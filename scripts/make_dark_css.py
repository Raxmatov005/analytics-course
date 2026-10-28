"""Build docs/assets/dark.css: the dark twin of every colour rule in the site's own styles (the founder, 2026-10-28:
"add dark mode, and the SQL and coding boxes the same dark and light mode").

Each rule of index.html's inline <style>, theme.css, labs.css, pics.css, videos.css and pyrun.css that sets a colour
gets a twin under html[data-theme="dark"] with every colour turned for a dark page, its hue kept:
  surfaces (background, gradients)  pale -> deep (white -> the card colour); strong colours (buttons, chips) stay
  text (color, fill, caret)         dark -> light; light text (white on a button) stays
  lines (border, outline)           pale -> a dark line; strong colours stay
  shadows                           kept (dark shadows read on a dark page)
"color: var(--brand…)" becomes var(--brand-text), a lighter teal that reads on the dark card.
A region between /* dark:skip */ and /* dark:end */ is left out (theme.css's code colours, which have their own dark
values in dark.css). The hand-made part of dark.css (the variables, Docsify's own theme, the code palette) lives in
scripts/dark_manual.css and is copied in last, so it wins.

  python -I scripts/make_dark_css.py      # rewrites docs/assets/dark.css; run it after any colour change in a .css
"""
import colorsys, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "docs", "assets")
DARK = 'html[data-theme="dark"]'
NAMED = {"white": "#ffffff", "black": "#000000"}
COLOR = re.compile(r"#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b|rgba?\([^)]*\)|\b(?:white|black)\b")


def parse_color(s):
    s = NAMED.get(s, s)
    if s.startswith("#"):
        h = s[1:]
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return r, g, b, a
    nums = [x.strip() for x in s[s.index("(") + 1:-1].replace("/", ",").split(",")]
    r, g, b = (float(x.rstrip("%")) * (2.55 if x.endswith("%") else 1) for x in nums[:3])
    a = float(nums[3].rstrip("%")) / (100 if nums[3].endswith("%") else 1) if len(nums) > 3 else 1.0
    return r, g, b, a


def fmt(r, g, b, a):
    r, g, b = (max(0, min(255, round(x))) for x in (r, g, b))
    return f"#{r:02x}{g:02x}{b:02x}" if a >= 0.999 else f"rgba({r}, {g}, {b}, {a:.3g})"


def turn(s, kind):
    r, g, b, a = parse_color(s)
    h, l, sat = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    pale = l >= 0.7 or (l >= 0.55 and sat < 0.3)   # a strong colour (a button, a red line) keeps its look
    if kind == "surface":
        if pale and sat < 0.15:   # white and greys: the page's own slate card colours (#fff -> about #161b22)
            h, l, sat = 0.59, 0.11 + (1 - l) * 0.55, 0.2
        elif pale:
            l, sat = 0.115 + (1 - l) * 0.55, sat * 0.42
        elif l < 0.16:
            l = 0.2   # a near-black panel (a toast) must still stand off the dark page
    elif kind == "text":
        if l < 0.6:
            l, sat = 0.93 - l * 0.5, min(sat, 0.75)
    elif kind == "line":
        if pale:
            l, sat = 0.2 + (1 - l) * 0.45, sat * 0.5
    else:
        return s
    r2, g2, b2 = colorsys.hls_to_rgb(h, l, sat)
    return fmt(r2 * 255, g2 * 255, b2 * 255, a)


def kind_of(prop):
    p = prop.strip().lower()
    if p in ("color", "caret-color", "-webkit-text-fill-color", "text-decoration-color", "fill", "stroke", "--tk", "accent-color"):
        return "text"
    if p.startswith("background"):
        return "surface"
    if p.startswith("border") or p.startswith("outline") or p == "column-rule":
        return "line"
    return None   # box-shadow, text-shadow, filters: kept


def var_kind(name):
    """a colour variable set on an element (.al-k-learn { --k-xl: … }): by the course's naming, -xl / -l are pale
    grounds, -d is the dark shade used for text, the plain one is the strong accent (kept)"""
    return "surface" if re.search(r"-x?l$", name) else "text" if name.endswith("-d") else None


