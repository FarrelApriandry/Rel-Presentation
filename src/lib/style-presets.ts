/* ── Visual style presets (strict design rules injected into the prompt) ── */
/*
 * Each preset translates a visual direction into concrete, non-negotiable
 * rules: design tokens (color / type / spacing), layout laws, component
 * recipes, and a small CSS + markup skeleton. The model is instructed to
 * reuse the given CSS verbatim (adjusting only token values) — it must NOT
 * invent its own palette, fonts, or decoration.
 *
 * "clean-premium" is distilled from a real reference deck:
 *   "Project-1 — Penawaran Investasi" (12 slides, investment pitch).
 */

export interface StylePreset {
  /** Short identity line: what the style is, in one sentence. */
  identity: string;
  /** Design tokens as CSS custom properties, ready to paste into :root. */
  tokens: string;
  /** Structural laws the layout must obey. */
  layout: string[];
  /** Component recipes: which patterns to use for which content types. */
  components: string[];
  /** Hard prohibitions (beyond the global design constraints). */
  prohibitions: string[];
  /** CSS skeleton — the model may adjust token values, never the structure. */
  cssSkeleton: string;
  /** Minimal markup skeleton showing slide anatomy. */
  markupSkeleton: string;
}

const CLEAN_PREMIUM: StylePreset = {
  identity:
    'Editorial print quality on warm paper: oversized serif headlines, near-empty layouts, ' +
    'hairline rules instead of boxes, one restrained accent color.',

  tokens: `:root{
  --paper:#FAF9F6;--ink:#15171C;--muted:#6A6F7A;--rule:#D9D6CE;--accent:#2A3A66;--accent-2:#A9802E;
  --serif:Georgia,"Iowan Old Style",Palatino,"Palatino Linotype",serif;
  --sans:"Helvetica Neue",Helvetica,Arial,system-ui,sans-serif;
}`,

  layout: [
    'Every slide is a full-viewport section: `.s{min-height:100vh;min-height:100dvh;padding:9vh 8vw;display:flex;flex-direction:column;justify-content:center}` with scroll-snap (`html{scroll-snap-type:y mandatory}` and `.s{scroll-snap-align:start}`).',
    'Vertical rhythm comes from whitespace, not boxes: generous `9vh 8vw` padding, content columns capped with `max-width` (headings ~20ch, body text ~52ch, notes ~60ch).',
    'One idea per slide. If a slide feels dense, split it — never shrink the type.',
    'Grid: single column by default; two-column `split{display:grid;grid-template-columns:1fr 1fr;gap:6vw}` only for text-vs-table/visual pairing.',
    'Type scale uses `clamp()` everywhere so slides survive any projector: e.g. cover `clamp(3.6rem,10vw,8.5rem)`, headings `clamp(1.9rem,4vw,3.3rem)`, body `clamp(1rem,1.4vw,1.2rem)`.',
    'Fixed slide counter bottom-right (`position:fixed;right:2.4vw;bottom:2.2vh`) in muted small text with tabular numerals.',
  ],

  components: [
    'Cover: giant serif H1 + serif sub-line in accent color, then a facts strip — a flex row of label/value pairs separated only by a `border-top:1px solid var(--rule)` hairline (no cards, no boxes).',
    'Data-as-typography: key numbers (%, multiples, amounts) are rendered as oversized serif text in the accent color (`.big`/`.k`), never as charts unless the comparison truly needs one.',
    'Simple proportions (e.g. "7 of 10"): a dot grid of squares — `background:var(--rule)` for the empty ones, `var(--accent)` for the filled ones.',
    'Ranges/bars: flat rectangles, height 12–18px, `background:var(--rule)` track with `var(--accent)` fill; the highlight/ceiling marker uses the gold `--accent-2`. No rounded corners, no gradients, no shadows.',
    'Timelines: one horizontal `<svg>` — a 2px ink line, 9px filled circles as milestones, dates in muted sans above the line, phase labels in serif below. Keep the SVG flat (no filters, no gradients).',
    'Comparison bars: label (sans) + bar + serif value on one row; the subject row is bolded and uses the gold fill.',
    'Ordered lists/steps: grid rows separated by `border-bottom:1px solid var(--rule)`; the left column shows the number/term in serif accent, the right column the explanation in sans.',
    'Tables: collapsed, no vertical rules, no header fill — only `border-bottom` hairlines per row; first column muted.',
    'Donut/split visuals: inline SVG with flat fills from the accent palette only, values labeled in serif; legend as hairline-separated rows with a 12px square swatch.',
    'Closing slide: oversized serif statement + contact block where the name is serif and details are sans.',
  ],

  prohibitions: [
    'No gradients of any kind (including subtle background washes).',
    'No rounded corners, no box-shadows, no glassmorphism, no glow.',
    'No decorative icons, illustrations, stock imagery, or texture — the typography and rules ARE the visual.',
    'No colored section backgrounds; everything sits on the paper color. Accent color appears only in text, small fills, and thin rules.',
    'No bullet-point lists with default bullets; use the hairline-row component instead.',
    'No two slides sharing the same composition — vary between: cover-style, statement+note, data-row, split, timeline, table.',
  ],

  cssSkeleton: `*{box-sizing:border-box}
html{height:100%;scroll-snap-type:y mandatory;overflow-y:scroll}
body{margin:0;font-family:var(--sans);background:var(--paper);color:var(--ink);-webkit-font-smoothing:antialiased}
.s{min-height:100vh;min-height:100dvh;padding:9vh 8vw;display:flex;flex-direction:column;justify-content:center;scroll-snap-align:start;position:relative}
h1,h2{font-family:var(--serif);font-weight:400;letter-spacing:-.02em;line-height:1.08;margin:0 0 .5em}
h2{font-size:clamp(1.9rem,4vw,3.3rem);max-width:20ch}
h3{font-size:clamp(1rem,1.5vw,1.2rem);font-weight:600;margin:0 0 .25em}
p{font-size:clamp(1rem,1.4vw,1.2rem);line-height:1.6;max-width:52ch;margin:0 0 .7em}
.note{font-size:.85rem;color:var(--muted);line-height:1.5;margin-top:1.5em;max-width:60ch}
.big{font-family:var(--serif);font-size:clamp(5rem,15vw,10rem);line-height:.9;color:var(--accent);letter-spacing:-.03em;margin:0}
.split{display:grid;grid-template-columns:1fr 1fr;gap:6vw;align-items:center}
.count{position:fixed;right:2.4vw;bottom:2.2vh;font-size:.8rem;color:var(--muted);font-variant-numeric:tabular-nums;z-index:5;background:var(--paper);padding:.2em .4em}
@media (max-width:760px){.split{grid-template-columns:1fr}}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}`,

  markupSkeleton: `<section class="s cover" aria-label="Cover">
  <h1>Deck Title</h1>
  <p class="sub">One-line positioning statement in accent color.</p>
  <ul class="facts">
    <li><b>Rp 5.000.000</b>Label</li>
    <li><b>Agustus 2027</b>Label</li>
  </ul>
</section>

<section class="s" aria-label="Statement">
  <h2>A single insight-sized headline.</h2>
  <p class="note">Supporting evidence and source, muted.</p>
</section>`,
};

