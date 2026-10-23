import os
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

def generate_ela_heatmap(image_path: str, output_path: str, quality: int = 90):
    """
    Performs Error Level Analysis (ELA) on a JPEG image.
    Saves the resulting heatmap to output_path.
    """
    # 1. Open the original image
    original = Image.open(image_path).convert("RGB")
    
    # 2. Re-save it temporarily at a known quality level
    temp_filename = "temp_ela_resave.jpg"
    original.save(temp_filename, "JPEG", quality=quality)
    
    # 3. Open the re-saved temporary image
    resaved = Image.open(temp_filename)
    
    # 4. Calculate the absolute difference between original and resaved
    # The areas that were edited recently will have higher difference values
    ela_image = ImageChops.difference(original, resaved)
    
    # 5. Enhance the difference to make it visible to the human eye
    # We find the maximum pixel value in the difference and scale it up
    extrema = ela_image.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    
    if max_diff == 0:
        max_diff = 1 # Prevent division by zero
        
    scale = 255.0 / max_diff
    ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)
    
    # 6. Save the final heatmap
    ela_image.save(output_path, "JPEG")
    
    # Cleanup temporary file
    if os.path.exists(temp_filename):
        os.remove(temp_filename)
        
    return output_path