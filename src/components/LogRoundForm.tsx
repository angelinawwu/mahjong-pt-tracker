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
    setSelection((prev) => ({
      ...prev,
      comboIds: prev.comboIds.includes(id)
        ? prev.comboIds.filter((c) => c !== id)
        : [...prev.comboIds, id],
    }));
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
      <div>
        <p className="text-xs font-semibold tracking-[0.3em] text-lacquer uppercase">
          Round {roundNumber}
        </p>
        <h2 className="font-display text-2xl text-jade">Log this hand</h2>
      </div>

      <section>
        <p className="mb-2 text-sm font-medium text-ink/70">Winner</p>
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
        <p className="mb-2 text-sm font-medium text-ink/70">Combos</p>
        <div className="flex flex-col gap-2">
          {COMBOS.map((combo) => {
            const checked = selection.comboIds.includes(combo.id);
            return (
              <button
                type="button"
                key={combo.id}
                onClick={() => toggleCombo(combo.id)}
                className={`hover-transition flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
                  checked
                    ? "border-jade bg-jade-soft/60"
                    : "border-ink/10 bg-white/60 hover:border-ink/25"
                }`}
              >
                <span className="text-sm text-ink">
                  <span className="font-medium">{combo.name}</span>
                  <span className="ml-2 text-ink/40">{combo.chineseName}</span>
                </span>
                <span className="font-display text-base text-jade">
                  +{combo.value}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-medium text-ink/70">Win type</p>
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
              className={`hover-transition rounded-xl border px-4 py-3 text-sm font-medium ${
                selection.winType === opt.key
                  ? "border-lacquer bg-lacquer text-ivory"
                  : "border-ink/10 bg-white/60 text-ink hover:border-ink/25"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {selection.winType === "discard" && (
        <section>
          <p className="mb-2 text-sm font-medium text-ink/70">Discarder</p>
          <div className="flex flex-wrap gap-2">
            {others.map((p) => (
              <PlayerChip
                key={p.id}
                label={p.name}
                selected={selection.discarderId === p.id}
                onClick={() => selectDiscarder(p.id)}
                variant="lacquer"
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
        className={`hover-transition sticky bottom-4 w-full rounded-xl py-4 font-display text-lg tracking-wide ${
          isValid
            ? "bg-jade text-ivory shadow-[0_8px_24px_rgba(15,61,51,0.35)] hover:bg-jade-deep active:scale-[0.98]"
            : "cursor-not-allowed bg-ink/10 text-ink/30"
        }`}
      >
        Confirm round
      </button>
    </div>
  );
}
