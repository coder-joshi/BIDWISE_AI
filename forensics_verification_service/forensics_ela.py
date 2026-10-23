import os
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

def generate_ela_heatmap(image_path: str, output_path: str, resave_quality: int = 90):
    # 1. Safely handle real-world uploads (PNGs, WebP, etc.) by forcing RGB
    try:
        original = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"Invalid image format: {e}")
        
    # 2. Create a unique temp file so concurrent customer uploads don't overwrite each other
    temp_filename = f"temp_resave_{os.urandom(4).hex()}.jpg"
    original.save(temp_filename, "JPEG", quality=resave_quality)
    
    resaved = Image.open(temp_filename)
    
    # 3. Calculate absolute pixel differences
    ela_image = ImageChops.difference(original, resaved)
    
    # 4. Generate the brightened heatmap for the frontend viewer
    extrema = ela_image.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    if max_diff == 0: max_diff = 1
        
    scale = 255.0 / max_diff
    heatmap = ImageEnhance.Brightness(ela_image).enhance(scale)
    heatmap.save(output_path, "JPEG")
    
    # 5. Real-World Anomaly Scoring (Statistical Method)
    # We analyze the RAW difference data (not the brightened frontend heatmap)
    img_cv = np.array(ela_image.convert('L'))
    
    # Calculate the image's specific background noise (mean) and variance (std_dev)
    mean_val, std_val = cv2.meanStdDev(img_cv)
    mean_val = mean_val[0][0]
    std_val = std_val[0][0]
    
    if mean_val == 0: mean_val = 1 # Prevent division by zero
    
    # The Coefficient of Variation: 
    # A clean image has uniform compression noise (low variation). 
    # A tampered image has localized extreme spikes where pasted edits occurred (high variation).
    variation_ratio = std_val / mean_val
    
    # Map the statistical ratio to a 0.0 to 1.0 confidence score
    # Usually, untampered images sit around 0.5 to 1.2. Forgeries spike above 1.5.
    base_threshold = 1.0
    anomaly_score = max(0.0, min(1.0, (variation_ratio - base_threshold) / 1.5))
    
    # Cleanup
    if os.path.exists(temp_filename):
        os.remove(temp_filename)
        
    return output_path, round(anomaly_score, 3)