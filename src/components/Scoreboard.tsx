"use client";

import { COMBOS } from "@/lib/combos";
import { calculateStandings } from "@/lib/ranking";
import type { Session } from "@/lib/types";

function comboLabel(comboIds: string[]) {
  return comboIds
    .map((id) => COMBOS.find((c) => c.id === id)?.name ?? id)
    .join(", ");
}

function playerName(session: Session, id: string) {
  return session.players.find((p) => p.id === id)?.name ?? "—";
}

interface ScoreboardProps {
  session: Session;
  title?: string;
}

export function Scoreboard({ session, title = "Scoreboard" }: ScoreboardProps) {
  const standings = calculateStandings(session.players, session.rounds);
  const rounds = [...session.rounds].reverse();

  return (
    <div className="flex flex-col gap-8">
      {/* --- Current Standings / Leaderboard --- */}
      <section>
        <h2 className="font-display mb-4 text-lg text-jade">{title}</h2>
        <div className="flex flex-col gap-2">
          {standings.map((entry) => {
            return (
              <div
                key={entry.player.id}
                className="hover-transition flex items-center justify-between border px-4 py-3.5 border-ink/10 bg-white/60"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display flex h-8 w-8 items-center justify-center text-sm bg-jade/10 text-jade">
                    {entry.rank}
                  </span>
                  <span className="text-sm text-ink">
                    {entry.player.name}
                  </span>
                </div>
                <span className="font-display tabular-nums text-accent-blue">
                  {entry.total}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- Round History Log --- */}
      <section>
        <h3 className="font-display mb-3 text-lg text-jade">Round history</h3>
        {rounds.length === 0 ? (
          <p className="text-sm text-ink/40">No rounds logged yet.</p>
        ) : (
          <>
            <div className="hidden overflow-hidden border border-ink/10 md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-jade/10 text-ink/60">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Winner</th>
                    <th className="px-4 py-2">Combo(s)</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((round) => (
                    <tr key={round.id} className="border-t border-ink/5">
                      <td className="px-4 py-2 text-ink/60">
                        {round.roundNumber}
                      </td>
                      <td className="px-4 py-2 text-ink">
                        {playerName(session, round.winnerId)}
                      </td>
                      <td className="px-4 py-2 text-ink/70">
                        {comboLabel(round.comboIds)}
                      </td>
                      <td className="px-4 py-2 text-ink/70">
                        {round.winType === "discard" ? "Discard" : "Self-draw"}
                        {round.winType === "discard" && round.discarderId && (
                          <span className="text-ink/40">
                            {" "}
                            ({playerName(session, round.discarderId)})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-ink/70">
                        {session.players
                          .map(
                            (p) =>
                              `${p.name} +${round.pointDeltas[p.id] ?? 0}`
                          )
                          .join(" · ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 md:hidden">
              {rounds.map((round) => (
                <div
                  key={round.id}
                  className="border border-ink/10 bg-white/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium tracking-[0.3em] text-lacquer uppercase">
                      Round {round.roundNumber}
                    </span>
                    <span className="text-xs text-ink/50">
                      {round.winType === "discard" ? "Discard" : "Self-draw"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink">
                    {playerName(session, round.winnerId)} won ·{" "}
                    {comboLabel(round.comboIds)}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">
                    {session.players
                      .map((p) => `${p.name} +${round.pointDeltas[p.id] ?? 0}`)
                      .join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
