import os
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
