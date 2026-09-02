from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import bids, chat, dashboard

app = FastAPI(
    title="GeM BidVerify AI API",
    description="Backend microservice for AI-powered Bid Compliance Verification",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for demo/hackathon
    allow_credentials=True,
    allow_methods=["*"],
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
