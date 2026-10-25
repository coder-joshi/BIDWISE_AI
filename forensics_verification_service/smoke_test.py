"""
End-to-end check against a RUNNING server (matches the real routes of this project).

    pip install requests
    python -m uvicorn main:app --port 8000        (terminal 1)
    python smoke_test.py                           (terminal 2, from this folder)
"""
import os
import sys
import tempfile

import requests

import pdf_fixtures as fx

BASE = os.environ.get("BASE", "http://127.0.0.1:8000")
ORIGIN = "http://localhost:3000"
ENVELOPE = ["status", "source", "is_mock", "checked_at", "confidence", "explanation", "processing_ms", "disclaimer"]
SAMPLE = next((p for p in ("samples/sample_for_cv_forged.jpg", "test_images/sample_for_cv_forged.jpg") if os.path.exists(p)), None)
results = []


def check(name, ok, detail=""):
    results.append(bool(ok))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f"   ({detail})" if detail else ""))


def has_envelope(j):
    return all(k in j for k in ENVELOPE)


try:
    requests.get(BASE + "/openapi.json", timeout=5).raise_for_status()
except Exception as e:
    sys.exit(f"Cannot reach {BASE}: {e}. Start the server first.")

for b, want in [("AstraNet", "valid"), ("Nexus_Global", "invalid"), ("Shivalik_Digitech", "warning"), ("shivalik", "warning")]:
    r = requests.get(f"{BASE}/demo/bidders/{b}/forensics")
    check(f"demo bidder {b} -> {want}", r.status_code == 200 and r.json().get("status") == want and has_envelope(r.json()))

x, y, w, h = requests.get(f"{BASE}/demo/bidders/Shivalik_Digitech/forensics").json()["evidence"]["bbox"]
check("Shivalik bbox is [x,y,w,h] fractions inside the page", x + w <= 1 and y + h <= 1 and w > 0 and h > 0, f"{[x, y, w, h]}")

for url, want in [("/verify/gst/ASTRA123", "valid"), ("/verify/gst/SHIVALIK9", "warning"),
                  ("/verify/udyam/NEXUS5", "invalid"), ("/verify/udin/U123", "valid")]:
    r = requests.get(BASE + url)
    check(f"GET {url} -> {want}", r.status_code == 200 and r.json().get("status") == want)

r = requests.get(BASE + "/nope")
check("unknown route is a JSON 404", r.status_code == 404 and "json" in r.headers.get("content-type", ""))

if SAMPLE:
    with open(SAMPLE, "rb") as f:
        r = requests.post(BASE + "/forensics/ela", files={"file": ("sample_for_cv_forged.jpg", f, "image/jpeg")})
    j = r.json()
    check("ELA on the forged sample returns 200 + neutral status", r.status_code == 200 and j.get("status") == "info", j.get("status"))
    check("ELA returns the annotated bbox for the demo file", j.get("evidence", {}).get("bbox") is not None)
    check("ELA processing_ms is filled in", j.get("processing_ms", 0) > 0, str(j.get("processing_ms")))
    url = j["evidence"]["value"].replace("Heatmap URL: ", "")
    h_ = requests.get(url)
    check("heatmap URL loads as an image", h_.status_code == 200 and h_.headers.get("content-type") == "image/jpeg", url)
    with open(SAMPLE, "rb") as f:
        j2 = requests.post(BASE + "/forensics/ela", files={"file": ("some_other_file.jpg", f, "image/jpeg")}).json()
    check("ELA gives NO box for files it did not annotate", j2["evidence"]["bbox"] is None)
else:
    check("sample image found (samples/ or test_images/)", False, "skipped ELA checks")

check("ELA rejects .exe", requests.post(BASE + "/forensics/ela", files={"file": ("a.exe", b"MZ")}).status_code == 400)
check("ELA rejects corrupt jpg", requests.post(BASE + "/forensics/ela", files={"file": ("a.jpg", b"nope")}).status_code == 400)

with tempfile.TemporaryDirectory() as tmp:
    clean = fx.make_pdf(os.path.join(tmp, "clean.pdf"))
    edited = fx.make_signed_then_edited(clean, os.path.join(tmp, "edited.pdf"))
    incr = fx.make_incremental(clean, os.path.join(tmp, "incr.pdf"))
    for name, path, want in [("clean pdf", clean, "valid"), ("edited-after-signing pdf", edited, "warning"),
                             ("incrementally saved pdf", incr, "warning")]:
        with open(path, "rb") as f:
            r = requests.post(BASE + "/forensics/metadata", files={"file": ("doc.pdf", f, "application/pdf")})
        check(f"metadata: {name} -> {want}", r.status_code == 200 and r.json().get("status") == want, r.json().get("evidence", {}).get("value"))
    victim = "smoke_victim.pdf"
    open(victim, "wb").write(b"precious")
    with open(clean, "rb") as f:
        requests.post(BASE + "/forensics/metadata", files={"file": ("../" + victim, f, "application/pdf")})
    check("metadata upload cannot overwrite files outside temp/", os.path.exists(victim) and open(victim, "rb").read() == b"precious")
    os.remove(victim)
r = requests.post(BASE + "/forensics/metadata", files={"file": ("bad.pdf", b"not a pdf")})
check("metadata: corrupt pdf -> 200 'invalid' (no crash)", r.status_code == 200 and r.json().get("status") == "invalid")
check("metadata rejects .txt", requests.post(BASE + "/forensics/metadata", files={"file": ("a.txt", b"x")}).status_code == 400)

r = requests.get(BASE + "/demo/bidders/AstraNet/forensics", headers={"Origin": ORIGIN})
check("CORS allows the frontend origin", r.headers.get("access-control-allow-origin") in ("*", ORIGIN))
check("X-Process-Time-Ms header present and exposed to browsers",
      "x-process-time-ms" in {k.lower() for k in r.headers} and "x-process-time-ms" in r.headers.get("access-control-expose-headers", "").lower())

print(f"\n{sum(results)}/{len(results)} checks passed")
sys.exit(0 if all(results) else 1)