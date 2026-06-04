export function NexusLogo({ size = 28, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="nx-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00BCD4" />
          </linearGradient>
        </defs>
        {/* Sharp filled hexagon (6 equal sides, flat-top) */}
        <polygon points="16,1 29,8.5 29,23.5 16,31 3,23.5 3,8.5" fill="url(#nx-grad)" />
        {/* White connection icon: two nodes joined by a line */}
        <line x1="10.5" y1="16" x2="21.5" y2="16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10.5" cy="16" r="3" fill="#FFFFFF" />
        <circle cx="21.5" cy="16" r="3" fill="#FFFFFF" />
      </svg>
      {showText && (
        <span
          className="font-display font-bold text-lg tracking-tight text-foreground"
          style={{ fontFamily: "Syne, ui-sans-serif" }}
        >
          Nexus
        </span>
      )}
    </div>
  );
}
