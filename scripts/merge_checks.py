"""Merge the homework checks written per week into the one file the site and scripts/check.py read.

  python scripts/merge_checks.py

Every checks/parts/*.json is {"checks": {id: entry, ...}} (optionally "replace": true). New ids are added to
checks/checks.json; an id that is already there is replaced only when its part says "replace": true — otherwise it
only gains the keys it lacks (e.g. new tasks under "tasks"), and a value that differs from the one already there is
kept and reported. Keys starting with "_" (notes) are not merged. The "salt" stays as it is. checks/checks.json is written back in its own format (indent=1, same
line endings) and copied to docs/assets/checks.json, which the site fetches first (same origin, no GitHub needed).
"""
from __future__ import annotations

import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN = os.path.join(ROOT, "checks", "checks.json")
PARTS = os.path.join(ROOT, "checks", "parts", "*.json")
SITE = os.path.join(ROOT, "docs", "assets", "checks.json")


def deep_add(into: dict, extra: dict, path: str, new: list, clash: list) -> None:
    """Copy the keys of extra that into lacks; go down into dicts both have; a different value already there is kept."""
    for k, v in extra.items():
        if k.startswith("_"):
            continue
        here = f"{path}.{k}"
        if k not in into:
            into[k] = v
            new.append(here)
        elif isinstance(into[k], dict) and isinstance(v, dict):
            deep_add(into[k], v, here, new, clash)
        elif into[k] != v:
            clash.append(here)


def main() -> int:
    raw = open(MAIN, "rb").read()
    eol = "\r\n" if b"\r\n" in raw else "\n"
    data = json.loads(raw.decode("utf-8"))
    salt, checks = data["salt"], data.setdefault("checks", {})
    added, replaced, kept = [], [], []
    for path in sorted(glob.glob(PARTS)):
        name = os.path.basename(path)
        try:
            part = json.load(open(path, encoding="utf-8"))
        except ValueError as e:
            print(f"{name}: not valid JSON ({e}) — skipped")
            continue
        if "salt" in part and part["salt"] != salt:
            print(f"{name}: its salt differs from checks.json — its fingerprints will not match; skipped")
            continue
        replace = bool(part.get("replace"))
        for cid, entry in (part.get("checks") or {}).items():
            if cid.startswith("_"):
                continue
            if cid not in checks:
                checks[cid] = {k: v for k, v in entry.items() if not k.startswith("_")} if isinstance(entry, dict) else entry
                added.append(f"{cid} ({name})")
            elif replace:
                if checks[cid] != entry:
                    checks[cid] = entry
                    replaced.append(f"{cid} ({name})")
            else:   # an existing check only gains what it lacks (new tasks); nothing already there is overwritten
                new, clash = [], []
                deep_add(checks[cid], entry, cid, new, clash)
                for p in new:
                    added.append(f"{p} ({name})")
                for p in clash:
                    kept.append(f"{p} ({name})")
    data["salt"] = salt
    text = json.dumps(data, indent=1)
    out = text.replace("\n", eol).encode("utf-8")
    changed = out != raw
    if changed:
        open(MAIN, "wb").write(out)
    os.makedirs(os.path.dirname(SITE), exist_ok=True)
    open(SITE, "wb").write(text.encode("utf-8"))
    print(f"parts: {len(glob.glob(PARTS))} · added {len(added)} · replaced {len(replaced)} · kept {len(kept)} · {len(checks)} checks in all")
    for label, ids in (("added", added), ("replaced", replaced), ("kept (already there, no \"replace\": true)", kept)):
        for i in ids:
            print(f"  {label}: {i}")
    print(("checks/checks.json updated" if changed else "checks/checks.json unchanged") + "; copied to docs/assets/checks.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
