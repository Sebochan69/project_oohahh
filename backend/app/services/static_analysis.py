import ast

from app.models.analysis import (
    AnalysisError,
    ClassSummary,
    FunctionCallSummary,
    FunctionSummary,
    ImportSummary,
    StaticAnalysisRequest,
    StaticAnalysisResponse,
    StaticFileSummary,
)


def _argument_names(arguments: ast.arguments) -> list[str]:
    names = [argument.arg for argument in arguments.posonlyargs]
    names.extend(argument.arg for argument in arguments.args)

    if arguments.vararg:
        names.append(arguments.vararg.arg)

    names.extend(argument.arg for argument in arguments.kwonlyargs)

    if arguments.kwarg:
        names.append(arguments.kwarg.arg)

    return names


def _extract_imports(file_path: str, node: ast.AST) -> list[ImportSummary]:
    imports: list[ImportSummary] = []

    if isinstance(node, ast.Import):
        imports.extend(
            ImportSummary(
                file_path=file_path,
                module=alias.name,
                name=alias.asname,
                import_type="import",
                line_number=node.lineno,
            )
            for alias in node.names
        )

    if isinstance(node, ast.ImportFrom):
        module = "." * node.level + (node.module or "")
        imports.extend(
            ImportSummary(
                file_path=file_path,
                module=module,
                name=alias.name,
                import_type="from_import",
                line_number=node.lineno,
            )
            for alias in node.names
        )

    return imports


def _call_name(node: ast.AST) -> str | None:
    if isinstance(node, ast.Name):
        return node.id

    if isinstance(node, ast.Attribute):
        parent_name = _call_name(node.value)
        return f"{parent_name}.{node.attr}" if parent_name else node.attr

    return None


class FunctionCallVisitor(ast.NodeVisitor):
    def __init__(self, file_path: str) -> None:
        self.file_path = file_path
        self.calls: list[FunctionCallSummary] = []
        self._scope_stack: list[tuple[str, str]] = []

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._scope_stack.append(("function", node.name))
        self.generic_visit(node)
        self._scope_stack.pop()

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._scope_stack.append(("function", node.name))
        self.generic_visit(node)
        self._scope_stack.pop()

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self._scope_stack.append(("class", node.name))
        self.generic_visit(node)
        self._scope_stack.pop()

    def visit_Call(self, node: ast.Call) -> None:
        callee_name = _call_name(node.func)

        if callee_name:
            caller_type, caller_name = self._scope_stack[-1] if self._scope_stack else ("top_level", None)
            self.calls.append(
                FunctionCallSummary(
                    file_path=self.file_path,
                    caller_name=caller_name,
                    caller_type=caller_type,
                    callee_name=callee_name,
                    line_number=node.lineno,
                    argument_count=len(node.args) + len(node.keywords),
                )
            )

        self.generic_visit(node)


def analyze_static(request: StaticAnalysisRequest) -> StaticAnalysisResponse:
    file_summaries = [
        StaticFileSummary(
            path=file.path,
            line_count=len(file.content.splitlines()),
            character_count=len(file.content),
            is_entry=file.path == request.entry_file,
        )
        for file in request.files
    ]

    errors: list[AnalysisError] = []
    imports: list[ImportSummary] = []
    functions: list[FunctionSummary] = []
    classes: list[ClassSummary] = []
    calls: list[FunctionCallSummary] = []

    if request.entry_file not in {file.path for file in request.files}:
        errors.append(
            AnalysisError(
                file_path=request.entry_file,
                message="Entry file was not found in submitted files.",
            )
        )

    for file in request.files:
        try:
            tree = ast.parse(file.content, filename=file.path)
        except SyntaxError as error:
            errors.append(
                AnalysisError(
                    file_path=file.path,
                    message=error.msg,
                    line_number=error.lineno,
                )
            )
            continue

        call_visitor = FunctionCallVisitor(file.path)
        call_visitor.visit(tree)
        calls.extend(call_visitor.calls)

        for node in ast.walk(tree):
            imports.extend(_extract_imports(file.path, node))

            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions.append(
                    FunctionSummary(
                        file_path=file.path,
                        name=node.name,
                        line_number=node.lineno,
                        argument_names=_argument_names(node.args),
                    )
                )

            if isinstance(node, ast.ClassDef):
                classes.append(
                    ClassSummary(
                        file_path=file.path,
                        name=node.name,
                        line_number=node.lineno,
                    )
                )

    return StaticAnalysisResponse(
        files=file_summaries,
        imports=imports,
        functions=functions,
        classes=classes,
        calls=calls,
        errors=errors,
    )
