import { useState } from "react";
import { analyzeImage } from "../utils/api";
import { auth, db } from "../firebase";
import { uploadToCloudinary } from "../utils/cloudinary";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read selected image."));
    reader.readAsDataURL(file);
  });
}

export function useAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function run(file, mode = "ensemble") {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeImage(file, mode);
      setResult(data);

      saveAnalysis(data, mode, file, file.name); // fire-and-forget, not awaited
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Analysis failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function saveAnalysis(data, mode, file, filename) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const { imageUrl, publicId } = await uploadToCloudinary(file);

      await addDoc(collection(db, "users", user.uid, "analyses"), {
        prediction: data.prediction,
        confidence: data.confidence,
        raw_score: data.raw_score,
        mode,
        filename,
        imageUrl, // Cloudinary URL instead of base64
        publicId,
        // heatmap_url: data.heatmap_url,
        // ela_url: data.ela_url,
        report: data.report,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to save analysis history:", err);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { result, loading, error, run, reset };
}
