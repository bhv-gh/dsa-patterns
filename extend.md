# extend.md — Runbook: turn new PDFs into app modules

> **You are an AI coding agent.** The user has dropped one or more new `*.pdf` files into
> this folder (`/Users/bhv/Documents/personal/HI`) and pointed you here. Follow this file
> **exactly**, top to bottom. At the end you **must** update the Ledger in this file and
> redeploy. Do not skip the "Update this file" or "Deploy" steps.

---

## 0. What this project is

A mobile-first, installable **PWA** ("DSA Patterns") for studying coding-interview
lessons offline. Live: **https://bhv-gh.github.io/dsa-patterns/**

- App lives in `docs/` (served by GitHub Pages from `main` branch `/docs`).
- Each lesson = one JSON **module** in `docs/modules/<id>.json`.
- `docs/modules/index.json` is the catalog the app reads.
- `docs/sw.js` precaches every module for offline use.
- Source PDFs and `.extracted/` raw text are **git-ignored** (kept private). Never commit them.

### Locked-in content decisions (keep consistent unless the user says otherwise)
- **Depth:** distilled + quiz (tight summary → step-by-step → complexity → code → 1–3 quiz Qs).
- **Code language:** **Python**.
- **Tone:** concise, phone-friendly.

---

## 1. Figure out what's new

1. List PDFs: `ls *.pdf`.
2. Read the **Ledger** (bottom of this file). Any `*.pdf` **not** already listed there is new work.
3. Assign each new PDF a **module id** = the next free integer after the current max id in the Ledger.
   (IDs need not match the PDF filename.)

If nothing is new, tell the user and stop.

---

## 2. Extract text from each new PDF

No system `pdftotext`/poppler here; use `uv` + `pypdf` (works offline after first fetch):

```bash
mkdir -p .extracted
uv run --with pypdf python - << 'EOF'
import glob, os
from pypdf import PdfReader
for pdf in glob.glob("*.pdf"):
    stem = os.path.splitext(os.path.basename(pdf))[0]
    out = f".extracted/{stem}.txt"
    if os.path.exists(out):   # skip already-extracted
        continue
    r = PdfReader(pdf)
    open(out,"w").write("\n".join((p.extract_text() or "") for p in r.pages))
    print("extracted", pdf, "->", len(r.pages), "pages")
EOF
```

> PDF text often has mangled spacing (e.g. `T w o  P o i n t e r s` = "Two Pointers").
> The sub-agents below must fix that.

Skim each new `.extracted/*.txt` to identify: **title, pattern/topic, type (intro/lesson/problem),
difficulty**. Group problems under the right pattern. If a brand-new pattern appears
(not Two Pointers / Sliding Window), add it to `docs/modules/index.json` `patterns[]`
(id = kebab-case, plus a one-line `blurb`).

---

## 3. Dispatch ONE sub-agent per new PDF (in parallel)

Use the Agent tool, `subagent_type: general-purpose`, `model: sonnet`, one call per PDF,
all in a single message so they run concurrently. Give each agent this prompt (fill the `<...>`):

```
You are distilling one lesson from a coding-interview course into a JSON study module
for an offline mobile learning app.

SOURCE: Read /Users/bhv/Documents/personal/HI/.extracted/<STEM>.txt — raw PDF text with
mangled spacing (fix it, e.g. "T w o" -> "Two"). Ignore page footers, "Desktop Required"
notices, timestamps, and URLs.

This is module id=<ID>, "<TITLE>" (<PATTERN>, <DIFFICULTY or lesson/intro>).

Write valid JSON to /Users/bhv/Documents/personal/HI/docs/modules/<ID>.json using EXACTLY
this schema (see SCHEMA below). Distill aggressively for phone study. Python code only.
For a PROBLEM: include correct, runnable Python (def + short docstring), 3-6 ordered
"approach" steps, complexity, and 2-3 quiz questions (4 options each, 0-based "answer",
"explain"). For a LESSON: "code" is a reusable Python template, "approach" is recognition
cues; 2 quiz Qs. For an INTRO: code=null, complexity=null.

Markdown allowed in section "body": **bold**, `inline code`, "- " bullet lists, \n newlines.
Output ONLY the JSON file. It MUST be valid JSON (double quotes, no trailing commas, no
comments; escape newlines inside strings as \n). Reply with one line: "<ID>.json done - <TITLE>".
```

