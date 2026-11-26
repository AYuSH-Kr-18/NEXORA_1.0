# Editing guide: v1-retro (original synthwave version)

Run: `npm install` once, then `npm run dev`, then open http://localhost:5173

| I want to change… | File |
|---|---|
| Fest name, dates, venue, events, fees, prizes, schedule, FAQ, contacts, UPI ID | `src/data/event.js` |
| Intro timing (loader, liquid reveal, HUD) | `src/lib/clock.js` → `T` |
| Loader text, micro-labels, tips | `src/components/Loader.jsx` |
| Hero title, strip, countdown, buttons | `src/components/Hero.jsx` + `hero.css` |
| Sunset sky, sun stripes, skyline, sea, liquid look | `src/gl/display.glsl.js` (shader) |
| Liquid behaviour (cursor trail strength, intro flood) | `src/gl/fluid.js` (`pointerSplats`, `introSplats`, `cfg`) |
| Palm trees | `src/components/Palms.jsx` |
| Colours and fonts | `src/styles/base.css` `:root` |
| "Mission passed! Respect ++" graphic (Pricedown, outlined SVG) | `public/mission-passed.svg`. Regenerate with `node ../cook/tools/sa-title.mjs <Pricedown.otf> public/mission-passed.svg` (free Pricedown from typodermicfonts.com; the font file itself must NOT be added to the site: licence allows images only) |
| Mission passed screen (smooth fade in/out + background blur, 4.4s) | `src/components/MissionPassed.jsx` + `.mp` styles and `@keyframes mpFade` in `src/components/wanted.css`. Graphic: `public/mission-passed.svg` |
| Cheat codes + achievement popups | `src/components/Achievement.jsx` (`CHEATS`) + `src/lib/achievements.js` (`ACHIEVEMENTS`) |
| GTA wanted stars, BUSTED, MISSION PASSED | `src/lib/wanted.js`, `src/components/WantedHud.jsx`, `src/pages/Pass.jsx` |
| Register / pay / pass | `src/pages/*.jsx`, `src/styles/flow.css` |
| Backend hook-up | `src/api/index.js` only |

URL tricks:
- `?intro=1` replays the intro.
- `?t=3000` freezes the intro at 3 seconds.
- `?trail=1` adds a scripted cursor trail (for screenshots).
