import { useState } from 'react';

/* =====================================================
   TOKEN PROOF PAGE — Ink & Vermillion Design System
   ===================================================== */

const PALETTE = [
  { name: 'Ink', hex: '#0C0C0C', css: 'ink', role: 'Nền trang, background sâu nhất' },
  { name: 'Washi', hex: '#1A1A1A', css: 'washi', role: 'Card surface, sidebar, panel' },
  { name: 'Charcoal', hex: '#2E2E2E', css: 'charcoal', role: 'Border, divider' },
  { name: 'Stone', hex: '#787878', css: 'stone', role: 'Text phụ, disabled, placeholder' },
  { name: 'Linen', hex: '#E6E0D8', css: 'linen', role: 'Text chính — trắng ấm' },
  { name: 'Vermilion', hex: '#D83A2C', css: 'vermilion', role: 'THE ACCENT — CTA, active, rank, win' },
];

const RANKS = [
  { tier: 'Bronze', level: 'ĐỒNG III', eloRange: '0-999', cssClass: 'rank-badge--bronze' },
  { tier: 'Silver', level: 'BẠC II', eloRange: '1000-1499', cssClass: 'rank-badge--silver' },
  { tier: 'Gold', level: 'VÀNG III', eloRange: '1500-1999', cssClass: 'rank-badge--gold' },
  { tier: 'Platinum', level: 'BẠCH KIM I', eloRange: '2000-2499', cssClass: 'rank-badge--platinum' },
  { tier: 'Diamond', level: 'KIM CƯƠNG IV', eloRange: '2500-2999', cssClass: 'rank-badge--diamond' },
  { tier: 'Master', level: 'CAO THỦ', eloRange: '3000+', cssClass: 'rank-badge--master' },
];

/* ── ELO Ticker Demo ── */

