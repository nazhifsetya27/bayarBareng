// pages/_app.tsx
import type { AppProps } from "next/app";
import { useEffect } from "react";
import "../styles/globals.css"; // kalau ada global CSS

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // ─── bootstrap share-link sekali saat load ───
    const hash = window.location.hash;
    if (hash.startsWith("#d=")) {
      try {
        const b64 = hash.slice(3);
        const jsonStr = decodeURIComponent(atob(b64));
        const { friends, items } = JSON.parse(jsonStr);

        localStorage.setItem("friends", JSON.stringify(friends));
        localStorage.setItem("items", JSON.stringify(items));
      } catch (err) {
        console.warn("Link patungan tidak valid", err);
        alert("Link patungan tidak valid.");
      } finally {
        window.location.hash = ""; // bersihkan hash
        window.location.replace("/step3"); // hard redirect ke hasil
      }
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
