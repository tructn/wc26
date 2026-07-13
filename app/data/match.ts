import type { TeamCode } from "./teams";

export type DecidedBy = "regulation" | "extra-time" | "penalties";

export interface MatchResult {
  teamA: TeamCode;
  teamB: TeamCode;
  scoreA: number;
  scoreB: number;
  winner: TeamCode;
  decidedBy: DecidedBy;
  penA?: number;
  penB?: number;
  scorersA: string[];
  scorersB: string[];
}
