import type { Combo } from "./types";

// Editable combo config. Add or edit entries here without touching app logic.
// NOTE: values marked as guesses below (see comments) should be confirmed
// by the user and updated once known.
export const COMBOS: Combo[] = [
  { id: "none", name: "None", chineseName: "无", value: 0, category: "hand" },
  { id: "all-triplets", name: "All triplets", chineseName: "碰碰胡", value: 3, category: "hand" },
  // Guessed value — confirm with user.
  { id: "dragon", name: "Dragon", chineseName: "一条龙", value: 3, category: "hand" },
  // Guessed value — confirm with user.
  { id: "seven-pairs", name: "Seven pairs", chineseName: "七对", value: 4, category: "hand" },
  // Guessed value — confirm with user.
  { id: "thirteen-orphans", name: "Thirteen orphans", chineseName: "十三幺", value: 3, category: "hand" },
  // Guessed value — confirm with user.
  { id: "all-symbols", name: "All symbols", chineseName: "字一色", value: 5, category: "hand" },
  // Guessed value — confirm with user.
  { id: "chi-chi-chi", name: "Chi chi chi", chineseName: "吃吃吃", value: 2, category: "hand" },
  // Guessed value — confirm with user.
  { id: "perfect-chi-chi-chi", name: "Perfect chi chi chi", chineseName: "清吃吃吃", value: 4, category: "hand" },
  // Guessed value — confirm with user.
  { id: "wind-triplet", name: "Wind triplet", chineseName: "门风刻", value: 1, category: "modifier", maxCount: 2 },
  // Guessed value — confirm with user.
  { id: "symbol-triplet", name: "Symbol triplet", chineseName: "箭刻", value: 1, category: "modifier", maxCount: 4 },
  // Guessed value — confirm with user.
  { id: "pure-suit", name: "Pure suit", chineseName: "清一色", value: 5, category: "modifier" },
  // Guessed value — confirm with user.
  { id: "mixed-suit", name: "Mixed suit", chineseName: "混一色", value: 3, category: "modifier" },
  // Guessed value — confirm with user.
  { id: "no-flower", name: "No flower", chineseName: "无花", value: 1, category: "flower" },
  // Guessed value — confirm with user.
  { id: "own-flower", name: "Own flower", chineseName: "正花", value: 1, category: "flower", maxCount: 2 },
];
