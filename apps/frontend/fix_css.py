import re

with open("/Users/juberry/Documents/Dev Camp/fessior-oj-backend/apps/frontend/src/index.css", "r") as f:
    css = f.read()

# Isolate the roadmap css section
roadmap_start = css.find(".roadmap-page {")
if roadmap_start == -1:
    print("Could not find .roadmap-page")
    exit(1)

roadmap_end = css.find("/* ─────────────────────────────────────────────────────────────────────────────", roadmap_start)
if roadmap_end == -1:
    roadmap_end = len(css)

roadmap_css = css[roadmap_start:roadmap_end]

# Make changes to roadmap_css
# 1. Center the toolbar
roadmap_css = roadmap_css.replace("justify-content: space-between;", "justify-content: center;", 1)

# 2. Update colors to use dark mode CSS variables
replacements = {
    "color: #101827;": "color: var(--color-linen);",
    "color: #111827;": "color: var(--color-linen);",
    "background: #fff;": "background: var(--color-washi);",
    "background: #f9fafb;": "background: var(--color-ink);",
    "border: 1px solid #111827;": "border: 1px solid var(--color-charcoal);",
    "border: 1px solid #1f2937;": "border: 1px solid var(--color-charcoal);",
    "border: 1px solid #e5e7eb;": "border: 1px solid var(--color-charcoal);",
    "border: 1px solid #d1d5db;": "border: 1px solid var(--color-charcoal);",
    "border: 1px dashed #cbd5e1;": "border: 1px dashed var(--color-charcoal);",
    "border-bottom: 1px solid #111827;": "border-bottom: 1px solid var(--color-charcoal);",
    "border-bottom: 1px solid #cbd5e1;": "border-bottom: 1px solid var(--color-charcoal);",
    "border-top-color: #111827;": "border-top-color: var(--color-charcoal);",
    "border-right: 1px solid #d1d5db;": "border-right: 1px solid var(--color-charcoal);",
    "border-top: 1px solid #d1d5db;": "border-top: 1px solid var(--color-charcoal);",
    "background: #e5e7eb;": "background: var(--color-charcoal);",
    "background: #e5f4ff;": "background: var(--color-ink);",
    "color: #475569;": "color: var(--color-stone);",
    "color: #64748b;": "color: var(--color-stone);",
    "color: #94a3b8;": "color: var(--color-stone);",
    "background: #c7ced8;": "background: var(--color-charcoal);",
    "color: #13233b;": "color: var(--color-linen);",
    "background: #f59e0b;": "background: var(--color-vermilion);",
    "border-color: #f59e0b;": "border-color: var(--color-vermilion);",
    "box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.14);": "box-shadow: 0 0 0 3px rgba(216, 58, 44, 0.14);",
    "box-shadow: inset 0 0 0 4px #fff;": "box-shadow: inset 0 0 0 4px var(--color-washi);",
}

for old, new in replacements.items():
    roadmap_css = roadmap_css.replace(old, new)

# Write back
new_css = css[:roadmap_start] + roadmap_css + css[roadmap_end:]
with open("/Users/juberry/Documents/Dev Camp/fessior-oj-backend/apps/frontend/src/index.css", "w") as f:
    f.write(new_css)

print("Updated index.css")
