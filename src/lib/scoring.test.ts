import { describe, expect, it } from "vitest";
import { calculateRoundPoints } from "./scoring";
import type { Combo } from "./types";

const combos: Combo[] = [
  { id: "all-triplets", name: "All triplets", chineseName: "碰碰胡", value: 3 },
  { id: "value-5", name: "Value 5", chineseName: "測試", value: 5 },
];

const players = ["A", "B", "C", "D"];

describe("calculateRoundPoints", () => {
  it("discard win: discarder pays double, others pay single", () => {
    const result = calculateRoundPoints(
      "A",
      ["all-triplets"],
      "discard",
      "C",
      players,
      combos
    );
    expect(result).toEqual({ A: 0, B: 3, C: 6, D: 3 });
  });

  it("self-draw win: every non-winner pays double", () => {
    const result = calculateRoundPoints(
      "A",
      ["all-triplets"],
      "selfDraw",
      undefined,
      players,
      combos
    );
    expect(result).toEqual({ A: 0, B: 6, C: 6, D: 6 });
  });

  it("stacking combos: values sum before doubling", () => {
    const result = calculateRoundPoints(
      "A",
      ["all-triplets", "value-5"],
      "discard",
      "C",
      players,
      combos
    );
    expect(result).toEqual({ A: 0, B: 8, C: 16, D: 8 });
  });
});
