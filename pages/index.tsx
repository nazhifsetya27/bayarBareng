import React, { useState } from "react";
// import Confetti from "react-confetti"; // Uncomment jika sudah install
// import Lottie from "lottie-react"; // Untuk animasi lottie

const palette = {
  pink: "#FF8FAB",
  yellow: "#FFD166",
  mint: "#7DE2D1",
  cream: "#FFEAC9",
  violet: "#725AC1",
};

const Home: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStart = () => {
    setShowConfetti(true);
    setTimeout(() => {
      window.location.href = "/step1";
    }, 1200);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${palette.pink} 0%, ${palette.mint} 100%)`,
      }}
    >
      {/* {showConfetti && <Confetti numberOfPieces={120} recycle={false} />} */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          borderRadius: 20,
          boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
          maxWidth: 340,
          width: "100%",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Hero Illustration */}
        <div
          style={{
            width: 200,
            height: 140,
            background: `linear-gradient(135deg, ${palette.yellow} 0%, ${palette.pink} 100%)`,
            borderRadius: 24,
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Highlight gloss */}
          <div
            style={{
              position: "absolute",
              top: -40,
              left: -60,
              width: 180,
              height: 180,
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)",
              pointerEvents: "none",
            }}
          />
          {/* Cartoon Friends emoji */}
          <span
            role="img"
            aria-label="Cartoon Friends"
            style={{
              fontSize: 54,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
              animation: "float 3.5s ease-in-out infinite",
            }}
          >
            👫🧾😄
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: 32,
            fontWeight: 800,
            color: palette.violet,
            marginBottom: 8,
            letterSpacing: 1,
            textShadow: "0 2px 8px #FFD16644",
          }}
        >
          BayarBareng
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            color: palette.violet,
            fontSize: 16,
            marginBottom: 32,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          Hitung patungan per-item, tanpa drama.
        </p>
        <button
          onClick={handleStart}
          style={{
            background: palette.violet,
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "16px 40px",
            fontFamily: "'Baloo 2', cursive",
            fontSize: 18,
            fontWeight: 700,
            boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
            cursor: "pointer",
            transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
            outline: "none",
            marginBottom: 8,
            position: "relative",
            overflow: "hidden",
            animation: showConfetti ? "bounce 0.3s" : undefined,
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(0.95)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          Mulai Hitung <span aria-hidden>✨</span>
        </button>
        {/* Micro-animation: Confetti burst */}
        {showConfetti && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {/* <Confetti numberOfPieces={120} recycle={false} /> */}
            {/* Atau Lottie animasi confetti */}
          </div>
        )}
      </div>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Inter:wght@400;500;700&display=swap");
        body {
          margin: 0;
          padding: 0;
        }
        button:active {
          transform: scale(0.95);
        }
        button:hover {
          transform: scale(1.06) rotate(-2deg);
        }
        @keyframes bounce {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.12);
          }
          60% {
            transform: scale(0.96);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
