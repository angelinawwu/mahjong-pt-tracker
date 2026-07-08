import type { Player, Round } from "./types";

export interface StandingEntry {
  player: Player;
  total: number;
  rank: number; // dense rank: ties share a rank number, no gaps for the next rank
}

/** Sum of pointDeltas[playerId] across all rounds. */
export function calculateTotals(
  players: Player[],
  rounds: Round[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  players.forEach((p) => {
    totals[p.id] = 0;
  });
  rounds.forEach((round) => {
    players.forEach((p) => {
      totals[p.id] += round.pointDeltas[p.id] ?? 0;
    });
  });
  return totals;
}

/**
 * Standings sorted ascending by total (lowest first, lowest wins).
 * Ties share a dense rank number (e.g. 1, 1, 2, 3) — no gaps.
 */
export function calculateStandings(
  players: Player[],
  rounds: Round[]
): StandingEntry[] {
  const totals = calculateTotals(players, rounds);
  const sorted = [...players].sort((a, b) => totals[a.id] - totals[b.id]);

  const standings: StandingEntry[] = [];
  let rank = 0;
  let lastTotal: number | null = null;

  sorted.forEach((player) => {
    const total = totals[player.id];
    if (lastTotal === null || total !== lastTotal) {
      rank += 1;
      lastTotal = total;
    }
    standings.push({ player, total, rank });
  });

  return standings;
}
