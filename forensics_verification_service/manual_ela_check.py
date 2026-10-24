import os
import httpx
from PIL import Image

# Setup
API_URL = "http://127.0.0.1:8000/forensics/ela"

# Updated paths using the exact filenames provided
files_to_test = [
    # --- The Baseline (Original JPEGs) ---
    "samples/sample_for_cv.jpg",
    "samples/sample_cv_2.jpg", 
    
    # --- The Forged JPEGs ---
    "samples/sample_for_cv_forged.jpg",
    
    # --- The WebP/PNG formats (Will be auto-converted to test the limitations) ---
    "samples/sample_cv_3.webp",
    "samples/sample_cv_3_forged.png",
    "samples/sample_cv_4.webp",
    "samples/sample_cv_4_forged.png",
    "samples/sample_cv_2_forged.png"
]

def convert_to_jpg(file_path):
    """Converts an image to JPEG if it isn't already."""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return None
        
    if file_path.lower().endswith((".jpg", ".jpeg")):
        return file_path
        
    jpg_path = file_path.rsplit(".", 1)[0] + "_converted.jpg"
    print(f"Converting {file_path} to {jpg_path}...")
    
    # Convert and save with standard compression to introduce JPEG artifacts
    with Image.open(file_path) as img:
        rgb_im = img.convert("RGB")
        rgb_im.save(jpg_path, "JPEG", quality=85)
        
    return jpg_path

def test_ela(file_path):
    """Sends the file to your API and extracts the anomaly score."""
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "image/jpeg")}
        response = httpx.post(API_URL, files=files, timeout=10.0)
        
    if response.status_code == 200:
        data = response.json()
        print(f"Result for {os.path.basename(file_path)}:")
        print(f"  Status: {data['status']}")
        print(f"  Explanation: {data['explanation']}\n")
    else:
        print(f"Error testing {file_path}: {response.status_code}\n")

# Run the pipeline
print("Starting Automated ELA Testing Pipeline...\n")
for filename in files_to_test:
    # 1. Convert
    jpg_file = convert_to_jpg(filename)
    # 2. Test
    if jpg_file:
        test_ela(jpg_file)