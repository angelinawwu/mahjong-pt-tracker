"use client";

import { useMemo, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { COMBOS } from "@/lib/combos";
import { calculateRoundPoints } from "@/lib/scoring";
import { LogRoundForm, type RoundSelection } from "./LogRoundForm";
import { PayoutPreview } from "./PayoutPreview";
import { Scoreboard } from "./Scoreboard";

type MobileTab = "log" | "scoreboard";

export function PlayScreen() {
  const { session, endSession } = useSession();
  const [mobileTab, setMobileTab] = useState<MobileTab>("log");
  const [selection, setSelection] = useState<RoundSelection | null>(null);

  const desktopPreviewDeltas = useMemo(() => {
    if (!session || !selection?.winnerId || selection.comboIds.length === 0) {
      return null;
    }
    if (selection.winType === "discard" && !selection.discarderId) return null;
    return calculateRoundPoints(
      selection.winnerId,
      selection.comboIds,
      selection.winType,
      selection.discarderId ?? undefined,
      session.players.map((p) => p.id),
      COMBOS
    );
  }, [session, selection]);

  if (!session) return null;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-24 pt-8 md:px-8 md:pb-16">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-lacquer uppercase">
            麻將 · Table Talley
          </p>
          <h1 className="font-display text-2xl text-jade">
            Round {session.rounds.length + 1}
          </h1>
        </div>
        <button
          type="button"
          onClick={endSession}
          className="hover-transition rounded-full border border-lacquer/40 px-4 py-2 text-sm font-medium text-lacquer hover:bg-lacquer hover:text-ivory"
        >
          End session
        </button>
      </header>

      {/* Mobile tabs */}
      <div className="mb-5 flex gap-2 rounded-full bg-white/60 p-1 md:hidden">
        {(
          [
            { key: "log", label: "Log round" },
            { key: "scoreboard", label: "Scoreboard" },
          ] as { key: MobileTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMobileTab(tab.key)}
            className={`hover-transition flex-1 rounded-full py-2 text-sm font-medium ${
              mobileTab === tab.key
                ? "bg-jade text-ivory"
                : "text-ink/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile: single column, one screen at a time */}
      <div className="md:hidden">
        {mobileTab === "log" ? (
          <LogRoundForm
            showInlinePreview
            onSelectionChange={setSelection}
            onConfirmed={() => setMobileTab("scoreboard")}
          />
        ) : (
          <Scoreboard session={session} />
        )}
      </div>

      {/* Desktop: two-column, both always visible */}
      <div className="hidden md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-10">
        <div className="flex flex-col gap-10">
          <LogRoundForm onSelectionChange={setSelection} />
          <Scoreboard session={session} />
        </div>
        <div className="sticky top-8 h-fit">
          <PayoutPreview
            players={session.players}
            deltas={desktopPreviewDeltas}
            winnerId={selection?.winnerId ?? null}
          />
        </div>
      </div>
    </main>
  );
}
