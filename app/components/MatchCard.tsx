"use client";

import { useEffect, useRef, useState } from "react";
import { TEAMS, type TeamCode } from "@/app/data/teams";
import { pickScorer } from "@/app/data/players";
import type { MatchResult } from "@/app/data/match";
import FlagIcon from "./FlagIcon";
import TeamLogo from "./TeamLogo";
import Confetti from "./Confetti";

interface MatchCardProps {
  label: string;
  teamA: TeamCode;
  teamB: TeamCode;
  onComplete: (result: MatchResult) => void;
}

// FIFA World Cup knockout rule: no draws are possible. 90' -> two 15' extra-time
// halves -> penalty shootout. Every match here always resolves to a winner.
type Phase = "idle" | "rolling" | "extra1" | "extra2" | "shootout" | "done";

// Weighted pool capped at 3 goals, the realistic ceiling for a normal-time scoreline.
const SCORE_POOL = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3];
const randomScore = () => SCORE_POOL[Math.floor(Math.random() * SCORE_POOL.length)];
const randomFlicker = () => Math.floor(Math.random() * 4);

// Each extra-time half rarely produces more than one goal per side.
const EXTRA_HALF_POOL = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1];
const randomExtraHalfGoals = () => EXTRA_HALF_POOL[Math.floor(Math.random() * EXTRA_HALF_POOL.length)];

// Roll delays that start fast and stretch out, like a slot machine settling.
const TICK_DELAYS = [80, 80, 90, 100, 110, 130, 160, 190, 230, 280, 340, 410, 490, 580];

const PEN_CONVERSION_RATE = 0.78;
const KICK_REVEAL_DELAY = 650;

interface Shootout {
  kicksA: boolean[];
  kicksB: boolean[];
}

interface GoalEvent {
  player: string;
  minute: number;
}

const makeGoals = (code: TeamCode, count: number, minMinute: number, maxMinute: number): GoalEvent[] =>
  Array.from({ length: count }, () => ({
    player: pickScorer(code),
    minute: minMinute + Math.floor(Math.random() * (maxMinute - minMinute + 1)),
  }));

// Groups goals by player and formats e.g. "Mbappé 23', 71'" for a brace.
function formatScorers(events: GoalEvent[]): string[] {
  const byPlayer = new Map<string, number[]>();
  events.forEach((e) => {
    const minutes = byPlayer.get(e.player) ?? [];
    minutes.push(e.minute);
    byPlayer.set(e.player, minutes);
  });
  return Array.from(byPlayer.entries()).map(
    ([name, minutes]) => `${name} ${minutes.sort((a, b) => a - b).map((m) => `${m}'`).join(", ")}`
  );
}

// Builds a full, already-decided shootout: 5 kicks each, then sudden death
// pairs until the tie is broken. Revealed progressively during the animation.
function simulateShootout(): Shootout {
  const scoreOf = (kicks: boolean[]) => kicks.filter(Boolean).length;
  const kicksA: boolean[] = [];
  const kicksB: boolean[] = [];

  for (let i = 0; i < 5; i++) {
    kicksA.push(Math.random() < PEN_CONVERSION_RATE);
    kicksB.push(Math.random() < PEN_CONVERSION_RATE);
  }
  while (scoreOf(kicksA) === scoreOf(kicksB)) {
    kicksA.push(Math.random() < PEN_CONVERSION_RATE);
    kicksB.push(Math.random() < PEN_CONVERSION_RATE);
  }
  return { kicksA, kicksB };
}

