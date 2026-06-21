// Kleurrijke 3D-stijl illustraties voor de dashboard-tegels.
// Elke SVG gebruikt eigen gradient-id's zodat ze elkaar niet beïnvloeden.

type Props = { className?: string };

export function CameraIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="cam-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#f43f6e" />
        </linearGradient>
        <radialGradient id="cam-lens" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#0e7490" />
        </radialGradient>
      </defs>
      <rect x="20" y="12" width="18" height="9" rx="3" fill="#f9a8d4" />
      <rect x="5" y="18" width="54" height="36" rx="11" fill="url(#cam-body)" />
      <circle cx="32" cy="37" r="13" fill="#ffffff" opacity="0.95" />
      <circle cx="32" cy="37" r="10" fill="url(#cam-lens)" />
      <circle cx="32" cy="37" r="4.5" fill="#0c4a6e" />
      <circle cx="28.5" cy="33.5" r="2.2" fill="#ffffff" opacity="0.85" />
      <circle cx="49" cy="26" r="2.6" fill="#fde68a" />
    </svg>
  );
}

export function GalleryIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="gal-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="gal-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="7" y="11" width="50" height="42" rx="9" fill="#ffffff" />
      <clipPath id="gal-clip">
        <rect x="12" y="16" width="40" height="32" rx="5" />
      </clipPath>
      <g clipPath="url(#gal-clip)">
        <rect x="12" y="16" width="40" height="32" fill="url(#gal-sky)" />
        <circle cx="23" cy="27" r="6" fill="#fbbf24" />
        <path d="M12 48 L26 33 L36 44 L44 36 L52 48 Z" fill="url(#gal-hill)" />
      </g>
    </svg>
  );
}

export function StarIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="star-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M32 6 L40 24 L59 26 L45 39 L49 58 L32 48 L15 58 L19 39 L5 26 L24 24 Z"
        fill="url(#star-fill)"
        stroke="#fbbf24"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M32 13 L37 24 L32 27 Z" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}

export function HomeIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="home-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#f43f6e" />
        </linearGradient>
      </defs>
      <path d="M32 8 L57 30 H7 Z" fill="url(#home-roof)" />
      <rect x="14" y="29" width="36" height="27" rx="3" fill="#fff3e0" />
      <rect x="28" y="40" width="9" height="16" rx="1.5" fill="#14b8a6" />
      <circle cx="42" cy="40" r="3" fill="#38bdf8" />
    </svg>
  );
}

export function CogIllustration({ className }: Props) {
  const teeth = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return { x: 32 + Math.cos(r) * 17 - 3, y: 32 + Math.sin(r) * 17 - 3 };
  });
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="cog-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      {teeth.map((t, i) => (
        <rect key={i} x={t.x} y={t.y} width="6" height="6" rx="1.5" fill="url(#cog-grad)" />
      ))}
      <circle cx="32" cy="32" r="16" fill="url(#cog-grad)" />
      <circle cx="32" cy="32" r="6.5" fill="#fff3e0" />
    </svg>
  );
}

export function TrophyIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="trophy-cup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d="M14 10 H50 V22 a18 18 0 0 1 -36 0 Z" fill="url(#trophy-cup)" />
      <path d="M14 12 H8 v4 a8 8 0 0 0 8 8" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
      <path d="M50 12 H56 v4 a8 8 0 0 1 -8 8" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
      <rect x="29" y="38" width="6" height="9" fill="#f59e0b" />
      <path d="M20 54 q12 -7 24 0 Z" fill="#fcd34d" />
      <rect x="18" y="52" width="28" height="5" rx="2.5" fill="#eab308" />
      <ellipse cx="26" cy="20" rx="2.5" ry="5" fill="#ffffff" opacity="0.45" />
    </svg>
  );
}
