# 🎨 Design System & Visual Guidelines
**Style Specification:** Clean Premium Tech (2026)  
**Target Identity:** Quiet · Precise · Intelligent · Technical · Premium · Confident  

---

> **Golden Rule:** Do not chase visual trends. Build a timeless interface using 2026's best interaction and layout principles. Every visual effect must improve hierarchy, comprehension, interaction, or brand identity. If it does none of these, remove it.

---

## 01. Design Philosophy

### Core Concept
`Clean Premium Tech = Minimalism + Editorial Hierarchy + Product-Level Precision + Subtle Technology`

* **Content-First Hierarchy:** Content → Hierarchy → Layout → Interaction → Decoration.
* **Restraint:** Every visual element must have a clear reason to exist.
* **Tone:** Premium (not flashy), Technical (not overwhelming), Modern (not trend-chasing), Professional (with personality).

---

## 02. Visual Direction & References

The aesthetic combines four distinct references:

1. **Apple-like Refinement:** Controlled typography, restrained shadows, clean spacing, high-quality micro-interactions.
2. **Modern SaaS:** Modular cards, structured information, clear CTAs, product-oriented storytelling.
3. **Editorial Design:** Large headlines, strong whitespace, asymmetric composition, bold type hierarchy.
4. **Developer Culture:** Monospace accents, technical metadata, status indicators, subtle grid structures.

---

## 03. Color System & CSS Tokens

Neutral-first palette. Avoid using gradients across large surfaces.

### Light Mode
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-bg` | `#FAFAF9` | Main background |
| `--color-surface` | `#FFFFFF` | Primary card / container surface |
| `--color-surface-secondary` | `#F4F4F5` | Secondary background / subtle fills |
| `--color-border` | `#E4E4E7` | Standard borders |
| `--color-text-primary` | `#18181B` | Headings and primary text |
| `--color-text-secondary` | `#52525B` | Subheadings and body copy |
| `--color-text-muted` | `#71717A` | Captions, metadata, placeholders |

### Dark Mode
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `--color-bg-dark` | `#09090B` | Main background |
| `--color-surface-dark` | `#111113` | Primary card surface |
| `--color-surface-elevated` | `#18181B` | Elevated cards, modals |
| `--color-border-dark` | `#27272A` | Standard dark borders |
| `--color-text-primary-dark` | `#FAFAFA` | Headings and primary text |
| `--color-text-secondary-dark` | `#A1A1AA` | Subheadings and body copy |
| `--color-text-muted-dark` | `#71717A` | Captions and metadata |

### Primary Accent
* **Accent Color:** `#2563EB` (Blue) or `#4F46E5` (Indigo)
* **Usage Limit:** Max ~5% of visible screen real estate. Use exclusively for CTAs, active states, links, and selected elements.

---

## 04. Gradient & Surface Rules

### ❌ DON'T
* Full-screen multi-color gradients (e.g., Purple → Pink → Blue).
* Large floating color "blobs" behind every section.

### ✅ DO
* Subtle background radial gradients for light ambient depth:
```css
background: radial-gradient(
  circle at 70% 20%,
  rgba(37, 99, 235, 0.08),
  transparent 35%
);

```

---

## 05. Typography System

* **Primary Font:** `Geist` (or `Inter` / `Manrope`)
* **Technical / Monospace Font:** `Geist Mono` (or `JetBrains Mono` / `IBM Plex Mono`)

### Type Scale Hierarchy

| Element | Desktop Size | Mobile Size | Weight | Tracking / Line Height |
| --- | --- | --- | --- | --- |
| **Display / Hero** | `72px–96px` | `42px–48px` | `600–700` | `-0.04em` / `1.0` |
| **Section Heading** | `48px–64px` | `32px–40px` | `600` | `-0.03em` / `1.05` |
| **Heading (H2/H3)** | `32px–40px` | `24px–28px` | `600` | `-0.02em` / `1.1` |
| **Subheading** | `20px–24px` | `18px` | `500` | `-0.01em` / `1.3` |
| **Body Text** | `16px–18px` | `15px–16px` | `400` | `normal` / `1.6` |
| **Small / Meta** | `12px–14px` | `12px` | `400 / 500` | `0.04em` (Uppercase for Meta) |

