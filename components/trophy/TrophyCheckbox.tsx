"use client";

export function TrophyCheckbox({
  checked,
  onToggle,
  label,
  small = false,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  small?: boolean;
}) {
  const box = small ? 22 : 28;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `Mark ${label} not earned` : `Mark ${label} earned`}
      onClick={onToggle}
      className="trophy-checkbox"
      // 44px minimum hit target regardless of visual size — couch rule.
      style={{ minWidth: 44, minHeight: 44 }}
    >
      <span
        className={`trophy-checkbox-box${checked ? " is-checked" : ""}`}
        style={{ width: box, height: box }}
      >
        <svg
          viewBox="0 0 24 24"
          width={box - 8}
          height={box - 8}
          fill="none"
          className="trophy-checkbox-mark"
          aria-hidden="true"
        >
          <path
            d="M5 12.5 10 17.5 19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
