import Image from "next/image";
import { TEAMS, type TeamCode } from "@/app/data/teams";

interface TeamLogoProps {
  code: TeamCode;
  size?: number;
  className?: string;
}

export default function TeamLogo({ code, size = 72, className = "" }: TeamLogoProps) {
  const team = TEAMS[code];
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={team.logo}
        alt={`${team.name} crest`}
        fill
        sizes={`${size}px`}
        className="object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)]"
        priority
      />
    </div>
  );
}
