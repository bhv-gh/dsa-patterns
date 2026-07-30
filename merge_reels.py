#!/usr/bin/env python3
"""Merge per-module reel files (docs/reels/<id>.json) into docs/reels.json.

Each per-module file is an array of "content" cards authored by a sub-agent:
  {"type":"concept","heading":..,"body":..}
  {"type":"code","label":..,"code":..}
  {"type":"quiz","q":..,"options":[..],"answer":..,"explain":..}
This stamps stable metadata (id, moduleId, slug, pattern, patternTitle, title) so the
app and bookmarks work. Stable id = "<type>:<moduleId>:<typeIndex>".
Falls back to mechanical generation from the module JSON if a per-module file is
missing or invalid, so reels.json is always complete.
"""
import json, os, sys

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")
MOD = os.path.join(BASE, "modules")
REELS = os.path.join(BASE, "reels")

idx = json.load(open(os.path.join(MOD, "index.json")))
patt_title = {p["id"]: p["title"] for p in idx["patterns"]}

def clip(s, n):
    s = (s or "").strip()
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"

def mechanical(mod):
    """Fallback cards straight from the module JSON."""
    out = []
    secs = mod.get("sections") or []
    chosen = next((s for s in secs if "insight" in s.get("heading", "").lower()), None) or (secs[0] if secs else None)
    if chosen:
        out.append({"type": "concept", "heading": chosen.get("heading", ""), "body": clip(chosen.get("body", ""), 360)})
    if mod.get("code"):
        out.append({"type": "code", "label": "Solution · Python" if mod["type"] == "problem" else "Template · Python", "code": mod["code"]})
    quiz = mod.get("quiz") or []
    if quiz:
        q = quiz[0]
        out.append({"type": "quiz", "q": q["q"], "options": q["options"], "answer": q["answer"], "explain": q.get("explain", "")})
    return out

cards = []
stats = {"authored": 0, "fallback": 0}
for m in idx["modules"]:
    mid = m["id"]
    mod = json.load(open(os.path.join(MOD, f"{mid}.json")))
    raw = None
    p = os.path.join(REELS, f"{mid}.json")
    if os.path.exists(p):
        try:
            data = json.load(open(p))
            if isinstance(data, list) and data:
                raw = data
                stats["authored"] += 1
        except Exception as e:
            print(f"  module {mid}: invalid reels file ({e}); using fallback", file=sys.stderr)
    if raw is None:
        raw = mechanical(mod)
        stats["fallback"] += 1

    counters = {}
    for c in raw:
        t = c.get("type")
        if t not in ("concept", "code", "quiz"):
            continue
        ti = counters.get(t, 0); counters[t] = ti + 1
        card = {
            "id": f"{t}:{mid}:{ti}",
            "type": t,
            "moduleId": mid,
            "slug": m["slug"],
            "pattern": m["pattern"],
            "patternTitle": patt_title.get(m["pattern"], m["pattern"]),
            "title": m["title"],
        }
        if t == "concept":
            card["heading"] = c.get("heading", ""); card["body"] = c.get("body", "")
        elif t == "code":
            code = c.get("code", "")
            # self-heal: if the trimmed snippet doesn't compile (e.g. a bare
            # `return` with no def), fall back to the module's full solution.
            ok = False
            try:
                compile(code, "snip", "exec"); ok = bool(code.strip())
            except SyntaxError:
                ok = False
            if not ok and mod.get("code"):
                code = mod["code"]
                c["label"] = "Solution · Python"
            card["label"] = c.get("label", "Code"); card["code"] = code
        elif t == "quiz":
            if not (isinstance(c.get("answer"), int) and c.get("options") and 0 <= c["answer"] < len(c["options"])):
                continue
            card.update(q=c.get("q", ""), options=c["options"], answer=c["answer"], explain=c.get("explain", ""))
        card["summary"] = mod.get("summary", "")
        cards.append(card)

json.dump({"version": 2, "count": len(cards), "cards": cards},
          open(os.path.join(BASE, "reels.json"), "w"), ensure_ascii=False, indent=1)
from collections import Counter
print(f"reels.json: {len(cards)} cards | {stats['authored']} authored, {stats['fallback']} fallback | types {dict(Counter(c['type'] for c in cards))}")
