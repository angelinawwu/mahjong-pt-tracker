import type { Combo, WinType } from "./types";

/**
 * Pure, deterministic scoring function. No side effects.
 *
 * - Self-draw: every non-winning player pays double the stacked combo value.
 * - Discard: the discarder pays double, the other two non-winners pay single.
 * - The winner's delta is always 0.
 */
export function calculateRoundPoints(
  winnerId: string,
  comboIds: string[],
  winType: WinType,
  discarderId: string | undefined,
  allPlayerIds: string[],
  combos: Combo[]
): Record<string, number> {
  const V = comboIds.reduce((sum, id) => {
    const combo = combos.find((c) => c.id === id);
    return sum + (combo?.value ?? 0);
  }, 0);

  const deltas: Record<string, number> = {};
  allPlayerIds.forEach((id) => {
    deltas[id] = 0;
  });

  const others = allPlayerIds.filter((id) => id !== winnerId);

  if (winType === "selfDraw") {
    others.forEach((id) => {
      deltas[id] = 2 * V;
    });
  } else {
    others.forEach((id) => {
      deltas[id] = id === discarderId ? 2 * V : V;
    });
  }

  return deltas;
}
