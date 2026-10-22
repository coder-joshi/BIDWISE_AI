import cv2
import numpy as np
import os

def run_ela(image_bytes, output_filename="ela_heatmap.jpg"):
    # Convert bytes to numpy array and decode image
    nparr = np.frombuffer(image_bytes, np.uint8)
    original = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if original is None:
        return {"error": "Invalid image file"}

    # Save at 90% quality to force compression loss
    temp_jpg = "temp_compressed.jpg"
    cv2.imwrite(temp_jpg, original, [cv2.IMWRITE_JPEG_QUALITY, 90])
    compressed = cv2.imread(temp_jpg)

    # Calculate absolute difference (ELA)
    diff = cv2.absdiff(original, compressed)
    
    # Enhance the difference to make the heatmap pop
    extrema = diff.max()
    if extrema == 0:
        extrema = 1
    scale = 255.0 / extrema
    ela_image = cv2.convertScaleAbs(diff, alpha=scale)

    # Save the final heatmap
    cv2.imwrite(output_filename, ela_image)
    os.remove(temp_jpg)
    
    return {"status": "success", "heatmap_path": output_filename, "tamper_detected": True}