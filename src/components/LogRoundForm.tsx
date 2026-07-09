"use client";

import { useEffect, useMemo, useState } from "react";
import { COMBOS } from "@/lib/combos";
import { calculateRoundPoints } from "@/lib/scoring";
import { useSession } from "@/context/SessionContext";
import type { WinType } from "@/lib/types";
import { PlayerChip } from "./PlayerChip";
import { PayoutPreview } from "./PayoutPreview";

export interface RoundSelection {
  winnerId: string | null;
  comboIds: string[];
  winType: WinType;
  discarderId: string | null;
}

const EMPTY_SELECTION: RoundSelection = {
  winnerId: null,
  comboIds: [],
  winType: "discard",
  discarderId: null,
};

interface LogRoundFormProps {
  onSelectionChange?: (selection: RoundSelection) => void;
  onConfirmed?: () => void;
  showInlinePreview?: boolean;
}

export function LogRoundForm({
  onSelectionChange,
  onConfirmed,
  showInlinePreview = false,
}: LogRoundFormProps) {
  const { session, logRound } = useSession();
  const [selection, setSelection] = useState<RoundSelection>(EMPTY_SELECTION);

  useEffect(() => {
    onSelectionChange?.(selection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  const previewDeltas = useMemo(() => {
    if (!session) return null;
    if (!selection.winnerId || selection.comboIds.length === 0) return null;
    if (selection.winType === "discard" && !selection.discarderId) return null;
    return calculateRoundPoints(
      selection.winnerId,
      selection.comboIds,
      selection.winType,
      selection.discarderId ?? undefined,
      session.players.map((p) => p.id),
      COMBOS
    );
  }, [selection, session]);

  if (!session) return null;
  const { players } = session;
  const roundNumber = session.rounds.length + 1;

  const others = players.filter((p) => p.id !== selection.winnerId);

  const isValid =
    !!selection.winnerId &&
    selection.comboIds.length > 0 &&
    (selection.winType !== "discard" ||
      (!!selection.discarderId && selection.discarderId !== selection.winnerId));

  function selectWinner(id: string) {
    setSelection((prev) => ({
      ...prev,
      winnerId: id,
      discarderId: prev.discarderId === id ? null : prev.discarderId,
    }));
  }

  function toggleCombo(id: string) {
    setSelection((prev) => {
      const combo = COMBOS.find((c) => c.id === id);
      const isHandType = combo?.category === "hand" || !combo?.category;

      let newCombos = prev.comboIds.includes(id)
        ? prev.comboIds.filter((c) => c !== id)
        : [...prev.comboIds, id];

      if (!prev.comboIds.includes(id)) {
        if (id === "no-flower") {
          newCombos = newCombos.filter((c) => c !== "own-flower");
        }
        if (isHandType) {
          newCombos = newCombos.filter((c) => {
            if (c === id) return true;
            const otherCombo = COMBOS.find((oc) => oc.id === c);
            const otherIsHandType = otherCombo?.category === "hand" || !otherCombo?.category;
            return !otherIsHandType;
          });
        }
      }

      return { ...prev, comboIds: newCombos };
    });
  }

  function setComboCount(id: string, count: number) {
    setSelection((prev) => {
      let otherCombos = prev.comboIds.filter((c) => c !== id);
      if (id === "own-flower" && count > 0) {
        otherCombos = otherCombos.filter((c) => c !== "no-flower");
      }
      const newCombos = [...otherCombos, ...Array(count).fill(id)];
      return {
        ...prev,
        comboIds: newCombos
      };
    });
  }

  function setWinType(winType: WinType) {
    setSelection((prev) => ({
      ...prev,
      winType,
      discarderId: winType === "selfDraw" ? null : prev.discarderId,
    }));
  }

  function selectDiscarder(id: string) {
    setSelection((prev) => ({ ...prev, discarderId: id }));
  }

  function handleConfirm() {
    if (!isValid || !selection.winnerId) return;
    logRound({
      winnerId: selection.winnerId,
      comboIds: selection.comboIds,
      winType: selection.winType,
      discarderId: selection.discarderId ?? undefined,
    });
    setSelection(EMPTY_SELECTION);
    onConfirmed?.();
  }

  return (
    <div className="flex flex-col gap-6">

      <section>
        <p className="mb-2 text-xs font-medium tracking-[0.3em] text-lacquer uppercase">Winner</p>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <PlayerChip
              key={p.id}
              label={p.name}
              selected={selection.winnerId === p.id}
              onClick={() => selectWinner(p.id)}
              variant="jade"
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs font-medium tracking-[0.3em] text-lacquer uppercase">Hand Types</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {COMBOS.filter((c) => c.category === "hand" || !c.category).map((combo) => {
            const checked = selection.comboIds.includes(combo.id);
            return (
              <button
                type="button"
                key={combo.id}
                onClick={() => toggleCombo(combo.id)}
                className={`hover-transition flex items-center justify-between border px-4 py-3 text-left ${checked
                  ? "border-jade bg-jade/10"
                  : "border-ink/10 bg-white hover:bg-jade/5"
                  }`}
              >
                <span className="text-sm text-jade">
                  <span>{combo.name}</span>
                  <span className="ml-2 font-medium text-ink/40">{combo.chineseName}</span>
                </span>
                <span className={`font-display text-base ${checked ? "text-jade" : "text-accent-blue"}`}>
                  +{combo.value}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs font-medium tracking-[0.3em] text-lacquer uppercase">Modifiers</p>
        <div className="flex flex-col gap-2">
          {COMBOS.filter((c) => c.category === "modifier").map((combo) => {
            const count = selection.comboIds.filter((id) => id === combo.id).length;
            const checked = count > 0;

            if (combo.maxCount && combo.maxCount > 1) {
              return (
                <div
                  key={combo.id}
                  onClick={() => setComboCount(combo.id, checked ? count - 1 : 1)}
                  className={`flex cursor-pointer items-center justify-between border px-4 py-3 text-left transition-colors ${checked
                    ? "border-jade bg-jade/10"
                    : "border-ink/10 bg-white hover:bg-jade/5"
                    }`}
                >
                  <span className="text-sm text-jade">
                    <span>{combo.name}</span>
                    <span className="ml-2 font-medium text-ink/40">{combo.chineseName}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`font-display text-base ${checked ? "text-jade" : "text-accent-blue"}`}>
                      +{combo.value * count}
                    </span>
                    <div className="flex items-center gap-1 border border-ink/0 bg-white p-[5px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setComboCount(combo.id, Math.max(0, count - 1));
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded bg-ink/5 text-base text-jade hover:bg-ink/10 active:scale-95"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-sm text-jade">{count}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setComboCount(combo.id, Math.min(combo.maxCount!, count + 1));
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded bg-ink/5 text-base text-jade hover:bg-ink/10 active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                type="button"
                key={combo.id}
                onClick={() => toggleCombo(combo.id)}
                className={`hover-transition flex items-center justify-between border px-4 py-3 text-left ${checked
                  ? "border-jade bg-jade/10"
                  : "border-ink/10 bg-white hover:bg-jade/5"
                  }`}
              >
                <span className="text-sm text-jade">
                  <span>{combo.name}</span>
                  <span className="ml-2 font-medium text-ink/40">{combo.chineseName}</span>
                </span>
                <span className={`font-display text-base ${checked ? "text-jade" : "text-accent-blue"}`}>
                  +{combo.value}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs font-medium tracking-[0.3em] text-lacquer uppercase">Flowers</p>
        <div className="flex flex-col gap-2">
          {COMBOS.filter((c) => c.category === "flower").map((combo) => {
            const count = selection.comboIds.filter((id) => id === combo.id).length;
            const checked = count > 0;

            if (combo.maxCount && combo.maxCount > 1) {
              return (
                <div
                  key={combo.id}
                  onClick={() => setComboCount(combo.id, checked ? count - 1 : 1)}
                  className={`flex cursor-pointer items-center justify-between border px-4 py-3 text-left transition-colors ${checked
                    ? "border-jade bg-jade/10"
                    : "border-ink/10 bg-white hover:bg-jade/5"
                    }`}
                >
                  <span className="text-sm text-jade">
                    <span>{combo.name}</span>
                    <span className="ml-2 font-medium text-ink/40">{combo.chineseName}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`font-display text-base ${checked ? "text-jade" : "text-accent-blue"}`}>
                      +{combo.value * count}
                    </span>
                    <div className="flex items-center gap-1 border border-ink/0 bg-white p-[5px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setComboCount(combo.id, Math.max(0, count - 1));
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded bg-ink/5 text-base text-jade hover:bg-ink/10 active:scale-95"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-sm text-jade">{count}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setComboCount(combo.id, Math.min(combo.maxCount!, count + 1));
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded bg-ink/5 text-base text-jade hover:bg-ink/10 active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                type="button"
                key={combo.id}
                onClick={() => toggleCombo(combo.id)}
                className={`hover-transition flex items-center justify-between border px-4 py-3 text-left ${checked
                  ? "border-jade bg-jade/10"
                  : "border-ink/10 bg-white hover:bg-jade/5"
                  }`}
              >
                <span className="text-sm text-jade">
                  <span>{combo.name}</span>
                  <span className="ml-2 font-medium text-ink/40">{combo.chineseName}</span>
                </span>
                <span className={`font-display text-base ${checked ? "text-jade" : "text-accent-blue"}`}>
                  +{combo.value}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs font-medium tracking-[0.3em] text-lacquer uppercase">Win type</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: "discard", label: "Discard" },
              { key: "selfDraw", label: "Self-draw" },
            ] as { key: WinType; label: string }[]
          ).map((opt) => (
            <button
              type="button"
              key={opt.key}
              onClick={() => setWinType(opt.key)}
              className={`hover-transition border px-4 py-3 text-sm font-normal ${selection.winType === opt.key
                ? "border-jade bg-jade/10 text-jade"
                : "border-ink/10 bg-white text-jade hover:bg-jade/5"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {selection.winType === "discard" && (
        <section>
          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-lacquer uppercase">Discarder</p>
          <div className="flex flex-wrap gap-2">
            {others.map((p) => (
              <PlayerChip
                key={p.id}
                label={p.name}
                selected={selection.discarderId === p.id}
                onClick={() => selectDiscarder(p.id)}
                variant="jade"
              />
            ))}
          </div>
        </section>
      )}

      {showInlinePreview && (
        <PayoutPreview
          players={players}
          deltas={previewDeltas}
          winnerId={selection.winnerId}
        />
      )}

      <button
        type="button"
        disabled={!isValid}
        onClick={handleConfirm}
        className={`hover-transition sticky bottom-4 w-full py-4 font-display text-lg tracking-wide ${isValid
          ? "bg-jade text-ivory hover:bg-jade-deep active:scale-[0.98]"
          : "cursor-not-allowed bg-[#DADADA] text-ink/30"
          }`}
      >
        Confirm round
      </button>
    </div>
  );
}
