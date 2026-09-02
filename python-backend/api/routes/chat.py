from fastapi import APIRouter
from pydantic import BaseModel
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/")
async def chat_with_ai(req: ChatRequest):
    if not api_key:
        return {
            "status": "error", 
            "response": "Gemini API key is missing. Please add GEMINI_API_KEY to your python-backend/.env file and restart the server."
        }
        
    try:
        # Give Gemini some system context about our mockup database
        system_context = """
        You are BidVerify AI, a government procurement compliance assistant.
        You have access to the following active bids in our system:
        - BID-2026-0841 (Bharat Engineering Solutions): Compliance Score: 94/100, Risk Score: 23 (Low Risk). Status: Verified. No missing docs except pending DigiLocker verification.
        - BID-2026-0843 (Rajveer Tech Solutions): Compliance Score: 38/100, Risk Score: 88 (High Risk). Status: Failed. Reason: Edited PDF detected on GST cert, Font Manipulation on PAN card. Turnover is only 9.2 Cr (minimum is 20 Cr).
        
        Keep your responses concise, professional, and formatted in Markdown.
        """
        
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"{system_context}\n\nUser Question: {req.query}"
        
        response = model.generate_content(prompt)
        
        return {"status": "success", "response": response.text}
    except Exception as e:
        return {"status": "error", "response": f"Gemini API Error: {str(e)}"}
