import os
import pytest
from fastapi.testclient import TestClient
from main import app

# Initialize the test client
client = TestClient(app)

# --- 1. Bidder & Registry Tests ---

def test_verify_gst_astra():
    """Test default/AstraNet valid GSTIN."""
    response = client.get("/verify/gst/ASTRA123")
    assert response.status_code == 200
    assert response.json()["status"] == "valid"

def test_verify_gst_shivalik():
    """Test Shivalik warning GSTIN."""
    response = client.get("/verify/gst/SHIVALIK999")
    assert response.status_code == 200
    assert response.json()["status"] == "warning"

def test_verify_udyam_nexus():
    """Test Nexus Global invalid Udyam."""
    response = client.get("/verify/udyam/NEXUS555")
    assert response.status_code == 200
    assert response.json()["status"] == "invalid"

# --- 2. Forensics Engine Tests ---

def test_forensics_ela():
    """Test the ELA endpoint with the clean baseline image."""
    file_path = "samples/sample_for_cv.jpg"
    
    # Skip if the image isn't in the folder
    if not os.path.exists(file_path):
        pytest.skip(f"Test image {file_path} not found.")
        
    with open(file_path, "rb") as image_file:
        response = client.post(
            "/forensics/ela", 
            files={"file": ("sample_for_cv.jpg", image_file, "image/jpeg")}
        )
        
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] in ["valid", "warning"]
    assert "Anomaly score" in json_data["explanation"]
    assert json_data["evidence"]["value"].startswith("Heatmap URL")

def test_forensics_metadata_invalid_pdf():
    """Test the PDF metadata endpoint's error handling with a broken file."""
    # We send raw text bytes pretending to be a PDF to ensure our pypdf try/except block catches it safely
    dummy_pdf_content = b"This is not a real PDF file."
    
    response = client.post(
        "/forensics/metadata", 
        files={"file": ("fake_document.pdf", dummy_pdf_content, "application/pdf")}
    )
    
    assert response.status_code == 200
    json_data = response.json()
    # It should gracefully return an 'invalid' status wrapped in our standard ForensicsResponse
    assert json_data["status"] == "invalid"
    assert "Failed to read PDF structure" in json_data["explanation"]