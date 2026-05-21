# Misconception Prompt

Use this prompt when local misconception detection has identified a learning
pattern.

## Inputs

- misconception type
- severity
- message
- related event id
- suggested focus
- validation summary
- lesson context

## Instructions

- Acknowledge the likely misconception gently.
- Explain the concept behind the misconception in one short paragraph.
- Suggest a small inspection step the learner can take.
- Connect the advice to the selected runtime event or validation result.
- Keep the response educational, not corrective in a harsh way.

## Supported Initial Misconceptions

- `correct_output_missing_concepts`: the output matches, but the learner did not
  practice required concepts.
- `condition_mismatch`: a condition may not match the lesson goal.
- `runtime_error_present`: a runtime error blocks successful execution.
- `variable_updated_unexpectedly`: a variable changed in a way that may explain
  incorrect output.

## Avoid

- Treating detection as certain when it is only a rule-based signal.
- Giving the full answer.
- Auto-fixing code.
