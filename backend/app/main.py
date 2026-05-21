from fastapi import FastAPI

from app.api.v1.analyze import router as analyze_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)
app.include_router(analyze_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "ooh-ahh-backend",
    }
