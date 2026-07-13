import type { TeamCode } from "@/app/data/teams";

interface FlagIconProps {
  code: TeamCode;
  className?: string;
}

// Hand-drawn SVG flags (no external assets) so the page stays fully self-contained.
export default function FlagIcon({ code, className = "" }: FlagIconProps) {
  const common = "h-full w-full rounded-[4px] shadow-inner";

  switch (code) {
    case "FRA":
      return (
        <svg viewBox="0 0 60 40" className={`${common} ${className}`}>
          <rect width="60" height="40" fill="#EF4135" />
          <rect width="40" height="40" fill="#FFFFFF" />
          <rect width="20" height="40" fill="#0055A4" />
        </svg>
      );
    case "ESP":
      return (
        <svg viewBox="0 0 60 40" className={`${common} ${className}`}>
          <rect width="60" height="40" fill="#AA151B" />
          <rect y="10" width="60" height="20" fill="#F1BF00" />
          <g transform="translate(16,14)">
            <rect width="10" height="12" rx="1.5" fill="#AA151B" />
            <rect x="1.5" y="2" width="7" height="3" fill="#F1BF00" />
            <rect x="1.5" y="6.5" width="7" height="3" fill="#F1BF00" />
          </g>
        </svg>
      );
    case "ENG":
      return (
        <svg viewBox="0 0 60 40" className={`${common} ${className}`}>
          <rect width="60" height="40" fill="#FFFFFF" />
          <rect x="24" width="12" height="40" fill="#CE1124" />
          <rect y="14" width="60" height="12" fill="#CE1124" />
        </svg>
      );
    case "ARG":
      return (
        <svg viewBox="0 0 60 40" className={`${common} ${className}`}>
          <rect width="60" height="40" fill="#FFFFFF" />
          <rect width="60" height="13.3" fill="#6CACE4" />
          <rect y="26.7" width="60" height="13.3" fill="#6CACE4" />
          <circle cx="30" cy="20" r="5" fill="#F6B40E" stroke="#8A5A19" strokeWidth="0.5" />
        </svg>
      );
    default:
      return null;
  }
}
