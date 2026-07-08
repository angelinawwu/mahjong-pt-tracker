"use client";

import { useSession } from "@/context/SessionContext";
import { calculateStandings } from "@/lib/ranking";

export function SessionSummary() {
  const { session, resetSession } = useSession();
  if (!session) return null;

  const standings = calculateStandings(session.players, session.rounds);
  const winner = standings.find((s) => s.rank === 1);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-semibold tracking-[0.3em] text-lacquer uppercase">
          Session ended
        </p>
        <h1 className="font-display text-4xl text-jade">Final standings</h1>
        {winner && (
          <p className="mt-3 text-sm text-ink/60">
            <span className="font-semibold text-gold">{winner.player.name}</span>{" "}
            takes the table with {winner.total} points.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {standings.map((entry) => {
          const isFirst = entry.rank === 1;
          return (
            <div
              key={entry.player.id}
              className={`flex items-center justify-between border px-4 py-4 ${
                isFirst
                  ? "border-gold bg-gold-soft/70 shadow-[0_4px_20px_rgba(185,144,47,0.3)]"
                  : "border-ink/10 bg-white/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-display flex h-9 w-9 items-center justify-center rounded-full ${
                    isFirst ? "bg-gold text-ivory" : "bg-jade-soft text-jade"
                  }`}
                >
                  {entry.rank}
                </span>
                <span className="font-medium text-ink">
                  {entry.player.name}
                </span>
              </div>
              <span
                className={`font-display text-xl tabular-nums ${
                  isFirst ? "text-gold" : "text-ink/70"
                }`}
              >
                {entry.total}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={resetSession}
        className="hover-transition mt-8 w-full bg-jade py-3.5 font-display text-lg tracking-wide text-ivory shadow-[0_8px_24px_rgba(12,95,50,0.35)] hover:bg-jade-deep active:scale-[0.98]"
      >
        Start a new session
      </button>
    </main>
  );
}
