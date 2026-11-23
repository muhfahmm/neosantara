"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGeopoliticsMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useGeopoliticsMenuTranslation";
import { fetchAllCountryProfilesFromDb, type CountryProfile } from "@/../../json/semua_fitur_negara/0_profiles";
import { getIsoForCountryName } from "../../pbbCountryIso";
import {
  addPlayerNomination,
  campaignForCandidate,
  ELECTION_MONTH,
  getEligibleUNMemberCountries,
  getScheduleYear,
  getSecurityCouncilElectionCandidateCountries,
  isIneligibleElectionCandidate,
  normalizeElectionState,
  normalizeName,
  SECURITY_COUNCIL_ELECTION_STATE_KEY,
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

const TOTAL_VOTERS = 193;

const renderCountryFlag = (iso: string, name: string) => {
  const resolvedIso = getIsoForCountryName(name);
  const suppliedIso = iso.trim().toLowerCase().split("-").pop();
  const flagCode = resolvedIso !== "un"
    ? resolvedIso
    : suppliedIso && /^[a-z]{2}$/.test(suppliedIso) && suppliedIso !== "un"
      ? suppliedIso
      : "";
  if (!flagCode) return null;
  return (
    <div className="w-6 h-4 rounded-sm overflow-hidden border border-root-accent/20 flex-shrink-0 shadow-sm bg-[#051111] relative flex items-center justify-center">
      <Image
        src={`https://flagcdn.com/w80/${flagCode}.png`}
        alt={`Bendera ${name}`}
        width={24}
        height={16}
        unoptimized
        className="w-full h-full object-cover absolute inset-0"
        onError={event => { event.currentTarget.style.display = "none"; }}
      />
    </div>
  );
};

/** localStorage adalah sumber kebenaran (dipakai tick jadwal, veto, dan pencopotan). */
function readStoredElection(): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (readError) {
    console.error("Gagal membaca state pemilu Dewan Keamanan:", readError);
    return null;
  }
}

