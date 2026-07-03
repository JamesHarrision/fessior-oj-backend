export function AppLogo(props: { variant?: 'full' | 'mark' }) {
  const variant = props.variant ?? 'full';
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-400 shadow-[0_8px_32px_rgba(16,185,129,0.35)]">
        <div className="h-3.5 w-3.5 rounded-[5px] bg-navy-900/80 ring-1 ring-white/20" />
      </div>
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <div className="text-[16px] font-bold tracking-tight text-slate-50" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            QUEU
          </div>
          <div className="text-[11px] font-medium tracking-[0.2em] text-emerald-400/80 uppercase">
            ARENA
          </div>
        </div>
      )}
    </div>
  );
}
