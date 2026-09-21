# Commonwealth

## Research inbox

Open [the research inbox](pipeline/inbox.html) to browse checked candidates for future editions. The [pipeline guide](pipeline/README.md) explains the weekly Codex research run, duplicate checks, review decisions and publishing handoff. Research intake does not automatically change the website collection. The public GitHub repository stores the queue; Codex hosts the schedule.

A paper-inspired hub for discovering creative projects, technology, and businesses. Edition 001 features a tear-off noticeboard, a searchable collection of 19 ideas, historical project locations, and a personal saved collection.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8080. No build step or package installation is required. Any static host can serve this directory; hosting has not been configured or published.

## Interactions

- Pull a featured tab downward, or click/tap/press Enter to reveal a project.
- Save and remove ideas; favorites persist in this browser's local storage. No accounts or cloud synchronization.
- Search by text and filter by theme. An empty result provides a reset action.
- Explore a schematic map of three historical/regional references. Pins are not claims of current exhibitions; links open geographic context in OpenStreetMap.
- Project details include source links, attribution, and editorial prompts.
- Native dialog supports Escape, focus containment, and backdrop dismissal. Reduced-motion preferences skip the tear animation.

## Editing

- `data.js`: projects, sources, themes, featured order (first four), and places.
- `styles.css`: paper treatments, responsive layouts, and animation.
- `app.js`: rendering, filters, saving, modal, and pointer interactions.
- `research/`: both original reference collections, preserved separately.

All line drawings are original SVG illustrations; they are representative, not official product images. System serif and sans-serif font stacks work offline, with no remote font requests. No analytics, geolocation, or backend. Content is a curated initial edition, not an automated weekly feed. Research was checked September 2026 and should be rechecked before presenting live visiting information.
