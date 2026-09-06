// cloudinary.js
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// cloudinary.js (client)
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    console.error("Cloudinary upload error:", errBody);
    throw new Error(errBody?.error?.message || "Image upload failed");
  }

  const data = await res.json();
  return { imageUrl: data.secure_url, publicId: data.public_id };
}
