/* ───── utils/shareWhatsApp.ts ────────────────────────────────────────── */
type Friend = {
  id: number;
  name: string;
  emoji?: string;
};

type Transfer = {
  from: number;
  to: number;
  amount: number;
};

interface Props {
  friends: Friend[];
  paidTotals: Record<number, number>;
  transfers: Transfer[];
  formatRupiah: (n: number) => string; // re-gunakan util yang sudah ada
}

const multiplier = (it: ShareItem) => {
  const ppn = it.ppnOn ? (it.ppnPercent || 0) / 100 : 0;
  const svc = it.svcOn ? (it.svcPercent || 0) / 100 : 0;
  return 1 + ppn + svc;
};

/** Merangkai teks hasil patungan */
/* utils/shareWhatsApp.ts – versi aman emoji */
/* utils/shareWhatsApp.ts – versi ASCII-safe */
export const buildWhatsAppMessage = (
  friends: Friend[],
  items: ShareItem[],
  paidTotals: Record<number, number>,
  transfers: Transfer[],
  fmt: (n: number) => string
) => {
  const t: string[] = [];

  t.push("*Hasil Patungan BayarBareng*");
  t.push("");

  /* Ringkasan total */
  t.push("_Ringkasan Bayar_");
  friends.forEach((f) =>
    t.push(`- *${f.name}* membayar Rp${fmt(paidTotals[f.id] || 0)}`)
  );
  t.push("");

  /* Rincian item */
  t.push("_Rincian Item_");
  items.forEach((it, idx) => {
    const m = multiplier(it);
    const peserta = it.participants
      .map((pid) => {
        const nm = friends.find((x) => x.id === pid)?.name;
        const nominalDasar = it.amounts[pid] || 0;
        const nominalAkhir = nominalDasar * m;
        return `${nm} (Rp${fmt(nominalAkhir)})`;
      })
      .join(", ");

    t.push(`${idx + 1}. ${it.name} — Rp${fmt(it.price * m)}`);
    t.push(
      `   Dibayar oleh: *${
        friends.find((x) => x.id === it.paidBy)?.name || "-"
      }*`
    );
    t.push(`   Peserta: ${peserta}`);
  });
  t.push("");

  /* Rincian per-orang – NEW -------------------------------------------- */
  t.push("_Rincian Per-Orang_");
  friends.forEach((f) => {
    t.push(`*${f.name}*`);
    items
      .filter((it) => it.participants.includes(f.id))
      .forEach((it) => {
        const m =
          1 +
          (it.ppnOn ? (it.ppnPercent || 0) / 100 : 0) +
          (it.svcOn ? (it.svcPercent || 0) / 100 : 0);

        const nominal = (it.amounts[f.id] || 0) * m;

        /* tag PPN / Service utk info visual */
        const tags: string[] = [];
        if (it.ppnOn) tags.push("PPN");
        if (it.svcOn) tags.push("Svc");
        const tagStr = tags.length ? ` (${tags.join("+")})` : "";

        t.push(`• ${it.name}${tagStr}: Rp${fmt(nominal)}`);
      });
    t.push(""); // spasi antar user
  });
  /* -------------------------------------------------------------------- */

  /* Transfer */
  if (transfers.length) {
    t.push("_Setoran Silang_");
    transfers.forEach((tr) =>
      t.push(
        `${friends.find((x) => x.id === tr.from)?.name} ➜ ` +
          `${friends.find((x) => x.id === tr.to)?.name}: ` +
          `Rp${fmt(tr.amount)}`
      )
    );
    t.push("");
  }

  t.push("Terima kasih, jangan lupa *DIBAYAR*!");
  return t.join("\n");
};

export const shareViaWhatsApp = (m: string) =>
  window.open("https://wa.me/?text=" + encodeURIComponent(m), "_blank");

export const WhatsAppButton = ({
  friends,
  items,
  paidTotals,
  transfers,
  formatRupiah,
}: {
  friends: { id: number; name: string }[];
  items: any[];
  paidTotals: Record<number, number>;
  transfers: { from: number; to: number; amount: number }[];
  formatRupiah: (n: number) => string;
}) => {
  const handleClick = () => {
    const msg = buildWhatsAppMessage(
      friends,
      items,
      paidTotals,
      transfers,
      formatRupiah
    );
    shareViaWhatsApp(msg);
  };

  return (
    <button
      style={{
        background: "#7DE2D1",
        color: "#725AC1",
        border: "none",
        borderRadius: 12,
        padding: "10px 18px",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        boxShadow: "0 2px 8px #0001",
      }}
      onClick={handleClick}
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        style={{
          width: 20,
          height: 20,
          verticalAlign: "middle",
          marginRight: 6,
        }}
      />
      WhatsApp
    </button>
  );
};

/* ------------------------------- SHARE LINK BUTTON --------------------------------- */
// helper buat encode & salin
interface ShareFriend {
  id: number;
  name: string;
  emoji?: string;
}

interface ShareItem {
  id: number;
  emoji: string;
  name: string;
  price: number;
  participants: number[];
  paidBy: number | null;
  ppnOn?: boolean;
  ppnPercent?: number; // ex: 10
  svcOn?: boolean;
  svcPercent?: number;
  amounts: Record<number, number>; // Added to fix the error
}

export const makeShareLink = (
  friends: ShareFriend[],
  items: ShareItem[]
): string => {
  // 1. susun objek kecil
  const payloadObj = { friends, items };

  // 2. stringify → URI-encode → Base64
  const payload = btoa(encodeURIComponent(JSON.stringify(payloadObj)));

  // 3. link = origin + hash #d=<payload>
  return `${window.location.origin}/#d=${payload}`;
};
