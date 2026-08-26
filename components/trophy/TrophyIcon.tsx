import type { TrophyType } from "@/lib/types";

const COLORS: Record<TrophyType, string> = {
  bronze: "var(--trophy-bronze)",
  silver: "var(--trophy-silver)",
  gold: "var(--trophy-gold)",
  platinum: "var(--trophy-platinum)",
};

export function TrophyIcon({
  type,
  size = 20,
  dim = false,
}: {
  type: TrophyType;
  size?: number;
  dim?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={`${type} trophy`}
      role="img"
      style={{ color: COLORS[type], opacity: dim ? 0.35 : 1, flexShrink: 0 }}
    >
      <path
        d="M7 4h10v2h3v3c0 2.4-1.9 4.3-4.2 4.5A5 5 0 0 1 13 16.9V19h3v2H8v-2h3v-2.1a5 5 0 0 1-2.8-3.4C5.9 13.3 4 11.4 4 9V6h3V4Zm-1 4v1c0 1.2.8 2.3 2 2.7V8H6Zm12 0h-2v3.7c1.2-.4 2-1.5 2-2.7V8Z"
        fill="currentColor"
      />
    </svg>
  );
}
