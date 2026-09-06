import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiChrome } from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./Login.module.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      navigate("/analyze");
    } catch (err) {
      toast.error(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/icons/favicon.svg" alt="DeepGuard Logo" />
        </div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to DeepGuard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <button type="submit" className={styles.btn} disabled={loading}>
            {/* <FiChrome size={18} style={{ marginRight: "8px" }} /> */}
            <img src="/icons/google.avif" alt="google" width={40} height={25} />
            {loading ? "Signing in…" : "Continue with Google"}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/cancelled-popup-request":
      return "Google sign-in request was cancelled.";
    case "auth/popup-blocked":
      return "Google sign-in popup was blocked. Please allow popups and try again.";
    default:
      return "Google sign in failed. Please try again.";
  }
}
