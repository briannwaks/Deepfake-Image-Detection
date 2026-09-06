import Router from "express";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // server-only, never in client
});

const router = Router();

router.delete("/cloudinary/:publicId", async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete image" });
  }
});

export default router;
