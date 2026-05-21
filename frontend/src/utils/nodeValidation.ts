import type { StaticGraphNodeData, RuntimeGraphNodeData } from '../types/graph';
import { validationStateClassName } from '../types/validation';

export function graphNodeValidationClassName(data: StaticGraphNodeData | RuntimeGraphNodeData) {
  return validationStateClassName(data.validation_state);
}
