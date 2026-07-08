export interface Player {
  id: string;
  name: string;
}

export interface Combo {
  id: string;
  name: string; // e.g. "All triplets"
  chineseName: string; // e.g. "碰碰胡"
  value: number; // base point value V for this combo
}

export type WinType = "discard" | "selfDraw";

export interface Round {
  id: string;
  roundNumber: number;
  winnerId: string;
  comboIds: string[]; // multiple combos allowed, values stack (summed)
  winType: WinType;
  discarderId?: string; // required if winType === 'discard', omitted if 'selfDraw'
  pointDeltas: Record<string, number>; // playerId -> points added this round, computed at log time
  timestamp: number;
}

export interface Session {
  players: Player[]; // exactly 4
  rounds: Round[];
  status: "active" | "ended";
}
