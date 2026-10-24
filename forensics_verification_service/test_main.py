import io
import os

import pytest
from fastapi.testclient import TestClient
from PIL import Image

import pdf_fixtures as fx
from main import SHIVALIK_BBOX, TEMP_DIR, app

client = TestClient(app)
ENVELOPE = ["status", "source", "is_mock", "checked_at", "confidence", "explanation", "processing_ms", "disclaimer"]


def jpeg_bytes():
    buf = io.BytesIO()
    Image.effect_noise((400, 300), 40).convert("RGB").save(buf, "JPEG", quality=70)
    return buf.getvalue()


def post_pdf(path, name="doc.pdf"):
    with open(path, "rb") as f:
        return client.post("/forensics/metadata", files={"file": (name, f, "application/pdf")})


# ------------------------------------------------------------------ registry mocks
def test_verify_gst_astra_valid():
    r = client.get("/verify/gst/ASTRA123")
    assert r.status_code == 200 and r.json()["status"] == "valid"
    assert all(k in r.json() for k in ENVELOPE)


def test_verify_gst_shivalik_warning():
    assert client.get("/verify/gst/SHIVALIK999").json()["status"] == "warning"


def test_verify_udyam_nexus_invalid():
    j = client.get("/verify/udyam/NEXUS555").json()
    assert j["status"] == "invalid" and "46510" in j["explanation"]


def test_verify_udin_valid():
    assert client.get("/verify/udin/ANY123").json()["status"] == "valid"


# ------------------------------------------------------------------ guided demo
@pytest.mark.parametrize("bidder,status", [("AstraNet", "valid"), ("Nexus_Global", "invalid"),
                                           ("Shivalik_Digitech", "warning")])
def test_demo_bidders(bidder, status):
    r = client.get(f"/demo/bidders/{bidder}/forensics")
    assert r.status_code == 200 and r.json()["status"] == status


def test_demo_ids_are_forgiving():
    assert client.get("/demo/bidders/shivalik/forensics").json()["status"] == "warning"
    assert client.get("/demo/bidders/astranet/forensics").json()["status"] == "valid"


def test_demo_shivalik_bbox_is_valid_fractions():
    x, y, w, h = client.get("/demo/bidders/Shivalik_Digitech/forensics").json()["evidence"]["bbox"]
    assert 0 <= x and 0 <= y and w > 0 and h > 0 and x + w <= 1 and y + h <= 1
    assert [x, y, w, h] == SHIVALIK_BBOX


def test_demo_unknown_bidder_is_json_404():
    r = client.get("/demo/bidders/nobody/forensics")
    assert r.status_code == 404 and r.json()["status"] == "error"


def test_unknown_route_is_json_404():
    r = client.get("/definitely/not/here")
    assert r.status_code == 404 and "json" in r.headers["content-type"]


# ------------------------------------------------------------------ ELA
def test_ela_returns_heatmap_and_no_fake_verdict():
    r = client.post("/forensics/ela", files={"file": ("some_upload.jpg", jpeg_bytes(), "image/jpeg")})
    assert r.status_code == 200
    j = r.json()
    assert j["status"] == "info" and j["confidence"] == "low" and j["is_mock"] is False
    assert "Anomaly score" not in j["explanation"]
    assert j["evidence"]["bbox"] is None              # no box for files we did not annotate
    assert j["processing_ms"] > 0
    heat = client.get("/temp/" + j["evidence"]["value"].rsplit("/", 1)[1])
    assert heat.status_code == 200 and heat.headers["content-type"] == "image/jpeg"


def test_ela_demo_sample_gets_the_annotated_box():
    r = client.post("/forensics/ela", files={"file": ("sample_for_cv_forged.jpg", jpeg_bytes(), "image/jpeg")})
    assert r.json()["evidence"]["bbox"] == SHIVALIK_BBOX
    assert "manual demo annotation" in r.json()["explanation"]


def test_ela_rejects_bad_uploads():
    assert client.post("/forensics/ela", files={"file": ("evil.exe", b"MZ", "application/octet-stream")}).status_code == 400
    assert client.post("/forensics/ela", files={"file": ("broken.jpg", b"not an image", "image/jpeg")}).status_code == 400
    assert client.post("/forensics/ela").status_code == 422


