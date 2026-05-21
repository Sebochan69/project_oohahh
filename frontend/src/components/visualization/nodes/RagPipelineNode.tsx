import { Handle, Position } from '@xyflow/react';
import { useWorkspaceStore } from '../../../stores/workspaceStore';
import type { AiRagPipelineNodeType } from '../../../types/lesson';
import { VALIDATION_STATE_LABELS, type ValidationState, validationStateClassName } from '../../../types/validation';

export type RagPipelineNodeData = {
  type: AiRagPipelineNodeType;
  label: string;
  beginnerExplanation: string;
  engineerExplanation: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  validation_state: ValidationState;
  riskMessage?: string;
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
    <div
      className={`rag-pipeline-node rag-pipeline-node--${data.type} ${validationStateClassName(
        data.validation_state,
      )}`}
    >
      <Handle type="target" position={Position.Left} />
      <div className="rag-pipeline-node__type">{formatType(data.type)}</div>
      <div className="rag-pipeline-node__label">{data.label}</div>
      <p>{isEngineerMode ? data.engineerExplanation : data.beginnerExplanation}</p>
      <div className="node-validation-label">{VALIDATION_STATE_LABELS[data.validation_state]}</div>
      {data.riskMessage && <div className="rag-pipeline-node__risk">{data.riskMessage}</div>}

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
