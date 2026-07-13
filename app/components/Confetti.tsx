"use client";

import { useMemo } from "react";

interface ConfettiProps {
  active: boolean;
  pieceCount?: number;
}

const COLORS = ["#FFD166", "#EF4135", "#0055A4", "#6CACE4", "#F1BF00", "#FFFFFF"];

export default function Confetti({ active, pieceCount = 36 }: ConfettiProps) {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.4 + Math.random() * 1.2,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
      size: 5 + Math.random() * 5,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-sm animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
