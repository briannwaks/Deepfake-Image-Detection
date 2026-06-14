from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    hf_api_token: str = ""
    hf_model_id: str = "Wvolf/ViT_Deepfake_Detection"
    hf_api_base: str = "https://api-inference.huggingface.co/models"
    confidence_threshold: float = 0.5
    max_image_size_mb: int = 10
    ela_quality: int = 90


settings = Settings()
