import { Handle, Position } from '@xyflow/react';
import { useWorkspaceStore } from '../../../stores/workspaceStore';

export type BackendLifecycleNodeType =
  | 'client'
  | 'route'
  | 'validation'
  | 'service'
  | 'repository'
  | 'database'
  | 'response'
  | 'error';

export type BackendLifecycleNodeData = {
  type: BackendLifecycleNodeType;
  label: string;
  beginnerExplanation: string;
  engineerExplanation: string;
  requestPath?: string;
  statusCode?: number;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type BackendLifecycleNodeProps = {
  data: BackendLifecycleNodeData;
};

function formatType(type: string) {
  return type.replace(/_/g, ' ');
}

export function BackendLifecycleNode({ data }: BackendLifecycleNodeProps) {
  const learningMode = useWorkspaceStore((state) => state.learningMode);
  const isEngineerMode = learningMode === 'engineer';

  return (
    <div className={`backend-lifecycle-node backend-lifecycle-node--${data.type}`}>
      <Handle type="target" position={Position.Left} />
      <div className="backend-lifecycle-node__type">{formatType(data.type)}</div>
      <div className="backend-lifecycle-node__label">{data.label}</div>
      <p>{isEngineerMode ? data.engineerExplanation : data.beginnerExplanation}</p>

      {isEngineerMode && (
        <dl className="backend-lifecycle-node__details">
          {data.requestPath && (
            <div>
              <dt>Path</dt>
              <dd>{data.requestPath}</dd>
            </div>
          )}
          {data.statusCode && (
            <div>
              <dt>Status</dt>
              <dd>{data.statusCode}</dd>
            </div>
          )}
          {data.payload && (
            <div>
              <dt>Payload</dt>
              <dd>{JSON.stringify(data.payload)}</dd>
            </div>
          )}
        </dl>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
