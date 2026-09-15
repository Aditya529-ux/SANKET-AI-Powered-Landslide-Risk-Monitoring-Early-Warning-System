from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.predictions import router as predictions_router

app = FastAPI(title="SANKET API", version="1.0.0")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictions_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