export default function MatchCard({ label, teamA, teamB, onComplete }: MatchCardProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scoreA, setScoreA] = useState<number | null>(null);
  const [scoreB, setScoreB] = useState<number | null>(null);
  const [wentToExtra, setWentToExtra] = useState(false);
  const [shootout, setShootout] = useState<Shootout | null>(null);
  const [revealedKicks, setRevealedKicks] = useState(0);
  const [winner, setWinner] = useState<TeamCode | null>(null);
  const [goalsA, setGoalsA] = useState<GoalEvent[]>([]);
  const [goalsB, setGoalsB] = useState<GoalEvent[]>([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeouts.current.push(id);
    return id;
  };

  const finish = (win: TeamCode, delay: number, extras: Omit<MatchResult, "teamA" | "teamB" | "winner">) => {
    setWinner(win);
    setPhase("done");
    const result: MatchResult = { teamA, teamB, winner: win, ...extras };
    schedule(() => onComplete(result), delay);
  };

  const startShootout = (finalScoreA: number, finalScoreB: number, finalGoalsA: GoalEvent[], finalGoalsB: GoalEvent[]) => {
    const result = simulateShootout();
    setShootout(result);
    setRevealedKicks(0);
    setPhase("shootout");

    const totalKicks = result.kicksA.length + result.kicksB.length;
    for (let i = 1; i <= totalKicks; i++) {
      schedule(() => setRevealedKicks(i), i * KICK_REVEAL_DELAY);
    }
    schedule(() => {
      const penA = result.kicksA.filter(Boolean).length;
      const penB = result.kicksB.filter(Boolean).length;
      finish(penA > penB ? teamA : teamB, 1300, {
        scoreA: finalScoreA,
        scoreB: finalScoreB,
        decidedBy: "penalties",
        penA,
        penB,
        scorersA: formatScorers(finalGoalsA),
        scorersB: formatScorers(finalGoalsB),
      });
    }, totalKicks * KICK_REVEAL_DELAY + 900);
  };

  const playExtraHalf = (
    half: "extra1" | "extra2",
    baseA: number,
    baseB: number,
    priorGoalsA: GoalEvent[],
    priorGoalsB: GoalEvent[]
  ) => {
    setPhase(half);
    schedule(() => {
      const addedA = randomExtraHalfGoals();
      const addedB = randomExtraHalfGoals();
      const newA = baseA + addedA;
      const newB = baseB + addedB;
      setScoreA(newA);
      setScoreB(newB);
      const [minMinute, maxMinute] = half === "extra1" ? [91, 105] : [106, 120];
      const newGoalsA = addedA > 0 ? [...priorGoalsA, ...makeGoals(teamA, addedA, minMinute, maxMinute)] : priorGoalsA;
      const newGoalsB = addedB > 0 ? [...priorGoalsB, ...makeGoals(teamB, addedB, minMinute, maxMinute)] : priorGoalsB;
      setGoalsA(newGoalsA);
      setGoalsB(newGoalsB);

      if (newA !== newB) {
        finish(newA > newB ? teamA : teamB, 1100, {
          scoreA: newA,
          scoreB: newB,
          decidedBy: "extra-time",
          scorersA: formatScorers(newGoalsA),
          scorersB: formatScorers(newGoalsB),
        });
      } else if (half === "extra1") {
        schedule(() => playExtraHalf("extra2", newA, newB, newGoalsA, newGoalsB), 900);
      } else {
        schedule(() => startShootout(newA, newB, newGoalsA, newGoalsB), 900);
      }
    }, 1350);
  };

  const simulate = () => {
    if (phase !== "idle") return;
    setPhase("rolling");
    setWinner(null);
    setWentToExtra(false);
    setShootout(null);
    setRevealedKicks(0);
    setGoalsA([]);
    setGoalsB([]);

    let elapsed = 0;
    TICK_DELAYS.forEach((delay) => {
      elapsed += delay;
      schedule(() => {
        setScoreA(randomFlicker());
        setScoreB(randomFlicker());
      }, elapsed);
    });

    schedule(() => {
      const finalA = randomScore();
      const finalB = randomScore();
      setScoreA(finalA);
      setScoreB(finalB);
      const newGoalsA = finalA > 0 ? makeGoals(teamA, finalA, 1, 90) : [];
      const newGoalsB = finalB > 0 ? makeGoals(teamB, finalB, 1, 90) : [];
      setGoalsA(newGoalsA);
      setGoalsB(newGoalsB);

      if (finalA !== finalB) {
        finish(finalA > finalB ? teamA : teamB, 1100, {
          scoreA: finalA,
          scoreB: finalB,
          decidedBy: "regulation",
          scorersA: formatScorers(newGoalsA),
          scorersB: formatScorers(newGoalsB),
        });
      } else {
        setWentToExtra(true);
        schedule(() => playExtraHalf("extra1", finalA, finalB, newGoalsA, newGoalsB), 1150);
      }
    }, elapsed + 750);
  };

  const rolling = phase === "rolling";
  const inExtra1 = phase === "extra1";
  const inExtra2 = phase === "extra2";
  const inShootout = phase === "shootout";
  const done = phase === "done";
  const isLive = rolling || inExtra1 || inExtra2 || inShootout;

  const kicksTakenA = shootout ? Math.ceil(revealedKicks / 2) : 0;
  const kicksTakenB = shootout ? Math.floor(revealedKicks / 2) : 0;
  const shootoutScoreA = shootout ? shootout.kicksA.slice(0, kicksTakenA).filter(Boolean).length : 0;
  const shootoutScoreB = shootout ? shootout.kicksB.slice(0, kicksTakenB).filter(Boolean).length : 0;
  const shootoutComplete = shootout ? revealedKicks >= shootout.kicksA.length + shootout.kicksB.length : false;
  const inSuddenDeath = shootout ? shootout.kicksA.length > 5 : false;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 sm:p-8 ${
        inShootout
          ? "border-red-400/40 bg-gradient-to-b from-red-950/50 to-emerald-950/60"
          : "border-white/10 bg-gradient-to-b from-emerald-950/80 to-emerald-900/40"
      } ${done ? "shadow-[0_0_35px_-5px_rgba(255,209,102,0.5)] animate-card-shake" : ""}`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-beam-sweep" />

      <Confetti active={done} />

      <p className="font-heading mb-6 text-center text-base uppercase tracking-[0.25em] text-amber-300/80">
        {label}
      </p>

      <div className="relative flex items-center justify-between gap-3">
        <TeamSide
          code={teamA}
          align="left"
          isWinner={winner === teamA}
          faded={done && winner !== teamA}
          scorers={formatScorers(goalsA)}
        />

        <div className="flex flex-col items-center px-1">
          <div
            className={`flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 font-score text-5xl font-black tabular-nums text-white sm:text-6xl ${
              isLive ? "ring-2 ring-amber-400/60 animate-pulse" : ""
            } ${done ? "animate-score-impact" : ""}`}
          >
            <span className={rolling ? "animate-score-flicker" : ""}>{scoreA ?? "-"}</span>
            <span className="text-white/40">:</span>
            <span className={rolling ? "animate-score-flicker" : ""}>{scoreB ?? "-"}</span>
          </div>

          {wentToExtra && !inShootout && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-300/90">
              {done && shootout
                ? "After penalties"
                : inExtra1
                  ? "Extra time · 1st half"
                  : inExtra2
                    ? "Extra time · 2nd half"
                    : "Extra time"}
            </p>
          )}

          {phase === "idle" && (
            <button
              onClick={simulate}
              className="mt-4 rounded-full bg-amber-400 px-5 py-2 text-sm font-bold uppercase tracking-wide text-emerald-950 shadow-lg transition hover:bg-amber-300 active:scale-95"
            >
              Simulate
            </button>
          )}

          {rolling && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/60 animate-pulse">
              Playing…
            </p>
          )}
          {(inExtra1 || inExtra2) && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-amber-200/80 animate-pulse">
              {inExtra1 ? "1st half…" : "2nd half…"}
            </p>
          )}

          {shootout && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300/90 animate-pulse">
                {shootoutComplete ? "Shootout" : inSuddenDeath ? "Sudden death!" : "Penalty shootout"}
              </p>
              <KickRow code={teamA} kicks={shootout.kicksA} taken={kicksTakenA} score={shootoutScoreA} />
              <KickRow code={teamB} kicks={shootout.kicksB} taken={kicksTakenB} score={shootoutScoreB} />
            </div>
          )}

          {done && winner && (
            <p className="font-heading mt-4 animate-pop-in text-base uppercase tracking-wide text-amber-300">
              {TEAMS[winner].name} win
            </p>
          )}
        </div>

        <TeamSide
          code={teamB}
          align="right"
          isWinner={winner === teamB}
          faded={done && winner !== teamB}
          scorers={formatScorers(goalsB)}
        />
      </div>
    </div>
  );
}

function KickRow({
  code,
  kicks,
  taken,
  score,
}: {
  code: TeamCode;
  kicks: boolean[];
  taken: number;
  score: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 font-heading text-[11px] uppercase text-white/60">{code}</span>
      <div className="flex gap-1">
        {kicks.map((scored, i) => {
          const revealed = i < taken;
          return (
            <span
              key={i}
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] leading-none sm:h-6 sm:w-6 ${
                revealed
                  ? scored
                    ? "border-emerald-300 bg-emerald-500/80 text-white animate-kick-pop"
                    : "border-red-400 bg-red-900/70 text-red-200 animate-kick-pop"
                  : "border-white/20 bg-white/5 text-transparent"
              }`}
            >
              {revealed ? (scored ? "●" : "✕") : ""}
            </span>
          );
        })}
      </div>
      <span className="w-4 font-score text-sm font-bold text-white">{score}</span>
    </div>
  );
}