def dark_decls(body, root=False):
    out = []
    for d in [x.strip() for x in body.split(";") if x.strip()]:
        if ":" not in d or (d.startswith("--") and root):
            continue
        prop, val = d.split(":", 1)
        k = var_kind(prop.strip()) if prop.strip().startswith("--") else kind_of(prop)
        if not k:
            continue
        m = re.match(r"\s*var\(--([\w-]+)\)\s*(!important)?\s*$", val)
        if m and k == "text" and not prop.strip().startswith("--") and not m.group(1).endswith("-d") and not m.group(1).startswith(
                ("ink", "body", "muted", "faint", "brand", "code", "tk-", "line", "card", "bg")):
            # a strong accent used as text (.gx-kicker { color: var(--g) }): lighter, so it reads on the dark card
            out.append(f"{prop.strip()}: color-mix(in srgb, var(--{m.group(1)}) 55%, #ffffff){' !important' if m.group(2) else ''}")
            continue
        if m and k == "surface" and m.group(1) == "ink":
            out.append(f"{prop.strip()}: #2f3a47")   # a dark chip under white text: ink itself turns light in the dark
            continue
        if k == "text" and re.search(r"var\(--brand(?:-d)?\b", val) and not COLOR.search(val.split("var(", 1)[0]):
            out.append(f"{prop.strip()}: var(--brand-text){' !important' if '!important' in val else ''}")
            continue
        if not COLOR.search(val) or "var(--" in val and not COLOR.search(re.sub(r"var\([^)]*\)", "", val)):
            # nothing to turn (background: none, border: 0, var(--card)): kept as it is, so this rule still outranks
            # the dark twin of a broader rule, as it does on the light page (.si-door .si-card over .si-card)
            if not prop.strip().startswith("--"):
                out.append(f"{prop.strip()}: {val.strip()}")
            continue
        new = COLOR.sub(lambda m: turn(m.group(0), k), re.sub(r"var\((--[\w-]+),\s*([^)]+)\)", r"var(\1)", val))
        out.append(f"{prop.strip()}: {new.strip()}")   # every colour line, turned or not: the same cascade as the light page
    return out


def prefix(sel):
    parts, depth, cur = [], 0, ""
    for ch in sel:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur); cur = ""
        else:
            cur += ch
    parts.append(cur)
    res = []
    for p in (x.strip() for x in parts):
        if p.startswith(":root"):
            res.append(DARK + p[5:])
        elif re.match(r"html\b", p):
            res.append(DARK + p[4:])
        else:
            res.append(f"{DARK} {p}")
    return ", ".join(res)


def blocks(css):
    """[(selector, body)] and ("@media …", [inner]) at one level; comments and @keyframes left out."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    i, out = 0, []
    while True:
        j = css.find("{", i)
        if j < 0:
            break
        sel = css[i:j].strip()
        depth, k = 1, j + 1
        while depth and k < len(css):
            depth += {"{": 1, "}": -1}.get(css[k], 0); k += 1
        inner = css[j + 1:k - 1]
        if sel.startswith("@media") or sel.startswith("@supports"):
            out.append((sel, blocks(inner)))
        elif not sel.startswith("@"):
            out.append((sel, inner))
        i = k
    return out


def emit(bl, ind=""):
    lines = []
    for sel, body in bl:
        if isinstance(body, list):
            inner = emit(body, ind + "  ")
            if inner:
                lines.append(f"{ind}{sel} {{"); lines += inner; lines.append(f"{ind}}}")
            continue
        ds = dark_decls(body, root=":root" in sel)
        if ds:
            lines.append(f"{ind}{prefix(sel)} {{ {'; '.join(ds)}; }}")
    return lines


def source(name):
    p = os.path.join(ROOT, "docs", name) if name == "index.html" else os.path.join(A, name)
    t = open(p, encoding="utf-8").read()
    if name == "index.html":
        t = "\n".join(re.findall(r"<style>(.*?)</style>", t, re.S))
    return re.sub(r"/\* dark:skip \*/.*?/\* dark:end \*/", "", t, flags=re.S)


head = open(os.path.join(ROOT, "scripts", "dark_manual.css"), encoding="utf-8").read()
out = ["/* GENERATED by scripts/make_dark_css.py — edit scripts/dark_manual.css or the light styles, then run it again. */", ""]
for name in ("index.html", "theme.css", "labs.css", "pics.css", "videos.css", "pyrun.css"):
    lines = emit(blocks(source(name)))
    out += [f"/* ---------- {name} ({len(lines)} rules) ---------- */"] + lines + [""]
out += ["/* ---------- by hand (scripts/dark_manual.css): last, so it wins ---------- */", head.strip(), ""]
open(os.path.join(A, "dark.css"), "w", encoding="utf-8", newline="\n").write("\n".join(out))
print("dark.css:", sum(1 for x in out if x.startswith(DARK) or x.startswith("  " + DARK)), "rules")
