import io

import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance


def generate_ela_heatmap(image_path: str, output_path: str, resave_quality: int = 90):
    """
    Writes an Error Level Analysis heatmap (JPEG) for a human reviewer to inspect.
    Returns (output_path, score). The score is NOT reliable (see README): do not use it to decide anything.
    The re-save happens in memory, so there is no temp file to clash between concurrent uploads
    or to fail to delete on Windows.
    """
    try:
        original = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"Invalid image format: {e}")

    buf = io.BytesIO()
    original.save(buf, "JPEG", quality=resave_quality)
    buf.seek(0)
    resaved = Image.open(buf).convert("RGB")

    ela_image = ImageChops.difference(original, resaved)

    extrema = ela_image.getextrema()
    max_diff = max(ex[1] for ex in extrema) or 1
    heatmap = ImageEnhance.Brightness(ela_image).enhance(255.0 / max_diff)
    heatmap.save(output_path, "JPEG")

    img_cv = np.array(ela_image.convert("L"))
    mean_val, std_val = cv2.meanStdDev(img_cv)
    mean_val = mean_val[0][0] or 1
    variation_ratio = std_val[0][0] / mean_val
    anomaly_score = max(0.0, min(1.0, (variation_ratio - 1.0) / 1.5))
    return output_path, round(float(anomaly_score), 3)