const SWISS_MINIMAL: StylePreset = {
  identity:
    'International Typographic Style: flush-left ragged-right grid, one neutral grotesque family, ' +
    'black on white, information as the only decoration.',

  tokens: `:root{
  --paper:#FFFFFF;--ink:#111111;--muted:#767676;--rule:#E5E5E5;--accent:#111111;
  --sans:Inter,"Helvetica Neue",Helvetica,Arial,system-ui,sans-serif;
}`,

  layout: [
    'Strict modular grid: 12 columns, full-bleed width with consistent outer margin (`padding:8vh 6vw`), elements snapped to column starts — never centered by eye.',
    'Flush-left, ragged-right text only; every text block aligned to the same left edge across slides.',
    'Hierarchy is built from scale and weight only: one neutral sans family, weights 400/500/700, sizes via `clamp()`.',
    'White is the only background. Structure comes from empty grid cells and 1px `--rule` dividers.',
    'One full-bleed black slide (inverse: white text on `--ink`) per deck maximum, used for a key statement.',
  ],

  components: [
    'Slide headers: tiny uppercase section label + rule at top, headline below on the grid.',
    'Numbers/dates set in tabular numerals; big figures in 700 weight, never serif.',
    'Data: flat bar rows or dot matrices, monochrome; highlight via black fill vs `--rule` gray.',
    'Diagrams: plain rectangles/circles/lines, 1–2px strokes, no fills except black.',
    'Footnotes in `--muted`, pinned to the bottom rule of the slide.',
  ],

  prohibitions: [
    'No serif type, no italics, no more than two weights per slide.',
    'No color other than black/white/gray; no accent hue at all.',
    'No gradients, shadows, rounded corners, icons, or imagery.',
    'No centered text anywhere.',
  ],

  cssSkeleton: `*{box-sizing:border-box}
body{margin:0;font-family:var(--sans);background:var(--paper);color:var(--ink)}
.s{min-height:100vh;min-height:100dvh;padding:8vh 6vw;display:grid;grid-template-columns:repeat(12,1fr);gap:0 2vw;align-content:center}
.label{grid-column:1/-1;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--rule);padding-bottom:1em;margin-bottom:2.5em}
h1{grid-column:1/9;font-size:clamp(2.6rem,7vw,6rem);font-weight:700;line-height:1.02;letter-spacing:-.03em;margin:0}
h2{grid-column:1/9;font-size:clamp(2rem,4.5vw,3.6rem);font-weight:700;line-height:1.05;letter-spacing:-.02em;margin:0 0 .4em}
p{grid-column:1/7;font-size:clamp(1rem,1.3vw,1.15rem);line-height:1.55;margin:0 0 .8em}
.num{font-variant-numeric:tabular-nums}`,

  markupSkeleton: `<section class="s" aria-label="Section">
  <div class="label">01 — Section name</div>
  <h2>Flush-left headline on the grid.</h2>
  <p>Body copy in columns 1–6, ragged right.</p>
</section>`,
};

