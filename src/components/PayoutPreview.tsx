"use client";

import type { Player } from "@/lib/types";

interface PayoutPreviewProps {
  players: Player[];
  deltas: Record<string, number> | null;
  winnerId: string | null;
}

export function PayoutPreview({ players, deltas, winnerId }: PayoutPreviewProps) {
  return (
    <div className="rounded-2xl border border-jade/15 bg-white/70 p-5">
      <p className="font-display text-lg text-jade">Payout preview</p>
      <p className="mt-1 text-xs tracking-wide text-ink/50 uppercase">
        Updates as you choose
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {players.map((player) => {
          const delta = deltas ? deltas[player.id] ?? 0 : 0;
          const isWinner = player.id === winnerId;
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors duration-200 ${
                isWinner ? "bg-gold-soft/60" : "bg-jade-soft/50"
              }`}
            >
              <span className="text-sm font-medium text-ink">
                {player.name}
                {isWinner && (
                  <span className="ml-2 text-xs font-semibold text-gold">
                    winner
                  </span>
                )}
              </span>
              <span
                className={`font-display text-lg tabular-nums ${
                  isWinner
                    ? "text-gold"
                    : delta > 0
                    ? "text-lacquer"
                    : "text-ink/40"
                }`}
              >
                {deltas === null ? "—" : isWinner ? "0" : `+${delta}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
