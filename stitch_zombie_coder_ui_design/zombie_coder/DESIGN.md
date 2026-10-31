---
name: Zombie Coder
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#b9ccb5'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#849581'
  outline-variant: '#3b4b3a'
  surface-tint: '#00e55b'
  primary: '#edffe8'
  on-primary: '#003911'
  primary-container: '#00ff66'
  on-primary-container: '#007128'
  inverse-primary: '#006e27'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#fff8fd'
  on-tertiary: '#490080'
  tertiary-container: '#edd4ff'
  on-tertiary-container: '#872fd5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6bff83'
  primary-fixed-dim: '#00e55b'
  on-primary-fixed: '#002107'
  on-primary-fixed-variant: '#00531b'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  headline-xl:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets an indie mobile sim capturing the grueling, comedic, and hypnotic reality of software engineering student life under impending deadlines. The aesthetic balances late-night terminal immersion with cozy handheld tactile satisfaction. The visual mood is technical, energetic, mildly chaotic, and delightfully obsessive—reminiscent of low-lit dorm rooms, energy drink tabs, failing unit tests, and terminal glow.

The core visual style merges **Cyberpunk Terminal UI** with **Tactile Retro-Modern Sim Controls**:
- **Terminal Phosphor Infusion:** Sharp, luminous status colors (matrix green, electric cyan, compiler amber, and apocalyptic red/purple) pop intensely against rich obsidian and midnight slate surfaces.
- **Micro-HUD Density:** Interface components emulate IDE panels, debugger watchlists, and modular circuit boards scaled down to high-density mobile viewports.
- **Tactile Game Affordance:** Mechanical micro-press interactions, inset status panels, scanline overlays, and neon edge-lighting create a tangible handheld game-deck feel.

## Colors

The palette operates in strict dark mode, utilizing tiered slate foundations punctuated by ultra-saturated fluorescent phosphors:

- **Primary (`#00ff66`):** Terminal Phosphor Green. Indicates compiling states, passing tests, energy recovery, and successful algorithmic loops.
- **Secondary (`#06b6d4`):** Electric Cyan. Dictates runtime data, memory pools, networking operations, and student focus/flow-state metrics.
- **Tertiary (`#a855f7`):** Cybernetic Necrosis Purple. Encapsulates "zombie legacy" mechanics—burnout meters, sleep deprivation curses, and creeping campus anomalies.
- **Neutral (`#0b0f19`):** Root Terminal Obsidian. The deep anchor for root canvas surfaces, stepped progressively up to `#111827` (Panel Dark) and `#1f2937` (HUD Surface Card).
- **Functional Semantics:**
  - **Compiler Warning / Bug Hunter (`#f59e0b`):** Warning cues, coffee/caffeine buffs, deadline counters.
  - **Fatal Panic / Brain Meltdown (`#ef4444`):** Segfaults, expulsion warnings, zero-energy burnout triggers.

## Typography

The type system blends the cold efficiency of code editors with the high legibility needed for dense mobile game dashboards:

- **JetBrains Mono** anchors headlines, numbers, currency, code snippets, timestamps, and stat counters. It renders data in fixed, machine-calibrated rhythm and evokes terminal prompts.
- **Inter** handles narrative dialogue, lore logs, quest descriptions, and multi-line item cards where monospaced text causes visual fatigue.
- All labels and subheadings are treated with slight uppercase tracking (`0.04em` to `0.08em`) to mirror technical telemetry readouts.

## Layout & Spacing

Designed fundamentally around a **Portrait Mobile-First Game Viewport** (360px to 430px wide base), extending adaptively to tablet:

