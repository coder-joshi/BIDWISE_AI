"""
PDF metadata and structure checks. These are SIGNALS for a human reviewer, not proof of tampering:
every one of them can also happen for an honest document, and a forger can avoid all of them.
Nothing here cryptographically validates a digital signature.
"""
import io
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

from pypdf import PdfReader

TOLERANCE_SECONDS = 120   # many exporters set ModDate a few seconds after CreationDate
EDITOR_KEYWORDS = ("photoshop", "gimp", "canva", "ilovepdf", "smallpdf", "sejda",
                   "pdfescape", "pdffiller", "foxit phantom", "pdf-xchange editor", "nitro")

_DATE_RE = re.compile(r"(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?\s*([Zz]|[+-])?\s*(\d{2})?'?(\d{2})?")
_BYTERANGE_RE = re.compile(rb"/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]")


def parse_pdf_date(raw) -> Optional[datetime]:
    """Parses PDF dates such as D:20240101120000Z, D:20240101173000+05'30' or D:20261022161210Z00'00'."""
    if not raw:
        return None
    s = str(raw).strip()
    if s.startswith("D:"):
        s = s[2:]
    m = _DATE_RE.match(s)
    if not m:
        return None
    year, month, day, hour, minute, second = (int(g) if g else d for g, d in zip(m.groups()[:6], (0, 1, 1, 0, 0, 0)))
    offset = timedelta(0)
    if m.group(7) in ("+", "-"):
        offset = timedelta(hours=int(m.group(8) or 0), minutes=int(m.group(9) or 0))
        if m.group(7) == "-":
            offset = -offset
    try:
        return datetime(year, month, day, hour, minute, second, tzinfo=timezone(offset))
    except ValueError:
        return None


def _human(seconds: float) -> str:
    seconds = abs(int(seconds))
    for unit, size in (("day", 86400), ("hour", 3600), ("minute", 60)):
        if seconds >= size:
            n = seconds // size
            return f"{n} {unit}{'s' if n != 1 else ''}"
    return f"{seconds} seconds"


def analyze_pdf_findings(file_path: str) -> dict:
    """Returns {"status", "explanation", "findings": [{"code","severity","message"}]}."""
    try:
        with open(file_path, "rb") as f:
            data = f.read()
        reader = PdfReader(io.BytesIO(data))
        meta = reader.metadata
    except Exception as e:
        return {"status": "invalid", "explanation": f"Failed to read PDF structure: {e}", "findings": []}

    findings = []

    def add(code, severity, message):
        findings.append({"code": code, "severity": severity, "message": message})

    if not meta:
        add("NO_METADATA", "medium", "No metadata found: the document may have been scrubbed.")
    else:
        created_raw, modified_raw = meta.get("/CreationDate"), meta.get("/ModDate")
        created, modified = parse_pdf_date(created_raw), parse_pdf_date(modified_raw)
        if created and modified:
            gap = (modified - created).total_seconds()
            if gap < -TOLERANCE_SECONDS:
                add("MODIFIED_BEFORE_CREATION", "high",
                    f"Modification date is {_human(gap)} BEFORE the creation date, which should be impossible.")
            elif gap > TOLERANCE_SECONDS:
                add("MODIFIED_AFTER_CREATION", "medium",
                    f"Document was modified {_human(gap)} after it was created "
                    f"(created {created.date()}, modified {modified.date()}).")
        elif (created_raw and not created) or (modified_raw and not modified):
            add("UNPARSEABLE_DATE", "low", "A creation or modification date is present but unreadable.")

        tools = " ".join(str(meta.get(k) or "") for k in ("/Producer", "/Creator")).lower()
        hit = next((k for k in EDITOR_KEYWORDS if k in tools), None)
        if hit:
            add("EDITING_TOOL", "medium", f"Producer/Creator names an editing tool ({hit}).")

    eof_count = data.count(b"%%EOF")
    expected = 2 if b"/Linearized" in data[:2048] else 1
    if eof_count > expected:
        add("INCREMENTAL_UPDATE", "medium",
            f"File was saved {eof_count} times by appending changes (typical after editing or signing).")

    ranges = _BYTERANGE_RE.findall(data)
    if ranges:
        start2, len2 = int(ranges[-1][2]), int(ranges[-1][3])
        if len(data.rstrip()) > start2 + len2:
            add("EDITED_AFTER_SIGNING", "high",
                "Digital signature found, and the file contains data added AFTER the signed range.")

    rank = {"high": 2, "medium": 1, "low": 0}
    worst = max((rank[f["severity"]] for f in findings), default=-1)
    if worst >= 1:
        status = "warning"
        explanation = " ".join(f["message"] for f in findings if rank[f["severity"]] >= 1)
    else:
        status = "valid"
        explanation = ("No metadata anomalies found. This does not prove the document is genuine; "
                       "a careful forger can avoid all of these signals.")
    return {"status": status, "explanation": explanation, "findings": findings}


def analyze_pdf_metadata(file_path: str):
    """Backward-compatible wrapper: returns (status, explanation)."""
    r = analyze_pdf_findings(file_path)
    return r["status"], r["explanation"]