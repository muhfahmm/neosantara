"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAllCountryProfilesFromDb, type CountryProfile } from "@/../../json/semua_fitur_negara/0_profiles";
import {
  addPlayerNomination,
  campaignForCandidate,
  getEligibleUNMemberCountries,
  normalizeElectionState,
  resolveElection,
  SECURITY_COUNCIL_ELECTION_STATE_KEY,
  type ElectionCountry,
  type SecurityCouncilElectionState,
  type SecurityCouncilMember,
} from "./securityCouncilElection";

interface Props {
  selectedCountry: { country?: string; iso?: string } | null;
  currentDate?: Date;
  countryDetail: Record<string, unknown> | null;
  setCountryDetail?: (update: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  onMembersChange?: (members: SecurityCouncilMember[]) => void;
}

const normalizeName = (value: string) => value.toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export default function SecurityCouncilElectionPanel({
  selectedCountry,
  currentDate,
  countryDetail,
  setCountryDetail,
  onMembersChange,
}: Props) {
  const year = Number.isFinite(currentDate?.getTime()) ? currentDate!.getFullYear() : new Date().getFullYear();
  const currentMonth = currentDate?.getMonth() ?? new Date().getMonth();
  const currentDay = currentDate?.getDate() ?? new Date().getDate();
  const savedState = countryDetail?.pbbSecurityCouncilElection;
  const [election, setElection] = useState<SecurityCouncilElectionState>(() =>
    normalizeElectionState(savedState, year)
  );
  const electionWindow = election.year === year && currentMonth === 5;
  const nominationOpen = electionWindow && currentDay >= 1 && currentDay < 15;
  const campaignOpen = electionWindow && currentDay >= 15 && currentDay < 25;
  const votingOpen = electionWindow && currentDay >= 25 && currentDay <= 30;
  const [profiles, setProfiles] = useState<CountryProfile[]>([]);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [error, setError] = useState("");
  const countries = useMemo(() => getEligibleUNMemberCountries(profiles), [profiles]);
  const profiledVoterCount = countries.filter(country => country.profile).length;
  const player = useMemo(() => {
    const playerName = selectedCountry?.country || "";
    return countries.find(country => normalizeName(country.name) === normalizeName(playerName)) || null;
  }, [countries, selectedCountry?.country]);
  const voters = countries;

  useEffect(() => {
    let active = true;
    fetchAllCountryProfilesFromDb()
      .then(result => {
        if (!active) return;
        setProfiles(result);
        setProfilesLoaded(true);
      })
      .catch(fetchError => {
        if (!active) return;
        console.error("Gagal memuat profil negara untuk pemilu Dewan Keamanan:", fetchError);
        setError("Data profil negara gagal dimuat. Coba buka kembali menu Dewan Keamanan.");
        setProfilesLoaded(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setElection(previous => {
      const next = normalizeElectionState(previous, year);
      onMembersChange?.(next.members);
      return next;
    });
  }, [year, onMembersChange]);

  useEffect(() => {
    const syncVetoUsage = () => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
        if (raw) setElection(JSON.parse(raw) as SecurityCouncilElectionState);
      } catch (syncError) {
        console.error("Gagal menyinkronkan roster setelah penggunaan hak veto:", syncError);
        setError("Status hak veto tidak dapat disinkronkan.");
      }
    };
    window.addEventListener("pbb_security_council_roster_updated", syncVetoUsage);
    window.addEventListener("pbb_security_council_election_updated", syncVetoUsage);
    return () => {
      window.removeEventListener("pbb_security_council_roster_updated", syncVetoUsage);
      window.removeEventListener("pbb_security_council_election_updated", syncVetoUsage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SECURITY_COUNCIL_ELECTION_STATE_KEY, JSON.stringify(election));
      onMembersChange?.(election.members);
      setCountryDetail?.(previous => previous
        ? { ...previous, pbbSecurityCouncilElection: election }
        : previous
      );
    } catch (storageError) {
      console.error("Gagal menyimpan hasil pemilu Dewan Keamanan:", storageError);
      setError("Hasil pemilu tidak dapat disimpan ke penyimpanan permainan.");
    }
  }, [election, onMembersChange]);

  const updateElection = (next: SecurityCouncilElectionState) => {
    setElection(next);
    setCountryDetail?.(previous => previous
      ? { ...previous, pbbSecurityCouncilElection: next }
      : previous
    );
  };

  const canNominate = Boolean(
    player && election.phase === "nomination" &&
    (election.nominees.every(candidate => candidate.slug !== player.slug)) &&
    election.members.every(member => member.iso !== player.iso || member.cohort === election.cohort)
  );
  const playerCandidate = player
    ? election.nominees.find(candidate => candidate.slug === player.slug)
    : undefined;

  const nominatePlayer = () => {
    if (!player || !canNominate) return;
    updateElection(addPlayerNomination(election, player, voters));
  };

  const campaign = () => {
    if (!player) return;
    updateElection(campaignForCandidate(election, player.slug));
  };

  const vote = () => {
    if (voters.length !== 193 || profiledVoterCount !== 193) {
      setError(`Pemilu dihentikan: diperlukan profil untuk seluruh 193 anggota; hanya ${profiledVoterCount} profil anggota yang cocok.`);
      return;
    }
    const next = resolveElection(election, voters);
    if (next.phase !== "completed") {
      setError("Pemungutan suara belum dapat diselesaikan. Pastikan nominasi dan kampanye sudah dimulai.");
      return;
    }
    updateElection(next);
  };

  const phaseLabel = election.phase === "nomination"
    ? "Nominasi"
    : election.phase === "campaign"
      ? "Kampanye diplomatik"
      : "Hasil pemilu";

  return (
    <section className="rounded-xl border border-cyan-500/25 bg-[#0A1A1A] p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-black uppercase tracking-wide text-cyan-300">
            Pemilihan Anggota Tidak Tetap DK PBB
          </h4>
          <p className="mt-1 text-[11px] text-[#8AA4A4]">
            Pemilihan {election.year} • Kohor {election.cohort} • 5 kursi tahun ini • Masa jabatan 2 tahun
          </p>
          <p className="mt-1 text-[10px] text-cyan-200/80">
            Total 10 anggota tidak tetap aktif; 5 kursi berganti setiap tahun.
          </p>
          <p className="mt-1 text-[10px] text-[#789090]">
            Juni · Markas Besar PBB, New York · Sidang Majelis Umum PBB
          </p>
        </div>
        <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-cyan-300">
          {phaseLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ["Reputasi diplomatik", "30%"],
          ["Pengaruh global", "25%"],
          ["Kontribusi PBB", "20%"],
          ["Kekuatan lunak", "15%"],
          ["Hubungan bilateral", "10%"],
        ].map(([label, weight]) => (
          <div key={label} className="rounded-lg border border-white/5 bg-[#051111] p-2">
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#6B8A8A]">{label}</p>
            <p className="mt-1 text-xs font-black text-[#E0E0E0]">{weight}</p>
          </div>
        ))}
        <div className="rounded-lg border border-white/5 bg-[#051111] p-2">
          <p className="text-[9px] font-bold uppercase tracking-wide text-[#6B8A8A]">Pemilih berhak</p>
          <p className="mt-1 text-xs font-black text-[#E0E0E0]">{voters.length} / 193</p>
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-[#789090]">
        Skor kontribusi misi perdamaian dan bantuan PBB dicatat melalui aksi kampanye karena profil negara saat ini belum memiliki metrik historis terpisah untuk kontribusi tersebut.
      </p>

      {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">{error}</p>}
      {!profilesLoaded && <p className="text-xs text-[#8AA4A4]">Memuat profil dan data pemilih...</p>}
      {profilesLoaded && voters.length !== 193 && (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
          Daftar anggota PBB yang dikenali berjumlah {voters.length}, bukan 193. Pemungutan suara belum tersedia.
        </p>
      )}
      {profilesLoaded && profiledVoterCount < 193 && (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
          Data kualifikasi hanya cocok untuk {profiledVoterCount} dari 193 profil anggota PBB.
        </p>
      )}
      {!player && (
        <p className="text-xs text-amber-300">
          Negara yang sedang dimainkan bukan anggota PBB berdaulat, sehingga tidak dapat mencalonkan diri atau memilih.
        </p>
      )}

      {election.phase === "nomination" && nominationOpen && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={nominatePlayer}
            disabled={!canNominate || !profilesLoaded || profiledVoterCount !== 193 || !player || voters.length !== 193 || !nominationOpen}
            className="rounded-lg bg-cyan-400 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[#071414] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Nominasi negara saya
          </button>
        </div>
      )}

      {election.phase === "campaign" && campaignOpen && (
        <div className="flex flex-wrap items-center gap-2">
          {playerCandidate && (
            <button
              type="button"
              onClick={campaign}
              disabled={playerCandidate.campaignCount >= 3}
              className="rounded-lg bg-cyan-400 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[#071414] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Kampanye kontribusi ({playerCandidate.campaignCount}/3)
            </button>
          )}
        </div>
      )}

      {election.phase === "voting" && votingOpen && (
        <button
          type="button"
          onClick={vote}
          disabled={voters.length !== 193 || profiledVoterCount !== 193}
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Selesaikan pemungutan suara
        </button>
      )}

      {!electionWindow && election.phase !== "completed" && (
        <p className="text-xs text-[#8AA4A4]">
          Pemilihan berikutnya dijadwalkan pada Juni {election.year}. Nominasi dibuka 1–14 Juni, kampanye 15–24 Juni, pemungutan suara 25–30 Juni, dan hasil diumumkan 30 Juni.
        </p>
      )}
      {currentMonth === 5 && election.phase !== "completed" && currentDay < 15 && (
        <p className="text-xs text-[#8AA4A4]">Nominasi dibuka sampai 14 Juni. Kampanye dimulai otomatis pada 15 Juni.</p>
      )}
      {currentMonth === 5 && election.phase === "campaign" && currentDay >= 25 && (
        <p className="text-xs text-[#8AA4A4]">Sidang pemungutan suara dimulai otomatis hari ini; hasil resmi dijadwalkan 30 Juni.</p>
      )}

      {election.nominees.length > 0 && (
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {[...election.nominees]
            .sort((a, b) => a.region.localeCompare(b.region) || b.votes - a.votes || b.score - a.score)
            .map(candidate => (
              <div key={candidate.slug} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-[#051111] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#E0E0E0]">{candidate.name}</p>
                  <p className="text-[9px] text-[#789090]">{candidate.region} · Skor {candidate.score.toFixed(1)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-black text-cyan-200">{candidate.votes} suara</p>
                  {candidate.campaignCount > 0 && (
                    <p className="text-[9px] text-emerald-300">Kontribusi {candidate.contributionScore}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {election.phase === "completed" && (
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-emerald-300">
            Anggota terpilih · jabatan 1 Januari {election.year + 1} sampai 31 Desember {election.year + 2}
          </p>
          <p className="mt-1 text-xs text-[#D0E0E0]">
            {election.history.at(-1)?.winners.join(", ") || "Hasil pemilu tersimpan"}
          </p>
          {playerCandidate && election.history.at(-1)?.winners.includes(playerCandidate.name) && (
            <p className="mt-2 text-[10px] text-emerald-200">
              Negara Anda memperoleh +25 reputasi diplomatik dan +15 kekuatan lunak permanen; pengaruh suara PBB meningkat 50% selama masa jabatan.
            </p>
          )}
        </div>
      )}
      <p className="text-[10px] text-[#789090]">
        Anggota wajib memilih Setuju, Tolak, atau Abstain untuk setiap resolusi selama masa jabatan. Tidak memilih menurunkan 1 poin reputasi diplomatik.
      </p>
    </section>
  );
}
