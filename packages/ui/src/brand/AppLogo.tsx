export function AppLogo(props: { variant?: 'full' | 'mark' }) {
  const variant = props.variant ?? 'full';
  return (
    <div className="inline-flex items-center gap-2 select-none">
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500/95 via-violet-500/90 to-cyan-400/80 shadow-[0_10px_30px_rgba(139,92,246,0.35)]">
        <div className="h-3 w-3 rounded-[6px] bg-slate-950/70 ring-1 ring-white/15" />
      </div>
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <div className="text-[13px] font-semibold tracking-tight text-slate-50">QUEU</div>
          <div className="text-[11px] tracking-wide text-slate-400">ARENA</div>
        </div>
      )}
    </div>
  );
}

