export function ConfidenceRing({ value, size = 64 }: { value: number; size?: number }) {
  const pct = Math.round(value * 100);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color =
    pct >= 90 ? "var(--color-success)" : pct >= 75 ? "var(--color-primary)" : pct >= 60 ? "var(--color-warning)" : "var(--color-destructive)";
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-muted)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-sm font-semibold tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}
