from fastapi import APIRouter
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv
from api.routes.bids import load_bids_db

ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(ENV_PATH, override=True)

api_key = os.getenv("GEMINI_API_KEY")

BASE = "https://generativelanguage.googleapis.com/v1beta/models"
MODELS = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3-flash-preview",
]

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


<<<<<<< HEAD
def build_dynamic_context(bids: list[dict]) -> str:
    lines = [
        "You are BidVerify AI, a government procurement compliance and risk analysis assistant.",
        f"You have live access to {len(bids)} bid(s) currently stored in the database:",
    ]
    for b in bids:
        alerts = b.get("fraudAlerts") or []
        alert_str = (
            "; ".join(f"{a.get('type')} on {a.get('document')} ({a.get('detail')})" for a in alerts)
            if alerts
            else "0 fraud alerts"
        )
        failed_reqs = [
            f"{r.get('requirement')} ({r.get('bidderValue')})"
            for r in (b.get("complianceRequirements") or [])
            if r.get("status") == "fail"
        ]
        failed_str = ", ".join(failed_reqs) if failed_reqs else "None (All passed)"
        rec = b.get("aiRecommendation", {}).get("verdict", "REVIEW")
        lines.append(
            f"- {b.get('id')} ({b.get('bidderName')}) | Tender: {b.get('tenderId')} | "
            f"Status: {b.get('status')} | Compliance Score: {b.get('complianceScore')}/100 | "
            f"Risk Score: {b.get('riskScore')}/100 | GST: {b.get('gstNumber')} | PAN: {b.get('panNumber')} | "
            f"Turnover: {b.get('turnover')} | Experience: {b.get('experience')} | "
            f"Failed Clauses: {failed_str} | Forensic Alerts: {alert_str} | Recommendation: {rec}"
        )
    lines.append("Keep your responses concise, accurate to the live database above, and formatted in Markdown.")
    return "\n".join(lines)


def _format_bid_detail(b: dict) -> str:
    alerts = b.get("fraudAlerts") or []
    reqs = b.get("complianceRequirements") or []
    passed_reqs = [r for r in reqs if r.get("status") == "pass"]
    failed_reqs = [r for r in reqs if r.get("status") == "fail"]
    lines = [
        f"**Detailed Analysis: {b.get('bidderName')} ({b.get('id')})**",
        f"• **Status:** {str(b.get('status', '')).upper()} | **Compliance Score:** {b.get('complianceScore')}% ({len(passed_reqs)}/{len(reqs)} passed) | **Risk Score:** {b.get('riskScore')}/100",
        f"• **Statutory IDs:** GST `{b.get('gstNumber', 'N/A')}` · PAN `{b.get('panNumber', 'N/A')}` · Udyam `{b.get('udyamNumber', 'N/A')}`",
        f"• **Financial & Technical:** Turnover `{b.get('turnover', 'N/A')}` · Experience `{b.get('experience', 'N/A')}` · State `{b.get('state', 'N/A')}`",
    ]
    if failed_reqs:
        for r in failed_reqs:
            lines.append(
                f"• **Failed Clause ({r.get('requirement')}):** Submitted `{r.get('bidderValue')}` — {r.get('aiNote')}"
            )
    else:
        lines.append("• **Compliance Clauses:** All mandatory tender clauses passed.")
    if alerts:
        for a in alerts:
            lines.append(
                f"• **Forensic Alert ({a.get('type')}):** {a.get('document')} — {a.get('detail')} ({a.get('confidence')}% confidence)"
            )
    lines.append(
        f"• **AI Recommendation ({b.get('aiRecommendation', {}).get('verdict')}):** {b.get('aiRecommendation', {}).get('summary')}"
    )
    return "\n".join(lines)


