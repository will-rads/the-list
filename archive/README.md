# Archived prototypes

V1 and V2 were retired on 2026-09-20. V3 is the only active app in `web/v3/`; this folder is outside the deployed web source.

| Original path | Archived path |
| --- | --- |
| `web/index.html`, `web/venue.html` | `archive/web/index.html`, `archive/web/venue.html` (V1) |
| `web/v2/` | `archive/web/v2/` |
| `web/gallery.html`, `web/mockup-v1.html` | Same names in `archive/web/` |
| `web/brand.html` | `archive/web/brand.html` (Brand Kit V.2) |
| `web/check-venue.mjs` | `archive/web/check-venue.mjs` |

The HTML is preserved unchanged. `archive/web/assets/` contains copies of the seven intro-video/poster and pool-image assets referenced by these prototypes. Active V3 assets remain in `web/assets/`.

To browse the archive, serve `archive/web/` as a static site and open `/` or `/v2/`. React, Tailwind, fonts, and remote images still require internet access. These are historical mock prototypes, not the current product or backend behavior.

Historical plans and prompts retain their original paths; use the mapping above when reading them. V3 and the latest agent docs take precedence. The old checkers remain available at `node archive/web/check-venue.mjs` and `node archive/web/v2/check-v2.mjs`.
