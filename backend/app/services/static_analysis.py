import ast

from app.models.analysis import (
    AnalysisError,
    ClassSummary,
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
        errors=errors,
    )
