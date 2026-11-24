import { Chip } from "@heroui/react";
import { labelize } from "@/format";

const tones = {
  active: "bg-emerald-100/70 text-emerald-950 border-emerald-300/60",
  complete: "bg-stone-200/70 text-stone-800 border-stone-300/60",
  planning: "bg-sky-100/70 text-sky-950 border-sky-300/60",
  "on-hold": "bg-amber-100/70 text-amber-950 border-amber-300/60",
  "on-site": "bg-emerald-100/70 text-emerald-950 border-emerald-300/60",
  off: "bg-stone-200/70 text-stone-700 border-stone-300/60",
  leave: "bg-violet-100/70 text-violet-950 border-violet-300/60",
  "in-use": "bg-emerald-100/70 text-emerald-950 border-emerald-300/60",
  available: "bg-sky-100/70 text-sky-950 border-sky-300/60",
  maintenance: "bg-rose-100/70 text-rose-950 border-rose-300/60",
  paid: "bg-emerald-100/70 text-emerald-950 border-emerald-300/60",
  sent: "bg-sky-100/70 text-sky-950 border-sky-300/60",
  draft: "bg-stone-200/70 text-stone-700 border-stone-300/60",
  overdue: "bg-rose-100/70 text-rose-950 border-rose-300/60",
};

export function StatusChip({ value }) {
  return (
    <Chip size="sm" className={`capitalize glass-pill border backdrop-blur-md px-2.5 py-0.5 text-xs font-medium shadow-xs ${tones[value] ?? "bg-white/60 text-ink border-white/70"}`}>
      {labelize(value)}
    </Chip>
  );
}

export function Meter({ value, warnAt = 100 }) {
  const width = Math.max(0, Math.min(100, value));
  const hot = value >= warnAt;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full glass-panel border border-white/60">
      <div className={`h-full rounded-full transition-all duration-300 ${hot ? "bg-rose-600 shadow-xs shadow-rose-600/30" : "bg-amber-600 shadow-xs shadow-amber-600/30"}`} style={{ width: `${width}%` }} />
    </div>
  );
}
