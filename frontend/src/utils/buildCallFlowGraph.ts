import type { StaticAnalysisCall, StaticAnalysisFunction, StaticAnalysisResult } from '../types/analysis';
import type { StaticGraphData, StaticGraphEdge, StaticGraphNode } from '../types/graph';
import { DEFAULT_VALIDATION_STATE } from '../types/validation';

function normalizePath(path: string) {
  return path.replace(/\\/g, '/').replace(/^\.\//, '');
}

function fileNodeId(filePath: string) {
  return `file:${filePath}`;
}

function topLevelNodeId(filePath: string) {
  return `top-level:${filePath}`;
}

function functionNodeId(filePath: string, name: string, lineNumber: number | null) {
  return `function:${filePath}:${name}:${lineNumber ?? 'unknown'}`;
}

function builtinCallNodeId(filePath: string, name: string) {
  return `builtin:${filePath}:${name}`;
}

function functionKey(filePath: string, name: string) {
  return `${normalizePath(filePath)}:${name}`;
}

function localCalleeName(calleeName: string) {
  const parts = calleeName.split('.');
  return parts[parts.length - 1] ?? calleeName;
}

function callerNodeId(
  call: StaticAnalysisCall,
  functionsByName: Map<string, StaticAnalysisFunction>,
) {
  const filePath = normalizePath(call.file_path);

  if (call.caller_type === 'function' && call.caller_name) {
    const callerFunction = functionsByName.get(functionKey(filePath, call.caller_name));

    if (callerFunction) {
      return functionNodeId(filePath, callerFunction.name, callerFunction.line_number);
    }
  }

  return topLevelNodeId(filePath);
}

export function buildCallFlowGraph(analysis: StaticAnalysisResult): StaticGraphData {
  const nodes: StaticGraphNode[] = [];
  const edges: StaticGraphEdge[] = [];
  const nodeIds = new Set<string>();
  const functionsByName = new Map<string, StaticAnalysisFunction>();

  function addNode(node: StaticGraphNode) {
    if (nodeIds.has(node.id)) {
      return;
    }

    nodeIds.add(node.id);
    nodes.push(node);
  }

  for (const functionItem of analysis.functions) {
    functionsByName.set(functionKey(functionItem.file_path, functionItem.name), functionItem);
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
        validation_state: DEFAULT_VALIDATION_STATE,
        is_entry: file.is_entry,
      },
    });

    addNode({
      id: topLevelNodeId(filePath),
      type: 'top_level',
      data: {
        file_path: filePath,
        name: 'top-level code',
        type: 'top_level',
        validation_state: DEFAULT_VALIDATION_STATE,
        is_entry: file.is_entry,
      },
    });

    edges.push({
      id: `contains:${fileNodeId(filePath)}:${topLevelNodeId(filePath)}`,
      source: fileNodeId(filePath),
      target: topLevelNodeId(filePath),
      type: 'contains',
      data: {
        file_path: filePath,
        type: 'contains',
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
        validation_state: DEFAULT_VALIDATION_STATE,
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

  for (const call of analysis.calls ?? []) {
    const filePath = normalizePath(call.file_path);
    const sourceId = callerNodeId(call, functionsByName);
    const localName = localCalleeName(call.callee_name);
    const calleeFunction = functionsByName.get(functionKey(filePath, localName));
    const targetId = calleeFunction
      ? functionNodeId(filePath, calleeFunction.name, calleeFunction.line_number)
      : builtinCallNodeId(filePath, call.callee_name);

    if (!calleeFunction) {
      addNode({
        id: targetId,
        type: 'builtin_call',
        data: {
          file_path: filePath,
          line_number: call.line_number,
          name: `${call.callee_name}()`,
          type: 'builtin_call',
          validation_state: DEFAULT_VALIDATION_STATE,
          argument_count: call.argument_count,
        },
      });
    }

    edges.push({
      id: `calls:${sourceId}:${targetId}:${call.line_number ?? 'unknown'}:${call.argument_count}`,
      source: sourceId,
      target: targetId,
      type: 'calls',
      data: {
        file_path: filePath,
        line_number: call.line_number,
        name: call.callee_name,
        type: 'calls',
        argument_count: call.argument_count,
      },
    });
  }

  return {
    nodes,
    edges,
  };
}
