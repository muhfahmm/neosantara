/**
 * tradeEventLogic.ts
 *
 * Menangani respon negara AI terhadap event & tawaran Perdagangan Masuk (Inbox: 3_notifikasi_perdagangan):
 * 1. Menganalisis tawaran impor/ekspor komoditas dari negara lain.
 * 2. Jika AI sedang kekurangan komoditas tersebut (ada alert KEKURANGAN), AI akan otomatis MENERIMA tawaran beli.
 * 3. Menghindari transaksi yang membuat kas negara berada di bawah batas cadangan aman.
 */

import { getMaterialStock } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import type { BrainContext } from "../core/brainContext";
import { nilaiAngka } from "../core/brainContext";
import type { AiInboxEvent, AiEventDecision } from "./eventTypes";

export function handleTradeEvent(
  ctx: BrainContext,
  event: AiInboxEvent,
): AiEventDecision {
  const tradeType = event.data.tradeType;
  const productKey = event.data.productKey;
  const quantity = Number(event.data.quantity || 0);
  const totalPrice = Number(event.data.totalPrice || event.data.pricePerUnit * quantity || 0);
  const partnerName = event.data.partnerName || event.sender || "Mitra Dagang";

  if (!productKey || quantity <= 0) {
    return {
      handled: false,
      category: "perdagangan",
      eventId: event.id,
      actionTaken: "LEWATI",
      alasan: "Detail tawaran dagang tidak valid atau kuantitas 0.",
    };
  }

  // Cek apakah produk ini sedang dibutuhkan oleh AI (stok saat ini tipis atau ada alert kekurangan)
  const stokSekarang = getMaterialStock(ctx.country, productKey);
  const alertsKekurangan = (ctx.state.alerts || []).some(
    (a) => a.jenis === "KEKURANGAN" && a.penyebab?.includes(productKey),
  );

  const kasSekarang = nilaiAngka(ctx.country.anggaran);

  // Jika AI ditawari membeli barang (tradeType === 'beli')
  if (tradeType === "beli") {
    // Terima jika barang sedang defisit/kurang dan kas cukup
    if ((alertsKekurangan || stokSekarang < 500) && kasSekarang - totalPrice > 50000) {
      // Eksekusi pembelian: potong anggaran dan tambah inventaris
      ctx.country.anggaran = kasSekarang - totalPrice;
      const invKey = `inventory_${productKey}`;
      ctx.country[invKey] = (Number(ctx.country[invKey]) || 0) + quantity;

      return {
        handled: true,
        category: "perdagangan",
        eventId: event.id,
        actionTaken: "TERIMA_PEMBELIAN",
        biayaDikeluarkan: totalPrice,
        alasan: `Menerima penawaran impor ${quantity.toLocaleString()} unit ${productKey} dari ${partnerName} seharga ${totalPrice.toLocaleString()} NEO untuk menutup defisit kebutuhan industri.`,
        dampak: { productKey, addedQty: quantity },
      };
    } else {
      return {
        handled: true,
        category: "perdagangan",
        eventId: event.id,
        actionTaken: "TOLAK_PEMBELIAN",
        alasan: `Menolak tawaran pembelian ${productKey} dari ${partnerName} karena stok masih mencukupi (${stokSekarang.toLocaleString()}) atau kas diprioritaskan untuk belanja esensial.`,
      };
    }
  }

  return {
    handled: true,
    category: "perdagangan",
    eventId: event.id,
    actionTaken: "PENGAMATAN_PASAR",
    alasan: `Memantau dinamika perdagangan komoditas ${productKey} dengan ${partnerName}.`,
  };
}