def build_fallback_response(query: str, bids: list[dict]) -> str:
    q = query.lower().strip()
    if not bids:
        return "**No bids are currently stored in the database.** Upload a bid package to begin analysis."

    # 1. Check if specific bidder(s) are mentioned in the query
    matched_bids = []
    for b in bids:
        name_lower = b.get("bidderName", "").lower()
        short_lower = b.get("bidderDetails", {}).get("shortName", "").lower()
        bid_id_lower = b.get("id", "").lower()
        tokens = [t for t in name_lower.replace("(", " ").replace(")", " ").split() if len(t) >= 4]
        if (
            (name_lower and name_lower in q)
            or (short_lower and short_lower in q)
            or (bid_id_lower and bid_id_lower in q)
            or any(t in q for t in tokens)
        ):
            matched_bids.append(b)

    # Also support "bidder a" / "bidder b" / "bidder c" or "latest" / "recent" / "last uploaded"
    if "bidder a" in q and "bidder c" in q and len(bids) >= 3:
        b_a = next((b for b in bids if "astranet" in b.get("bidderName", "").lower()), bids[0])
        b_c = next((b for b in bids if "rajveer" in b.get("bidderName", "").lower()), bids[min(2, len(bids) - 1)])
        return "\n".join(
            [
                f"**Head-to-Head Comparison: {b_a.get('bidderName')} vs {b_c.get('bidderName')}**",
                f"1. **{b_a.get('bidderName')} ({b_a.get('id')}):** Compliance `{b_a.get('complianceScore')}%` · Risk `{b_a.get('riskScore')}/100` · Turnover `{b_a.get('turnover')}` · Experience `{b_a.get('experience')}` · Alerts `{len(b_a.get('fraudAlerts') or [])}` · Verdict: **{b_a.get('aiRecommendation', {}).get('verdict')}**",
                f"2. **{b_c.get('bidderName')} ({b_c.get('id')}):** Compliance `{b_c.get('complianceScore')}%` · Risk `{b_c.get('riskScore')}/100` · Turnover `{b_c.get('turnover')}` · Experience `{b_c.get('experience')}` · Alerts `{len(b_c.get('fraudAlerts') or [])}` · Verdict: **{b_c.get('aiRecommendation', {}).get('verdict')}**",
                f"• **Key Takeaway:** {b_a.get('bidderName')} satisfies all statutory thresholds, whereas {b_c.get('bidderName')} is flagged for disqualification due to compliance/forensic failures.",
            ]
        )

    if any(k in q for k in ("latest", "recent", "newest", "last upload", "wrong document")):
        return _format_bid_detail(bids[0])

    if len(matched_bids) == 1 and "compare" not in q:
        return _format_bid_detail(matched_bids[0])

    if len(matched_bids) >= 2 or "compare" in q or "vs" in q:
        target_list = matched_bids if len(matched_bids) >= 2 else bids
        lines = [f"**Live Comparison Across {len(target_list)} Bidders**"]
        for i, b in enumerate(target_list, 1):
            alerts_cnt = len(b.get("fraudAlerts") or [])
            lines.append(
                f"{i}. **{b.get('bidderName')} ({b.get('id')}):** Compliance `{b.get('complianceScore')}%` · Risk `{b.get('riskScore')}/100` · Turnover `{b.get('turnover')}` · Fraud Alerts `{alerts_cnt}` · Verdict: **{b.get('aiRecommendation', {}).get('verdict')}**"
            )
        best = min(target_list, key=lambda x: x.get("riskScore", 100))
        lines.append(
            f"• **Top Recommended Bidder:** **{best.get('bidderName')}** ({best.get('complianceScore')}% compliance, {best.get('riskScore')}/100 risk score)."
        )
        return "\n".join(lines)

    # 2. Questions about missing documents or failed requirements
    if any(k in q for k in ("missing", "document", "certificate", "gst", "pan", "udyam", "iso")):
        lines = ["**Document & Certificate Verification Status Across Bids**"]
        for b in bids:
            failed_docs = [d.get("name") for d in (b.get("documents") or []) if d.get("status") == "failed"]
            failed_clauses = [
                f"{r.get('requirement')} ({r.get('bidderValue')})"
                for r in (b.get("complianceRequirements") or [])
                if r.get("status") == "fail"
            ]
            if failed_docs or failed_clauses:
                issues = ", ".join(failed_docs or failed_clauses)
                lines.append(f"• **{b.get('bidderName')} ({b.get('id')}):** Missing / Failed — {issues}")
            else:
                lines.append(
                    f"• **{b.get('bidderName')} ({b.get('id')}):** All 6 statutory certificates verified (GST `{b.get('gstNumber')}`, PAN `{b.get('panNumber')}`)."
                )
        return "\n".join(lines)

    # 3. Questions about fraud / tampering / forensic alerts
    if any(k in q for k in ("fraud", "tamper", "forensic", "alert", "ela", "fake", "forged", "anomaly")):
        lines = ["**Forensic & Fraud Detection Summary**"]
        found_any = False
        for b in bids:
            for a in b.get("fraudAlerts") or []:
                found_any = True
                lines.append(
                    f"• **{b.get('bidderName')} ({b.get('id')}) — {a.get('type')} [{str(a.get('severity', 'high')).upper()}]:** Document `{a.get('document')}` — {a.get('detail')} ({a.get('confidence')}% confidence)"
                )
        if not found_any:
            lines.append("• No forensic fraud alerts are currently active.")
        return "\n".join(lines)

    # 4. Questions about failed bids / why someone failed / risk
    if any(k in q for k in ("fail", "why", "reject", "disqualif", "high risk", "risk")):
        failed_bids = [b for b in bids if b.get("status") == "failed" or b.get("riskScore", 0) > 60]
        lines = [f"**High-Risk & Failed Bids ({len(failed_bids)} of {len(bids)} total)**"]
        for b in failed_bids:
            failed_reqs = [
                f"{r.get('requirement')}: {r.get('aiNote')}"
                for r in (b.get("complianceRequirements") or [])
                if r.get("status") == "fail"
            ]
            reason = "; ".join(failed_reqs) if failed_reqs else b.get("aiRecommendation", {}).get("summary", "")
            lines.append(
                f"• **{b.get('bidderName')} ({b.get('id')}):** Compliance `{b.get('complianceScore')}%` · Risk `{b.get('riskScore')}/100` — {reason}"
            )
        return "\n".join(lines)

    # 5. Default live overview
    verified_cnt = sum(1 for b in bids if b.get("status") == "verified")
    failed_cnt = sum(1 for b in bids if b.get("status") == "failed")
    lines = [
        f"**BidVerify AI — Live Procurement Intelligence ({len(bids)} Bids Loaded: {verified_cnt} Verified, {failed_cnt} Failed)**"
    ]
    for b in bids:
        lines.append(
            f"• **{b.get('bidderName')} ({b.get('id')}):** Status `{b.get('status')}` · Compliance `{b.get('complianceScore')}%` · Risk `{b.get('riskScore')}/100` · Verdict: **{b.get('aiRecommendation', {}).get('verdict')}**"
        )
    lines.append(
        "Ask me about any specific bidder (e.g., *Why did 26MA3BSDMS fail?*, *Compare all bidders*, or *Show forensic fraud alerts*)."
    )
    return "\n".join(lines)


