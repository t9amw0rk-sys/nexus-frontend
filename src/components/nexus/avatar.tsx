export function Avatar({ initials, color, size = 32, src }: { initials: string; color: string; size?: number; src?: string | null }) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${color}, ${color}cc)`, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