function TeamSide({
  code,
  align,
  isWinner,
  faded,
  scorers,
}: {
  code: TeamCode;
  align: "left" | "right";
  isWinner: boolean;
  faded: boolean;
  scorers: string[];
}) {
  const team = TEAMS[code];
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-3 transition-opacity duration-500 ${
        faded ? "opacity-40" : "opacity-100"
      } ${isWinner ? "animate-winner-shake" : ""} ${align === "left" ? "sm:items-end" : "sm:items-start"}`}
    >
      <div className={`h-12 w-[4.5rem] overflow-hidden animate-flag-flutter sm:h-14 sm:w-20 ${isWinner ? "animate-glow-pulse" : ""}`}>
        <FlagIcon code={code} />
      </div>
      <div className="relative flex items-center justify-center">
        {isWinner && (
          <>
            <span className="absolute h-24 w-24 rounded-full bg-amber-300/50 animate-flash-burst" />
            <span className="absolute rounded-full border border-amber-300 animate-ring-burst h-20 w-20" />
            <span className="absolute rounded-full border border-amber-300 animate-ring-burst h-20 w-20 [animation-delay:0.4s]" />
          </>
        )}
        <TeamLogo code={code} size={80} className={isWinner ? "animate-trophy-bounce" : "animate-crest-entrance"} />
      </div>
      <span className="font-heading text-lg tracking-wide text-white/90 sm:text-2xl">{team.name}</span>
      {scorers.length > 0 && (
        <div key={scorers.length} className="flex flex-col items-center gap-0.5 animate-pop-in">
          {scorers.map((line, i) => (
            <span key={i} className="text-[11px] text-white/50 italic">
              ⚽ {line}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