const MODERN_TECH: StylePreset = {
  identity:
    'Dark engineering aesthetic: deep slate canvas, cyan/violet signal accents, monospace data, ' +
    'thin luminous strokes — precision over spectacle.',

  tokens: `:root{
  --bg:#0B1220;--surface:#111A2C;--ink:#E6EDF7;--muted:#8B98AD;--line:#22304A;--accent:#22D3EE;--accent-2:#A78BFA;
  --sans:"Inter",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace;
}`,

  layout: [
    'Full-viewport slides (`min-height:100dvh`) with a consistent 1px inner frame or top rule to read as "panels".',
    'Dense-but-ordered: data lives in mono, narrative in sans; clear separation between the two.',
    'Accent colors are signals, not paint: cyan for primary data/active states, violet for secondary series — each used sparingly.',
    'Structure via 1px `--line` borders and the `--surface` panel color; no elevation tricks.',
  ],

  components: [
    'Key metrics as mono readouts with a small uppercase muted label above (dashboard vibe).',
    'Charts: flat SVG line/bar with 2px accent strokes, `--line` grid, mono axis labels.',
    'Code/config fragments: `<pre>` on `--surface` with mono, cyan keywords — only when genuinely relevant.',
    'Comparison tables: mono numerals, hairline rows, right-aligned figures.',
    'Status chips: 1px accent border, transparent fill, uppercase mono micro-label.',
  ],

  prohibitions: [
    'No neon glow, bloom, or blur effects — luminosity comes from hue contrast only.',
    'No gradient meshes, orbs, or "AI abstract" backgrounds; at most one very subtle radial vignette.',
    'No rounded-card grids with shadows; corners max 6px radius.',
    'No emoji or icon fonts.',
  ],

  cssSkeleton: `*{box-sizing:border-box}
body{margin:0;font-family:var(--sans);background:var(--bg);color:var(--ink)}
.s{min-height:100vh;min-height:100dvh;padding:7vh 6vw;display:flex;flex-direction:column;justify-content:center;border-top:1px solid var(--line)}
h1{font-size:clamp(2.4rem,6vw,5rem);letter-spacing:-.02em;margin:0 0 .35em;line-height:1.04}
h2{font-size:clamp(1.8rem,3.6vw,3rem);letter-spacing:-.01em;margin:0 0 .5em;line-height:1.1}
p{font-size:clamp(1rem,1.3vw,1.15rem);line-height:1.6;max-width:58ch;color:var(--muted);margin:0 0 .7em}
.k{font-family:var(--mono);font-size:clamp(2.2rem,5vw,4rem);color:var(--accent);line-height:1}
.lbl{font-family:var(--mono);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.panel{border:1px solid var(--line);background:var(--surface);padding:1.4em}`,

  markupSkeleton: `<section class="s" aria-label="Metric">
  <div class="lbl">conversion rate</div>
  <div class="k">0.10–0.15×</div>
  <p>Context sentence in muted sans.</p>
</section>`,
};

