import { Handle, Position } from '@xyflow/react';
import { useWorkspaceStore } from '../../../stores/workspaceStore';
import type { AiRagPipelineNodeType } from '../../../types/lesson';

export type RagPipelineNodeData = {
  type: AiRagPipelineNodeType;
  label: string;
  beginnerExplanation: string;
  engineerExplanation: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type RagPipelineNodeProps = {
  data: RagPipelineNodeData;
};

function formatType(type: string) {
  return type.replace(/_/g, ' ');
}

export function RagPipelineNode({ data }: RagPipelineNodeProps) {
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const isEngineerMode = learningMode === 'engineer';

  return (
    <div className={`rag-pipeline-node rag-pipeline-node--${data.type}`}>
      <Handle type="target" position={Position.Left} />
      <div className="rag-pipeline-node__type">{formatType(data.type)}</div>
      <div className="rag-pipeline-node__label">{data.label}</div>
      <p>{isEngineerMode ? data.engineerExplanation : data.beginnerExplanation}</p>

      {isEngineerMode && (
        <dl className="rag-pipeline-node__details">
          {data.payload && (
            <div>
              <dt>Payload</dt>
              <dd>{JSON.stringify(data.payload)}</dd>
            </div>
          )}
          {data.metadata && (
            <div>
              <dt>Metadata</dt>
              <dd>{JSON.stringify(data.metadata)}</dd>
            </div>
          )}
        </dl>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
