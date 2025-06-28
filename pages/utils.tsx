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

/** Merangkai teks hasil patungan */
/* utils/shareWhatsApp.ts – versi aman emoji */
/* utils/shareWhatsApp.ts – versi ASCII-safe */
export const buildWhatsAppMessage = (
  friends: { id: number; name: string }[],
  items: {
    id: number;
    emoji: string;
    name: string;
    price: number;
    participants: number[];
    paidBy: number | null;
  }[],
  paidTotals: Record<number, number>,
  transfers: { from: number; to: number; amount: number }[],
  fmt: (n: number) => string
) => {
  const txt: string[] = [];

  /* Header */
  txt.push("*Hasil Patungan BayarBareng*");
  txt.push("");

  /* Ringkasan per orang */
  txt.push("_Ringkasan Bayar_");
  friends.forEach((f) =>
    txt.push(`- *${f.name}* membayar Rp${fmt(paidTotals[f.id] || 0)}`)
  );
  txt.push("");

  /* Rincian item */
  txt.push("_Rincian Item_");
  items.forEach((it, i) => {
    const share = it.participants.length
      ? fmt(it.price / it.participants.length)
      : "0";
    const peserta = it.participants
      .map((pid) => friends.find((x) => x.id === pid)?.name)
      .join(", ");
    txt.push(`${i + 1}. ${it.name} — Rp${fmt(it.price)}`);
    txt.push(
      `   Dibayar oleh: *${friends.find((x) => x.id === it.paidBy)?.name}*`
    );
    txt.push(`   Peserta: ${peserta} (Rp${share}/orang)`);
  });
  txt.push("");

  /* Transfer */
  if (transfers.length) {
    txt.push("_Setoran Silang_");
    transfers.forEach((t) =>
      txt.push(
        `${friends.find((x) => x.id === t.from)?.name} ➜ ` +
          `${friends.find((x) => x.id === t.to)?.name}: ` +
          `Rp${fmt(t.amount)}`
      )
    );
    txt.push("");
  }

  txt.push("Terima kasih!");

  return txt.join("\n");
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
