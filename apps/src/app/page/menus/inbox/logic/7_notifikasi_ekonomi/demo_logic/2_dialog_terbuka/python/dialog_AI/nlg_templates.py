import random

from ..shared.schemas import Choice, NPCState


USER_OPENERS = (
    "Tegaskan", "Sampaikan", "Umumkan", "Tetapkan", "Berikan",
    "Nyatakan", "Ajukan", "Buka", "Dorong", "Pastikan",
)
USER_HARD = (
    "batas anggaran pemerintah", "penolakan tuntutan penuh", "peringatan sebelum forum ditutup",
    "larangan blokade jalan", "penertiban aksi yang mengganggu layanan publik", "garis merah kebijakan fiskal",
)
USER_SOFT = (
    "meja kerja harga pangan", "jadwal negosiasi tiga hari", "audit bersama atas distribusi beras",
    "forum perwakilan buruh dan pemerintah", "laporan terbuka tentang PPN", "mediasi dengan tokoh masyarakat",
)
USER_CONCESSION = (
    "subsidi beras bagi keluarga rentan", "bantuan tunai darurat", "evaluasi tarif PPN kebutuhan pokok",
    "dana stabilisasi harga pasar", "keringanan pajak usaha kecil", "program pangan murah pekan ini",
)

NPC_OPENERS = (
    "Massa menilai", "Kami mendengar", "Para pekerja merasa", "Warga meminta", "Perwakilan lapangan melihat",
    "Keluarga yang terdampak menunggu", "Aliansi buruh menegaskan", "Masyarakat di lapangan merasakan",
    "Kami perlu memastikan", "Rakyat ingin melihat",
)
NPC_HARD = (
    "tekanan tidak akan menurunkan harga pangan", "ancaman bukan jawaban atas beban hidup", "penertiban tanpa solusi akan memperbesar ketegangan",
    "penolakan total membuat kepercayaan semakin tipis", "pemerintah perlu mendengar sebelum mengambil langkah keras", "forum ini tidak boleh berubah menjadi ruang intimidasi",
)
NPC_SOFT = (
    "jadwal yang jelas akan memberi kami alasan untuk menahan massa", "dialog perlu disertai target yang dapat diawasi", "transparansi adalah awal untuk memulihkan kepercayaan",
    "kami siap bekerja sama bila ada penanggung jawab yang pasti", "waktu dapat diberikan bila kebutuhan mendesak tetap ditangani", "langkah ini perlu segera dibuktikan di lapangan",
)
NPC_CONCESSION = (
    "langkah nyata ini memberi harapan bagi keluarga yang kesulitan", "bantuan segera dapat meredakan keadaan di lapangan", "komitmen ini perlu dikawal sampai benar-benar diterima warga",
    "kami menghargai keberanian pemerintah mengambil tindakan", "kepercayaan mulai tumbuh ketika kebijakan berpihak pada kebutuhan pokok", "massa akan menilai realisasi, bukan hanya pengumuman",
)


def _random_text(openers: tuple[str, ...], subjects: tuple[str, ...], state: NPCState) -> str:
    options = [f"{opener} {subject}." for opener in openers for subject in subjects]
    previous = state.memory.get("last_text")
    available = [text for text in options if text != previous] or options
    text = random.choice(available)
    state.memory["last_text"] = text
    return text


def choice_text(choice: Choice, state: NPCState) -> str:
    subjects = {
        Choice.HARD_POWER: USER_HARD,
        Choice.SOFT_POWER: USER_SOFT,
        Choice.CONCESSION: USER_CONCESSION,
    }[choice]
    return _random_text(USER_OPENERS, subjects, state)


def reaction_text(choice: Choice, status: str, state: NPCState) -> str:
    if status == "success":
        return _random_text(NPC_OPENERS, ("kesepakatan ini diterima; kami akan mengawal pelaksanaannya", "jalan damai terbuka dan massa akan membubarkan diri dengan tertib"), state)
    if status == "riot": return "Penolakan ini memicu kerusuhan. Negosiasi gagal."
    if status == "walkout": return "Kesabaran kami habis. Perwakilan massa meninggalkan forum."
    subjects = {
        Choice.HARD_POWER: NPC_HARD,
        Choice.SOFT_POWER: NPC_SOFT,
        Choice.CONCESSION: NPC_CONCESSION,
    }[choice]
    return _random_text(NPC_OPENERS, subjects, state)
