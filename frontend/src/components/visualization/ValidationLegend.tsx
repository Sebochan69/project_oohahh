import { VALIDATION_STATES, VALIDATION_STATE_LABELS } from '../../types/validation';

export function ValidationLegend() {
  return (
    <aside className="validation-legend" aria-label="Correctness state legend">
      <h3>Correctness</h3>
      <ul>
        {VALIDATION_STATES.map((state) => (
          <li key={state}>
            <span className={`validation-legend__swatch validation-state--${state}`} aria-hidden="true" />
            <span>{VALIDATION_STATE_LABELS[state]}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
