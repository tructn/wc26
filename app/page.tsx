"use client";

import { useState } from "react";
import { TEAMS, type TeamCode } from "@/app/data/teams";
import type { MatchResult } from "@/app/data/match";
import MatchCard from "@/app/components/MatchCard";
import TeamLogo from "@/app/components/TeamLogo";
import Confetti from "@/app/components/Confetti";

export default function Home() {
  const [resetKey, setResetKey] = useState(0);
  const [semiResult1, setSemiResult1] = useState<MatchResult | null>(null);
  const [semiResult2, setSemiResult2] = useState<MatchResult | null>(null);
  const [finalResult, setFinalResult] = useState<MatchResult | null>(null);
  const [championModalOpen, setChampionModalOpen] = useState(false);

  const champion = finalResult?.winner ?? null;

  const reset = () => {
    setSemiResult1(null);
    setSemiResult2(null);
    setFinalResult(null);
    setChampionModalOpen(false);
    setResetKey((k) => k + 1);
  };

  const handleFinalComplete = (result: MatchResult) => {
    setFinalResult(result);
    setChampionModalOpen(true);
  };

  const allResults = [
    { label: "Semi-final 1", result: semiResult1 },
    { label: "Semi-final 2", result: semiResult2 },
    { label: "Final", result: finalResult },
  ].filter((r): r is { label: string; result: MatchResult } => r.result !== null);

  return (
    <div className="pitch-bg relative flex flex-1 flex-col items-center overflow-hidden px-4 py-10 sm:py-16">
      <div className="floodlight pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/10 to-transparent" />

      <header className="relative z-10 mb-10 flex flex-col items-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-300/80">
          FIFA World Cup 2026
        </p>
        <h1 className="shimmer-title font-heading mt-2 text-4xl tracking-wide sm:text-6xl">
          Knockout Predictor
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/60">
          Simulate the semi-finals, then the final, and crown your 2026 champion.
        </p>
      </header>

      <div key={resetKey} className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-10">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <div className="animate-pop-in">
            <MatchCard label="Semi-final 1" teamA="FRA" teamB="ESP" onComplete={setSemiResult1} />
          </div>
          <div className="animate-pop-in" style={{ animationDelay: "0.1s" }}>
            <MatchCard label="Semi-final 2" teamA="ENG" teamB="ARG" onComplete={setSemiResult2} />
          </div>
        </div>

        {semiResult1 && semiResult2 && (
          <div className="w-full max-w-2xl animate-pop-in">
            <MatchCard
              key={`${semiResult1.winner}-${semiResult2.winner}`}
              label="Final"
              teamA={semiResult1.winner}
              teamB={semiResult2.winner}
              onComplete={handleFinalComplete}
            />
          </div>
        )}

        {!semiResult1 || !semiResult2 ? (
          <p className="text-xs uppercase tracking-widest text-white/30">
            Complete both semi-finals to unlock the final
          </p>
        ) : null}

        {allResults.length > 0 && (
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="font-heading mb-3 text-center text-sm uppercase tracking-[0.2em] text-white/60">
              Match summary
            </p>
            <div className="flex flex-col gap-3">
              {allResults.map(({ label, result }) => (
                <MatchSummaryRow key={label} label={label} result={result} />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {champion && !championModalOpen && (
            <button
              onClick={() => setChampionModalOpen(true)}
              className="font-heading rounded-full border border-amber-300/50 bg-amber-400/10 px-5 py-2 text-xs tracking-widest text-amber-300 transition hover:bg-amber-400/20"
            >
              🏆 View champion
            </button>
          )}
          <button
            onClick={reset}
            className="font-heading rounded-full border border-white/20 px-5 py-2 text-xs tracking-widest text-white/70 transition hover:border-amber-300/60 hover:text-amber-300"
          >
            New tournament
          </button>
        </div>
      </div>

      {champion && championModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setChampionModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative overflow-hidden flex flex-col items-center gap-4 rounded-3xl border border-amber-300/40 bg-gradient-to-b from-emerald-950 to-emerald-900/90 px-10 py-12 text-center shadow-[0_0_80px_-10px_rgba(255,209,102,0.6)] animate-champion-pop sm:px-20 sm:py-16"
          >
            <button
              onClick={() => setChampionModalOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-amber-300/60 hover:text-amber-300"
            >
              ✕
            </button>

            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-beam-sweep [animation-duration:3s]" />
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent animate-beam-sweep [animation-duration:3.6s] [animation-delay:1s]" />
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white animate-flash-burst" />
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300 animate-ring-burst" />
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300 animate-ring-burst [animation-delay:0.5s]" />
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300 animate-ring-burst [animation-delay:1s]" />

            <Confetti active pieceCount={110} />

            <p className="relative text-sm font-bold uppercase tracking-[0.4em] text-amber-300/80">
              World Champions
            </p>
            <span className="relative text-8xl animate-trophy-bounce">🏆</span>
            <TeamLogo code={champion} size={160} className="relative" />
            <p className="shimmer-title font-heading relative text-4xl tracking-wide sm:text-6xl">
              {TEAMS[champion].name}!
            </p>

            <div className="relative flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setChampionModalOpen(false)}
                className="font-heading rounded-full border border-white/20 px-6 py-3 text-sm tracking-wide text-white/70 transition hover:border-amber-300/60 hover:text-amber-300"
              >
                View match details
              </button>
              <button
                onClick={reset}
                className="font-heading rounded-full bg-amber-400 px-8 py-3 text-base tracking-wide text-emerald-950 shadow-lg transition hover:bg-amber-300 active:scale-95"
              >
                Play again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchSummaryRow({ label, result }: { label: string; result: MatchResult }) {
  const teamAName = TEAMS[result.teamA].name;
  const teamBName = TEAMS[result.teamB].name;
  const note =
    result.decidedBy === "penalties"
      ? `pens ${result.penA}-${result.penB}`
      : result.decidedBy === "extra-time"
        ? "AET"
        : null;

  return (
    <div className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-heading text-[11px] uppercase tracking-widest text-amber-300/70">{label}</span>
        <span className="text-white/90">
          <span className={result.winner === result.teamA ? "font-bold text-amber-300" : ""}>{teamAName}</span>
          {" "}
          <span className="font-score font-bold">{result.scoreA} - {result.scoreB}</span>
          {" "}
          <span className={result.winner === result.teamB ? "font-bold text-amber-300" : ""}>{teamBName}</span>
          {note && <span className="ml-2 text-xs text-white/40">({note})</span>}
        </span>
      </div>
      {(result.scorersA.length > 0 || result.scorersB.length > 0) && (
        <div className="flex justify-between text-[11px] text-white/45 italic">
          <span>{result.scorersA.join(" · ")}</span>
          <span>{result.scorersB.join(" · ")}</span>
        </div>
      )}
    </div>
  );
}
