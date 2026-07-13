"use client";

import { useEffect, useRef, useState } from "react";
import { TEAMS, type TeamCode } from "@/app/data/teams";
import FlagIcon from "./FlagIcon";
import TeamLogo from "./TeamLogo";
import Confetti from "./Confetti";

interface MatchCardProps {
  label: string;
  teamA: TeamCode;
  teamB: TeamCode;
  onComplete: (winner: TeamCode) => void;
}

type Phase = "idle" | "rolling" | "extra" | "penalties" | "done";

// Weighted pool capped at 3 goals, the realistic ceiling for a normal-time scoreline.
const SCORE_POOL = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3];
const randomScore = () => SCORE_POOL[Math.floor(Math.random() * SCORE_POOL.length)];
const randomFlicker = () => Math.floor(Math.random() * 4);

// Extra time rarely produces more than one goal per side.
const EXTRA_TIME_POOL = [0, 0, 0, 0, 0, 0, 1, 1, 1, 2];
const randomExtraTimeGoals = () => EXTRA_TIME_POOL[Math.floor(Math.random() * EXTRA_TIME_POOL.length)];

// Roll delays that start fast and stretch out, like a slot machine settling.
const TICK_DELAYS = [70, 70, 80, 90, 100, 120, 140, 170, 210, 260, 320, 400];

export default function MatchCard({ label, teamA, teamB, onComplete }: MatchCardProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scoreA, setScoreA] = useState<number | null>(null);
  const [scoreB, setScoreB] = useState<number | null>(null);
  const [wentToExtra, setWentToExtra] = useState(false);
  const [penA, setPenA] = useState<number | null>(null);
  const [penB, setPenB] = useState<number | null>(null);
  const [winner, setWinner] = useState<TeamCode | null>(null);
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

  // FIFA World Cup knockout rule: draw after 90' -> 30' extra time -> penalty shootout.
  const resolveExtraTime = (baseA: number, baseB: number) => {
    setPhase("extra");
    setWentToExtra(true);
    schedule(() => {
      const etA = baseA + randomExtraTimeGoals();
      const etB = baseB + randomExtraTimeGoals();
      setScoreA(etA);
      setScoreB(etB);

      if (etA !== etB) {
        const win = etA > etB ? teamA : teamB;
        setWinner(win);
        setPhase("done");
        schedule(() => onComplete(win), 900);
      } else {
        resolvePenalties();
      }
    }, 900);
  };

  const resolvePenalties = () => {
    setPhase("penalties");
    schedule(() => {
      let pA = 3 + Math.floor(Math.random() * 3);
      let pB = 3 + Math.floor(Math.random() * 3);
      if (pA === pB) pA += 1;
      setPenA(pA);
      setPenB(pB);
      const win = pA > pB ? teamA : teamB;
      setWinner(win);
      setPhase("done");
      schedule(() => onComplete(win), 1100);
    }, 900);
  };

  const simulate = () => {
    if (phase === "rolling") return;
    setPhase("rolling");
    setWinner(null);
    setWentToExtra(false);
    setPenA(null);
    setPenB(null);

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

      if (finalA !== finalB) {
        const win = finalA > finalB ? teamA : teamB;
        setWinner(win);
        setPhase("done");
        schedule(() => onComplete(win), 900);
      } else {
        schedule(() => resolveExtraTime(finalA, finalB), 900);
      }
    }, elapsed + 500);
  };

  const rolling = phase === "rolling";
  const inExtraTime = phase === "extra";
  const decidingPens = phase === "penalties";
  const done = phase === "done";
  const isLive = rolling || inExtraTime || decidingPens;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-950/80 to-emerald-900/40 p-6 shadow-2xl backdrop-blur-sm transition-shadow duration-500 sm:p-8 ${
        done ? "shadow-[0_0_35px_-5px_rgba(255,209,102,0.5)]" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-beam-sweep" />

      <Confetti active={done} />

      <p className="font-heading mb-6 text-center text-base uppercase tracking-[0.25em] text-amber-300/80">
        {label}
      </p>

      <div className="relative flex items-center justify-between gap-3">
        <TeamSide code={teamA} align="left" isWinner={winner === teamA} faded={done && winner !== teamA} />

        <div className="flex flex-col items-center px-1">
          <div
            className={`flex items-center gap-3 rounded-xl bg-black/30 px-4 py-3 font-score text-5xl font-black tabular-nums text-white sm:text-6xl ${
              isLive ? "ring-2 ring-amber-400/50" : ""
            } ${done ? "animate-score-impact" : ""}`}
          >
            <span className={rolling ? "animate-score-flicker" : ""}>{scoreA ?? "-"}</span>
            <span className="text-white/40">:</span>
            <span className={rolling ? "animate-score-flicker" : ""}>{scoreB ?? "-"}</span>
          </div>

          {(wentToExtra || decidingPens || (done && penA !== null)) && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-300/90">
              {decidingPens && penA === null
                ? "Penalties…"
                : penA !== null
                  ? `Pens ${penA}-${penB}`
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

          {isLive && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/60 animate-pulse">
              {inExtraTime ? "Extra time…" : decidingPens ? "Shootout…" : "Playing…"}
            </p>
          )}

          {done && winner && (
            <p className="font-heading mt-4 animate-pop-in text-base uppercase tracking-wide text-amber-300">
              {TEAMS[winner].name} win
            </p>
          )}
        </div>

        <TeamSide code={teamB} align="right" isWinner={winner === teamB} faded={done && winner !== teamB} />
      </div>
    </div>
  );
}

function TeamSide({
  code,
  align,
  isWinner,
  faded,
}: {
  code: TeamCode;
  align: "left" | "right";
  isWinner: boolean;
  faded: boolean;
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
            <span className="absolute rounded-full border border-amber-300 animate-ring-burst h-20 w-20" />
            <span className="absolute rounded-full border border-amber-300 animate-ring-burst h-20 w-20 [animation-delay:0.4s]" />
          </>
        )}
        <TeamLogo code={code} size={80} className={isWinner ? "animate-trophy-bounce" : "animate-crest-entrance"} />
      </div>
      <span className="font-heading text-lg tracking-wide text-white/90 sm:text-2xl">{team.name}</span>
    </div>
  );
}