### SCHEMA (every module file must match this)
```json
{
  "id": 17,
  "slug": "kebab-case-slug",
  "title": "Human Title",
  "pattern": "two-pointers | sliding-window | <new-pattern-id> | intro",
  "type": "problem | lesson | intro",
  "difficulty": "easy | medium | hard | null",
  "summary": "<=140 char one-liner",
  "sections": [ { "heading": "Problem", "body": "concise markdown" } ],
  "approach": ["ordered steps (problems) OR recognition cues (lessons)"],
  "complexity": { "time": "O(...)", "space": "O(...)" },
  "code": "python string, or null for intro",
  "quiz": [ { "q": "...", "options": ["a","b","c","d"], "answer": 0, "explain": "why" } ]
}
```

---

## 3b. Add a visualization per new module (optional but encouraged)

Each non-intro module can have an **interactive visualization** that explains its core idea.
They use a shared framework — authors only compute *frames*, never touch the DOM.

- Framework: `docs/anim/_framework.js` (read its header for the full API + FRAME schema).
- One file per module: `docs/anim/<slug>.js`, which calls
  `DSAAnim.register('<slug>', function(container){ DSAAnim.render(container, {mode, values, frames, ...}); })`.
- The app auto-loads `./anim/<slug>.js` for a module whose slug matches a registered key.
- **Not everything needs to be interactive** — build the ONE visualization that best explains
  the idea; skip it if a module doesn't benefit.

Dispatch one sub-agent per new module with a prompt that (1) tells it to READ
`docs/anim/_framework.js` first, (2) specifies `mode` ('bars' for height/water problems,
'cells' for arrays/strings), a concrete sample input, and what to highlight, and (3) says
"SIMULATE the algorithm to produce correct frames." Require: vanilla JS, no imports/network,
must pass `node --check`, register key == slug.

**Verify animations run** (catches infinite loops in frame generation — a real risk):
```bash
cd /Users/bhv/Documents/personal/HI/docs/anim
for f in *.js; do node --check "$f" || echo "SYNTAX $f"; done
# then run each through a mock DOM (see the harness pattern used previously) with a
# frame-count guard (throw if cfg.frames.length > 500) to surface runaway while-loops.
```

Then in `docs/sw.js`, add each new `./anim/<slug>.js` to the `ANIM` list and bump the cache
version. Every non-intro module's anim file must be precached for offline use.

---

## 4. Verify (do NOT skip)

```bash
cd /Users/bhv/Documents/personal/HI/docs/modules
# 4a. all module JSON valid + quiz answers in range
uv run python - << 'EOF'
import json, glob, os
for f in sorted(glob.glob("[0-9]*.json"), key=lambda x:int(os.path.splitext(x)[0])):
    d=json.load(open(f))
    for q in d.get("quiz",[]):
        a=q.get("answer"); n=len(q.get("options",[]))
        assert isinstance(a,int) and 0<=a<n, f"{f}: bad quiz answer"
    assert d.get("code") is None or __import__("py_compile") or True
    if d.get("code"): compile(d["code"], f, "exec")   # Python must compile
print("all modules valid + code compiles")
EOF
```

