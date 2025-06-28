import React, { useEffect, useMemo, useState } from "react";
import { praiseWords } from "../../utils/praiseWords";
import { WhatsAppButton, makeShareLink } from "../../utils/utils";

const palette = {
  pink: "#FF8FAB",
  yellow: "#FFD166",
  mint: "#7DE2D1",
  cream: "#FFEAC9",
  violet: "#725AC1",
};

/* ----------------- styling helper ----------------- */
const payCard = {
  background: "#E6F0FF", // 💙 biru-muda, tidak bentrok dgn palette
  border: "2px solid #A7C4FF", // aksen biru sedikit lebih gelap
  borderRadius: 14,
  padding: "10px 16px",
  marginBottom: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  display: "flex",
  alignItems: "center",
  fontWeight: 600,
  fontSize: 15,
  color: palette.violet,
};

interface ChipStyle {
  background: string;
  color: string;
  borderRadius: number;
  padding: string;
  fontWeight: number;
  display: string;
  alignItems: string;
}

const chip = (bg: string, txt: string): ChipStyle => ({
  background: bg,
  color: txt,
  borderRadius: 8,
  padding: "4px 10px",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
});

interface FormatRupiah {
  (value: number | string): string;
}

const formatRupiah: FormatRupiah = (value) => {
  if (typeof value !== "number" && typeof value !== "string") return "0";
  let num = Number(value);
  // Bulatkan ke ratusan terdekat
  num = Math.round(num / 100) * 100;
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/* --------------------- UTILITIES --------------------- */
interface Item {
  id: number;
  name: string;
  price: number;
  paidBy: number;
  participants: number[];
  amounts: Record<number, number>;
  ppnOn?: boolean;
  ppnPercent?: number;
  svcOn?: boolean;
  svcPercent?: number;
}

const getOthers = (item: Item): number[] =>
  item.participants?.filter((pid: number) => pid !== item.paidBy) ?? [];

/* ------------------ SPLIT PER ORANG ------------------ */
interface Friend {
  id: number;
  name: string;
  emoji?: string;
}

interface CalculateSplitResult {
  [id: number]: number;
}

function calculateSplit(
  friends: Friend[],
  items: Item[]
): CalculateSplitResult {
  const total: CalculateSplitResult = Object.fromEntries(
    friends.map((f) => [f.id, 0])
  );

  items.forEach((it) => {
    const m = getItemMultiplier(it);
    it.participants.forEach((pid: number) => {
      total[pid] += Number(it.amounts[pid] || 0) * m;
    });
  });
  return total;
}

interface ItemMultiplierInput {
  ppnOn?: boolean;
  ppnPercent?: number;
  svcOn?: boolean;
  svcPercent?: number;
}

function getItemMultiplier(it: ItemMultiplierInput): number {
  const ppn = it.ppnOn ? Number(it.ppnPercent || 0) / 100 : 0;
  const svc = it.svcOn ? Number(it.svcPercent || 0) / 100 : 0;
  return 1 + ppn + svc;
}

/* --------------------- NERACA ------------------------ */
interface CalculateBalancesResult {
  [id: number]: number;
}

function calculateBalances(
  friends: Friend[],
  items: Item[]
): CalculateBalancesResult {
  const bal: CalculateBalancesResult = Object.fromEntries(
    friends.map((f) => [f.id, 0])
  );

  items.forEach((it: Item) => {
    const m = getItemMultiplier(it);
    it.participants.forEach((pid: number) => {
      const owe = Number(it.amounts[pid] || 0) * m;
      bal[pid] -= owe;
    });
    bal[it.paidBy] += Number(it.price) * m;
  });
  return bal;
}

/* total dibayar murni */
interface PaidTotals {
  [id: number]: number;
}

function calculatePaidTotals(friends: Friend[], items: Item[]): PaidTotals {
  const paid: PaidTotals = Object.fromEntries(friends.map((f) => [f.id, 0]));
  items.forEach((it: Item) => {
    if (!it.price || it.paidBy == null) return;
    paid[it.paidBy] += Number(it.price) * getItemMultiplier(it);
  });
  return paid;
}

type Transfer = { from: number; to: number; amount: number };
function settle(balances: Record<number, number>): Transfer[] {
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id: Number(id), value: v }))
    .sort((a, b) => b.value - a.value);

  const debtors = Object.entries(balances)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id: Number(id), value: -v }))
    .sort((a, b) => b.value - a.value);

  const transfers: Transfer[] = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].value, creditors[j].value);
    transfers.push({ from: debtors[i].id, to: creditors[j].id, amount: pay });
    debtors[i].value -= pay;
    creditors[j].value -= pay;
    if (debtors[i].value === 0) i++;
    if (creditors[j].value === 0) j++;
  }
  return transfers;
}

