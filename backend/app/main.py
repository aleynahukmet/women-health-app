from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, health
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A privacy-first API for women's health tracking.",
    version="0.1.0",
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["health"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Women's Health App API", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