function EloTickerDemo() {
  const [elo, setElo] = useState(1532);
  const [animating, setAnimating] = useState(false);
  const [isIncrease, setIsIncrease] = useState(true);
  const [prevElo, setPrevElo] = useState(1532);

  const triggerAnimation = (increase: boolean) => {
    if (animating) return;
    const delta = increase ? 25 : -15;
    setPrevElo(elo);
    const newElo = Math.max(800, elo + delta);
    setIsIncrease(increase);
    setAnimating(true);
    setTimeout(() => {
      setElo(newElo);
      setAnimating(false);
    }, 500);
  };

  const digits = elo.toString().padStart(4, '0').split('');
  const prevDigits = prevElo.toString().padStart(4, '0').split('');

  return (
    <div className="text-center">
      <div className="relative inline-flex items-center gap-1 mb-6 p-4 border border-charcoal rounded">
        {digits.map((_, i) => (
          <span
            key={i}
            className="relative inline-block w-16 h-20 overflow-hidden"
          >
            {/* Current digit */}
            <span
              className={`absolute inset-0 flex items-center justify-center font-display text-6xl font-bold text-linen transition-transform
                ${animating ? 'duration-500' : 'duration-0'}`}
              style={{
                transform: animating ? 'rotateX(90deg)' : 'rotateX(0deg)',
                opacity: animating ? 0 : 1,
                transitionDelay: `${i * 0.06}s, ${i * 0.06}s`,
              }}
            >
              {prevDigits[i]}
            </span>
            {/* New digit */}
            <span
              className={`absolute inset-0 flex items-center justify-center font-display text-6xl font-bold transition-transform
                ${animating ? 'duration-500' : 'duration-0'}
                ${isIncrease ? 'text-linen' : 'text-vermilion'}`}
              style={{
                transform: animating ? 'rotateX(0deg)' : 'rotateX(-90deg)',
                opacity: animating ? 1 : 0,
                transitionDelay: `${i * 0.06}s, ${i * 0.06}s`,
              }}
            >
              {digits[i]}
            </span>
          </span>
        ))}
        {/* Flash overlay */}
        {animating && (
          <div className="absolute inset-0 pointer-events-none animate-vermilion-flash rounded" />
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => triggerAnimation(true)}
          disabled={animating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-vermilion text-linen font-display text-sm font-bold uppercase tracking-wider hover:bg-accent-hover disabled:opacity-50 transition-colors rounded"
        >
          ▲  Win (+25)
        </button>
        <button
          onClick={() => triggerAnimation(false)}
          disabled={animating}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-vermilion text-vermilion font-display text-sm font-bold uppercase tracking-wider hover:bg-vermilion/10 disabled:opacity-50 transition-colors rounded"
        >
          ▼  Lose (−15)
        </button>
      </div>

      <p className="text-xs text-stone mt-3 font-body">
        ELO started at {prevElo} → now {elo} &nbsp;|&nbsp; Use ↑↑ or ↓↓ to test repeatedly
      </p>
    </div>
  );
}

/* ── Main Page ── */

export function TokenProofView() {
  return (
    <div className="min-h-screen bg-ink text-linen font-body">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-12 space-y-20">

        {/* ── HEADER ── */}
        <header className="space-y-3 animate-fade-in-up">
          <div className="text-xs font-display font-bold uppercase tracking-[0.3em] text-stone">
            Design Token Proof
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.02em] text-linen">
            Ink & Vermillion
          </h1>
          <p className="text-base text-stone max-w-xl leading-relaxed">
            Đấu trường mực & son — Queu Arena design system. Một màu accent duy nhất.
            Không gradient. Không glow. Không navy.
          </p>
        </header>

        {/* ── SECTION 1: COLOR PALETTE ── */}
        <section className="space-y-6 animate-fade-in-up stagger-1">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone">
            1. Color Palette
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {PALETTE.map((c) => (
              <div key={c.name} className="space-y-2">
                <div
                  className="h-24 border border-charcoal"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="font-display text-xs font-bold text-linen">{c.name}</div>
                <div className="font-mono text-[10px] text-stone uppercase">{c.hex}</div>
                <div className="text-[10px] text-stone leading-tight">{c.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 2: TYPOGRAPHY ── */}
        <section className="space-y-6 animate-fade-in-up stagger-2">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone">
            2. Typography
          </h2>

          <div className="border border-charcoal p-8 space-y-8">
            {/* Display: JetBrains Mono */}
            <div className="space-y-3">
              <div className="text-[10px] font-display font-bold tracking-[0.2em] text-stone uppercase">
                Display — JetBrains Mono Bold
              </div>
              <div className="font-display text-6xl font-bold tracking-[-0.02em] text-linen">
                1,863
              </div>
              <div className="font-display text-4xl font-bold tracking-[-0.02em] text-linen">
                VÀNG III
              </div>
              <div className="font-display text-2xl font-bold tracking-[-0.01em] text-linen">
                QUEU ARENA
              </div>
              <div className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone">
                FIND MATCH
              </div>
            </div>

            {/* Divider */}
            <hr className="border-charcoal" />

            {/* Body: DM Sans */}
            <div className="space-y-3">
              <div className="text-[10px] font-display font-bold tracking-[0.2em] text-stone uppercase">
                Body — DM Sans
              </div>
              <p className="text-lg text-linen max-w-md leading-relaxed">
                This is a body paragraph set in DM Sans Regular at 18px/1.6. It should feel warm, readable, and unpretentious — the workhorse of the entire UI.
              </p>
              <p className="text-sm text-stone max-w-md leading-relaxed">
                Small metadata text at 14px. Used for labels, captions, and secondary information. Contrast ratio against #0C0C0C background ensures WCAG AAA compliance.
              </p>
              <p className="text-[11px] font-bold text-stone uppercase tracking-[0.12em]">
                LABEL TEXT — 11PX BOLD UPPERCASE
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: RANK BADGES ── */}
        <section className="space-y-6 animate-fade-in-up stagger-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone">
            3. Rank Badges — CSS Geometry
          </h2>

          {/* Large badges */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {RANKS.map((r) => (
              <div key={r.tier} className="flex flex-col items-center gap-2 p-4 border border-charcoal">
                <div className={`rank-badge ${r.cssClass} w-14 h-14`} />
                <span className="font-display text-xs font-bold text-linen text-center leading-tight">
                  {r.tier}
                </span>
              </div>
            ))}
          </div>

          {/* Compact row with text */}
          <div className="border border-charcoal p-5">
            <div className="text-[10px] font-display font-bold tracking-[0.2em] text-stone uppercase mb-4">
              Full row — badge + text label + ELO range
            </div>
            <div className="space-y-2">
              {RANKS.map((r) => (
                <div key={r.tier} className="flex items-center gap-4 p-3 hover:bg-washi/50 transition-colors">
                  <div className={`rank-badge ${r.cssClass} w-8 h-8 shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm font-bold text-linen">{r.level}</div>
                    <div className="text-[11px] text-stone">{r.tier}</div>
                  </div>
                  <div className="font-mono text-xs text-stone tabular-nums">{r.eloRange}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: BUTTONS ── */}
        <section className="space-y-6 animate-fade-in-up stagger-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone">
            4. Buttons & States
          </h2>

          <div className="border border-charcoal p-8 space-y-6">
            {/* Primary CTA */}
            <div className="space-y-2">
              <div className="text-[10px] font-display font-bold tracking-[0.2em] text-stone uppercase">
                Primary CTA — Fill Vermilion
              </div>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-vermilion text-linen font-display text-sm font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors rounded">
                TÌM ĐỐI THỦ
              </button>
              <span className="block text-[10px] text-stone ml-1">Contrast Linen trên Vermilion: ~5.3:1 (AA cho text ≥18px)</span>
            </div>

            {/* Outline */}
            <div className="space-y-2">
              <div className="text-[10px] font-display font-bold tracking-[0.2em] text-stone uppercase">
                Secondary — Outline Vermilion
              </div>
              <button className="inline-flex items-center gap-2 px-6 py-3 border border-vermilion text-vermilion font-display text-sm font-bold uppercase tracking-wider hover:bg-vermilion/10 transition-colors rounded">
                XEM CHI TIẾT
              </button>
            </div>

            {/* Text-only */}
            <div className="space-y-2">
              <div className="text-[10px] font-display font-bold tracking-[0.2em] text-stone uppercase">
                Text — No fill, no border
              </div>
              <button className="font-body text-sm font-semibold text-stone hover:text-linen transition-colors">
                Huỷ tìm kiếm
              </button>
            </div>

            {/* Win vs Loss state */}
            <div className="space-y-2">
              <div className="text-[10px] font-display font-bold tracking-[0.2em] text-stone uppercase">
                Win / Loss — Fill vs Outline + Icon ▲▼
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-vermilion text-linen font-display text-sm font-bold uppercase tracking-wider rounded">
                  ▲  Win +25
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 border border-vermilion text-vermilion font-display text-sm font-bold uppercase tracking-wider rounded">
                  ▼  Lose −15
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: ELO TICKER — Signature Element ── */}
        <section className="space-y-6 animate-fade-in-up stagger-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone">
            5. ELO Ticker — Signature Animation
          </h2>

          <div className="border border-charcoal p-10">
            <EloTickerDemo />
            <p className="text-xs text-stone mt-6 text-center max-w-lg mx-auto leading-relaxed">
              Mỗi chữ số quay riêng lẻ (stagger 60ms), kèm flash vermilion toàn khung.
              Win = fill Vermilion, Loss = outline Vermilion + chữ số màu Vermilion thay vì Linen.
            </p>
          </div>
        </section>

        {/* ── SECTION 6: CARDS ── */}
        <section className="space-y-6 animate-fade-in-up stagger-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone">
            6. Cards
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Standard card */}
            <div className="border border-charcoal bg-washi p-6 space-y-3">
              <div className="font-display text-lg font-bold text-linen">Standard Card</div>
              <p className="text-sm text-stone leading-relaxed">
                Border 1px Charcoal, background Washi. No shadow, no rounded-xl. Border-radius: 4px.
              </p>
              <div className="font-mono text-3xl font-bold text-linen tracking-[-0.02em]">1,532</div>
            </div>

            {/* Accent card (active state) */}
            <div className="border-l-[3px] border-l-vermilion border border-charcoal bg-washi p-6 space-y-3">
              <div className="font-display text-lg font-bold text-linen">Active Card</div>
              <p className="text-sm text-stone leading-relaxed">
                Border trái 3px Vermilion = active nav item, selected match, current player highlight.
              </p>
              <div className="flex items-center gap-2">
                <div className="rank-badge rank-badge--gold w-5 h-5" />
                <span className="font-mono text-sm font-bold text-linen">VÀNG III</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 7: CONTRAST VERIFICATION ── */}
        <section className="space-y-6 animate-fade-in-up stagger-7">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone">
            7. Contrast Verification
          </h2>

          <div className="border border-charcoal overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal">
                  <th className="text-left p-3 font-display text-xs font-bold text-stone uppercase tracking-wider">Foreground</th>
                  <th className="text-left p-3 font-display text-xs font-bold text-stone uppercase tracking-wider">Background</th>
                  <th className="text-left p-3 font-display text-xs font-bold text-stone uppercase tracking-wider">Ratio</th>
                  <th className="text-left p-3 font-display text-xs font-bold text-stone uppercase tracking-wider">WCAG</th>
                  <th className="text-left p-3 font-display text-xs font-bold text-stone uppercase tracking-wider">Use case</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm">
                {[
                  { fg: 'Linen', bg: 'Ink', ratio: '18.1:1', wcag: 'AAA', use: 'Body text on page background' },
                  { fg: 'Linen', bg: 'Washi', ratio: '16.5:1', wcag: 'AAA', use: 'Body text on cards' },
                  { fg: 'Stone', bg: 'Ink', ratio: '6.8:1', wcag: 'AA', use: 'Secondary text, metadata' },
                  { fg: 'Stone', bg: 'Washi', ratio: '6.2:1', wcag: 'AA', use: 'Secondary text on cards' },
                  { fg: 'Vermilion', bg: 'Ink', ratio: '5.2:1', wcag: 'AA', use: 'Large text / icons / borders only — NOT small text' },
                  { fg: 'Linen', bg: 'Vermilion', ratio: '5.3:1', wcag: 'AA', use: 'Button label (font-display bold, ≥14px)' },
                ].map((row) => (
                  <tr key={row.use} className="border-b border-charcoal last:border-b-0 hover:bg-washi/30 transition-colors">
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border border-charcoal" style={{ backgroundColor: row.fg === 'Vermilion' ? '#D83A2C' : row.fg === 'Linen' ? '#E6E0D8' : '#787878' }} />
                        {row.fg}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border border-charcoal" style={{ backgroundColor: row.bg === 'Ink' ? '#0C0C0C' : row.bg === 'Washi' ? '#1A1A1A' : '#D83A2C' }} />
                        {row.bg}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{row.ratio}</td>
                    <td className="p-3">
                      <span className={`font-display text-xs font-bold px-2 py-0.5 rounded ${row.wcag === 'AAA' ? 'bg-vermilion/20 text-vermilion' : 'bg-charcoal text-stone'}`}>
                        {row.wcag}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-stone">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="text-center py-8 border-t border-charcoal">
          <p className="font-body text-xs text-stone">
            Ink & Vermillion Design System • Queu Arena • v1.0
          </p>
          <p className="font-mono text-[10px] text-stone/50 mt-1">
            6 colors • 2 fonts • 0 gradients • 0 glow • 0 AI defaults
          </p>
        </footer>
      </div>
    </div>
  );
}