export default function SecurityCouncilElectionPanel({
  selectedCountry,
  currentDate,
  countryDetail,
  setCountryDetail,
  onMembersChange,
}: Props) {
  const { pbb } = useGeopoliticsMenuTranslation();

  // Ref agar callback dari parent / fungsi terjemahan yang tidak stabil tidak memicu effect berulang.
  const pbbRef = useRef(pbb);
  const onMembersChangeRef = useRef(onMembersChange);
  const setCountryDetailRef = useRef(setCountryDetail);
  pbbRef.current = pbb;
  onMembersChangeRef.current = onMembersChange;
  setCountryDetailRef.current = setCountryDetail;

  const hasValidDate = Boolean(currentDate) && Number.isFinite(currentDate!.getTime());
  const now = hasValidDate ? currentDate! : new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Tanggal penuh (bukan hanya tahun) → dasar semua penyesuaian jadwal.
  const clock = useMemo(
    () => new Date(year, currentMonth, currentDay),
    [year, currentMonth, currentDay]
  );

  const [election, setElection] = useState<SecurityCouncilElectionState>(() =>
    normalizeElectionState(readStoredElection() ?? countryDetail?.pbbSecurityCouncilElection, clock)
  );
  const [profiles, setProfiles] = useState<CountryProfile[]>([]);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [error, setError] = useState("");

  // Tahun jadwal SELALU diturunkan dari tanggal game (23 Nov 2026 → 2027, dst.).
  const scheduleYear = useMemo(() => getScheduleYear(election, clock), [election, clock]);

  const electionWindow = scheduleYear === year && currentMonth === ELECTION_MONTH;
  const nominationOpen = electionWindow && currentDay >= 1 && currentDay < 15;
  const campaignOpen = electionWindow && currentDay >= 15 && currentDay < 25;

  const voters = useMemo(() => getEligibleUNMemberCountries(profiles), [profiles]);
  const candidateCountries = useMemo(() => getSecurityCouncilElectionCandidateCountries(profiles), [profiles]);
  const profiledVoterCount = voters.filter(country => country.profile).length;

  const player = useMemo(() => {
    const selectedIso = selectedCountry?.iso?.trim().toLowerCase();
    if (selectedIso) {
      const byIso = candidateCountries.find(country => country.iso.toLowerCase() === selectedIso);
      if (byIso) return byIso;
    }
    const playerName = normalizeName(selectedCountry?.country || "");
    return candidateCountries.find(country => normalizeName(country.name) === playerName) || null;
  }, [candidateCountries, selectedCountry?.country, selectedCountry?.iso]);

  /* ---------------- Muat profil negara ---------------- */
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
        setError(pbbRef.current("election.loadError"));
        setProfilesLoaded(true);
      });
    return () => { active = false; };
  }, []);

  /* ---------------- Sinkron dari storage ---------------- */
  const syncFromStorage = useCallback(() => {
    try {
      const stored = readStoredElection();
      if (!stored) return;
      const next = normalizeElectionState(stored, clock);
      setElection(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    } catch (syncError) {
      console.error("Gagal menyinkronkan roster Dewan Keamanan:", syncError);
      setError(pbbRef.current("election.vetoSyncError"));
    }
  }, [clock]);

  // Tanggal game berubah (tick jadwal bisa menulis storage) → ambil state terbaru.
  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  // Tanggal game berubah → normalisasi ulang (rollover tahun / geser jadwal ke Juni berikutnya).
  useEffect(() => {
    setElection(previous => {
      const next = normalizeElectionState(previous, clock);
      return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
    });
  }, [clock]);

  useEffect(() => {
    window.addEventListener("pbb_security_council_roster_updated", syncFromStorage);
    window.addEventListener("pbb_security_council_election_updated", syncFromStorage);
    return () => {
      window.removeEventListener("pbb_security_council_roster_updated", syncFromStorage);
      window.removeEventListener("pbb_security_council_election_updated", syncFromStorage);
    };
  }, [syncFromStorage]);

  /* ---------------- Simpan ke storage & countryDetail ---------------- */
  const serializedElection = useMemo(() => JSON.stringify(election), [election]);

  useEffect(() => {
    try {
      if (localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY) !== serializedElection) {
        localStorage.setItem(SECURITY_COUNCIL_ELECTION_STATE_KEY, serializedElection);
      }
      onMembersChangeRef.current?.(election.members);
      setCountryDetailRef.current?.(previous => {
        if (!previous || JSON.stringify(previous.pbbSecurityCouncilElection) === serializedElection) {
          return previous;
        }
        return { ...previous, pbbSecurityCouncilElection: election };
      });
    } catch (storageError) {
      console.error("Gagal menyimpan hasil pemilu Dewan Keamanan:", storageError);
      setError(pbbRef.current("election.saveError"));
    }
  }, [election, serializedElection]);

  /* ---------------- Turunan UI ---------------- */
  const isPlayerIneligible = Boolean(player && isIneligibleElectionCandidate(
    election.members,
    player.iso,
    election.recentlyServedIsos,
  ));
  const canNominate = Boolean(
    player &&
    election.phase === "nomination" &&
    !isPlayerIneligible &&
    election.nominees.every(candidate => candidate.slug !== player.slug)
  );

  const eligibleNominees = useMemo(
    () => election.nominees.filter(candidate => !isIneligibleElectionCandidate(
      election.members,
      candidate.iso,
      election.recentlyServedIsos,
    )),
    [election.members, election.nominees, election.recentlyServedIsos]
  );
  // Setelah pemilu selesai, pemenang sudah jadi anggota sehingga semua kandidat tetap ditampilkan.
  const visibleNominees = election.phase === "completed" ? election.nominees : eligibleNominees;

  const latestElection = election.history.at(-1);
  const winnerIsoSet = useMemo(() => {
    if (election.phase !== "completed" || !latestElection) return null;
    const isos = new Set((latestElection.winnerIsos || []).map(iso => iso.trim().toLowerCase()));
    if (isos.size === 0) {
      const names = new Set(latestElection.winners.map(normalizeName));
      election.nominees.forEach(candidate => {
        if (names.has(normalizeName(candidate.name))) isos.add(candidate.iso.trim().toLowerCase());
      });
    }
    return isos;
  }, [election.phase, election.nominees, latestElection]);

  const playerCandidate = player && !isPlayerIneligible
    ? eligibleNominees.find(candidate => candidate.slug === player.slug)
    : undefined;
  const playerWon = Boolean(player && winnerIsoSet?.has(player.iso.toLowerCase()));
  const sortedNominees = [...visibleNominees].sort(
    (a, b) => a.region.localeCompare(b.region) || b.votes - a.votes || b.score - a.score
  );
  const nomineeGroups = winnerIsoSet
    ? [
      {
        key: "elected",
        title: pbb("election.electedCandidates"),
        candidates: sortedNominees
          .filter(candidate => winnerIsoSet.has(candidate.iso.toLowerCase()))
          .slice(0, 5),
      },
      {
        key: "not-elected",
        title: pbb("election.notElectedCandidates"),
        candidates: sortedNominees
          .filter(candidate => !winnerIsoSet.has(candidate.iso.toLowerCase()))
          .sort((a, b) => b.votes - a.votes || b.score - a.score)
          .slice(0, 5),
      },
    ]
    : [{ key: "candidates", title: "", candidates: sortedNominees }];

  const updateElection = (next: SecurityCouncilElectionState) => {
    setElection(next);
    setCountryDetail?.(previous => previous
      ? { ...previous, pbbSecurityCouncilElection: next }
      : previous
    );
  };

  const nominatePlayer = () => {
    if (!player || !canNominate || !nominationOpen) return;
    updateElection(addPlayerNomination(election, player, voters));
  };

  const campaign = () => {
    if (!player || !campaignOpen) return;
    updateElection(campaignForCandidate(election, player.slug));
  };

  const phaseLabel = election.phase === "completed"
    ? pbb("election.phaseResults")
    : !electionWindow
      ? pbb("election.phaseWaiting")
      : election.phase === "nomination"
        ? pbb("election.phaseNomination")
        : election.phase === "campaign"
          ? pbb("election.phaseCampaign")
          : pbb("election.phaseVoting");

  const dataReady = profilesLoaded && voters.length === TOTAL_VOTERS && profiledVoterCount === TOTAL_VOTERS;

  return (
    <section className="rounded-xl border border-cyan-500/25 bg-root-canvas p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-black uppercase tracking-wide text-cyan-300">
            {pbb("election.title")}
          </h4>
          <p className="mt-1 text-[11px] text-[#8AA4A4]">
            {pbb("election.activeMembers")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-[#051111] px-2.5 py-1 text-[10px] font-bold text-[#8AA4A4]">
            {pbb("election.eligibleVoters")}: {profiledVoterCount}/{TOTAL_VOTERS}
          </span>
          <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-cyan-300">
            {phaseLabel}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2.5">
        <p className="whitespace-pre-line text-xs font-bold leading-relaxed text-cyan-100">
          {pbb("election.nextSchedule", { year: scheduleYear, startYear: scheduleYear + 1 })}
        </p>
      </div>

      <details className="rounded-lg border border-white/5 bg-[#051111] px-3 py-2">
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wide text-[#8AA4A4]">
          {pbb("election.scoreBreakdown")}
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
          {[
            [pbb("election.metricDiplomacy"), "30%"],
            [pbb("election.metricInfluence"), "25%"],
            [pbb("election.metricContribution"), "20%"],
            [pbb("election.metricSoftPower"), "15%"],
            [pbb("election.metricBilateral"), "10%"],
          ].map(([label, weight]) => (
            <div key={label} className="rounded-lg border border-white/5 bg-root-canvas p-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-root-subtle">{label}</p>
              <p className="mt-1 text-xs font-black text-root-text">{weight}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-[#789090]">
          {pbb("election.contributionNote")}
        </p>
      </details>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
          {error}
        </p>
      )}
      {!profilesLoaded && <p className="text-xs text-[#8AA4A4]">{pbb("election.waiting")}</p>}
      {profilesLoaded && voters.length !== TOTAL_VOTERS && (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
          {pbb("election.memberCountError", { count: voters.length })}
        </p>
      )}
      {profilesLoaded && profiledVoterCount < TOTAL_VOTERS && (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
          {pbb("election.profileMatchError", { count: profiledVoterCount })}
        </p>
      )}
      {!player && <p className="text-xs text-amber-300">{pbb("election.notMember")}</p>}

      {election.phase === "nomination" && nominationOpen && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={nominatePlayer}
            disabled={!canNominate || !dataReady}
            className="rounded-lg bg-cyan-400 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-root-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pbb("election.nominate")}
          </button>
          {player && isPlayerIneligible && (
            <p className="w-full text-xs text-amber-300">{pbb("election.currentMemberIneligible")}</p>
          )}
        </div>
      )}

      {election.phase === "campaign" && campaignOpen && playerCandidate && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={campaign}
            disabled={playerCandidate.campaignCount >= 3}
            className="rounded-lg bg-cyan-400 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-root-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pbb("election.campaign", { count: playerCandidate.campaignCount })}
          </button>
        </div>
      )}

      {visibleNominees.length > 0 && (
        <div className="space-y-3">
          {nomineeGroups.map(group => group.candidates.length > 0 && (
            <div key={group.key} className="space-y-2">
              {group.title && (
                <h5 className="text-[10px] font-black uppercase tracking-wide text-[#8AA4A4]">
                  {group.title}
                </h5>
              )}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {group.candidates.map(candidate => {
                  const isWinner = Boolean(winnerIsoSet?.has(candidate.iso.toLowerCase()));
                  const tone = winnerIsoSet
                    ? isWinner
                      ? "border-emerald-400/70 bg-emerald-500/10"
                      : "border-rose-500/60 bg-rose-500/5"
                    : "border-white/5 bg-[#051111]";
                  return (
                    <div
                      key={candidate.slug}
                      className={`grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border px-3 py-2 ${tone}`}
                    >
                      <div className="pt-0.5" title={candidate.iso.toUpperCase()}>
                        {renderCountryFlag(candidate.iso, candidate.name)}
                      </div>
                      <div className="min-w-0">
                        <p
                          title={candidate.name}
                          className="break-words text-[10px] font-bold leading-tight text-root-text"
                        >
                          {candidate.name}
                        </p>
                        <p className="break-words text-[8px] text-[#789090]">
                          {candidate.region} · {pbb("election.score", { score: candidate.score.toFixed(1) })}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="whitespace-nowrap text-[10px] font-black text-cyan-200">{pbb("election.votes", { count: candidate.votes })}</p>
                        {candidate.campaignCount > 0 && (
                          <p className="text-[8px] text-emerald-300">
                            {pbb("election.contribution", { score: candidate.contributionScore })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {election.phase === "completed" && (
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-emerald-300">
            {pbb("election.winners", { startYear: election.year + 1, endYear: election.year + 2 })}
          </p>
          <p className="mt-1 text-xs text-[#D0E0E0]">
            {latestElection?.winners.join(", ") || pbb("election.savedResults")}
          </p>
          {playerWon && (
            <p className="mt-2 text-[10px] text-emerald-200">{pbb("election.playerReward")}</p>
          )}
        </div>
      )}

      <p className="text-[10px] text-[#789090]">{pbb("election.memberDuty")}</p>
    </section>
  );
}