# Smoke Test

Use this checklist to verify the current PROJECT OOH-AHH prototype end to end.
It is intended for local development, not production readiness.

## Prerequisites

- Node dependencies installed in `frontend/` with `npm install`.
- Python dependencies installed in `backend/` with `pip install -r requirements.txt`.
- Optional: `.env` created from `.env.example`.
- Optional: `OPENAI_API_KEY` in `.env` for real mentor responses. Without it,
  mentor fallback behavior is expected.

## 1. Backend Startup

Command:

```bash
cd backend
uvicorn app.main:app --reload
```

Expected outcome:

- FastAPI starts without import errors.
- The backend listens at `http://127.0.0.1:8000`.

## 2. Health Endpoint

Command:

```bash
curl http://127.0.0.1:8000/health
```

Expected outcome:

```json
{
  "status": "ok",
  "service": "ooh-ahh-backend"
}
```

PowerShell alternative:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

## 3. Frontend Startup

Command:

```bash
cd frontend
npm run dev
```

Expected outcome:

- Vite starts successfully.
- The app opens at `http://localhost:5173` or the URL printed by Vite.
- The workspace shows PROJECT OOH-AHH.

## 4. Multi-Track Navigation

Steps:

1. Open the lesson selector.
2. Confirm lessons are grouped by track:
   - Python Foundations
   - Backend Lifecycle
   - AI/RAG Pipeline

Expected outcome:

- Each track appears as a separate selector group.
- Lesson option labels include the track short label.
- The lesson panel shows the current track name and track description.

## 5. Python Lesson Loading

Steps:

1. Open the lesson selector.
2. Select "Python - Print Welcome Message".
3. Click Load.

Expected outcome:

- Lesson title, description, difficulty, topic, and objectives are visible.
- The current track shows Python Foundations.
- The workspace files are replaced with the lesson starter files.
- `main.py` is selected.

## 6. File Explorer

Steps:

1. Create a new file.
2. Select between files.
3. Rename the new file.
4. Delete the new file.

Expected outcome:

- Files are created, selected, renamed, and deleted in memory.
- The app does not reload.
- `main.py` remains usable.

## 7. Monaco Editor Editing

Steps:

1. Edit `main.py`.
2. Enter:

   ```python
   print("Welcome to OOH-AHH")
   ```

Expected outcome:

- Python syntax highlighting is visible.
- The editor content updates in frontend state.

## 8. Python Static Analysis Graph

Steps:

1. Click Analyze.

Expected outcome:

- A loading state appears while analysis is running.
- The frontend calls `POST /api/v1/analyze/static`.
- The visualization panel renders a static React Flow graph.
- Static analysis errors, if any, appear without crashing the app.

## 9. Node Inspection

Steps:

1. Hover or click a node in the static graph.

Expected outcome:

- The inspection panel updates with node type, name, file path, line number when
  available, metadata, and a short explanation.

## 10. Python Runtime Trace

Steps:

1. Click Run / Verify.

Expected outcome:

- A loading state appears while the trace runs.
- The frontend calls `POST /api/v1/trace/run`.
- Runtime events appear in the UI.
- stdout shows `Welcome to OOH-AHH`.
- stderr and errors are empty for the recommended lesson solution.

## 11. Timeline Playback

Steps:

1. Use Next and Previous.
2. Use Play and Pause.
3. Use Reset.

Expected outcome:

- Current event details update as the event index changes.
- Play advances automatically.
- Reset returns to the first event.
- The active runtime graph node follows the current event.

## 12. Python Validation Result

Expected outcome for the recommended solution:

- Lesson validation status is `correct`.
- Output validation is correct.
- Runtime errors are absent.
- Required concepts include `print_statement` as found.

Change the stdout text and run again.

Expected outcome:

- Validation changes to incorrect or partially correct, depending on concepts
  found and output mismatch.

## 13. Backend Lifecycle Track