const CORPORATE: StylePreset = {
  identity:
    'Boardroom-safe: white canvas, navy structure, restrained blue accent, chart-led slides with ' +
    'consistent headers and footers — clarity and trust over personality.',

  tokens: `:root{
  --paper:#FFFFFF;--ink:#1F2933;--muted:#6B7280;--line:#E1E4E8;--accent:#1F4E79;--accent-2:#C9A227;
  --sans:"Segoe UI",Arial,system-ui,sans-serif;
}`,

  layout: [
    'Consistent slide chrome: title area top-left with an accent underline, footer strip with deck name + page number.',
    'Content grid: title band (~20vh) + body band; body splits into 1–2 balanced columns.',
    'Charts and tables get priority space; text is supporting, capped ~60ch.',
    'Palette discipline: navy for structure/primary series, gold `--accent-2` for the one highlighted figure.',
  ],

  components: [
    'Title slide: navy band or heavy accent rule, deck title, subtitle, date/author line.',
    'KPI row: 3–4 metric blocks separated by hairlines — big navy figure, muted label.',
    'Bar/line charts in flat SVG, gridlines in `--line`, direct labels instead of legends where possible.',
    'Two-column pros/cons or before/after using hairline-divided columns (no cards).',
    'Footer on every non-cover slide: muted 0.75rem, deck name left, page number right.',
  ],

  prohibitions: [
    'No gradients, shadows, 3D, or perspective effects.',
    'No more than two data-series colors per chart.',
    'No icon-heavy "startup" layouts, no emoji.',
    'No full-bleed photos or abstract backgrounds.',
  ],

  cssSkeleton: `*{box-sizing:border-box}
body{margin:0;font-family:var(--sans);background:var(--paper);color:var(--ink)}
.s{min-height:100vh;min-height:100dvh;padding:7vh 7vw;display:flex;flex-direction:column;justify-content:center;position:relative}
.s::before{content:"";position:absolute;top:0;left:7vw;width:64px;height:5px;background:var(--accent)}
h1{font-size:clamp(2.4rem,5.5vw,4.4rem);margin:0 0 .3em;line-height:1.06}
h2{font-size:clamp(1.7rem,3.4vw,2.8rem);margin:0 0 .5em;color:var(--accent)}
p{font-size:clamp(1rem,1.3vw,1.15rem);line-height:1.55;max-width:60ch;margin:0 0 .7em;color:var(--muted)}
.k{font-size:clamp(2rem,4.5vw,3.4rem);font-weight:700;color:var(--accent);line-height:1}
.foot{position:absolute;left:7vw;right:7vw;bottom:3.5vh;display:flex;justify-content:space-between;font-size:.75rem;color:var(--muted);border-top:1px solid var(--line);padding-top:1em}`,

  markupSkeleton: `<section class="s" aria-label="KPI">
  <h2>Section headline in navy.</h2>
  <div class="kpis">
    <div><div class="k">72%</div><div class="lbl">label</div></div>
    <div><div class="k">3×</div><div class="lbl">label</div></div>
  </div>
  <div class="foot"><span>Deck name</span><span>03</span></div>
</section>`,
};

