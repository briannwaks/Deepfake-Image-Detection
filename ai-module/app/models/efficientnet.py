"""
Model loader — supports EfficientNetB4 and Xception backbones.

If pre-trained weights are present at MODEL_WEIGHTS_PATH they are loaded;
otherwise the network is built with ImageNet weights for development/testing.
"""
import os
import logging
from functools import lru_cache

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB4, Xception

from app.config import settings

logger = logging.getLogger(__name__)


def _build_model(backbone: str, input_size: int) -> Model:
    inputs = tf.keras.Input(shape=(input_size, input_size, 3))

    if backbone == "efficientnet":
        base = EfficientNetB4(include_top=False, weights="imagenet", input_tensor=inputs)
        conv_layer_name = "top_conv"
    else:
        base = Xception(include_top=False, weights="imagenet", input_tensor=inputs)
        conv_layer_name = "block14_sepconv2_act"

    x = layers.GlobalAveragePooling2D()(base.output)
    x = layers.Dropout(0.3)(x)
    output = layers.Dense(1, activation="sigmoid", name="predictions")(x)

    model = Model(inputs=inputs, outputs=output)
    model._gradcam_layer = conv_layer_name
    return model


@lru_cache(maxsize=1)
def get_model() -> Model:
    model = _build_model(settings.model_name, settings.input_size)

    weights_path = settings.model_weights_path
    if weights_path and os.path.exists(weights_path):
        model.load_weights(weights_path)
        logger.info("Loaded weights from %s", weights_path)
    else:
        logger.warning("No weights file found at '%s' — using ImageNet init (dev only)", weights_path)

    return model
