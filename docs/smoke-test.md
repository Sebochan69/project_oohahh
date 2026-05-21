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

## 4. Lesson Loading

Steps:

1. Open the lesson selector.
2. Select "Print Welcome Message".
3. Click Load.

Expected outcome:

- Lesson title, description, difficulty, topic, and objectives are visible.
- The workspace files are replaced with the lesson starter files.
- `main.py` is selected.

## 5. File Explorer

Steps:

1. Create a new file.
2. Select between files.
3. Rename the new file.
4. Delete the new file.

Expected outcome:

- Files are created, selected, renamed, and deleted in memory.
- The app does not reload.
- `main.py` remains usable.

## 6. Monaco Editor Editing

Steps:

1. Edit `main.py`.
2. Enter:

   ```python
   print("Welcome to OOH-AHH")
   ```

Expected outcome:

- Python syntax highlighting is visible.
- The editor content updates in frontend state.

## 7. Static Analysis Graph

Steps:

1. Click Analyze.

Expected outcome:

- A loading state appears while analysis is running.
- The frontend calls `POST /api/v1/analyze/static`.
- The visualization panel renders a static React Flow graph.
- Static analysis errors, if any, appear without crashing the app.

## 8. Node Inspection

Steps:

1. Hover or click a node in the static graph.

Expected outcome:

- The inspection panel updates with node type, name, file path, line number when
  available, metadata, and a short explanation.

## 9. Runtime Trace

Steps:

1. Click Run / Verify.

Expected outcome:

- A loading state appears while the trace runs.
- The frontend calls `POST /api/v1/trace/run`.
- Runtime events appear in the UI.
- stdout shows `Welcome to OOH-AHH`.
- stderr and errors are empty for the recommended lesson solution.

## 10. Timeline Playback

Steps:

1. Use Next and Previous.
2. Use Play and Pause.
3. Use Reset.

Expected outcome:

- Current event details update as the event index changes.
- Play advances automatically.
- Reset returns to the first event.
- The active runtime graph node follows the current event.

## 11. Validation Result

Expected outcome for the recommended solution:

- Lesson validation status is `correct`.
- Output validation is correct.
- Runtime errors are absent.
- Required concepts include `print_statement` as found.

Change the stdout text and run again.

Expected outcome:

- Validation changes to incorrect or partially correct, depending on concepts
  found and output mismatch.

## 12. Beginner / Engineer Mode

Steps:

1. Toggle Beginner Mode.
2. Inspect the timeline event details.
3. Toggle Engineer Mode.
4. Inspect the same event again.

Expected outcome:

- Beginner Mode shows simplified event type, explanation, line number, variable
  change details, and validation summary.
- Engineer Mode shows event id, step, file path, line number, scope, payload,
  and validation metadata.

## 13. AI Mentor

Steps:

1. Select or step to a runtime event.
2. Click Explain This.
3. Click Give Hint.

Expected outcome:

- The frontend calls `POST /api/v1/mentor/respond`.
- A mentor response appears in the AI Mentor panel.
- If OpenAI is not configured or the request fails, local fallback guidance is
  shown.
- The mentor does not auto-edit code or provide a full solution.

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
