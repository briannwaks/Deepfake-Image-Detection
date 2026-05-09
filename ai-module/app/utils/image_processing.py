import io
import numpy as np
from PIL import Image


def load_image_from_bytes(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data)).convert("RGB")


def preprocess(image: Image.Image, input_size: int) -> np.ndarray:
    """Resize and normalise to [0, 1] with a batch dimension."""
    img = image.resize((input_size, input_size), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def image_to_base64_png(arr: np.ndarray) -> str:
    """Convert a float [0,1] HxWx3 array to a base64 PNG data-URI."""
    import base64
    uint8 = (np.clip(arr, 0, 1) * 255).astype(np.uint8)
    img = Image.fromarray(uint8)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    encoded = base64.b64encode(buf.getvalue()).decode()
    return f"data:image/png;base64,{encoded}"
