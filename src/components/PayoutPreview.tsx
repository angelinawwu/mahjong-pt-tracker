"use client";

import type { Player } from "@/lib/types";

interface PayoutPreviewProps {
  players: Player[];
  deltas: Record<string, number> | null;
  winnerId: string | null;
}

export function PayoutPreview({ players, deltas, winnerId }: PayoutPreviewProps) {
  return (
    <div className="border border-ink/10 bg-white/70 p-[21px]">
      <p className="font-display text-lg text-jade">Payout preview</p>
      <div className="mt-4 flex flex-col gap-2">
        {players.map((player) => {
          const delta = deltas ? deltas[player.id] ?? 0 : 0;
          const isWinner = player.id === winnerId;
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between border px-[17px] py-[13px] transition-colors duration-200 ${isWinner ? "border-jade bg-jade/10" : "border-lacquer bg-lacquer/10"
                }`}
            >
              <span
                className={`text-sm ${isWinner ? "text-jade" : "text-lacquer"}`}
              >
                {player.name}
                {isWinner && (
                  <span className="ml-2 text-xs text-ink/40">
                    winner
                  </span>
                )}
              </span>
              <span
                className={`font-display text-base tabular-nums ${isWinner ? "text-jade" : "text-lacquer"
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
