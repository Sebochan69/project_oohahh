import type { StaticAnalysisImport, StaticAnalysisResult } from '../types/analysis';
import type { StaticGraphData, StaticGraphEdge, StaticGraphNode } from '../types/graph';

function fileNodeId(filePath: string) {
  return `file:${filePath}`;
}

function functionNodeId(filePath: string, name: string, lineNumber: number | null) {
  return `function:${filePath}:${name}:${lineNumber ?? 'unknown'}`;
}

function classNodeId(filePath: string, name: string, lineNumber: number | null) {
  return `class:${filePath}:${name}:${lineNumber ?? 'unknown'}`;
}

function externalModuleNodeId(moduleName: string) {
  return `external:${moduleName}`;
}

function normalizePath(path: string) {
  return path.replace(/\\/g, '/').replace(/^\.\//, '');
}

function directoryName(filePath: string) {
  const normalizedPath = normalizePath(filePath);
  const lastSlashIndex = normalizedPath.lastIndexOf('/');

  return lastSlashIndex === -1 ? '' : normalizedPath.slice(0, lastSlashIndex + 1);
}

function importModuleCandidates(sourceFilePath: string, importItem: StaticAnalysisImport) {
  const moduleName = importItem.module.replace(/^\.+/, '');
  const sourceDirectory = directoryName(sourceFilePath);
  const candidates = new Set<string>();

  if (moduleName) {
    const modulePath = moduleName.replace(/\./g, '/');
    candidates.add(normalizePath(`${modulePath}.py`));
    candidates.add(normalizePath(`${sourceDirectory}${modulePath}.py`));
  }

  if (importItem.name) {
    const modulePath = moduleName.replace(/\./g, '/');
    const importedNamePath = importItem.name.replace(/\./g, '/');
    candidates.add(normalizePath(`${modulePath}/${importedNamePath}.py`));
    candidates.add(normalizePath(`${sourceDirectory}${modulePath}/${importedNamePath}.py`));
    candidates.add(normalizePath(`${sourceDirectory}${importedNamePath}.py`));
  }

  return [...candidates].filter(Boolean);
}

function resolveImportTarget(
  sourceFilePath: string,
  importItem: StaticAnalysisImport,
  availableFilePaths: Set<string>,
) {
  return importModuleCandidates(sourceFilePath, importItem).find((candidate) => availableFilePaths.has(candidate));
}

export function buildStaticGraph(analysis: StaticAnalysisResult): StaticGraphData {
  const nodes: StaticGraphNode[] = [];
  const edges: StaticGraphEdge[] = [];
  const nodeIds = new Set<string>();
  const filePaths = new Set(analysis.files.map((file) => normalizePath(file.path)));

  function addNode(node: StaticGraphNode) {
    if (nodeIds.has(node.id)) {
      return;
    }

    nodeIds.add(node.id);
    nodes.push(node);
  }

  for (const file of analysis.files) {
    const filePath = normalizePath(file.path);

    addNode({
      id: fileNodeId(filePath),
      type: 'file',
      data: {
        file_path: filePath,
        name: filePath,
        type: 'file',
        is_entry: file.is_entry,
      },
    });
  }

  for (const functionItem of analysis.functions) {
    const filePath = normalizePath(functionItem.file_path);
    const nodeId = functionNodeId(filePath, functionItem.name, functionItem.line_number);

    addNode({
      id: nodeId,
      type: 'function',
      data: {
        file_path: filePath,
        line_number: functionItem.line_number,
        name: functionItem.name,
        type: 'function',
      },
    });

    edges.push({
      id: `contains:${fileNodeId(filePath)}:${nodeId}`,
      source: fileNodeId(filePath),
      target: nodeId,
      type: 'contains',
      data: {
        file_path: filePath,
        line_number: functionItem.line_number,
        name: functionItem.name,
        type: 'contains',
      },
    });
  }

  for (const classItem of analysis.classes ?? []) {
    const filePath = normalizePath(classItem.file_path);
    const nodeId = classNodeId(filePath, classItem.name, classItem.line_number);

    addNode({
      id: nodeId,
      type: 'class',
      data: {
        file_path: filePath,
        line_number: classItem.line_number,
        name: classItem.name,
        type: 'class',
      },
    });

    edges.push({
      id: `contains:${fileNodeId(filePath)}:${nodeId}`,
      source: fileNodeId(filePath),
      target: nodeId,
      type: 'contains',
      data: {
        file_path: filePath,
        line_number: classItem.line_number,
        name: classItem.name,
        type: 'contains',
      },
    });
  }

  for (const importItem of analysis.imports) {
    const sourceFilePath = normalizePath(importItem.file_path);
    const targetFilePath = resolveImportTarget(sourceFilePath, importItem, filePaths);
    const targetId = targetFilePath ? fileNodeId(targetFilePath) : externalModuleNodeId(importItem.module);

    if (!targetFilePath) {
      addNode({
        id: targetId,
        type: 'external_module',
        data: {
          line_number: importItem.line_number,
          name: importItem.name ? `${importItem.module}.${importItem.name}` : importItem.module,
          type: 'external_module',
          import_type: importItem.import_type,
        },
      });
    }

    edges.push({
      id: `imports:${sourceFilePath}:${importItem.module}:${importItem.name ?? '*'}:${importItem.line_number ?? 'unknown'}`,
      source: fileNodeId(sourceFilePath),
      target: targetId,
      type: 'imports',
      data: {
        file_path: sourceFilePath,
        line_number: importItem.line_number,
        module: importItem.module,
        name: importItem.name,
        type: 'imports',
      },
    });
  }

  return {
    nodes,
    edges,
  };
}