export default function Step3() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [showCoins, setShowCoins] = useState(false);
  /* --- cari creditor terbesar --- */
  // const [topCreditorId, setTopCreditorId] = useState<number | null>(null);
  // const [kataPujian, setKataPujian] = useState<string>("");

  const balances = calculateBalances(friends, items);
  const paidTotals = calculatePaidTotals(friends, items); // 👈
  const transfers = settle(balances);
  const split = calculateSplit(friends, items);
  const noData = friends.length === 0 || items.length === 0;

  useEffect(() => {
    const storedFriends = localStorage.getItem("friends");
    const storedItems = localStorage.getItem("items");
    if (storedFriends) setFriends(JSON.parse(storedFriends));
    if (storedItems) setItems(JSON.parse(storedItems));
  }, []);

  const topCreditorId = useMemo(() => {
    const max = Object.entries(balances)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])[0];
    return max ? Number(max[0]) : null;
  }, [balances]);

  const kataPujian = useMemo(() => {
    if (topCreditorId == null) return "";
    return praiseWords[Math.floor(Math.random() * praiseWords.length)];
    // dipanggil sekali saja per perubahan ID
  }, [topCreditorId]);

  // useEffect(() => {
  //   // hitung orang dengan saldo positif tertinggi
  //   const maxEntry = Object.entries(balances)
  //     .filter(([, v]) => v > 0)
  //     .sort((a, b) => b[1] - a[1])[0];

  //   if (maxEntry) {
  //     const idTeratas = Number(maxEntry[0]);
  //     setTopCreditorId(idTeratas);

  //     // ambil kalimat random
  //     const random =
  //       praiseWords[Math.floor(Math.random() * praiseWords.length)];
  //     setKataPujian(random);
  //   } else {
  //     setTopCreditorId(null);
  //     setKataPujian("");
  //   }
  // }, [balances]);

  return (
    <div
      style={{
        minHeight: "100svh",
        background: `linear-gradient(135deg, ${palette.pink} 0%, ${palette.mint} 100%)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        padding: 0,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.92)",
          borderRadius: 0,
          boxShadow: "none",
          maxWidth: 430,
          width: "100vw",
          minHeight: "100svh",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 360,
            margin: "0 auto",
            padding: 24,
          }}
        >
          {/* ----------- EMPTY-CARD ----------- */}
          {noData && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                background: "#FFF7E6", // krem lembut
                border: "2px dashed #FFD166",
                borderRadius: 16,
                padding: "32px 20px",
                marginBottom: 28,
                animation: "slideIn 0.5s ease both",
              }}
            >
              <div style={{ fontSize: 44 }}>📋</div>
              <div
                style={{
                  color: palette.violet,
                  fontWeight: 800,
                  fontSize: 20,
                  textAlign: "center",
                  fontFamily: "'Baloo 2', cursive",
                }}
              >
                Belum ada data!
              </div>
              <p style={{ color: "#666", fontSize: 15, textAlign: "center" }}>
                Ayo mulai lagi dengan menambahkan teman
                <br /> dan item di langkah pertama.
              </p>
              <button
                onClick={() => (window.location.href = "/step1")}
                style={{
                  background: palette.violet,
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 24px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px #0002",
                  fontFamily: "'Baloo 2', cursive",
                  transition: "transform 0.2s",
                }}
              >
                Mulai Lagi
              </button>
            </div>
          )}
          {/* -------- END EMPTY-CARD --------- */}
          {/* Progress Bar */}
          {!noData && (
            <>
              <div style={{ width: "100%", marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: palette.violet,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ color: palette.violet }}>3</span>{" "}
                  <span style={{ color: "#aaa" }}>/ 3</span>{" "}
                  <span style={{ fontWeight: 400, color: "#aaa" }}>
                    Review & Split
                  </span>
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
                      width: "100%",
                      height: 6,
                      background: palette.violet,
                      borderRadius: 3,
                      transition: "width 0.4s cubic-bezier(.4,2,.6,1)",
                    }}
                  />
                </div>
              </div>
            </>
          )}
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
                background: palette.yellow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginBottom: 8,
                boxShadow: "0 2px 8px #0001",
              }}
            >
              🎉
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
              Hasil Patungan
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
            Berikut total yang harus dibayar masing-masing:
          </div>
          {/* Hasil Split */}
          <div style={{ width: "100%", marginBottom: 18 }}>
            {friends.map((f, i) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: palette.cream,
                  borderRadius: 16,
                  padding: "16px 18px",
                  marginBottom: 14,
                  boxShadow: "0 2px 8px #0001",
                  position: "relative",
                  overflow: "hidden",
                  animation: `slideIn 0.5s cubic-bezier(.4,2,.6,1) ${
                    i * 0.07 + 0.1
                  }s both`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: palette.mint,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginRight: 14,
                  }}
                >
                  {f.emoji || "🧑"}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: palette.violet,
                      fontFamily: "'Baloo 2', cursive",
                    }}
                  >
                    {f.name}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 14,
                      color: "#888",
                      fontWeight: 500,
                    }}
                  >
                    Total dibayar:{" "}
                    <span
                      style={{
                        color: palette.violet,
                        fontWeight: 700,
                        fontSize: 18,
                        marginLeft: 2,
                      }}
                    >
                      Rp{formatRupiah(paidTotals[f.id] || 0)}
                    </span>
                  </div>
                  {/* ─── Rincian per-event ─── */}
                  <div style={{ marginTop: 6 }}>
                    {items
                      .filter((it) => it.participants.includes(f.id))
                      .map((it) => {
                        const m = getItemMultiplier(it); // ppn+svc already
                        const nominal = Number(it.amounts[f.id] || 0) * m;

                        // Contoh label “(+PPN, +Svc)” bila perlu
                        const info: string[] = [];
                        if (it.ppnOn) info.push("PPN");
                        if (it.svcOn) info.push("Svc");
                        const tag = info.length ? ` (+${info.join(",")})` : "";

                        return (
                          <div
                            key={it.id}
                            style={{
                              fontSize: 13,
                              color: "#555",
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 2,
                            }}
                          >
                            <span>
                              • {it.name}
                              {tag}
                            </span>
                            <span style={{ fontWeight: 600 }}>
                              Rp{formatRupiah(nominal)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  {f.id === topCreditorId && kataPujian && (
                    <div
                      style={{
                        marginTop: 6,
                        background: palette.mint,
                        color: palette.violet,
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 8,
                        padding: "6px 10px",
                        boxShadow: "0 1px 4px #0001",
                      }}
                    >
                      {kataPujian}
                    </div>
                  )}
                </div>
                {split[f.id] === 0 && (
                  <span
                    style={{
                      background: palette.mint,
                      color: palette.violet,
                      fontWeight: 700,
                      fontSize: 13,
                      borderRadius: 8,
                      padding: "4px 10px",
                      marginLeft: 10,
                    }}
                  >
                    Lunas!
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Button Split Now */}
          {/* <button
            style={{
              width: "100%",
              background: palette.violet,
              color: "#fff",
              border: "none",
              borderRadius: 16,
              padding: 18,
              fontWeight: 800,
              fontFamily: "'Baloo 2', cursive",
              fontSize: 18,
              marginBottom: 18,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0001",
              transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
              animation: showCoins ? "shake 0.3s" : undefined,
            }}
            onClick={() => setShowCoins(true)}
            onAnimationEnd={() => setShowCoins(false)}
          >
            Split Now! <span aria-hidden>🪙</span>
          </button> */}

          {transfers.length > 0 && (
            <div style={{ width: "100%", marginBottom: 18 }}>
              <div
                style={{
                  fontWeight: 700,
                  color: palette.violet,
                  marginBottom: 8,
                }}
              >
                Pembayaran antar teman:
              </div>
              {transfers.map((t, i) => {
                const from = friends.find((f) => f.id === t.from);
                const to = friends.find((f) => f.id === t.to);
                if (!from || !to) return null;

                // 🔹 hitung warna latar untuk from / to
                const paletteKeys = Object.keys(
                  palette
                ) as (keyof typeof palette)[];
                const bgFrom =
                  palette[paletteKeys[from.id % paletteKeys.length]];
                const bgTo = palette[paletteKeys[to.id % paletteKeys.length]];

                // 🔹 pilih warna teks kontras (contoh: putih jika bg = violet)
                const textFrom =
                  bgFrom === palette.violet ? "#fff" : palette.violet;
                const textTo =
                  bgTo === palette.violet ? "#fff" : palette.violet;

                return (
                  <div key={i} style={payCard}>
                    <span style={chip(bgFrom, textFrom)}>{from.name}</span>
                    <span style={{ margin: "0 6px" }}>
                      {" "}
                      {/* ikon panah */}➜
                    </span>
                    <span style={chip(bgTo, textTo)}>{to.name}</span>
                    <span style={{ marginLeft: 6 }}>
                      : Rp{formatRupiah(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              width: "100%",
              marginBottom: 12,
            }}
          >
            {/* Kembali */}
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
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Kembali"
              onClick={() => (window.location.href = "/step2")}
            >
              ←
            </button>
            {/* Home */}
            <button
              style={{
                flex: 1,
                background: palette.mint,
                border: "none",
                borderRadius: 12,
                padding: 14,
                fontWeight: 700,
                color: palette.violet,
                fontFamily: "'Baloo 2', cursive",
                cursor: "pointer",
                boxShadow: "0 2px 8px #0001",
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Home"
              onClick={() => (window.location.href = "/")}
            >
              🏠
            </button>
            {/* Reset */}
            <button
              style={{
                flex: 1,
                background: palette.violet,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: 14,
                fontWeight: 700,
                fontFamily: "'Baloo 2', cursive",
                cursor: "pointer",
                boxShadow: "0 2px 8px #0001",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {
                localStorage.clear();
                setFriends([]); // ← kosongkan state lokal juga
                setItems([]);
                // window.location.reload();
              }}
            >
              Reset
            </button>
          </div>
          {/* Share Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <WhatsAppButton
              friends={friends}
              items={items} // ← items sudah punya amounts + ppnOn + …
              paidTotals={paidTotals}
              transfers={transfers}
              formatRupiah={formatRupiah}
            />

            <button
              style={{
                background: palette.yellow,
                color: palette.violet,
                border: "none",
                borderRadius: 12,
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 2px 8px #0001",
                transition: "transform 0.2s",
              }}
              onClick={() => {
                const shareItems = items.map((it) => ({
                  ...it,
                  emoji: "", // or provide a suitable emoji if available
                }));
                const link = makeShareLink(friends, shareItems);
                // Tampilkan toaster notifikasi
                const toaster = document.createElement("div");
                toaster.textContent = "Link disalin!";
                Object.assign(toaster.style, {
                  position: "fixed",
                  top: "24px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: palette.violet,
                  color: "#fff",
                  padding: "12px 28px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "16px",
                  zIndex: 9999,
                  boxShadow: "0 2px 12px #0002",
                  opacity: "0",
                  transition: "opacity 0.3s",
                  fontFamily: "'Baloo 2', cursive",
                });
                document.body.appendChild(toaster);
                setTimeout(() => {
                  toaster.style.opacity = "1";
                }, 10);
                setTimeout(() => {
                  toaster.style.opacity = "0";
                  setTimeout(() => {
                    document.body.removeChild(toaster);
                  }, 300);
                }, 2000);
                navigator.clipboard.writeText(link);
              }}
            >
              <span role="img" aria-label="copy">
                🔗
              </span>{" "}
              Copy Link
            </button>
          </div>
        </div>
        {/* Animasi koin terbang */}
        {/* {showCoins && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100svh",
              pointerEvents: "none",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              animation: "fadeOut 1s forwards",
            }}
          >
            🪙🪙🪙
          </div>
        )} */}
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
          @keyframes shake {
            0% {
              transform: translateX(0);
            }
            20% {
              transform: translateX(-6px);
            }
            40% {
              transform: translateX(6px);
            }
            60% {
              transform: translateX(-4px);
            }
            80% {
              transform: translateX(4px);
            }
            100% {
              transform: translateX(0);
            }
          }
          @keyframes fadeOut {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
