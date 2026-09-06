import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiTrash2,
} from "react-icons/fi";
import { FaTrashCan } from "react-icons/fa6";
import ResultCard from "../components/ResultCard";
import HeatmapViewer from "../components/HeatmapViewer";
import ForensicReport from "../components/ForensicReport";
import styles from "./History.module.css";

const MODE_LABELS = {
  ensemble: "Full Ensemble",
  "ai-art": "AI Art Detector",
  "face-deepfake": "Face Deepfake",
  "full-scan": "Full Image Scan",
};

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    async function fetchHistory() {
      const q = query(
        collection(db, "users", user.uid, "analyses"),
        orderBy("createdAt", "desc"),
        limit(50),
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAnalyses(items);
      setSelectedId(null);
      setLoading(false);
    }

    fetchHistory();
  }, [navigate]);

  const selectedAnalysis = analyses.find((a) => a.id === selectedId) || null;

  // async function handleDelete(e, id) {
  //   e.stopPropagation();
  //   const user = auth.currentUser;
  //   if (!user) return;

  //   try {
  //     await deleteDoc(doc(db, "users", user.uid, "analyses", id));
  //     const nextAnalyses = analyses.filter((a) => a.id !== id);
  //     setAnalyses(nextAnalyses);
  //     setSelectedId((current) =>
  //       current === id ? (nextAnalyses[0]?.id ?? null) : current,
  //     );
  //   } catch (error) {
  //     console.error("Error deleting analysis:", error);
  //   }
  // }

  async function handleDelete(e, id) {
    e.stopPropagation();
    const user = auth.currentUser;
    if (!user) return;

    const analysis = analyses.find((a) => a.id === id);

    try {
      await deleteDoc(doc(db, "users", user.uid, "analyses", id));

      if (analysis?.publicId) {
        try {
          await fetch(
            `/api/cloudinary/${encodeURIComponent(analysis.publicId)}`,
            {
              method: "DELETE",
            },
          );
        } catch (imgErr) {
          console.error("Failed to delete Cloudinary image:", imgErr);
          // Firestore doc is already gone; decide if this should surface to the user
        }
      }

      const nextAnalyses = analyses.filter((a) => a.id !== id);
      setAnalyses(nextAnalyses);
      setSelectedId((current) =>
        current === id ? (nextAnalyses[0]?.id ?? null) : current,
      );
    } catch (error) {
      console.error("Error deleting analysis:", error);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <FiClock size={24} className={styles.headerIcon} />
        <h1 className={styles.title}>Analysis History</h1>
      </div>

      {loading && <p className={styles.empty}>Loading…</p>}

      {!loading && analyses.length === 0 && (
        <p className={styles.empty}>
          No analyses yet. <a href="/analyze">Run your first one.</a>
        </p>
      )}

      {!loading && analyses.length > 0 && (
        <>
          <div className={styles.list}>
            {analyses.map((a) => (
              <div
                key={a.id}
                className={`${styles.card} ${selectedId === a.id ? styles.selected : ""}`}
                onClick={() => setSelectedId(a.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(a.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.cardLeft}>
                  {a.prediction === "FAKE" ? (
                    <FiAlertTriangle className={styles.iconFake} size={20} />
                  ) : (
                    <FiCheckCircle className={styles.iconReal} size={20} />
                  )}
                  <div>
                    <span
                      className={
                        a.prediction === "FAKE"
                          ? styles.badgeFake
                          : styles.badgeReal
                      }
                    >
                      {a.prediction}
                    </span>
                    <p className={styles.filename}>
                      {a.filename || "Unknown file"}
                    </p>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.mode}>
                    {MODE_LABELS[a.mode] || a.mode}
                  </span>
                  <span className={styles.confidence}>
                    {Math.round(a.confidence * 100)}% confidence
                  </span>
                  <span className={styles.date}>
                    {a.createdAt?.toDate().toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) ?? "—"}
                  </span>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, a.id)}
                    aria-label={`Delete analysis for ${a.filename || "unknown file"}`}
                    title="Delete analysis"
                  >
                    <FaTrashCan size={16} color="red" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedAnalysis && (
            <div className={styles.detail}>
              <ResultCard result={selectedAnalysis} />

              <HeatmapViewer
                originalUrl={selectedAnalysis.imageUrl || null}
                heatmapUrl={selectedAnalysis.heatmap_url}
                elaUrl={selectedAnalysis.ela_url}
              />

              {selectedAnalysis.report && (
                <ForensicReport report={selectedAnalysis.report} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