const ACADEMIC: StylePreset = {
  identity:
    'University-lecture discipline: white slides, serif headlines, structured evidence blocks, ' +
    'citation lines, numbered sections — substance first.',

  tokens: `:root{
  --paper:#FFFFFF;--ink:#1A1A1A;--muted:#5F6368;--line:#DADCE0;--accent:#3949AB;--accent-2:#00796B;
  --serif:Georgia,"Times New Roman",serif;
  --sans:Arial,Helvetica,system-ui,sans-serif;
}`,

  layout: [
    'Header band: section number + short title, hairline underneath — same position on every slide.',
    'Serif for headlines and figures (authority), sans for body and labels (legibility).',
    'Evidence-first structure: claim headline, then data block, then citation line at the bottom in muted small text.',
    'Marginal notes allowed in a right column (`--muted`, 0.85rem) for definitions or caveats.',
  ],

  components: [
    'Title slide: institutional look — title, subtitle, author, affiliation, date; thin double rule.',
    'Section dividers: large serif number ("03") + section name on white.',
    'Data: simple flat charts or tables with visible axes/units; every chart carries a figure caption ("Figure 1 — …") and a source line.',
    'Equations/definitions: serif, in a hairline-bounded block, centered within its column.',
    'Bullet content: square-dot custom list markers, generous line-height, max 5 lines per slide.',
  ],

  prohibitions: [
    'No decorative imagery, watermarks, or university logos unless supplied.',
    'No gradients, shadows, rounded cards, or icon sets.',
    'No chart without a caption and a source/unit line.',
    'No claims without a visible citation line.',
  ],

  cssSkeleton: `*{box-sizing:border-box}
body{margin:0;font-family:var(--sans);background:var(--paper);color:var(--ink)}
.s{min-height:100vh;min-height:100dvh;padding:8vh 8vw;display:flex;flex-direction:column;justify-content:center}
.head{display:flex;justify-content:space-between;border-bottom:1px solid var(--ink);padding-bottom:.9em;margin-bottom:2.2em;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
h1,h2{font-family:var(--serif);font-weight:400;letter-spacing:-.01em;margin:0 0 .4em;line-height:1.12}
h1{font-size:clamp(2.2rem,5vw,4rem)}
h2{font-size:clamp(1.7rem,3.4vw,2.7rem)}
p{font-size:clamp(1rem,1.25vw,1.1rem);line-height:1.6;max-width:62ch;margin:0 0 .6em}
.cap{font-size:.85rem;color:var(--muted);margin-top:1.2em}
.src{font-size:.75rem;color:var(--muted);margin-top:auto;padding-top:1.5em}`,

  markupSkeleton: `<section class="s" aria-label="Finding">
  <div class="head"><span>03 — Results</span><span>Course / Deck</span></div>
  <h2>Claim stated precisely.</h2>
  <p>Evidence, method note, interpretation.</p>
  <div class="cap">Figure 2 — short caption. Source: reference, year.</div>
</section>`,
};

