from fastapi import APIRouter
from pydantic import BaseModel
import os
<<<<<<< HEAD
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not configured in environment or .env")
    exit(1)

model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
prompt = "Say 'Gemini API is verified and connected to GeM BidVerify.' in one short sentence."
payload = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode("utf-8")

http_req = urllib.request.Request(
    url,
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(http_req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        print(f"Status: OK | Model: {model}")
        print(f"Response: {text.strip()}")
except Exception as e:
    print(f"Status: Error | Model: {model} | Detail: {e}")
=======
import time
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

BASE = "https://generativelanguage.googleapis.com/v1beta/models"
# Tried in order; falls through on overload/quota errors
MODELS = [
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-lite-latest",
]
RETRY_STATUS = {429, 500, 502, 503, 504}

SYSTEM_CONTEXT = """
You are BidVerify AI, a government procurement compliance assistant.
You have access to the following active bids in our system:
- BID-2026-0841 (Bharat Engineering Solutions): Compliance Score: 94/100, Risk Score: 23 (Low Risk). Status: Verified. No missing docs except pending DigiLocker verification.
- BID-2026-0843 (Rajveer Tech Solutions): Compliance Score: 38/100, Risk Score: 88 (High Risk). Status: Failed. Reason: Edited PDF detected on GST cert, Font Manipulation on PAN card. Turnover is only 9.2 Cr (minimum is 20 Cr).

Keep your responses concise, professional, and formatted in Markdown.
"""

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


def _extract_text(data: dict) -> str:
    parts = data["candidates"][0]["content"]["parts"]
    return "".join(p.get("text", "") for p in parts if not p.get("thought"))


@router.post("/")
def chat_with_ai(req: ChatRequest):
    if not api_key:
        return {
            "status": "error",
            "response": "Gemini API key is missing. Please add GEMINI_API_KEY to your python-backend/.env file and restart the server."
        }

    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_CONTEXT}]},
        "contents": [{"role": "user", "parts": [{"text": req.query}]}],
    }
    headers = {"x-goog-api-key": api_key}
    last_error = "No response from Gemini."

    for round_no in range(2):
        for model in MODELS:
            try:
                r = requests.post(
                    f"{BASE}/{model}:generateContent",
                    headers=headers, json=body, timeout=15,
                )
            except requests.exceptions.RequestException as e:
                last_error = f"{model}: {e}"
                continue

            if r.status_code == 200:
                try:
                    return {"status": "success", "response": _extract_text(r.json())}
                except (KeyError, IndexError, ValueError):
                    last_error = f"{model}: empty/blocked response"
                    continue

            last_error = f"{model}: HTTP {r.status_code}"
            if r.status_code not in RETRY_STATUS and r.status_code != 404:
                # e.g. 400/403 -> bad request or key problem, no point retrying
                return {"status": "error", "response": f"Gemini API Error: {r.text[:300]}"}

        time.sleep(1.5)

    return {"status": "error", "response": f"Gemini is busy right now, please try again. ({last_error})"}
>>>>>>> 42f23ad (fix(cors): resolve express preflight options, python cors fallbacks, and token refresh url)
