from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.database import init_db
from app.api.routes import weather, records

settings = get_settings()

app = FastAPI(
    title="WeatherSphere API",
    description="Full-stack weather app — PM Accelerator Technical Assessment",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router)
app.include_router(records.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"app": "WeatherSphere API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}
