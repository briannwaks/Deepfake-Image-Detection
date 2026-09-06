import { useEffect, useRef, useState } from "react";
import { FiCamera, FiX } from "react-icons/fi";
import styles from "./WebcamCapture.module.css";

export default function WebcamCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (cancelled) {
          // Close/unmount happened before the camera was ready — kill it now.
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
      stopStream();
    };
  }, []);

  function stopStream() {
    const stream = streamRef.current ?? videoRef.current?.srcObject;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (streamRef.current) {
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setReady(false);
  }

  function handleClose() {
    stopStream();
    onClose?.();
  }

  function capture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    stopStream();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "webcam-capture.jpg", {
          type: "image/jpeg",
        });
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Take a Photo</h3>
          <button
            className={styles.close}
            onClick={handleClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {error ? (
          <div className={styles.errorBox}>
            <p>Could not access camera.</p>
            <p className={styles.errorDetail}>{error}</p>
            <p>Make sure you have granted camera permission in your browser.</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => setReady(true)}
            className={styles.video}
          />
        )}

        <div className={styles.actions}>
          <button className="btn-primary" onClick={capture} disabled={!ready}>
            <FiCamera size={16} style={{ marginRight: "0.4rem" }} />
            Capture
          </button>
          <button className={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