Then **regenerate `docs/modules/index.json`** so it lists every module in display order
(intro first, then each pattern's lessons/problems in a sensible learning order):

```bash
cd /Users/bhv/Documents/personal/HI/docs/modules
uv run python - << 'EOF'
import json, glob, os
mods=[]
for f in sorted(glob.glob("[0-9]*.json"), key=lambda x:int(os.path.splitext(x)[0])):
    d=json.load(open(f))
    mods.append({k:d.get(k) for k in ("id","slug","title","pattern","type","difficulty","summary")})
idx=json.load(open("index.json"))
idx["modules"]=mods                       # keep existing patterns[]; add new ones if needed
json.dump(idx, open("index.json","w"), indent=2, ensure_ascii=False)
print("index.json now lists", len(mods), "modules")
EOF
```
> If you added a new pattern, make sure `index.json` `patterns[]` contains it, and that
> module order within a pattern makes pedagogical sense (guide/overview before problems,
> easy → hard). Reorder the `sorted(...)` or post-sort `mods` if needed.

Finally, **update the service worker** `docs/sw.js`:
- The line `Array.from({ length: 16 }, ...)` assumes module ids are `1..N` contiguous.
  If your ids are contiguous, change `16` to the new **max id**.
  If ids are NOT contiguous, replace that line with an explicit list of `./modules/<id>.json`.
- **Bump the cache version**: change `const CACHE = 'dsa-patterns-v1'` to `...-v2`, `-v3`, …
  (this forces clients to re-cache the new content).

Quick smoke test locally (optional but preferred):
```bash
cd /Users/bhv/Documents/personal/HI/docs && python3 -m http.server 8765 &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765/modules/index.json
```

---

## 5. Update THIS file (mandatory)

Add a row to the **Ledger** below for every PDF you just converted:
`| <pdf filename> | <id> | <slug> | <pattern> | <type/difficulty> |`
Also update **Max module id** and the **Last updated** date. Keep the table sorted by id.

---

## 6. Deploy

**Bump the version** so users can confirm they're on the latest: increment `APP_VERSION`
in `docs/app.js` AND `CACHE` in `docs/sw.js` to the same new value (e.g. `v4` → `v5`).
The value shows as a chip in the app's top bar; the refresh button clears caches to fetch it.

GitHub Pages rebuilds automatically on push to `main`:
```bash
cd /Users/bhv/Documents/personal/HI
git add -A                       # .gitignore keeps *.pdf and .extracted/ out
git ls-files | grep -Ei '\.pdf$|\.extracted/' && echo "STOP: private files staged" || true
git -c user.name="bhv-gh" -c user.email="bhv-gh@users.noreply.github.com" \
    commit -m "Add modules <ids> from new PDFs"
git push
```
Then confirm it's live (build takes ~1 min):
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://bhv-gh.github.io/dsa-patterns/modules/index.json
```
Tell the user the live URL and which modules were added.

---

## Ledger — PDFs already converted to modules

**Max module id:** 67
**Last updated:** 2026-07-29

| PDF        | id | slug                                  | pattern        | type / difficulty |
|------------|----|---------------------------------------|----------------|-------------------|
| 1.pdf      | 1  | intro                                 | intro          | intro             |
| 2.pdf      | 2  | two-pointers-overview                 | two-pointers   | lesson            |
| 3.pdf      | 3  | container-with-most-water             | two-pointers   | problem / medium  |
| 4.pdf      | 4  | two-sum-sorted                        | two-pointers   | problem / medium  |
| 5.pdf      | 5  | 3-sum                                 | two-pointers   | problem / medium  |
| 6.pdf      | 6  | valid-triangle-number                 | two-pointers   | problem / medium  |
| 7.pdf      | 7  | move-zeroes                           | two-pointers   | problem / easy    |
| 8.pdf      | 8  | sort-colors                           | two-pointers   | problem / medium  |
| 9.pdf      | 9  | trapping-rain-water                   | two-pointers   | problem / hard    |
| 10.pdf     | 10 | fixed-length-sliding-window           | sliding-window | lesson            |
| 11.pdf     | 11 | max-sum-subarrays-size-k              | sliding-window | problem / easy    |
| 12.pdf     | 12 | max-points-from-cards                 | sliding-window | problem / medium  |
| 13.pdf     | 13 | max-sum-distinct-subarrays-k          | sliding-window | problem / medium  |
| 14.pdf     | 14 | variable-length-sliding-window        | sliding-window | lesson            |
| 15.pdf     | 15 | longest-substring-no-repeat           | sliding-window | problem / medium  |
| 16.pdf     | 16 | longest-repeating-char-replacement    | sliding-window | problem / medium  |
| 17.pdf     | 17 | intervals-overview                    | intervals      | lesson            |
| 18.pdf     | 18 | can-attend-meetings                   | intervals      | problem / easy    |
| 19.pdf     | 19 | insert-interval                       | intervals      | problem / medium  |
| 20.pdf     | 20 | non-overlapping-intervals             | intervals      | problem / medium  |
| 21.pdf     | 21 | merge-intervals                       | intervals      | problem / medium  |
| 22.pdf     | 22 | employee-free-time                    | intervals      | problem / hard    |
| 23.pdf     | 23 | stack-overview                        | stack          | lesson            |
| 24.pdf     | 24 | valid-parentheses                     | stack          | problem / easy    |
| 25.pdf     | 25 | decode-string                         | stack          | problem / medium  |
| 26.pdf     | 26 | longest-valid-parentheses             | stack          | problem / hard    |
| 27.pdf     | 27 | monotonic-stack                       | stack          | lesson            |
| 28.pdf     | 28 | daily-temperatures                    | stack          | problem / medium  |
| 29.pdf     | 29 | largest-rectangle-in-histogram        | stack          | problem / hard    |
| 30.pdf     | 30 | linked-list-overview                  | linked-list    | lesson            |
| 31.pdf     | 31 | linked-list-cycle                     | linked-list    | problem / easy    |
| 32.pdf     | 32 | palindrome-linked-list                | linked-list    | problem / easy    |
| 33.pdf     | 33 | remove-nth-node-from-end              | linked-list    | problem / medium  |
| 34.pdf     | 34 | reorder-list                          | linked-list    | problem / medium  |
| 35.pdf     | 35 | swap-nodes-in-pairs                   | linked-list    | problem / medium  |
| 36.pdf     | 36 | binary-search-overview                | binary-search  | lesson            |
| 37.pdf     | 37 | koko-eating-bananas                    | binary-search  | problem / medium  |
| 38.pdf     | 38 | search-in-rotated-sorted-array        | binary-search  | problem / medium  |
| 39.pdf     | 39 | split-array-largest-sum               | binary-search  | problem / hard    |
| 40.pdf     | 40 | kth-smallest-in-sorted-matrix         | binary-search  | problem / medium  |
| 41.pdf     | 41 | minimum-shipping-capacity             | binary-search  | problem / medium  |
| 42.pdf     | 42 | heap-overview                         | heap           | lesson            |
| 43.pdf     | 43 | kth-largest-element                   | heap           | problem / medium  |
| 44.pdf     | 44 | k-closest-points-to-origin            | heap           | problem / medium  |
| 45.pdf     | 45 | find-k-closest-elements               | heap           | problem / medium  |
| 46.pdf     | 46 | merge-k-sorted-lists                  | heap           | problem / hard    |
| 47.pdf     | 47 | find-median-from-data-stream          | heap           | problem / hard    |
| 48.pdf     | 48 | dfs-introduction                      | depth-first-search | lesson        |
| 49.pdf     | 49 | dfs-fundamentals                      | depth-first-search | lesson        |
| 50.pdf     | 50 | dfs-return-values                     | depth-first-search | lesson        |
| 51.pdf     | 51 | maximum-depth-of-binary-tree          | depth-first-search | problem / easy |
| 52.pdf     | 52 | path-sum                              | depth-first-search | problem / easy |
| 53.pdf     | 53 | dfs-helper-functions                  | depth-first-search | lesson        |
| 54.pdf     | 54 | validate-binary-search-tree           | depth-first-search | problem / medium |
| 55.pdf     | 55 | calculate-tilt                        | depth-first-search | problem / easy |
| 56.pdf     | 56 | diameter-of-binary-tree               | depth-first-search | problem / easy |
| 57.pdf     | 57 | path-sum-ii                           | depth-first-search | problem / medium |
| 58.pdf     | 58 | longest-univalue-path                 | depth-first-search | problem / medium |
| 59.pdf     | 59 | graphs-overview                       | depth-first-search | lesson        |
| 60.pdf     | 60 | adjacency-list                        | depth-first-search | lesson        |
| 61.pdf     | 61 | copy-graph                            | depth-first-search | problem / easy |
| 62.pdf     | 62 | graph-valid-tree                      | depth-first-search | problem / medium |
| 63.pdf     | 63 | matrices-grid-dfs                     | depth-first-search | lesson        |
| 64.pdf     | 64 | flood-fill                            | depth-first-search | problem / easy |
| 65.pdf     | 65 | number-of-islands                     | depth-first-search | problem / medium |
| 66.pdf     | 66 | surrounded-regions                    | depth-first-search | problem / medium |
| 67.pdf     | 67 | pacific-atlantic-water-flow           | depth-first-search | problem / medium |
