import React, { useEffect, useState } from "react";

const palette = {
  pink: "#FF8FAB",
  yellow: "#FFD166",
  mint: "#7DE2D1",
  cream: "#FFEAC9",
  violet: "#725AC1",
};

export default function Step1() {
  type Friend = { name: string; id: number; isMe?: boolean };
  const [friends, setFriends] = useState<Friend[]>([
    { name: "", id: 1, isMe: false },
    { name: "", id: 2, isMe: false },
  ]);
  const [meId, setMeId] = useState<number | null>(null);
  const [inputFocus, setInputFocus] = useState<number | null>(null);

  const validCount = friends.filter((f) => f.name.trim() !== "").length;
  const canContinue = validCount >= 2; // harus lebih dari 2 orang

  // Animasi slide-in
  const cardAnim = (i: number) => ({
    animation: `slideIn 0.5s cubic-bezier(.4,2,.6,1) ${i * 0.07 + 0.1}s both`,
  });

  useEffect(() => {
    const stored = localStorage.getItem("friends");
    if (stored) setFriends(JSON.parse(stored));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${palette.pink} 0%, ${palette.mint} 100%)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          borderRadius: 20,
          boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
          maxWidth: 360,
          width: "100%",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Progress Bar */}
        <div style={{ width: "100%", marginBottom: 18 }}>
          <div
            style={{
              fontSize: 13,
              color: palette.violet,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            <span style={{ color: palette.violet }}>1</span>{" "}
            <span style={{ color: "#aaa" }}>/ 3</span>{" "}
            <span style={{ fontWeight: 400, color: "#aaa" }}>Tambah Orang</span>
          </div>
          <div
            style={{
              height: 6,
              background: palette.cream,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "33%",
                height: 6,
                background: palette.violet,
                borderRadius: 3,
                transition: "width 0.4s cubic-bezier(.4,2,.6,1)",
              }}
            />
          </div>
        </div>
        {/* Title */}
        <div
          style={{
            margin: "18px 0 8px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: palette.mint,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              marginBottom: 8,
              boxShadow: "0 2px 8px #0001",
            }}
          >
            👫
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 20,
              color: palette.violet,
              fontFamily: "'Baloo 2', cursive",
              letterSpacing: 0.5,
            }}
          >
            Siapa aja yang ikut?
          </span>
        </div>
        <div
          style={{
            color: "#888",
            fontSize: 15,
            marginBottom: 18,
            textAlign: "center",
          }}
        >
          Masukin nama teman-teman yang ikut acara ini bareng kamu, ya!
        </div>
        {/* Card List */}
        <div style={{ width: "100%", marginBottom: 12 }}>
          {friends.map((f, i) => (
            <div
              key={f.id}
              style={{
                display: "flex",
                alignItems: "center",
                background: palette.cream,
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 12,
                boxShadow: "0 2px 8px #0001",
                position: "relative",
                minWidth: 0,
                ...cardAnim(i),
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  // flex: "0 0 36px", // ⬅️ stop grow & shrink
                  // borderRadius: "50%", // ⬅️ true circle, berapa pun ukuran
                  // overflow: "hidden", // (opsional) potong emoji besar
                  borderRadius: 18,
                  background: palette.yellow,
                  marginRight: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  border:
                    meId === f.id ? `2px solid ${palette.violet}` : "none",
                }}
              >
                {meId === f.id ? "😊" : "🧑"}
              </div>
              <input
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: 16,
                  fontWeight: 600,
                  color: palette.violet,
                  outline:
                    inputFocus === i ? `2px solid ${palette.pink}` : "none",
                  borderRadius: 8,
                  padding: "4px 6px",
                  transition: "outline 0.2s",
                }}
                placeholder={meId === f.id ? "Kamu" : "Nama teman..."}
                value={f.name}
                // disabled={!!f.isMe}
                onFocus={() => setInputFocus(i)}
                onBlur={() => setInputFocus(null)}
                onChange={(e) => {
                  const arr = [...friends];
                  arr[i].name = e.target.value;
                  setFriends(arr);
                }}
                // aria-label={f.isMe ? "Nama kamu" : "Nama teman"}
              />
              {f.isMe ? (
                <span
                  style={{
                    background: palette.mint,
                    borderRadius: 8,
                    fontSize: 12,
                    padding: "2px 10px",
                    marginLeft: 10,
                    color: palette.violet,
                    fontWeight: 700,
                  }}
                >
                  Me
                </span>
              ) : (
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: palette.violet,
                    fontSize: 20,
                    // marginLeft: 10,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    marginLeft:
                      "auto" /* ⬅️ dorong ke kanan, tidak menambah lebar */,
                    flexShrink: 0 /* jangan ikut direnggangkan */,
                  }}
                  aria-label="Hapus teman"
                  onClick={() => {
                    setFriends(friends.filter((_, idx) => idx !== i));
                    if (meId === f.id) setMeId(null);
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
        {/* Add Friend Button */}
        <button
          style={{
            width: "100%",
            border: `2px dashed ${palette.mint}`,
            background: "none",
            borderRadius: 12,
            padding: 14,
            color: palette.violet,
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 18,
            marginTop: 2,
            cursor: "pointer",
            transition: "background 0.2s, color 0.2s",
          }}
          onClick={() => setFriends([...friends, { name: "", id: Date.now() }])}
        >
          + Tambah Teman
        </button>
        {/* Tips */}
        <div
          style={{
            background: palette.mint,
            borderRadius: 10,
            padding: 12,
            fontSize: 13,
            color: palette.violet,
            marginBottom: 16,
            width: "100%",
            boxShadow: "0 2px 8px #0001",
            textAlign: "center",
          }}
        >
          <b>Tips</b>{" "}
          <span role="img" aria-label="info">
            💡
          </span>
          <br />
          Minimal 2 orang untuk mulai hitung patungan. Kamu bisa tambah atau
          hapus teman.
        </div>
        {/* Navigation Buttons */}
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button
            style={{
              flex: 1,
              background: palette.cream,
              border: "none",
              borderRadius: 12,
              padding: 14,
              fontWeight: 700,
              color: palette.violet,
              fontFamily: "'Baloo 2', cursive",
              cursor: "pointer",
              boxShadow: "0 2px 8px #0001",
            }}
            onClick={() => (window.location.href = "/")}
          >
            Kembali
          </button>
          <button
            style={{
              flex: 2,
              background: canContinue ? palette.violet : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: 14,
              fontWeight: 700,
              fontFamily: "'Baloo 2', cursive",
              cursor: canContinue ? "pointer" : "not-allowed",
              boxShadow: "0 2px 8px #0001",
              transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
              opacity: canContinue ? 1 : 0.5,
            }}
            disabled={!canContinue}
            onClick={() => {
              if (!canContinue) return; // ekstra keamanan
              localStorage.setItem("friends", JSON.stringify(friends));
              window.location.href = "/step2";
            }}
          >
            Lanjut ke Item
          </button>
        </div>
        {!canContinue && (
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            Minimal 2 orang untuk melanjutkan.
          </div>
        )}
        {/* Floating Add Button */}
        <button
          style={{
            position: "fixed",
            right: 32,
            bottom: 32,
            width: 56,
            height: 56,
            borderRadius: 28,
            background: palette.pink,
            color: "#fff",
            fontSize: 32,
            border: "none",
            boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
          }}
          aria-label="Tambah Teman"
          onClick={() =>
            setFriends([
              ...friends.slice(0, -1),
              { name: "", id: Date.now() },
              friends[friends.length - 1],
            ])
          }
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "rotate(45deg) scale(1.08)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "rotate(0deg) scale(1)")
          }
        >
          +
        </button>
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Inter:wght@400;500;700&display=swap");
          @keyframes slideIn {
            0% {
              opacity: 0;
              transform: translateY(40px);
            }
            80% {
              opacity: 1;
              transform: translateY(-8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
