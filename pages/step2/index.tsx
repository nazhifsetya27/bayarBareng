import React, { useEffect, useState } from "react";
interface Item {
  id: number;
  emoji: string;
  name: string;
  price: string; // sama
  participants: number[]; // tetap
  paidBy: number | null; // tetap
  amounts: Record<number, string>; // ⇐ NEW  { pid: "12000", … }
  ppnOn?: boolean; // NEW
  ppnPercent?: string; // NEW ("10")
  svcOn?: boolean; // NEW
  svcPercent?: string;
}

/* =========================================================
   1. Helper komponen  ToggleChip
   ========================================================= */
const ToggleChip = ({
  checked,
  onChange,
  label,
  accent,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  accent: string; // warna saat aktif (ambil dari palette)
}) => (
  <label
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      userSelect: "none",
      fontSize: 14,
      fontWeight: 700,
      color: palette.violet,
    }}
  >
    {/* checkbox asli disembunyikan */}
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ display: "none" }}
    />
    {/* chip visual */}
    <span
      style={{
        minWidth: 16,
        height: 16,
        borderRadius: 11,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: checked ? accent : "transparent",
        border: `2px solid ${accent}`,
        transition: "all 0.25s",
      }}
    >
      {/* centang kecil */}
      {checked && (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path
            d="M1 5l3 3 7-7"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
    <span>{label}</span>
  </label>
);

/* di file Step2 (di atas komponen utama) */
const InfoTip: React.FC<{ message: string }> = ({ message }) => {
  const [show, setShow] = React.useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* lingkaran ? */}
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 9,
          background: palette.violet,
          color: "#fff",
          fontSize: 8,
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          verticalAlign: "top",
          cursor: "help",
          marginLeft: 4,
        }}
      >
        ?
      </span>

      {/* tooltip */}
      {show && (
        <div
          style={{
            position: "absolute",
            top: "130%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: `2px solid ${palette.violet}`,
            borderRadius: 10,
            padding: "6px 10px",
            fontSize: 12,
            color: palette.violet,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px #0002",
            zIndex: 100,
          }}
        >
          {message}
        </div>
      )}
    </span>
  );
};

const palette = {
  pink: "#FF8FAB",
  yellow: "#FFD166",
  mint: "#7DE2D1",
  cream: "#FFEAC9",
  violet: "#725AC1",
};

