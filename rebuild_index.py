#!/usr/bin/env python3
"""Rebuild docs/modules/index.json from every docs/modules/<id>.json.

Keeps existing patterns[] and appends any new ones declared below, in the order
modules should appear. Run after adding modules (see extend.md step 4).
"""
import json, glob, os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs", "modules")

# new patterns to ensure exist (id -> title, blurb); appended if not already present
NEW_PATTERNS = [
    {"id": "breadth-first-search", "title": "Breadth-First Search",
     "blurb": "Explore level by level with a queue — the go-to for shortest paths in unweighted graphs and grids."},
    {"id": "backtracking", "title": "Backtracking",
     "blurb": "Choose, explore, un-choose — search a tree of partial solutions and prune branches that can't work."},
    {"id": "graphs", "title": "Graph Algorithms",
     "blurb": "Topological sort for ordering DAGs, plus Dijkstra / Bellman-Ford for weighted shortest paths."},
    {"id": "dynamic-programming", "title": "Dynamic Programming",
     "blurb": "Break a problem into overlapping subproblems, solve each once, and reuse — memoize or tabulate."},
    {"id": "greedy", "title": "Greedy",
     "blurb": "Take the locally best choice at each step — fast and simple when the greedy-choice property holds."},
    {"id": "trie", "title": "Trie",
     "blurb": "A prefix tree for fast prefix lookups, autocomplete, and word-set membership."},
    {"id": "prefix-sum", "title": "Prefix Sum",
     "blurb": "Precompute cumulative sums so any range query answers in O(1) — plus the hashmap counting trick."},
    {"id": "matrices", "title": "Matrices",
     "blurb": "In-place 2D manipulation — spiral traversal, rotation, and marker tricks for O(1) extra space."},
]

mods = []
for f in sorted(glob.glob(os.path.join(BASE, "[0-9]*.json")),
                key=lambda x: int(os.path.splitext(os.path.basename(x))[0])):
    d = json.load(open(f))
    mods.append({k: d.get(k) for k in ("id", "slug", "title", "pattern", "type", "difficulty", "summary")})

idx = json.load(open(os.path.join(BASE, "index.json")))
existing = {p["id"] for p in idx["patterns"]}
for p in NEW_PATTERNS:
    if p["id"] not in existing:
        idx["patterns"].append(p)
idx["modules"] = mods
json.dump(idx, open(os.path.join(BASE, "index.json"), "w"), indent=2, ensure_ascii=False)

used = {m["pattern"] for m in mods}
declared = {p["id"] for p in idx["patterns"]}
missing = used - declared - {"intro"}
print(f"index.json: {len(mods)} modules, {len(idx['patterns'])} patterns")
if missing:
    print("  WARNING: modules reference undeclared patterns:", missing)
