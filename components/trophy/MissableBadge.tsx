export function MissableBadge() {
  return (
    <span className="missable-badge" role="note" aria-label="Missable trophy">
      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" aria-hidden="true">
        <path
          d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3v.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Missable
    </span>
  );
}
