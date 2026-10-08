const GAME_DATE_PROPERTY = "neosantara_current_game_date";

type GameWindow = Window & { neosantara_current_game_date?: string };

export function setCurrentGameDateString(value: string): void {
  if (typeof window === "undefined") return;
  (window as GameWindow)[GAME_DATE_PROPERTY] = value;
}

export function getCurrentGameDateString(): string {
  if (typeof window !== "undefined") {
    const value = (window as GameWindow)[GAME_DATE_PROPERTY];
    if (value) return value;

    try {
      const pendingSave = window.sessionStorage.getItem("presiden_simulator_load_save");
      if (pendingSave) {
        const gameDate = (JSON.parse(pendingSave) as { game_date?: unknown }).game_date;
        if (typeof gameDate === "string" && !Number.isNaN(new Date(gameDate).getTime())) {
          return gameDate.slice(0, 10);
        }
      }
    } catch (error) {
      console.error("Gagal membaca tanggal dari save yang sedang dimuat:", error);
    }
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
