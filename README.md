# DSA Patterns — Interview Prep PWA

A mobile-first, installable **Progressive Web App** for studying the most important
coding-interview patterns on the go. Works **fully offline** once loaded.

Each lesson is a self-contained **module** (distilled notes → step-by-step approach →
complexity → Python solution → self-check quiz), organized into two pattern tracks:

- **Two Pointers** — overview + 7 problems
- **Sliding Window** — 2 pattern guides + 4 problems

## Features

- 📱 Installable PWA (Add to Home Screen) with app icon and standalone display
- 🔌 Offline-first — a service worker precaches the shell and all lesson data
- ✅ Progress tracking saved locally (localStorage)
- 🎬 Step-through visualizations per lesson (play / step / scrub) via a shared `DSAAnim` framework
- 🧠 Interactive quizzes with explanations
- 🌗 Dark / light theme
- ⚡ Zero build step — plain HTML/CSS/JS

## Structure

```
docs/                     ← served by GitHub Pages
  index.html
  app.js                  ← router, rendering, quiz, progress, PWA glue
  styles.css
  sw.js                   ← service worker (offline cache)
  manifest.webmanifest
  icons/
  modules/
    index.json            ← module catalog
    1.json … 16.json      ← one module per lesson
```

## Run locally

```bash
cd docs
python3 -m http.server 8000
# open http://localhost:8000
```

(A local server is required — service workers don't run from `file://`.)

## Deploy

Published via **GitHub Pages** from the `/docs` folder on the `main` branch.

## Adding / editing modules

Modules are data-driven. To add a lesson, drop a new `docs/modules/<id>.json`
(matching the existing schema), add it to `docs/modules/index.json`, and bump the
file list + cache version in `docs/sw.js`.

---

*Study content is distilled from the HelloInterview "Learn DSA Through Visualizations"
course for personal study. Source PDFs are intentionally excluded from this repository.*