### Technical Metadata Styling

Monospace, small, uppercase details add an editorial technical feel:

```css
.meta-label {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
/* Example Output: 01 / SELECTED WORK */

```

---

## 06. Layout & Grid System

* **Grid:** 12-column grid on desktop, 8-column on tablet, 4-column on mobile.
* **Max Container Width:** `1280px` – `1440px`.
* **Side Padding:**
* Desktop: `32px–64px`
* Tablet: `24px–32px`
* Mobile: `20px–24px`



### Vertical Rhythm (Whitespace)

Use deliberate spacing between major sections:

* **Hero → Section 1:** `160px`
* **Between Standard Sections:** `120px–140px`
* **Inside Component Groups:** `24px–32px`

---

## 07. Bento Grid & Card System

Bento layouts should organize spatial hierarchy logically. Card size must reflect item importance.

```text
┌──────────────────────────────┬──────────────┐
│                              │   METRIC     │
│       FEATURED PROJECT       ├──────────────┤
│                              │   STACK      │
└──────────────────────────────┴──────────────┘

```

### Card Design Standards

* **Background:** `#FFFFFF` (Dark: `#111113`)
* **Border:** `1px solid #E4E4E7` (Dark: `#27272A`)
* **Corner Radius System:**
* Pill/Badge: `9999px`
* Small UI Elements: `8px–10px`
* Cards / Containers: `16px–20px`
* Large Hero Modules: `28px–32px`


* **Shadows:** Ultra-subtle depth only:
```css
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);

```



---

## 08. Glassmorphism & Depth

Glassmorphism must be restricted to overlay utility surfaces (navbars, toolbars, dropdowns, floating controls).

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(228, 228, 231, 0.6);
}

/* Dark Mode Equivalent */
.dark .glass-panel {
  background: rgba(17, 17, 19, 0.7);
  border: 1px solid rgba(39, 39, 42, 0.6);
}

```

---

## 09. Motion & Micro-Interactions

Motion must feel responsive, swift, and functional rather than decorative.

* **Duration:** `200ms` – `300ms`
* **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out)
* **Hover States:**
* Buttons: Subtle translation (`translateY(-1px)`) + subtle bg change.
* Project Cards: Image scale (`scale(1.02)`) + border color change.


* **Animations to AVOID:** Parallax overflow, heavy WebGL scenes, flying particles, continuous floating loops.

---

## 10. Summary Matrix (Do's & Don'ts)

| Feature | ✅ DO | ❌ DON'T |
| --- | --- | --- |
| **Typography** | Aggressive scale, high contrast headlines | Tiny fonts, uniform sizes everywhere |
| **Color** | Neutral surfaces + 1 accent color | Neon gradients, multi-colored surfaces |
| **Spacing** | Generous vertical rhythm & whitespace | Crammed components, tiny padding |
| **Borders & Depth** | 1px clean borders, subtle contrast | Heavy drop shadows, multi-colored glows |
| **Motion** | Functional 200ms ease-out transitions | Constant looping particle animations |
| **Glassmorphism** | Restrained to toolbars/navbars | Applied to every card and section |
| **Copywriting** | Concise, direct, technical precision | Corporate jargon & buzzwords |

---

## 11. CSS Design Tokens (`:root`)

```css
:root {
  /* Colors - Light */
  --bg-main: #fafaf9;
  --surface-card: #ffffff;
  --surface-muted: #f4f4f5;
  --border-color: #e4e4e7;
  --text-main: #18181b;
  --text-sub: #52525b;
  --text-muted: #71717a;
  --color-accent: #2563eb;

  /* Typography */
  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Geist Mono', monospace;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 32px;

  /* Spacing */
  --space-section: 140px;
  --container-max: 1280px;

  /* Shadow */
  --shadow-subtle: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.dark {
  /* Colors - Dark */
  --bg-main: #09090b;
  --surface-card: #111113;
  --surface-muted: #18181b;
  --border-color: #27272a;
  --text-main: #fafafa;
  --text-sub: #a1a1aa;
  --text-muted: #71717a;
  --shadow-subtle: 0 8px 30px rgba(0, 0, 0, 0.4);
}