from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import bids, chat, dashboard

app = FastAPI(
    title="GeM BidVerify AI API",
    description="Backend microservice for AI-powered Bid Compliance Verification",
    version="1.0.0"
)

import os

# Configure CORS
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:4000,http://127.0.0.1:5173,http://127.0.0.1:4000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(bids.router, prefix="/api/v1/bids", tags=["Bids"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["AI Chat"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "BidVerify AI Engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
