"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COMBOS } from "@/lib/combos";
import { calculateRoundPoints } from "@/lib/scoring";
import type { Player, Round, Session, WinType } from "@/lib/types";

interface LogRoundInput {
  winnerId: string;
  comboIds: string[];
  winType: WinType;
  discarderId?: string;
}

interface SessionContextValue {
  session: Session | null;
  startSession: (names: [string, string, string, string]) => void;
  logRound: (input: LogRoundInput) => void;
  updateRound: (roundId: string, input: LogRoundInput) => void;
  deleteRound: (roundId: string) => void;
  endSession: () => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function createId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const startSession = useCallback(
    (names: [string, string, string, string]) => {
      const players: Player[] = names.map((name) => ({
        id: createId(),
        name: name.trim(),
      }));
      setSession({ players, rounds: [], status: "active" });
    },
    []
  );

  const logRound = useCallback((input: LogRoundInput) => {
    setSession((prev) => {
      if (!prev || prev.status !== "active") return prev;
      const allPlayerIds = prev.players.map((p) => p.id);
      const pointDeltas = calculateRoundPoints(
        input.winnerId,
        input.comboIds,
        input.winType,
        input.discarderId,
        allPlayerIds,
        COMBOS
      );
      const round: Round = {
        id: createId(),
        roundNumber: prev.rounds.length + 1,
        winnerId: input.winnerId,
        comboIds: input.comboIds,
        winType: input.winType,
        discarderId: input.winType === "discard" ? input.discarderId : undefined,
        pointDeltas,
        timestamp: Date.now(),
      };
      return { ...prev, rounds: [...prev.rounds, round] };
    });
  }, []);

  const updateRound = useCallback((roundId: string, input: LogRoundInput) => {
    setSession((prev) => {
      if (!prev) return prev;
      const allPlayerIds = prev.players.map((p) => p.id);
      const pointDeltas = calculateRoundPoints(
        input.winnerId,
        input.comboIds,
        input.winType,
        input.discarderId,
        allPlayerIds,
        COMBOS
      );
      const rounds = prev.rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              winnerId: input.winnerId,
              comboIds: input.comboIds,
              winType: input.winType,
              discarderId:
                input.winType === "discard" ? input.discarderId : undefined,
              pointDeltas,
            }
          : round
      );
      return { ...prev, rounds };
    });
  }, []);

  const deleteRound = useCallback((roundId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const rounds = prev.rounds
        .filter((round) => round.id !== roundId)
        .map((round, index) => ({ ...round, roundNumber: index + 1 }));
      return { ...prev, rounds };
    });
  }, []);

  const endSession = useCallback(() => {
    setSession((prev) => (prev ? { ...prev, status: "ended" } : prev));
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      startSession,
      logRound,
      updateRound,
      deleteRound,
      endSession,
      resetSession,
    }),
    [session, startSession, logRound, updateRound, deleteRound, endSession, resetSession]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
