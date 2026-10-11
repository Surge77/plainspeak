// One drawn icon family: 20px box, 1.75 stroke, round caps, currentColor.

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function SunIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" {...STROKE}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" {...STROKE}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function PencilIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" {...STROKE}>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" {...STROKE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

// The favicon's drawing: a name-tag sticker, red band over a white label.
export function LogoMark() {
  return (
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#d7263d" />
      <rect x="4" y="13" width="24" height="14" rx="3" fill="#fbfcfd" />
    </svg>
  );
}
