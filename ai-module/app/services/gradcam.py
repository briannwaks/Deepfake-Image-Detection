"""
Grad-CAM implementation that works with both EfficientNet and Xception.
Returns a base64 PNG data-URI of the overlay so it can be sent directly
in the JSON response without needing a file server.
"""
import numpy as np
import tensorflow as tf
import cv2
from PIL import Image

from app.models.efficientnet import get_model
from app.utils.image_processing import preprocess, image_to_base64_png
from app.config import settings


def generate(image: Image.Image) -> str:
    model = get_model()
    tensor = preprocess(image, settings.input_size)

    grad_model = tf.keras.Model(
        inputs=model.inputs,
        outputs=[model.get_layer(settings.gradcam_layer).output, model.output],
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(tensor, training=False)
        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_outputs)[0]
    conv_outputs = conv_outputs[0]

    weights = tf.reduce_mean(grads, axis=(0, 1))
    cam = tf.reduce_sum(tf.multiply(weights, conv_outputs), axis=-1).numpy()

    cam = np.maximum(cam, 0)
    cam = cam / (cam.max() + 1e-8)

    # Resize CAM to original image size
    h, w = settings.input_size, settings.input_size
    cam_resized = cv2.resize(cam, (w, h))

    heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

    original = np.array(image.resize((w, h)), dtype=np.float32) / 255.0
    overlay = 0.5 * original + 0.5 * heatmap

    return image_to_base64_png(overlay)
