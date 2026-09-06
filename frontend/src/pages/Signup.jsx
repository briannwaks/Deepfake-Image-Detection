import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FiShield, FiChrome } from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./Login.module.css";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const { user } = await signInWithPopup(auth, provider);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "Google User",
          email: user.email,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

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
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join DeepGuard today</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <button type="submit" className={styles.btn} disabled={loading}>
            {/* <FiChrome size={18} style={{ marginRight: "8px" }} /> */}
            <img src="/icons/google.avif" alt="google" width={40} height={25} />
            {loading ? "Creating account…" : "Continue with Google"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/popup-closed-by-user":
      return "Google sign-up was cancelled.";
    case "auth/cancelled-popup-request":
      return "Google sign-up request was cancelled.";
    case "auth/popup-blocked":
      return "Google sign-up popup was blocked. Please allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists for this Google profile.";
    default:
      return "Sign up failed. Please try again.";
  }
}