@router.post("")
@router.post("/")
async def chat_with_ai(req: ChatRequest):
    load_dotenv(ENV_PATH, override=True)
    current_key = os.getenv("GEMINI_API_KEY")
    bids = load_bids_db()
    system_context = build_dynamic_context(bids)

    if not current_key:
        return {
            "status": "success",
            "response": build_fallback_response(req.query, bids),
        }

    import json as _json
    import urllib.request

    candidate_models = [
        os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        "gemini-flash-lite-latest",
        "gemini-2.5-flash",
    ]

    for model_name in candidate_models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={current_key}"
            payload = _json.dumps(
                {
                    "contents": [
                        {
                            "parts": [
                                {"text": f"{system_context}\n\nUser Question: {req.query}"}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "maxOutputTokens": 600,
                        "temperature": 0.4,
                    },
                }
            ).encode("utf-8")
            http_req = urllib.request.Request(
                url,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(http_req, timeout=15) as resp:
                resp_data = _json.loads(resp.read().decode("utf-8"))
                candidates = resp_data.get("candidates") or []
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts") or []
                    if parts and parts[0].get("text"):
                        return {"status": "success", "response": parts[0]["text"], "model": model_name}
        except Exception as e:
            print(f"Gemini chat model {model_name} failed: {e}")
            continue

    return {
        "status": "success",
        "response": build_fallback_response(req.query, bids),
    }
=======
@router.post("/")
def chat_with_ai(req: ChatRequest):
    if not api_key:
        return {"status": "error", "response": "Gemini API key is missing. Add GEMINI_API_KEY to python-backend/.env and restart."}

    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_CONTEXT}]},
        "contents": [{"role": "user", "parts": [{"text": req.query}]}],
    }
    headers = {"x-goog-api-key": api_key}
    errors = []

    for model in MODELS:
        try:
            r = requests.post(f"{BASE}/{model}:generateContent",
                              headers=headers, json=body, timeout=(5, 10))
            if r.status_code == 200:
                parts = r.json()["candidates"][0]["content"]["parts"]
                text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
                if text:
                    return {"status": "success", "response": text}
            errors.append(f"{model}: {r.status_code}")
        except Exception as e:
            errors.append(f"{model}: {type(e).__name__}")

    return {"status": "error", "response": "Gemini is busy, try again. " + " | ".join(errors)}
>>>>>>> 42f23ad (fix(cors): resolve express preflight options, python cors fallbacks, and token refresh url)