Steps:

1. Select "Backend - FastAPI Request Lifecycle".
2. Click Load.
3. Inspect the visualization panel.
4. Toggle Beginner Mode and Engineer Mode.

Expected outcome:

- The current track shows Backend Lifecycle.
- `BackendLifecycleCanvas` renders client, route, validation, service,
  repository, database, response, and error nodes.
- The graph uses lesson-defined/mock lifecycle data only.
- Beginner Mode shows simpler lifecycle explanations.
- Engineer Mode shows deeper request, payload, response, and metadata details.
- The backend lifecycle validation summary appears and does not crash.

## 14. AI/RAG Pipeline Track

Steps:

1. Select "AI/RAG - RAG Pipeline Overview".
2. Click Load.
3. Inspect the visualization panel.
4. Toggle Beginner Mode and Engineer Mode.

Expected outcome:

- The current track shows AI/RAG Pipeline.
- `RagPipelineCanvas` renders query, document, chunker, embedding model, vector
  store, retriever, context builder, LLM, response, citation, and risk nodes.
- The graph uses lesson-defined/mock pipeline data only.
- Hallucination/risk overlays are visible.
- Beginner Mode explains risk in learner-friendly language.
- Engineer Mode shows deeper retrieval, context, citation, and payload metadata.
- The AI/RAG validation summary appears and does not crash.

## 15. Beginner / Engineer Mode Across Tracks

Steps:

1. Load one lesson from each track.
2. Toggle Beginner Mode.
3. Toggle Engineer Mode.

Expected outcome:

- Python timeline details become simpler in Beginner Mode and deeper in Engineer
  Mode.
- Backend lifecycle node details change explanation depth.
- AI/RAG node details change explanation depth.
- The selected mode does not crash any visualization.

## 16. AI Mentor Across Tracks

Steps:

1. Load a Python lesson, run it, then click Explain This and Give Hint.
2. Load a Backend Lifecycle lesson, then click Explain This and Give Hint.
3. Load an AI/RAG Pipeline lesson, then click Explain This and Give Hint.

Expected outcome:

- The frontend calls `POST /api/v1/mentor/respond`.
- A mentor response appears in the AI Mentor panel.
- If OpenAI is not configured or the request fails, local fallback guidance is
  shown.
- The mentor does not auto-edit code or provide a full solution.
- Backend and AI/RAG lessons may have no runtime step selected; the mentor still
  shows a response or local fallback without crashing.

## 17. Unsupported Lesson Type Fallback

Developer-only check:

1. Temporarily load or mock a lesson with an unknown `lesson_type`.
2. Open the visualization panel.

Expected outcome:

- The app shows a graceful unsupported-track empty state.
- The message asks the learner to choose Python Foundations, Backend Lifecycle,
  or AI/RAG Pipeline.
- Existing supported lesson types remain unaffected.

## Troubleshooting

- Backend import error: confirm the command is run from `backend/` and
  dependencies are installed.
- Health endpoint unavailable: confirm `uvicorn app.main:app --reload` is still
  running and no other service is using port `8000`.
- Frontend API errors: confirm the backend URL is `http://127.0.0.1:8000` and
  the frontend is running on Vite's local port.
- Empty graph after Analyze: check for Python syntax errors and inspect the
  analysis error state.
- Runtime timeout: check for infinite loops or long-running code.
- Mentor fallback: expected when `OPENAI_API_KEY` is missing or the OpenAI
  request fails.
- Import errors during runtime: expected in V1 because controlled execution
  blocks imports. Static analysis still reports import syntax.
- Backend Lifecycle and AI/RAG graphs are static prototypes. They do not execute
  real FastAPI apps, send HTTP requests, call embedding APIs, or query a vector
  database.
- If Analyze fails with `Failed to fetch`, confirm the frontend origin is allowed
  by backend CORS. The default local origin is `http://127.0.0.1:5173`.
