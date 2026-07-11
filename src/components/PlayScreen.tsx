"use client";

import { useMemo, useState } from "react";
import { useSession } from "@/context/SessionContext";
import { COMBOS } from "@/lib/combos";
import { calculateRoundPoints } from "@/lib/scoring";
import { LogRoundForm, type RoundSelection } from "./LogRoundForm";
import { PayoutPreview } from "./PayoutPreview";
import { Scoreboard } from "./Scoreboard";
import { InteractiveHandPreview } from "./InteractiveHandPreview";

type ActiveTab = "log" | "scoreboard";

export function PlayScreen() {
  const { session, endSession } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>("log");
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
    <main className="mx-auto min-h-dvh w-full px-4 pb-24 pt-8 md:px-8 md:pb-16">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.3em] text-lacquer uppercase">
            麻將 · MAHJONG
          </p>
          <h1 className="font-display text-2xl text-jade">
            Round {session.rounds.length + 1}
          </h1>
        </div>
        <button
          type="button"
          onClick={endSession}
          className="hover-transition border border-[rgba(168,41,31,0.4)] px-4 py-2 text-sm font-normal text-lacquer hover:bg-lacquer hover:text-ivory"
        >
          End session
        </button>
      </header>

      {/* Tabs */}
      <div className="mb-6 flex rounded-full bg-white/60 w-full md:max-w-sm">
        {(
          [
            { key: "log", label: "Log round" },
            { key: "scoreboard", label: "Scoreboard" },
          ] as { key: ActiveTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`hover-transition flex-1 border py-2 text-sm font-normal ${activeTab === tab.key
              ? "border-jade bg-jade text-ivory"
              : "border-ink/10 text-ink/60"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "log" ? (
        <>
          {/* Mobile: single column */}
          <div className="md:hidden">
            <LogRoundForm
              showInlinePreview
              onSelectionChange={setSelection}
              onConfirmed={() => setActiveTab("scoreboard")}
            />
          </div>

          {/* Desktop: two-column layout */}
          <div className="hidden md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-10">
            <div>
              <LogRoundForm
                onSelectionChange={setSelection}
                onConfirmed={() => setActiveTab("scoreboard")}
              />
            </div>
            <div className="sticky top-8 h-fit flex flex-col gap-4">
              <PayoutPreview
                players={session.players}
                deltas={desktopPreviewDeltas}
                winnerId={selection?.winnerId ?? null}
              />
              {selection?.winnerId && (
                <InteractiveHandPreview
                  comboIds={selection.comboIds}
                  winType={selection.winType}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full">
          <Scoreboard session={session} />
        </div>
      )}
    </main>
  );
}
