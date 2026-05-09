from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    model_name: str = "efficientnet"
    model_weights_path: str = "models/weights.h5"
    input_size: int = 224
    confidence_threshold: float = 0.5
    gradcam_layer: str = "top_conv"
    max_image_size_mb: int = 10


settings = Settings()