const emojiList = [
  "🍕",
  "🥤",
  "🍔",
  "🍟",
  "🍦",
  "🍰",
  "🎬",
  "🧃",
  "🍗",
  "🍜",
  "☕",
];
function formatRupiah(value: string) {
  const num = value.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function Step2() {
  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      emoji: "☕",
      name: "",
      price: "",
      participants: [] as number[],
      paidBy: null as number | null,
      amounts: {},
      ppnOn: false,
      ppnPercent: "10",
      svcOn: false,
      svcPercent: "5",
    },
  ]);
  const [friends, setFriends] = useState<{ id: number; name: string }[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);

  // Helper: true kalau ada item yang BELUM lengkap
  const hasIncomplete = items.some((it) => {
    if (!it.name.trim() || !it.price || it.paidBy == null) return true;

    const amt = it.amounts ?? {}; // guard

    const filled = it.participants.every((pid) => Number(amt[pid] || 0) > 0);

    const sum = it.participants.reduce(
      (s, pid) => s + Number(amt[pid] || 0),
      0
    );

    if (it.ppnOn && !Number(it.ppnPercent)) return true;
    if (it.svcOn && !Number(it.svcPercent)) return true;

    return !filled || sum !== Number(it.price);
  });

  // Tombol boleh klik hanya jika semua item lengkap
  const canContinue = !hasIncomplete && items.length > 0;

  // Animasi slide-in
  const cardAnim = (i: number) => ({
    animation: `slideIn 0.5s cubic-bezier(.4,2,.6,1) ${i * 0.07 + 0.1}s both`,
  });

  // Count-up animasi harga
  const [priceAnim, setPriceAnim] = useState<{ [id: number]: number }>({});

  const handlePriceChange = (id: number, value: string) => {
    const num = parseInt(value.replace(/\D/g, "")) || 0;
    setItems((items) =>
      items.map((item) => (item.id === id ? { ...item, price: value } : item))
    );
    setPriceAnim((anim) => ({ ...anim, [id]: num }));
  };

  useEffect(() => {
    const storedItems = localStorage.getItem("items");
    if (storedItems) {
      const parsed: Item[] = JSON.parse(storedItems).map((it: any) => ({
        ...it,
        amounts: it.amounts ?? {}, // ← fallback ke objek kosong
      }));
      setItems(parsed);
    }
    const stored = localStorage.getItem("friends");
    if (stored) setFriends(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  return (
    <div
      style={{
        minHeight: "100svh",
        width: "100vw",
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
              <span style={{ color: palette.violet }}>2</span>{" "}
              <span style={{ color: "#aaa" }}>/ 3</span>{" "}
              <span style={{ fontWeight: 400, color: "#aaa" }}>
                Tambah Item
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
                  width: "66%",
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
                background: palette.yellow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginBottom: 8,
                boxShadow: "0 2px 8px #0001",
              }}
            >
              🛒
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
              Tambah Item Belanja
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
            Masukkan item, harga, dan siapa saja yang ikut membayar
          </div>
          {/* Item List */}
          <div style={{ width: "100%", marginBottom: 12 }}>
            {items.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: palette.cream,
                  borderRadius: 12,
                  padding: "14px 14px 10px 14px",
                  marginBottom: 14,
                  boxShadow: "0 2px 8px #0001",
                  position: "relative",
                  ...cardAnim(i),
                }}
              >
                {/* Tombol hapus di pojok kanan atas */}
                <button
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "none",
                    border: "none",
                    color: palette.violet,
                    fontSize: 18,
                    cursor: "pointer",
                    padding: 4,
                    zIndex: 2,
                  }}
                  aria-label="Hapus item"
                  onClick={() =>
                    setItems(items.filter((it) => it.id !== item.id))
                  }
                >
                  🗑️
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                    // border: "2px solid red",
                  }}
                >
                  {/* Emoji Picker */}
                  <button
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: palette.mint,
                      border: "none",
                      fontSize: 22,
                      marginRight: 10,
                      cursor: "pointer",
                      transition: "box-shadow 0.2s",
                      boxShadow: "0 2px 8px #0001",
                      position: "relative",
                    }}
                    aria-label="Pilih emoji"
                    onClick={() =>
                      setShowEmojiPicker(
                        showEmojiPicker === item.id ? null : item.id
                      )
                    }
                  >
                    {item.emoji}
                    {showEmojiPicker === item.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: 44,
                          left: 0,
                          background: "#fff",
                          borderRadius: 10,
                          boxShadow: "0 2px 8px #0002",
                          padding: 6,
                          zIndex: 10,
                          display: "flex",
                          gap: 4,
                        }}
                      >
                        {emojiList.map((em, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 20,
                              cursor: "pointer",
                              padding: 4,
                              borderRadius: 6,
                              transition: "background 0.2s",
                              background:
                                em === item.emoji ? palette.pink : "none",
                            }}
                            onClick={() => {
                              setItems((items) =>
                                items.map((it) =>
                                  it.id === item.id ? { ...it, emoji: em } : it
                                )
                              );
                              setShowEmojiPicker(null);
                            }}
                          >
                            {em}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                  {/* Nama Item */}
                  <input
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: 16,
                      fontWeight: 600,
                      color: palette.violet,
                      borderRadius: 8,
                      padding: "6px 8px",
                      marginRight: 25,
                    }}
                    placeholder="Nama item (cth: Ngopi)"
                    value={item.name}
                    onChange={(e) =>
                      setItems((items) =>
                        items.map((it) =>
                          it.id === item.id
                            ? { ...it, name: e.target.value }
                            : it
                        )
                      )
                    }
                    aria-label="Nama item"
                  />
                </div>
                {/* Harga */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 90,
                    flexShrink: 0,
                    background: "#fff0",
                    borderRadius: 8,
                    padding: 0,
                    width: "fit-content",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      color: palette.violet,
                      fontWeight: 600,
                      flexShrink: 0,
                      lineHeight: 1,
                      display: "inline-block",
                      minWidth: 24,
                      textAlign: "right",
                      marginRight: 4,
                    }}
                  >
                    Rp
                  </span>
                  <input
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: 16,
                      fontWeight: 700,
                      color: palette.violet,
                      borderRadius: 8,
                      padding: "6px 8px 6px 8px",
                      width: 80,
                      textAlign: "left",
                      outline: "none",
                      flex: 1,
                      minWidth: 0,
                    }}
                    placeholder="Harga"
                    value={formatRupiah(item.price)}
                    onChange={(e) =>
                      handlePriceChange(
                        item.id,
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    inputMode="numeric"
                    aria-label="Harga item"
                  />
                </div>
                {/* Chips Teman yang ikutan */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {friends.map((f) => (
                    <button
                      key={f.id}
                      style={{
                        background: item.participants.includes(f.id)
                          ? palette.violet
                          : palette.mint,
                        color: item.participants.includes(f.id)
                          ? "#fff"
                          : palette.violet,
                        border: "none",
                        borderRadius: 20,
                        padding: "6px 14px",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        transition: "background 0.2s, color 0.2s",
                        boxShadow: "0 1px 4px #0001",
                        outline: "none",
                      }}
                      onClick={() =>
                        setItems((its) =>
                          its.map((it) => {
                            if (it.id !== item.id) return it;
                            const isSelected = it.participants.includes(f.id);
                            const newParticipants = isSelected
                              ? it.participants.filter((p) => p !== f.id)
                              : [...it.participants, f.id];
                            // Buat amounts baru tanpa key jika di-unselect
                            const newAmounts = { ...(it.amounts || {}) };
                            if (isSelected) {
                              delete newAmounts[f.id];
                            } else {
                              newAmounts[f.id] = "";
                            }
                            return {
                              ...it,
                              participants: newParticipants,
                              amounts: newAmounts,
                            };
                          })
                        )
                      }
                      aria-pressed={item.participants.includes(f.id)}
                    >
                      🧑 {f.name}
                    </button>
                  ))}
                </div>
                {/* Participant amounts */}
                <div
                  style={{
                    marginTop: 10, // jarak pas dengan chip
                    display: "flex",
                    flexDirection: "column",
                    gap: 6, // jarak antar baris
                  }}
                >
                  {item.participants.map((pid) => {
                    const friend = friends.find((x) => x.id === pid);
                    return (
                      <div
                        key={pid}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            minWidth: 70,
                            fontWeight: 700,
                            color: palette.violet,
                            fontFamily: "'Baloo 2', cursive",
                            fontSize: 14,
                          }}
                        >
                          {friend?.name}
                        </span>{" "}
                        <input
                          style={{
                            flex: 1,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            padding: "6px 8px",
                            fontWeight: 600,
                            color: palette.violet,
                          }}
                          placeholder="Rp"
                          value={formatRupiah(item.amounts[pid] || "")}
                          onChange={(e) =>
                            setItems((its) =>
                              its.map((it) =>
                                it.id === item.id
                                  ? {
                                      ...it,
                                      amounts: {
                                        ...it.amounts,
                                        [pid]: e.target.value.replace(
                                          /\D/g,
                                          ""
                                        ),
                                      },
                                    }
                                  : it
                              )
                            )
                          }
                          inputMode="numeric"
                        />
                      </div>
                    );
                  })}
                </div>
                {/* ─── Pajak & Service ─── */}
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* PPN */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <ToggleChip
                        checked={!!item.ppnOn}
                        onChange={() =>
                          setItems((its) =>
                            its.map((it) =>
                              it.id === item.id
                                ? { ...it, ppnOn: !it.ppnOn }
                                : it
                            )
                          )
                        }
                        label="Tambah PPN"
                        accent={palette.mint}
                      />
                      <InfoTip message="Jika PPN dipilih, maka harga yang dimasukkan exclude PPN" />
                    </div>

                    {item.ppnOn && (
                      <>
                        <input
                          style={{
                            width: 64,
                            border: `2px solid ${palette.mint}`,
                            borderRadius: 10,
                            padding: "6px 8px",
                            fontWeight: 700,
                            fontSize: 14,
                            textAlign: "right",
                            color: palette.violet,
                          }}
                          value={item.ppnPercent}
                          onChange={(e) =>
                            setItems((its) =>
                              its.map((it) =>
                                it.id === item.id
                                  ? {
                                      ...it,
                                      ppnPercent: e.target.value.replace(
                                        /\D/g,
                                        ""
                                      ),
                                    }
                                  : it
                              )
                            )
                          }
                          inputMode="numeric"
                        />
                        <span
                          style={{ fontWeight: 700, color: palette.violet }}
                        >
                          %
                        </span>
                      </>
                    )}
                  </div>

                  {/* Service */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <ToggleChip
                        checked={!!item.svcOn}
                        onChange={() =>
                          setItems((its) =>
                            its.map((it) =>
                              it.id === item.id
                                ? { ...it, svcOn: !it.svcOn }
                                : it
                            )
                          )
                        }
                        label="Tambah Service"
                        accent={palette.yellow}
                      />
                      <InfoTip message="Jika Service dipilih, maka harga exclude biaya service" />
                    </div>

                    {item.svcOn && (
                      <>
                        <input
                          style={{
                            width: 64,
                            border: `2px solid ${palette.yellow}`,
                            borderRadius: 10,
                            padding: "6px 8px",
                            fontWeight: 700,
                            fontSize: 14,
                            textAlign: "right",
                            color: palette.violet,
                          }}
                          value={item.svcPercent}
                          onChange={(e) =>
                            setItems((its) =>
                              its.map((it) =>
                                it.id === item.id
                                  ? {
                                      ...it,
                                      svcPercent: e.target.value.replace(
                                        /\D/g,
                                        ""
                                      ),
                                    }
                                  : it
                              )
                            )
                          }
                          inputMode="numeric"
                        />
                        <span
                          style={{ fontWeight: 700, color: palette.violet }}
                        >
                          %
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Dropdown Pilih Pembayar */}
                <div
                  style={{
                    marginTop: 10,
                    marginBottom: 2,
                    position: "relative",
                  }}
                >
                  <select
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 12px",
                      borderRadius: 10,
                      border: `2px solid ${palette.mint}`,
                      background: "#fff",
                      color: palette.violet,
                      fontWeight: 600,
                      fontSize: 15,
                      boxShadow: "0 2px 8px #7DE2D133",
                      outline: "none",
                      marginTop: 2,
                      marginBottom: 2,
                      cursor: "pointer",
                      appearance: "none",
                      transition:
                        "border 0.2s, box-shadow 0.2s, background 0.2s",
                    }}
                    value={item.paidBy ?? ""}
                    onFocus={(e) =>
                      (e.currentTarget.style.border = `2px solid ${palette.violet}`)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = `2px solid ${palette.mint}`)
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? null : Number(e.target.value);
                      setItems((items) =>
                        items.map((it) =>
                          it.id === item.id ? { ...it, paidBy: val } : it
                        )
                      );
                    }}
                    aria-label="Pilih siapa yang membayar"
                  >
                    <option value="">Pilih siapa yang membayar</option>
                    {friends.map((f) => (
                      <option key={f.id} value={f.id}>
                        🧑 {f.name}
                      </option>
                    ))}
                  </select>
                  {/* Custom Arrow */}
                  <span
                    style={{
                      pointerEvents: "none",
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      alignItems: "center",
                      height: 20,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M6 8l4 4 4-4"
                        stroke={palette.violet}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* Add Item Button */}
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
            onClick={() =>
              setItems([
                ...items,
                {
                  id: Date.now(),
                  emoji:
                    emojiList[Math.floor(Math.random() * emojiList.length)],
                  name: "",
                  price: "",
                  participants: [],
                  paidBy: null,
                  amounts: {},
                  ppnOn: false,
                  ppnPercent: "10",
                  svcOn: false,
                  svcPercent: "5",
                },
              ])
            }
          >
            + Tambah Item
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
              width: "auto",
              boxShadow: "0 2px 8px #0001",
              textAlign: "center",
            }}
          >
            <b>Tips</b>{" "}
            <span role="img" aria-label="info">
              💡
            </span>
            <br />
            Pilih siapa saja yang ikut membayar tiap item. Harga bisa diketik
            manual.
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
              onClick={() => (window.location.href = "/step1")}
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
                if (!canContinue) return; // guard ekstra
                window.location.href = "/step3";
              }}
            >
              Review & Split
            </button>
          </div>
          {!canContinue && (
            <div
              style={{
                color: "#888",
                fontSize: 13,
                marginTop: 6,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Lengkapi nama item, harga, nominal tiap orang, pajak dan service
              jika dipilih.
            </div>
          )}
        </div>
        {/* Floating Add Button */}
        <button
          style={{
            position: "fixed",
            right: 32,
            bottom: 32,
            width: 56,
            height: 56,
            borderRadius: 28,
            background: palette.yellow,
            color: palette.violet,
            fontSize: 32,
            border: "none",
            boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
          }}
          aria-label="Tambah Item"
          onClick={() =>
            setItems([
              ...items,
              {
                id: Date.now(),
                emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
                name: "",
                price: "",
                participants: [],
                paidBy: null,
                amounts: {},
                ppnOn: false,
                ppnPercent: "10",
                svcOn: false,
                svcPercent: "5",
              },
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
          select:focus {
            background: #f7fafd;
            box-shadow: 0 4px 16px #7de2d144;
          }
          select option {
            background: #fff;
            color: #725ac1;
            font-weight: 600;
            font-size: 15px;
          }
          select option:checked,
          select option:hover {
            background: #7de2d1;
            color: #725ac1;
          }
        `}</style>
      </div>
    </div>
  );
}