- **HUD Grid & Stacking:** A unified 4-column fluid mobile grid with compact 12px (`0.75rem`) gutters and 16px (`1rem`) viewport margins. Top-screen real estate is reserved for sticky student vitals (Energy, GPA, Sanity, Git Commits).
- **Vertical Flow Rhythm:** Tight vertical spacing units (`space-xs` through `space-md`) prevent informational fragmentation, keeping inventory slots, action bars, and sim speed toggles within one-thumb operating distance.
- **Safe Area Insets:** Strict respect for dynamic bottom home indicators and top status bars with dedicated game-frame letterbox padding.

## Elevation & Depth

Rather than conventional drop shadows, elevation is communicated through **Chroma-Border Layering and Terminal Backlight Glow**:

- **Layer 0 (Canvas Base):** Deep `#0b0f19`, non-reflective, textured with faint scanlines or micro dot-matrix grid patterns at 4% opacity.
- **Layer 1 (Containers & Panels):** Solid `#111827` framed by a 1px border of `#1f2937`.
- **Layer 2 (Interactive HUD Cards):** `#1f2937` with inset highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.08)`) and high-contrast bounding borders (`rgba(0, 255, 102, 0.2)` or `rgba(6, 182, 212, 0.2)`).
- **Layer 3 (Modals & Focus Flyouts):** Suspended overlays with a backdrop blur of `12px` and ambient peripheral neon bloom (`box-shadow: 0 0 24px rgba(0, 255, 102, 0.15)`).
- **Active State Depth:** Buttons depress physically with an inset dark shadow (`inset 0 2px 4px rgba(0, 0, 0, 0.6)`) paired with heightened phosphor edge glow.

## Shapes

The interface adopts a **Soft Angled Aesthetic (`roundedness: 1`)**:
- Buttons and cards use tight 4px (`0.25rem`) corner rounding, preventing generic roundness while staying friendly for prolonged handheld sessions.
- Key interactive modules feature optional chamfered or angled corner trims on decorative edges to evoke rugged cyberdeck hardware.
- Status pips, notification dots, and LED state indicators remain purely rectangular or micro-radiused chips.

## Components

### Buttons
- **Primary Terminal Action:** High-saturation background (`#00ff66`), bold black monospaced text (`#0b0f19`), 1px outer glow, 4px border radius. On press: slight 1px downward translate and darkened lime tone.
- **Secondary Cyber Action:** Dark translucent fill (`rgba(6, 182, 212, 0.12)`), cyan border (`#06b6d4`), and glowing cyan text.
- **Danger / Refactor Abort:** Ghost panel with crimson outline (`#ef4444`) and subtle red warning pulse.

### Cards & HUD Modules
- Built on `#111827` foundations with 1px borders in `#1f2937`.
- Header bars feature technical brackets (e.g., `[SYS.MODULE // GPA]`) rendered in `label-sm` monospaced type with integrated status dot LEDs.

### Chips & Micro-Badges
- Compact 18px-height status chips for buff/debuff display (e.g., `CAFFEINE +40%`, `MEMORY LEAK`, `DEADLINE D-2`).
- Monospace bold lettering, solid contrasting outlines, and semi-transparent tinted backgrounds matching their severity class.

### Input Fields & Terminal Console Prompts
- Deep charcoal recessed troughs (`#080c14`) with a fixed green prompt glyph (`>_`).
- Active state replaces standard focus rings with an electric phosphor border pulse and blinking block cursor.

### Selection Controls (Checkboxes, Toggles, Radio Switches)
- **Checkboxes:** Square boxes with hard inset borders; active state displays an authentic terminal "X" or checked block `[■]`.
- **Segmented Toggles:** Mechanical rocker-switch style containing segmented tabs that light up in neon cyan when active.

### Game-Specific Components
- **Vital Gauges (Sanity / Code Quality):** Segmented LED-bar meters with distinct block divisions rather than smooth continuous bars.
- **Inventory & Skill Slots:** 48x48px square slots with subtle corner bracket notches and badge counters anchored to the bottom-right.
- **Dialogue & Story Log:** Terminal output card featuring auto-scrolling monospace syntax, user choice buttons rendered as executable bash commands.