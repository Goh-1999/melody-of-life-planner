# Melody Of Life 17 Planner — JS Refactor


## Goal

Split the existing legacy script by responsibility without doing a broad feature rewrite in the same step.

## Structure

```text
melody-of-life-17-planner/
├── data/
│   └── MelodyOfLife17.xlsx
├── core/
│   ├── config-runtime.js
│   ├── state.js
│   ├── utils.js
│   ├── data.js
│   ├── filters.js
│   ├── time.js
│   └── status.js
├── ui/
│   ├── transition.js
│   ├── refresh.js
│   ├── status.js
│   ├── filters.js
│   ├── artists.js
│   ├── nowPlaying.js
│   ├── schedule.js
│   ├── conflict.js
│   ├── realtime.js
│   ├── simulation.js
│   ├── export.js
│   └── popup.js
├── app.js
├── dev/
├── tester/
├── production/
└── legacy/
    └── script.js
```

Keep the project's existing `core/config.js`, `core/artistData.js`, and `core/theme.js`; this package does not replace those files.

Use `SCRIPT_LOAD_ORDER.txt` when wiring the new HTML files.

`legacy/script.js` is the original uploaded source for rollback/comparison.