def test_ela_does_not_keep_the_uploaded_file():
    client.post("/forensics/ela", files={"file": ("a.jpg", jpeg_bytes(), "image/jpeg")})
    assert not [f for f in os.listdir(TEMP_DIR) if f.endswith(("_in.jpg", "_in.png", "_in.webp"))]


# ------------------------------------------------------------------ metadata
def test_metadata_clean_pdf(tmp_path):
    j = post_pdf(fx.make_pdf(tmp_path / "c.pdf")).json()
    assert j["status"] == "valid" and j["is_mock"] is False


def test_metadata_few_seconds_gap_is_tolerated(tmp_path):
    p = fx.make_pdf(tmp_path / "s.pdf", modified="D:20240101120005Z")
    assert post_pdf(p).json()["status"] == "valid"


def test_metadata_same_instant_in_other_timezone_is_tolerated(tmp_path):
    p = fx.make_pdf(tmp_path / "tz.pdf", created="D:20240101173000+05'30'", modified="D:20240101120000Z")
    assert post_pdf(p).json()["status"] == "valid"


def test_metadata_modified_long_after_creation_warns(tmp_path):
    p = fx.make_pdf(tmp_path / "m.pdf", created="D:20230101120000Z", modified="D:20250601120000Z")
    j = post_pdf(p).json()
    assert j["status"] == "warning" and "MODIFIED_AFTER_CREATION" in j["evidence"]["value"]


def test_metadata_editing_tool_warns(tmp_path):
    j = post_pdf(fx.make_pdf(tmp_path / "e.pdf", producer="Adobe Photoshop")).json()
    assert j["status"] == "warning" and "EDITING_TOOL" in j["evidence"]["value"]


def test_metadata_incremental_save_warns_even_with_unchanged_dates(tmp_path):
    base = fx.make_pdf(tmp_path / "b.pdf")
    j = post_pdf(fx.make_incremental(base, tmp_path / "i.pdf")).json()
    assert j["status"] == "warning" and "INCREMENTAL_UPDATE" in j["evidence"]["value"]


def test_metadata_edit_after_signature_warns(tmp_path):
    base = fx.make_pdf(tmp_path / "b.pdf")
    ok = post_pdf(fx.make_signed_then_edited(base, tmp_path / "ok.pdf", edit=False)).json()
    bad = post_pdf(fx.make_signed_then_edited(base, tmp_path / "bad.pdf", edit=True)).json()
    assert "EDITED_AFTER_SIGNING" not in ok["evidence"]["value"]
    assert bad["status"] == "warning" and "EDITED_AFTER_SIGNING" in bad["evidence"]["value"]


def test_metadata_corrupt_pdf_is_invalid_not_a_crash(tmp_path):
    p = tmp_path / "x.pdf"
    p.write_bytes(b"This is not a real PDF file.")
    r = post_pdf(p)
    assert r.status_code == 200 and r.json()["status"] == "invalid"
    assert "Failed to read PDF structure" in r.json()["explanation"]


def test_metadata_rejects_non_pdf_extension():
    assert client.post("/forensics/metadata", files={"file": ("a.txt", b"x", "text/plain")}).status_code == 400


def test_metadata_filename_cannot_escape_temp(tmp_path):
    victim = os.path.join(os.path.dirname(TEMP_DIR), "victim_do_not_touch.pdf")
    with open(victim, "wb") as f:
        f.write(b"precious")
    try:
        post_pdf(fx.make_pdf(tmp_path / "c.pdf"), name="../victim_do_not_touch.pdf")
        assert os.path.exists(victim) and open(victim, "rb").read() == b"precious"
    finally:
        if os.path.exists(victim):
            os.remove(victim)


# ------------------------------------------------------------------ cross-cutting
def test_cors_and_latency_header_exposed():
    r = client.get("/demo/bidders/AstraNet/forensics", headers={"Origin": "http://localhost:3000"})
    assert r.headers["access-control-allow-origin"] in ("*", "http://localhost:3000")
    assert "x-process-time-ms" in {k.lower() for k in r.headers}
    assert "X-Process-Time-Ms" in r.headers["access-control-expose-headers"]