"use client";

import { useState } from "react";
import { TEAMS, type TeamCode } from "@/app/data/teams";
import MatchCard from "@/app/components/MatchCard";
import TeamLogo from "@/app/components/TeamLogo";
import Confetti from "@/app/components/Confetti";

export default function Home() {
  const [resetKey, setResetKey] = useState(0);
  const [semiWinner1, setSemiWinner1] = useState<TeamCode | null>(null);
  const [semiWinner2, setSemiWinner2] = useState<TeamCode | null>(null);
  const [champion, setChampion] = useState<TeamCode | null>(null);

  const reset = () => {
    setSemiWinner1(null);
    setSemiWinner2(null);
    setChampion(null);
    setResetKey((k) => k + 1);
  };

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
            <MatchCard label="Semi-final 1" teamA="FRA" teamB="ESP" onComplete={setSemiWinner1} />
          </div>
          <div className="animate-pop-in" style={{ animationDelay: "0.1s" }}>
            <MatchCard label="Semi-final 2" teamA="ENG" teamB="ARG" onComplete={setSemiWinner2} />
          </div>
        </div>

        {semiWinner1 && semiWinner2 && (
          <div className="w-full max-w-2xl animate-pop-in">
            <MatchCard
              key={`${semiWinner1}-${semiWinner2}`}
              label="Final"
              teamA={semiWinner1}
              teamB={semiWinner2}
              onComplete={setChampion}
            />
          </div>
        )}

        {!semiWinner1 || !semiWinner2 ? (
          <p className="text-xs uppercase tracking-widest text-white/30">
            Complete both semi-finals to unlock the final
          </p>
        ) : null}

        <button
          onClick={reset}
          className="font-heading mt-2 rounded-full border border-white/20 px-5 py-2 text-xs tracking-widest text-white/70 transition hover:border-amber-300/60 hover:text-amber-300"
        >
          New tournament
        </button>
      </div>

      {champion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative flex flex-col items-center gap-4 rounded-3xl border border-amber-300/40 bg-gradient-to-b from-emerald-950 to-emerald-900/90 px-10 py-12 text-center shadow-[0_0_80px_-10px_rgba(255,209,102,0.6)] animate-champion-pop sm:px-20 sm:py-16">
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white animate-flash-burst" />
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300 animate-ring-burst" />
            <span className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300 animate-ring-burst [animation-delay:0.5s]" />

            <Confetti active pieceCount={110} />

            <p className="relative text-sm font-bold uppercase tracking-[0.4em] text-amber-300/80">
              World Champions
            </p>
            <span className="relative text-8xl animate-trophy-bounce">🏆</span>
            <TeamLogo code={champion} size={160} className="relative" />
            <p className="shimmer-title font-heading relative text-4xl tracking-wide sm:text-6xl">
              {TEAMS[champion].name}!
            </p>

            <button
              onClick={reset}
              className="font-heading relative mt-4 rounded-full bg-amber-400 px-8 py-3 text-base tracking-wide text-emerald-950 shadow-lg transition hover:bg-amber-300 active:scale-95"
            >
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
