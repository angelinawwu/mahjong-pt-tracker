import type { Combo } from "./types";

// Editable combo config. Add or edit entries here without touching app logic.
// NOTE: only confirmed point values are listed below. Do not invent values
// for unlisted combos (e.g. great dragons 大三元, thirteen orphans 十三幺,
// flush 清一色) — add them here once the user supplies confirmed values.
export const COMBOS: Combo[] = [
  { id: "all-triplets", name: "All triplets", chineseName: "碰碰胡", value: 3 },
];
