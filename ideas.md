# Design Ideas — MF Workbook Builder SOP

## Response 1
<response>
<text>
**Design Movement:** Technical Documentation meets Terminal Noir
**Core Principles:**
- Dark-first, high-contrast, monospace-forward — feels like a pro developer's tool
- Information hierarchy through typographic weight, not color noise
- Code blocks are first-class citizens: large, readable, with syntax highlighting
- Minimal chrome — no decorative elements, every pixel earns its place

**Color Philosophy:** Near-black background (#0d1117), cool-tinted surfaces (#161b22), electric blue accent (#58a6ff), green for success (#3fb950), amber for warnings (#d29922). Borrowed from GitHub Dark — familiar to technical users, zero cognitive friction.

**Layout Paradigm:** Single-column editorial scroll with a sticky left-rail step navigator. Content flows vertically like a long-form technical guide. The step nav anchors the reader's position without cluttering the reading area.

**Signature Elements:**
- Terminal-style code blocks with language badges and one-click copy
- Step circles with connecting lines (like a CI/CD pipeline diagram)

**Interaction Philosophy:** Hover reveals; click expands. Nothing moves unless triggered. Copy buttons appear on hover. Sections collapse/expand with smooth height transitions.

**Animation:** Minimal — fade-in on scroll entry (opacity 0→1, translateY 8px→0, 300ms ease-out). No bouncing, no parallax.

**Typography System:** `JetBrains Mono` for all code; `IBM Plex Sans` for body (technical, readable, not Inter). Display headings in `IBM Plex Sans` Bold at large sizes.
</text>
<probability>0.08</probability>
</response>

## Response 2
<response>
<text>
**Design Movement:** Brutalist Finance Dashboard
**Core Principles:**
- Hard edges, dense information, no rounded corners on structural elements
- Monochrome base with single high-saturation accent (electric indigo)
- Tables and grids dominate — data is the hero
- Bold typographic hierarchy: massive step numbers, tight body text

**Color Philosophy:** Off-white (#f5f5f0) background, near-black (#111) text, indigo (#4338ca) accent. Feels like a Bloomberg terminal crossed with a financial report.

**Layout Paradigm:** Two-column asymmetric grid — narrow left column for step numbers/labels, wide right column for content. Steps don't collapse; everything is visible at once like a printed SOP document.

**Signature Elements:**
- Oversized step numbers (200px, light weight) as background watermarks
- Thick top border on each section card (4px indigo)

**Interaction Philosophy:** Static by default. Hover adds a subtle left-border highlight. Copy buttons are always visible, not hover-only.

**Animation:** None. This is a document, not an app. Scrolling is the only interaction.

**Typography System:** `Space Grotesk` for headings (geometric, distinctive); `Source Code Pro` for code; `Source Serif 4` for body prose.
</text>
<probability>0.07</probability>
</response>

## Response 3
<response>
<text>
**Design Movement:** Glassmorphic Command Center
**Core Principles:**
- Dark navy base with frosted glass cards — depth without heaviness
- Gradient accents (blue→violet) for interactive elements only
- Progress tracker as a visual centrepiece — users always know where they are
- Interactive config generator as the hero feature of the page

**Color Philosophy:** Deep navy (#0a0e1a) base, glass surfaces with 12% white opacity and 1px white/10% border, blue-to-violet gradient (#4f8ef7→#7c5cbf) for CTAs and highlights. Feels premium and modern without being garish.

**Layout Paradigm:** Single-column with a sticky top progress bar (4 steps). Each step is a collapsible card. The config generator in Step 3 is a mini-app within the page — form inputs + live code preview side by side.

**Signature Elements:**
- Frosted glass cards with subtle inner glow on hover
- Gradient progress connector between steps

**Interaction Philosophy:** Progressive disclosure — sections start collapsed, expand on click. Config generator updates the code preview in real-time as you type. Copy buttons animate to "Copied ✓" with a green flash.

**Animation:** Smooth height transitions (300ms ease) for expand/collapse. Subtle scale(1.01) on card hover. Gradient shimmer on the progress bar.

**Typography System:** `Space Grotesk` for headings and UI labels; `JetBrains Mono` for all code; system-ui for body prose (fast, clean, no font load delay).
</text>
<probability>0.09</probability>
</response>

## Selected Design: Response 3 — Glassmorphic Command Center

Chosen for: deep navy + glass cards creates a premium "financial tool" feel appropriate for a finance SOP. The interactive config generator as a hero feature differentiates this from a plain docs page. Progress tracker gives clear navigation for a multi-step guide.
