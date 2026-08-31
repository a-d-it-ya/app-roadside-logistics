from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.router import api_router
from app.database.session import engine
from app.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist if running in lightweight development mode
    # (Alembic is also provided for migrations)
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ PostgreSQL Database connection initialized and tables verified.")
    except Exception as e:
        print(f"⚠️ Database connection notice: {e}")
    yield
    # Shutdown
    engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Production-Grade Authentication and SaaS User Architecture for RoadSide Logistics.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "RoadSide Logistics SaaS API",
        "status": "operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
