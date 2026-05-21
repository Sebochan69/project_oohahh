# Demo Flow

This flow is for a short PROJECT OOH-AHH walkthrough. It assumes the frontend
and backend are already running locally.

Recommended lesson:

- `lessons/python-foundations/print-welcome-message.lesson.json`

Backend lifecycle demo:

- `lessons/backend-lifecycle/fastapi-hello-route.lesson.json`
- Detailed presenter path: `docs/backend-lifecycle-demo.md`

## Setup

1. Start the backend from the repository root:

   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

   Expected outcome: FastAPI starts at `http://127.0.0.1:8000`.

2. Start the frontend in a second terminal:

   ```bash
   cd frontend
   npm run dev
   ```

   Expected outcome: Vite starts, usually at `http://localhost:5173`.

3. Open the frontend URL in a browser.

   Expected outcome: the PROJECT OOH-AHH workspace appears with code,
   visualization, timeline/output, lesson, and AI Mentor areas.

## Presenter Script

1. Show the empty workspace.

   Expected outcome: the visualization and timeline/output areas indicate that
   no analysis or runtime trace has been run yet.

2. Load the "Print Welcome Message" lesson.

   Expected outcome: the lesson details are visible and `main.py` is loaded into
   the in-memory workspace.

3. Point out the file explorer and Monaco editor.

   Expected outcome: `main.py` is selected, and the editor can be modified
   without saving to disk.

4. Click Analyze.

   Expected outcome: the frontend calls `POST /api/v1/analyze/static`, then the
   visualization panel renders a static graph with file/function/class/import
   information when present.

5. Hover or click a graph node.

   Expected outcome: the node inspection panel explains the node type, name,
   file path, line number when available, and metadata.

6. Click Run / Verify.

   Expected outcome: the frontend calls `POST /api/v1/trace/run`; stdout,
   stderr, errors, runtime events, lesson validation, and runtime graph data
   appear in the bottom panel.

7. Use Previous, Next, Play, Pause, and Reset.

   Expected outcome: the current runtime event changes, and the active runtime
   graph node updates with the selected timeline step.

8. Show the validation result.

   Expected outcome: correct lesson output shows a correct validation state.
   Incorrect output or runtime errors produce an explanatory validation result.

9. Toggle Beginner Mode and Engineer Mode.

   Expected outcome: Beginner Mode presents simpler event explanations. Engineer
   Mode shows deeper payload, scope, validation, file, step, and event details.

10. Click Explain This in the AI Mentor panel.

    Expected outcome: the mentor returns a contextual explanation using the
    selected runtime event, validation result, and lesson context. If no OpenAI
    key is configured, placeholder/fallback guidance still appears.

11. Click Give Hint.

    Expected outcome: the mentor returns a hint without auto-editing code or
    giving a full solution.

## Good Demo Variations

- Change the printed text so it does not match the expected stdout, then run
  again. The validation result should explain the mismatch.
- Add `x = 1` and `x = x + 1`, then run again. Runtime events should include
  variable creation and update information.
- Switch to Engineer Mode before stepping through the timeline to show raw event
  payloads.
- Load "FastAPI Request Lifecycle" to show the static backend track prototype.
  The visualization should render client, route, validation, service,
  repository, mock database, response, and error nodes from lesson metadata.

## Troubleshooting

- If Analyze or Run / Verify fails immediately, confirm the backend is running
  at `http://127.0.0.1:8000`.
- If the frontend cannot reach the backend, confirm it is running from
  `http://localhost:5173` or `http://127.0.0.1:5173`, which are allowed by CORS.
- If AI Mentor falls back, check whether `OPENAI_API_KEY` is configured. Fallback
  behavior is expected when no key is set or the OpenAI request fails.
- If a graph looks empty, confirm the active file has valid Python and rerun
  Analyze or Run / Verify.
- If runtime code imports a module, expect execution to reject it in V1. Static
  analysis can detect import syntax, but runtime imports are blocked.
