import type { StaticGraphNodeData } from '../../types/graph';

type NodeInspectionPanelProps = {
  nodeData: StaticGraphNodeData | null;
};

const explanations: Record<StaticGraphNodeData['type'], string> = {
  file: 'This represents a Python file in your workspace.',
  function: 'This represents a function definition found by static analysis.',
  class: 'This represents a class definition found by static analysis.',
  external_module: 'This represents an imported module outside the current workspace.',
};

function formatType(type: string) {
  return type.replace(/_/g, ' ');
}

export function NodeInspectionPanel({ nodeData }: NodeInspectionPanelProps) {
  if (!nodeData) {
    return (
      <aside className="node-inspector node-inspector--empty" aria-label="Node inspection panel">
        <p>Hover or click a graph node to inspect its static analysis details.</p>
      </aside>
    );
  }

  const metadata = Object.entries(nodeData).filter(
    ([key, value]) => !['type', 'name', 'file_path', 'line_number'].includes(key) && value !== undefined,
  );

  return (
    <aside className="node-inspector" aria-label="Node inspection panel">
      <div className="node-inspector__header">
        <span>{formatType(nodeData.type)}</span>
        <h3>{nodeData.name}</h3>
      </div>

      <dl className="node-inspector__details">
        <div>
          <dt>Type</dt>
          <dd>{formatType(nodeData.type)}</dd>
        </div>
        {nodeData.file_path && (
          <div>
            <dt>File path</dt>
            <dd>{nodeData.file_path}</dd>
          </div>
        )}
        {nodeData.line_number && (
          <div>
            <dt>Line</dt>
            <dd>{nodeData.line_number}</dd>
          </div>
        )}
        {metadata.map(([key, value]) => (
          <div key={key}>
            <dt>{formatType(key)}</dt>
            <dd>{String(value)}</dd>
          </div>
        ))}
      </dl>

      <p className="node-inspector__explanation">{explanations[nodeData.type]}</p>
    </aside>
  );
}