const CREATIVE: StylePreset = {
  identity:
    'Bold editorial poster: off-white or ink canvas, oversized display type used as imagery, ' +
    'brave two-tone compositions, deliberate asymmetry — expressive but disciplined.',

  tokens: `:root{
  --paper:#F4F1EA;--ink:#161616;--muted:#6E6A61;--accent:#E2483D;--accent-2:#1F4FD8;
  --display:"Archivo Black","Arial Black",system-ui,sans-serif;
  --sans:"Inter",system-ui,sans-serif;
}`,

  layout: [
    'Full-bleed slides; composition is asymmetric — type anchored to edges/corners, not centered columns.',
    'Type is the image: display faces at extreme sizes (`clamp(3.5rem,12vw,10rem)`), tight leading (~0.95), intentional line breaks that create shape.',
    'One dominant color pair per slide: ink-on-paper or paper-on-ink, with the red/blue accent doing a single job.',
    'Rotation, oversized cropped letters, and bleed-off text are allowed — but each deck uses at most one such "loud" device per 3 slides.',
  ],

  components: [
    'Cover: 3–5 word headline filling the slide, tiny metadata pinned to a corner.',
    'Statement slides: one sentence, huge, possibly split across the full width.',
    'Number slides: a single figure at maximum scale with a one-line caption.',
    'Data: only when needed — flat two-tone bars or dot grids in accent colors.',
    'Section breaks: full accent-color slides with a single display word.',
  ],

  prohibitions: [
    'No stock photos, illustrations, 3D renders, or AI-abstract backgrounds — type and flat color only.',
    'No gradients, glows, drop shadows, or rounded "sticker" elements.',
    'No more than two accent colors in the whole deck.',
    'No body-copy walls: max ~3 short lines per slide.',
  ],

  cssSkeleton: `*{box-sizing:border-box}
body{margin:0;font-family:var(--sans);background:var(--paper);color:var(--ink)}
.s{min-height:100vh;min-height:100dvh;padding:6vh 6vw;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
h1{font-family:var(--display);font-size:clamp(3.5rem,12vw,10rem);line-height:.95;letter-spacing:-.02em;text-transform:uppercase;margin:0}
h2{font-family:var(--display);font-size:clamp(2.4rem,7vw,6rem);line-height:.98;letter-spacing:-.01em;text-transform:uppercase;margin:0}
.meta{position:absolute;top:4vh;left:6vw;right:6vw;display:flex;justify-content:space-between;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.cap{font-size:clamp(1rem,1.4vw,1.15rem);max-width:44ch;margin-top:1.5em;color:var(--muted)}
.invert{background:var(--ink);color:var(--paper)}
.invert .meta,.invert .cap{color:#B9B4AA}`,

  markupSkeleton: `<section class="s" aria-label="Headline">
  <div class="meta"><span>Project</span><span>01</span></div>
  <h1>Three to five words that fill the slide.</h1>
  <p class="cap">One supporting line.</p>
</section>`,
};

export const STYLE_PRESETS: Record<string, StylePreset> = {
  'clean-premium': CLEAN_PREMIUM,
  'swiss-minimal': SWISS_MINIMAL,
  'modern-tech': MODERN_TECH,
  corporate: CORPORATE,
  academic: ACADEMIC,
  creative: CREATIVE,
};

/* ── Prompt rendering ── */

/**
 * Renders a preset into a strict style directive for the prompt. Empty string
 * when the style has no preset (e.g. custom styles).
 */
export function buildStyleSection(styleValue: string, customStyle: string): string {
  if (styleValue === 'custom') {
    const c = customStyle.trim();
    if (!c) return '';
    return (
      '\n\nVisual style directive (prescribed by the presenter — follow strictly):\n' + c
    );
  }

  const preset = STYLE_PRESETS[styleValue];
  if (!preset) return '';

  return (
    '\n\nSTRICT VISUAL STYLE DIRECTIVE — "' + styleValue + '"\n' +
    'The following design system is prescribed. Treat it as a binding spec, not inspiration:\n' +
    '- Reuse the provided CSS skeleton and design tokens VERBATIM (you may only adjust token values where noted, and add new component classes in the same spirit).\n' +
    '- Do not substitute your own palette, fonts, spacing, or decoration.\n' +
    '- Obey every layout rule and prohibition below.\n\n' +
    'Identity: ' + preset.identity + '\n\n' +
    'Design tokens (CSS custom properties):\n' + preset.tokens + '\n\n' +
    'Layout laws:\n' + preset.layout.map((r) => '- ' + r).join('\n') + '\n\n' +
    'Component recipes (use these patterns for the matching content types):\n' +
    preset.components.map((c) => '- ' + c).join('\n') + '\n\n' +
    'Prohibitions (hard limits, even if the general instructions conflict):\n' +
    preset.prohibitions.map((p) => '- ' + p).join('\n') + '\n\n' +
    'CSS skeleton (structural baseline — extend, do not replace):\n' +
    '<style>\n' + preset.cssSkeleton + '\n</style>\n\n' +
    'Slide anatomy skeleton (markup conventions: full-viewport .s sections, aria labels, semantic tags):\n' +
    '<!-- example slide structure -->\n' + preset.markupSkeleton
  );
}
