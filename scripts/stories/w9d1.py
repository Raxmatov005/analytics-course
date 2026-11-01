"""Week 9 Day 1 (correlation and linear regression) as eight ```story blocks, English and Russian from one source (the founder, 2026-11-01).
Build once: python -I scripts/stories/rebuild.py w9d1 · after that: python -I scripts/stories/apply.py w9d1.
Pictures: scatter and arrows (docs/assets/story6.js). Numbers: the page, or computed with Python on data/raw/loans.csv
(payments in m soum here; the page's thousand-soum numbers are the same divided by 1 000)."""
from common import build as _b, btn

# all 391 Auto loans (product 4), sorted by principal: [principal m (1 dp), payment m (3 dp), term 0 = 24 / 1 = 36 / 2 = 48 months]
# r 0.893, slope 41.49 thousand per 1 m, intercept −12.1 thousand, R² 0.797; average residual +2.48 / −0.47 / −1.95 m by term
A391 = [
    [50.3, 1.973, 1], [50.4, 2.663, 0], [50.9, 1.995, 1], [51.7, 2.03, 1], [52.0, 2.751, 0], [53.4, 2.822, 0], [56.0, 2.198, 1], [56.4, 1.838, 2], [57.0, 2.236, 1], [57.4, 2.251, 1], [60.5, 2.373, 1], [60.5, 3.199, 0],
    [60.6, 3.206, 0], [62.4, 2.034, 2], [63.2, 2.059, 2], [63.9, 2.506, 1], [65.9, 2.586, 1], [68.9, 3.642, 0], [69.5, 2.265, 2], [70.5, 2.297, 2], [70.7, 3.739, 0], [71.2, 3.765, 0], [72.2, 3.815, 0], [72.7, 2.37, 2],
    [73.5, 3.884, 0], [75.4, 3.988, 0], [75.9, 2.979, 1], [76.4, 4.042, 0], [77.0, 3.023, 1], [77.3, 2.522, 2], [78.7, 2.565, 2], [78.8, 2.57, 2], [80.3, 3.151, 1], [80.4, 3.155, 1], [80.4, 3.155, 1], [80.4, 2.623, 2],
    [81.1, 2.645, 2], [82.5, 4.364, 0], [84.5, 2.753, 2], [84.7, 4.479, 0], [84.8, 3.327, 1], [85.5, 4.518, 0], [87.6, 2.857, 2], [88.0, 3.452, 1], [88.2, 4.662, 0], [89.1, 2.905, 2], [89.9, 3.526, 1], [89.9, 4.753, 0],
    [92.4, 3.625, 1], [92.6, 3.632, 1], [96.3, 3.14, 2], [96.6, 5.108, 0], [98.2, 3.2, 2], [98.3, 5.199, 0], [98.4, 5.201, 0], [100.0, 5.288, 0], [101.7, 3.315, 2], [103.4, 3.372, 2], [104.4, 4.096, 1], [105.8, 3.45, 2],
    [106.0, 4.159, 1], [106.6, 3.474, 2], [108.2, 3.529, 2], [110.6, 4.338, 1], [112.0, 3.652, 2], [112.7, 5.957, 0], [113.7, 3.705, 2], [114.4, 6.05, 0], [115.6, 6.11, 0], [116.3, 3.793, 2], [116.5, 6.16, 0], [116.8, 3.807, 2],
    [118.3, 4.64, 1], [118.7, 4.657, 1], [119.4, 3.892, 2], [119.7, 6.331, 0], [120.1, 4.711, 1], [121.4, 3.959, 2], [123.7, 6.54, 0], [124.3, 4.052, 2], [124.3, 4.877, 1], [125.0, 6.608, 0], [125.1, 6.615, 0], [125.1, 4.08, 2],
    [125.2, 4.913, 1], [125.8, 4.936, 1], [128.5, 5.043, 1], [128.6, 5.046, 1], [128.7, 4.197, 2], [128.8, 6.808, 0], [129.6, 4.224, 2], [130.1, 6.877, 0], [130.7, 4.26, 2], [130.8, 4.264, 2], [131.0, 5.138, 1], [132.2, 5.188, 1],
    [132.9, 7.027, 0], [133.2, 4.344, 2], [134.6, 4.389, 2], [135.6, 5.318, 1], [137.1, 7.246, 0], [137.9, 7.289, 0], [139.0, 4.532, 2], [139.1, 7.352, 0], [139.3, 5.467, 1], [139.6, 7.38, 0], [140.0, 7.402, 0], [140.0, 5.493, 1],
    [140.1, 5.495, 1], [140.3, 7.418, 0], [140.4, 4.577, 2], [141.0, 7.453, 0], [141.6, 4.615, 2], [142.2, 7.52, 0], [143.9, 5.648, 1], [144.2, 7.627, 0], [144.4, 5.664, 1], [144.9, 4.726, 2], [146.5, 7.745, 0], [146.5, 5.747, 1],
    [148.1, 7.831, 0], [150.8, 5.915, 1], [150.8, 4.918, 2], [151.7, 8.022, 0], [151.8, 4.95, 2], [151.9, 5.961, 1], [152.1, 4.96, 2], [152.8, 4.981, 2], [154.7, 8.18, 0], [154.9, 5.051, 2], [156.7, 6.148, 1], [158.2, 6.206, 1],
    [161.2, 8.52, 0], [162.0, 5.281, 2], [163.1, 6.399, 1], [163.2, 5.322, 2], [163.7, 8.652, 0], [163.7, 8.653, 0], [164.1, 5.351, 2], [166.8, 6.543, 1], [167.7, 8.864, 0], [167.7, 8.867, 0], [167.7, 5.467, 2], [169.0, 6.629, 1],
    [169.3, 6.641, 1], [170.9, 5.572, 2], [172.1, 6.75, 1], [172.3, 6.761, 1], [174.1, 6.831, 1], [174.2, 5.679, 2], [175.7, 6.894, 1], [176.1, 9.309, 0], [177.3, 6.955, 1], [177.8, 5.797, 2], [179.6, 7.044, 1], [180.9, 7.098, 1],
    [181.0, 7.102, 1], [181.4, 7.115, 1], [182.3, 5.943, 2], [184.2, 9.741, 0], [184.7, 9.764, 0], [185.1, 9.786, 0], [185.5, 9.806, 0], [185.8, 6.056, 2], [186.8, 7.327, 1], [187.8, 9.932, 0], [188.2, 6.137, 2], [190.9, 6.224, 2],
    [193.1, 6.295, 2], [193.4, 10.226, 0], [193.5, 10.229, 0], [194.6, 7.633, 1], [196.5, 6.406, 2], [197.0, 6.422, 2], [197.1, 10.42, 0], [197.3, 6.434, 2], [197.6, 7.751, 1], [198.2, 6.463, 2], [198.4, 6.469, 2], [202.4, 7.94, 1],
    [204.3, 6.662, 2], [207.0, 10.944, 0], [207.4, 8.136, 1], [207.5, 8.141, 1], [208.6, 8.182, 1], [208.8, 6.808, 2], [208.9, 11.047, 0], [211.8, 11.2, 0], [212.7, 11.243, 0], [212.8, 11.25, 0], [213.4, 8.374, 1], [213.5, 11.287, 0],
    [213.6, 6.962, 2], [214.2, 8.402, 1], [214.6, 11.348, 0], [214.8, 11.359, 0], [214.9, 7.008, 2], [216.0, 8.473, 1], [216.1, 11.426, 0], [216.5, 11.445, 0], [216.5, 11.446, 0], [216.7, 7.064, 2], [218.1, 8.556, 1], [220.6, 11.664, 0],
    [220.9, 8.666, 1], [221.5, 7.221, 2], [221.8, 7.233, 2], [224.2, 11.851, 0], [224.2, 11.854, 0], [225.1, 11.902, 0], [225.6, 7.354, 2], [225.8, 7.362, 2], [226.0, 7.368, 2], [226.3, 7.377, 2], [227.0, 8.906, 1], [227.1, 8.91, 1],
    [227.9, 8.94, 1], [229.1, 7.468, 2], [229.5, 7.482, 2], [231.2, 12.221, 0], [233.6, 12.351, 0], [233.7, 12.354, 0], [235.1, 9.225, 1], [235.6, 9.244, 1], [237.1, 12.533, 0], [237.8, 7.752, 2], [237.9, 7.755, 2], [238.2, 7.767, 2],
    [238.6, 7.78, 2], [239.1, 7.794, 2], [240.1, 9.421, 1], [241.0, 12.742, 0], [241.5, 9.476, 1], [242.0, 7.888, 2], [242.7, 7.912, 2], [243.0, 7.921, 2], [243.1, 12.853, 0], [243.6, 9.557, 1], [243.6, 9.557, 1], [245.3, 9.624, 1],
    [246.9, 13.053, 0], [248.5, 9.75, 1], [248.8, 13.152, 0], [249.1, 8.12, 2], [249.6, 13.196, 0], [252.7, 13.361, 0], [253.1, 8.251, 2], [253.2, 13.388, 0], [255.8, 10.034, 1], [256.6, 8.365, 2], [257.4, 10.097, 1], [258.1, 8.413, 2],
    [260.4, 13.767, 0], [261.1, 13.805, 0], [262.7, 10.306, 1], [262.9, 13.901, 0], [264.0, 8.607, 2], [265.0, 10.396, 1], [267.7, 10.503, 1], [268.3, 14.184, 0], [268.4, 10.529, 1], [269.4, 14.246, 0], [270.7, 10.622, 1], [270.9, 8.832, 2],
    [271.0, 8.836, 2], [273.6, 8.92, 2], [274.5, 10.771, 1], [274.9, 14.534, 0], [275.1, 10.792, 1], [277.5, 10.889, 1], [277.9, 9.059, 2], [279.1, 9.1, 2], [279.9, 10.982, 1], [280.2, 14.812, 0], [280.4, 9.143, 2], [280.6, 11.007, 1],
    [280.7, 9.152, 2], [284.2, 9.264, 2], [285.5, 9.308, 2], [287.3, 15.19, 0], [288.1, 9.393, 2], [289.8, 9.448, 2], [289.9, 15.328, 0], [290.3, 9.465, 2], [290.6, 15.363, 0], [291.2, 15.396, 0], [292.5, 9.536, 2], [293.1, 9.556, 2],
    [293.8, 9.579, 2], [294.8, 9.61, 2], [294.8, 9.612, 2], [297.3, 11.665, 1], [297.4, 11.667, 1], [298.9, 15.805, 0], [300.8, 11.801, 1], [303.1, 11.893, 1], [304.6, 16.104, 0], [305.3, 9.953, 2], [305.4, 9.955, 2], [306.8, 10.003, 2],
    [307.7, 12.07, 1], [308.4, 10.055, 2], [308.7, 16.32, 0], [309.1, 12.129, 1], [310.1, 16.398, 0], [311.3, 10.15, 2], [312.2, 10.179, 2], [312.2, 16.507, 0], [312.5, 12.259, 1], [312.7, 10.195, 2], [314.8, 10.261, 2], [315.3, 16.67, 0],
    [315.4, 12.376, 1], [316.8, 12.427, 1], [317.1, 16.765, 0], [320.2, 10.441, 2], [321.4, 10.477, 2], [322.6, 12.657, 1], [322.7, 12.659, 1], [323.1, 17.084, 0], [324.9, 12.747, 1], [325.4, 10.607, 2], [326.1, 10.631, 2], [327.0, 12.828, 1],
    [330.8, 17.49, 0], [331.6, 17.53, 0], [331.6, 13.01, 1], [331.8, 17.543, 0], [331.8, 17.545, 0], [332.9, 17.601, 0], [333.3, 10.866, 2], [333.9, 10.886, 2], [334.1, 13.108, 1], [334.2, 13.11, 1], [335.7, 17.749, 0], [336.8, 17.806, 0],
    [337.1, 17.82, 0], [337.4, 17.839, 0], [340.6, 11.103, 2], [341.9, 18.075, 0], [344.1, 13.502, 1], [345.7, 13.563, 1], [346.0, 18.293, 0], [346.6, 18.323, 0], [347.1, 13.617, 1], [348.1, 11.349, 2], [349.6, 11.398, 2], [349.6, 11.398, 2],
    [349.6, 11.399, 2], [351.3, 11.453, 2], [352.4, 18.63, 0], [353.6, 11.527, 2], [354.7, 18.753, 0], [354.8, 18.759, 0], [354.9, 18.767, 0], [355.0, 11.573, 2], [356.1, 13.972, 1], [356.6, 13.99, 1], [357.2, 18.888, 0], [357.9, 18.925, 0],
    [359.9, 14.121, 1], [360.4, 19.055, 0], [361.1, 14.166, 1], [361.8, 11.796, 2], [362.4, 11.816, 2], [364.4, 14.297, 1], [372.0, 19.669, 0], [373.9, 14.67, 1], [376.4, 12.27, 2], [376.9, 12.286, 2], [377.3, 14.804, 1], [377.6, 14.815, 1],
    [379.5, 12.371, 2], [379.6, 20.069, 0], [380.4, 20.11, 0], [380.6, 12.407, 2], [383.4, 15.04, 1], [384.4, 15.081, 1], [385.3, 12.561, 2], [388.2, 15.231, 1], [388.3, 20.529, 0], [389.1, 12.686, 2], [390.9, 12.744, 2], [394.4, 20.852, 0],
    [394.9, 15.493, 1], [395.2, 12.886, 2], [395.9, 20.934, 0], [396.2, 20.948, 0], [398.2, 12.981, 2], [399.5, 15.672, 1], [399.5, 21.124, 0]]
BIG = 390                            # the 399.5 m loan (payment 21.124 m): typed ten times too small, the slope goes 41.49 → 40.55
# the 25 real Auto loans of the explorer (w09d1-x1), payment in m: r 0.904, slope 47.9 thousand per 1 m, intercept −0.68 m
A25 = [[312.2, 16.51, 0], [161.2, 8.52, 0], [172.1, 6.75, 1], [65.9, 2.59, 1], [243.1, 12.85, 0], [249.6, 13.2, 0], [308.4, 10.05, 2], [128.6, 5.05, 1],
       [221.5, 7.22, 2], [289.9, 15.33, 0], [249.1, 8.12, 2], [50.3, 1.97, 1], [255.8, 10.03, 1], [77.4, 2.52, 2], [140.3, 7.42, 0], [380.6, 12.41, 2],
       [144.0, 5.65, 1], [202.4, 7.94, 1], [335.7, 17.75, 0], [211.8, 11.2, 0], [354.8, 18.76, 0], [128.5, 5.04, 1], [197.1, 10.42, 0], [379.6, 20.07, 0],
       [267.7, 10.5, 1]]
# six of them, small enough to count: x̄ 211.3, ȳ 8.85, r 0.891, slope 44.4 thousand per 1 m, intercept −0.54 m, SS_tot 153.9, SS_res 31.6, R² 0.794
A6 = [[65.9, 2.59], [128.6, 5.05], [161.2, 8.52], [249.1, 8.12], [308.4, 10.05], [354.8, 18.76]]
# the median payment (m) of each product and term: BNPL, Consumer, Auto (r 0.61 together; −0.90, −0.93, −0.94 inside)
MED = [[3, 1.428, 0], [6, 0.656, 0], [12, 0.357, 0], [6, 4.996, 1], [12, 2.655, 1], [18, 1.906, 1], [24, 1.42, 1], [24, 11.348, 2], [36, 8.141, 2], [48, 7.354, 2]]
# 30 Micro loans (a seeded sample), principal and payment in m; the page's Micro line: 0.7 + 271.6 × principal (thousand)
MIC = [[4.66, 0.875], [0.72, 0.135], [2.86, 0.537], [0.57, 0.203], [4.07, 1.453], [3.3, 1.178], [1.75, 0.328], [3.63, 0.681], [0.94, 0.336], [2.0, 0.714],
       [4.59, 1.638], [1.59, 0.298], [0.69, 0.13], [3.98, 1.421], [4.04, 0.758], [3.55, 0.666], [1.55, 0.553], [2.18, 0.778], [3.64, 1.299], [4.4, 0.826],
       [1.7, 0.319], [1.22, 0.435], [0.64, 0.228], [0.88, 0.165], [4.72, 0.886], [3.11, 0.584], [4.26, 1.52], [4.6, 0.863], [3.81, 0.715], [4.4, 0.826]]
# made-up dots for "how close to a line" (r 1.00, 0.80, 0.30, −0.90; tight-and-flat 0.97, steep-and-loose 0.62)
XS = [0.8, 1.6, 2.3, 3.1, 3.9, 4.4, 5.2, 6.0, 6.7, 7.5, 8.3, 9.1]
def toy(ys): return [[x, y] for x, y in zip(XS, ys)]
LINE = toy([1.64, 2.28, 2.84, 3.48, 4.12, 4.52, 5.16, 5.8, 6.36, 7.0, 7.64, 8.28])
MID = toy([1.3, 3.7, 4.0, 3.7, 3.9, 7.0, 6.2, 7.1, 5.6, 4.3, 8.4, 7.8])
LOW = toy([6.5, 0.2, 7.7, 5.4, 2.1, 0.7, 9.8, 2.5, 3.9, 7.0, 8.2, 6.9])
FALL = toy([7.7, 6.3, 8.3, 6.0, 5.6, 5.2, 3.4, 5.1, 4.3, 2.2, 3.7, 1.6])
GENTLE = toy([9.2, 9.2, 9.4, 9.3, 10.0, 10.1, 10.0, 10.3, 10.4, 10.4, 10.8, 10.8])
STEEP = toy([11.4, 0.9, 2.8, 3.0, 8.4, 0.7, 11.6, 9.2, 1.1, 14.7, 17.7, 18.9])
U = [[-3, 9], [-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4], [3, 9]]                       # y = x²: r = 0
TYPO = [[1, 1.2], [2, 1.9], [3, 3.1], [4, 3.9], [5, 5.2], [6, 60.0]]                   # the page's toy: Pearson 0.699, Spearman 1.0
# payment ≈ 6 581.94 + 41.83 × principal − 184.3 × term (thousand): one line per term, in m
TERM_LINES = [[2.15874, 0.04183, "o"], [-0.05286, 0.04183, "b"], [-2.26446, 0.04183, "p"]]

KEYS = ["pts", "cols", "xr", "yr", "xt", "yt", "words", "mean", "quad", "ybar", "res0", "line", "guess", "res", "sq", "lines", "gfit", "resplot", "gmean",
        "rank", "drag", "ghost", "hot", "pred", "predOn", "range", "marks", "tri", "triOn", "big", "read", "sk", "sdp", "adp", "one", "pull"]


def sc(**kw):   # a fresh scatter picture: every option not given is switched off
    d = {k: None for k in KEYS}
    d["kind"] = "scatter"
    d.update(kw)
    return d


def arrows(nodes, labels, edges, edge_words=None, h=176, legend=None):
    d = {"kind": "arrows", "nodes": nodes, "labels": labels, "edges": edges, "h": h}
    d["words"] = {"edges": edge_words or []}
    if legend:
        d["legend"] = legend
    return d


TERMS = [("24 months", "24 мес."), ("36 months", "36 мес."), ("48 months", "48 мес.")]
WA = {"x": ("principal, m soum", "сумма кредита, млн сумов"), "y": ("payment a month, m soum", "платёж в месяц, млн сумов"), "xu": ("m", "млн"), "yu": ("m", "млн"),
      "slope": ("thousand soum a month per 1 m", "тыс. сумов в месяц на 1 млн"), "groups": TERMS}
WT = {"x": ("x", "x"), "y": ("y", "y")}
WM = {"x": ("term, months", "срок, мес."), "y": ("typical payment a month, m soum", "типичный платёж в месяц, млн сумов"), "xu": ("months", "мес."), "yu": ("m", "млн"),
      "groups": [("BNPL", "BNPL"), ("Consumer", "потребительские"), ("Auto", "авто")]}
WX = {"x": ("principal, m soum", "сумма кредита, млн сумов"), "y": ("payment a month, m soum", "платёж в месяц, млн сумов"), "xu": ("m", "млн"), "yu": ("m", "млн"),
      "range": ("Micro loans: 0.5–5 m", "микрозаймы: 0,5–5 млн"), "marks": [("real SME loans of about 300 m: median 16.0 m", "настоящие SME-кредиты около 300 млн: медиана 16,0 млн")]}
TERM_COLS = ["o", "b", "p"]
AUTO_AX = dict(xr=[0, 420], yr=[0, 22], xt=100, yt=5, words=WA)
SIX_AX = dict(xr=[0, 400], yr=[0, 20], xt=100, yt=5, words=WA)
TOY_AX = dict(xr=[0, 10], yr=[0, 10], xt=2, yt=2, words=WT)

STORIES = [
 {"id": "w09d1-s1", "min": 4, "title": ("Six loans on a grid", "Шесть кредитов на сетке"), "steps": [
  {"show": sc(pts=A6, hot=0, read=["hot"], **SIX_AX),
   "say": ("Each dot is one of Nur's Auto loans. How far **right** a dot sits is its principal — the amount lent. How **high** it sits is its monthly payment.",
           "Каждая точка — один автокредит Nur. Насколько точка **правее** — такова сумма кредита. Насколько **выше** — таков ежемесячный платёж.")},
  {"show": {"hot": 5},
   "say": ("Another one: {b|354.8 m} lent, {o|18.76 m} a month. One dot per case, one number across and one up: that picture is a [[scatter plot|one dot per case: one number across (x), the other up (y)]].",
           "Ещё один: выдано {b|354,8 млн}, платёж {o|18,76 млн} в месяц. Одна точка на случай, одно число по горизонтали, другое по вертикали: такая картинка — [[диаграмма рассеяния|одна точка на каждый случай: одно число по горизонтали (x), другое по вертикали (y)]].")},
  {"show": {"hot": None, "read": ["n"]},
   "say": ("Put the number that you think explains across — {b|x}, the principal — and the number you want to understand up — {o|y}, the payment. Here: the further right, the higher.",
           "По горизонтали — число, которое, как вы думаете, объясняет ({b|x}, сумма кредита), по вертикали — число, которое хотите понять ({o|y}, платёж). Здесь: чем правее, тем выше.")},
  {"show": sc(pts=A25, read=["n"], **AUTO_AX),
   "say": ("25 real Auto loans. Read four things: the **direction** (up or down), the **form** (straight or curved), the **strength** (a tight band or a loose cloud) and anything **odd**.",
           "25 настоящих автокредитов. Прочитайте четыре вещи: **направление** (вверх или вниз), **форму** (прямая или кривая), **силу** (плотная полоса или рыхлое облако) и всё **странное**.")},
  {"show": {"cols": TERM_COLS, "read": ["key"]},
   "say": ("Something odd: colour each loan by its term and the cloud splits into three fans. At the same principal, the {o|24-month} loans pay the most.",
           "Странное есть: раскрасьте кредиты по сроку — и облако распадается на три веера. При одной и той же сумме больше всех платят {o|24-месячные}.")},
  {"say": ("Your turn — use the colours.", "Ваша очередь — смотрите на цвета."),
   "ask": {"q": ("At about 250 m, which loans pay the most each month?", "Около 250 млн: какие кредиты платят больше всего в месяц?"),
           "options": (["{o|24 months}", "{p|48 months}", "all terms pay the same"], ["{o|24 месяца}", "{p|48 месяцев}", "все сроки одинаково"]), "answer": 0,
           "why": ("The same money paid back in fewer months means bigger instalments: the orange fan sits on top.",
                   "Те же деньги, возвращённые за меньшее число месяцев, — это более крупные платежи: оранжевый веер сверху.")}},
  {"show": sc(pts=A391, cols=TERM_COLS, read=["n", "key"], **AUTO_AX),
   "say": ("All 391 Auto loans: the same three fans. Draw the picture before any number — and one product at a time: next to SME loans (up to 600 m), Micro loans (0.5–5 m) would shrink to one dot.",
           "Все 391 автокредит: те же три веера. Рисуйте картинку раньше любых чисел — и по одному продукту: рядом с SME (до 600 млн) микрозаймы (0,5–5 млн) сожмутся в одну точку.")},
 ]},

 {"id": "w09d1-s2", "min": 6, "title": ("How close to a line?", "Насколько близко к прямой?"), "steps": [
  {"show": sc(pts=LINE, big=True, **TOY_AX),
   "say": ("Twelve made-up dots exactly on a rising line. We want one number for **how close to a straight line** dots lie; we call it {y|r}. On the line, r = {y|1}.",
           "Двенадцать придуманных точек ровно на возрастающей прямой. Нам нужно одно число: **насколько близко к прямой** лежат точки. Назовём его {y|r}. На прямой r = {y|1}.")},
  {"show": {"pts": MID},
   "say": ("Shake the dots off the line a little: r drops to {y|0.80}. Still a clear rising band.",
           "Немного стряхнём точки с прямой: r падает до {y|0,80}. Всё ещё ясная возрастающая полоса.")},
  {"show": {"pts": LOW},
   "say": ("Shake them a lot: r = {y|0.30}. A rise is still there, but weak — a loose cloud.",
           "Стряхнём сильно: r = {y|0,30}. Рост ещё есть, но слабый — рыхлое облако.")},
  {"show": {"pts": FALL},
   "f": ("r: from −1 (a falling line) through 0 (no straight line) to +1 (a rising line)", "r: от −1 (убывающая прямая) через 0 (никакой прямой) до +1 (возрастающая прямая)"),
   "say": ("Make them fall instead: r = {y|−0.90}. The **sign** of r is the direction: + up, − down. Its **size** is how close the dots lie to a line.",
           "Теперь пусть точки убывают: r = {y|−0,90}. **Знак** r — направление: + вверх, − вниз. **Величина** — насколько близко точки к прямой.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("Which r says the dots hug a straight line most closely?", "Какое r говорит, что точки теснее всего прижаты к прямой?"),
           "options": (["0.75", "−0.92", "0.30"], ["0,75", "−0,92", "0,30"]), "answer": 1,
           "why": ("Closeness is the size of r, whatever its sign: 0.92 is the biggest. The minus only says the line falls, like the picture.",
                   "Близость — это величина r, знак не важен: 0,92 — больше всех. Минус лишь говорит, что прямая убывает, как на картинке.")}},
  {"show": {"pts": GENTLE, "yr": [0, 20], "yt": 5},
   "say": ("Steep is not strong. These dots barely rise, yet they lie tight on their line: r = {y|0.97}.",
           "Круто — не значит сильно. Эти точки еле поднимаются, но плотно лежат на своей прямой: r = {y|0,97}.")},
  {"show": {"pts": STEEP},
   "say": ("These rise steeply but scatter widely: r = {y|0.62}. How steep a line is, is the slope's job (later). r measures only how close the dots are to a line.",
           "А эти круто растут, но широко разбросаны: r = {y|0,62}. Крутизна — дело наклона (о нём позже). r измеряет только, насколько точки близки к прямой.")},
  {"show": sc(pts=A6, mean=True, read=["mean"], **SIX_AX),
   "say": ("How is r counted? Back to six Auto loans. The purple cross marks the **average loan**: the average principal {p|x̄} (“x-bar”) across, the average payment {p|ȳ} up.",
           "Как считается r? Вернёмся к шести автокредитам. Фиолетовый крест отмечает **средний кредит**: средняя сумма {p|x̄} («икс с чертой») по горизонтали, средний платёж {p|ȳ} по вертикали.")},
  {"show": {"quad": True, "mean": None, "read": ["q"]},
   "f": ("r = Σ ({b|x − x̄}) × ({p|y − ȳ}) ÷ √( Σ (x − x̄)² × Σ (y − ȳ)² )", "r = Σ ({b|x − x̄}) × ({p|y − ȳ}) ÷ √( Σ (x − x̄)² × Σ (y − ȳ)² )"),
   "fs": ("r is the sum of the two distances multiplied, divided by a number that keeps it between minus one and one.",
          "r — сумма произведений двух расстояний, делённая на число, которое держит её между минус единицей и единицей."),
   "say": ("Multiply each dot's two distances from the cross (Σ means “add them all up”). In the {g|green} corners both distances share a sign: the product is +. In the {o|orange} corners it is −.",
           "Перемножьте два расстояния каждой точки до креста (Σ значит «сложить всё»). В {g|зелёных} углах у расстояний один знак — произведение +. В {o|оранжевых} — минус.")},
  {"show": {"big": True, "read": ["q", "r"]},
   "say": ("Add the products: five pluses and one small minus make a big plus. The bottom of the fraction only rescales the sum, so that r stays between −1 and +1: here {y|r = 0.891}.",
           "Сложим произведения: пять плюсов и один маленький минус дают большой плюс. Знаменатель лишь масштабирует сумму, чтобы r оставался между −1 и +1: здесь {y|r = 0,891}.")},
  {"say": ("Check yourself on the cross.", "Проверьте себя по кресту."),
   "ask": {"q": ("A dot sits right of the average principal but below the average payment. What does it add to r?", "Точка правее средней суммы, но ниже среднего платежа. Что она добавляет к r?"),
           "options": (["a plus", "a minus", "nothing"], ["плюс", "минус", "ничего"]), "answer": 1,
           "why": ("Right: x − x̄ is +. Below: y − ȳ is −. Plus times minus is minus — the lone dot in an orange corner.",
                   "Правее: x − x̄ со знаком +. Ниже: y − ȳ со знаком −. Плюс на минус — минус. Это единственная точка в оранжевом углу.")}},
  {"show": sc(pts=A391, read=["n", "r"], **AUTO_AX),
   "f": ("|r| below 0.1: none · 0.1–0.3: weak · 0.3–0.7: moderate · above 0.7: strong", "|r| меньше 0,1: нет · 0,1–0,3: слабая · 0,3–0,7: умеренная · больше 0,7: сильная"),
   "say": ("All 391 Auto loans: r = {y|0.893}; on all 7 828 loans, {y|0.904}. A rough scale for the size of r (a habit, not a law) is in the strip.",
           "Все 391 автокредит: r = {y|0,893}; на всех 7 828 кредитах — {y|0,904}. Грубая шкала для величины r (привычка, не закон) — в рамке.")},
 ]},

 {"id": "w09d1-s3", "min": 5, "title": ("Cause or coincidence? A game", "Причина или совпадение? Игра"), "steps": [
  {"show": sc(pts=MED, xr=[0, 50], yr=[0, 12], xt=10, yt=2, words=WM, big=True),
   "say": ("Three rounds. Each: a real link from Nur's data and a claim; you decide if it is a cause. Round 1: each dot is one product and one term, with its typical (median) payment.",
           "Три раунда. В каждом — настоящая связь из данных Nur и утверждение; вы решаете, причина ли это. Раунд 1: каждая точка — один продукт и один срок, с типичным (медианным) платежом.")},
  {"say": ("Longer terms, bigger payments: r = {y|0.61} here, {y|+0.335} on all 7 828 loans. Sales: “Lengthen the loans and the payments will rise.”",
           "Дольше срок — больше платёж: здесь r = {y|0,61}, на всех 7 828 кредитах {y|+0,335}. Продажи: «Удлиним кредиты — и платежи вырастут».")
   , "ask": {"q": ("Are they right?", "Они правы?"),
             "options": (["Yes — r is positive", "No — something else drives both the term and the payment", "No — r is too small to mean anything"],
                         ["Да — r положительный", "Нет — и срок, и платёж двигает что-то третье", "Нет — r слишком мал, чтобы что-то значить"]), "answer": 1,
             "why": ("Colour the dots by product (next step): inside each product the rise turns into a fall.", "Раскрасьте точки по продуктам (следующий шаг): внутри каждого продукта рост превращается в падение.")}},
  {"show": {"cols": ["g", "b", "p"], "gfit": True, "big": None, "read": ["gr"]},
   "say": ("Colour by product: inside **every** product the line **falls** — a longer term, a smaller payment. On all loans, inside the products r runs from −0.39 to −0.62.",
           "Раскрасим по продуктам: внутри **каждого** продукта линия **падает** — дольше срок, меньше платёж. На всех кредитах внутри продуктов r от −0,39 до −0,62.")},
  {"show": arrows([[240, 40, "y"], [110, 140, "b"], [370, 140, "o"]], [("product", "продукт"), ("term", "срок"), ("payment", "платёж")],
                  [[0, 1, "s"], [0, 2, "s"], [1, 2, "x"]], ["", "", ("“longer → bigger”", "«дольше → больше»")]),
   "say": ("The product drives both: Auto loans are long **and** big. A third thing behind both is a [[confounder|a third variable that drives both x and y]]; a link that flips inside every group is [[Simpson's paradox|a pattern across groups that points the other way inside each group]].",
           "Продукт двигает и то, и другое: автокредиты длинные **и** крупные. Третье, что стоит за обоими, — [[вмешивающаяся переменная|третья переменная, которая влияет и на x, и на y]]; связь, которая переворачивается внутри каждой группы, — [[парадокс Симпсона|картина по всем группам вместе направлена в другую сторону, чем внутри каждой группы]].")},
  {"show": arrows([[110, 90, "b"], [370, 90, "o"]], [("collection calls", "звонки взыскания"), ("default", "дефолт")], [[0, 1, "d"]], h=150),
   "say": ("Round 2. Loans with more collection calls go bad more often. A manager: “Call less, and fewer loans will default.”",
           "Раунд 2. Кредиты, по которым больше звонков взыскания, чаще становятся плохими. Менеджер: «Звоним меньше — и дефолтов станет меньше».")
   , "ask": {"q": ("What is going on?", "Что здесь происходит?"),
             "options": (["The calls push people into default", "The arrow runs the other way: being late brings the calls", "Calls and defaults have nothing to do with each other"],
                         ["Звонки толкают людей к дефолту", "Стрелка смотрит в другую сторону: звонки приходят из-за просрочки", "Звонки и дефолты никак не связаны"]), "answer": 1,
             "why": ("A loan is called **because** it is already late: the lateness comes first.", "По кредиту звонят, **потому что** он уже просрочен: просрочка идёт первой.")}},
  {"show": arrows([[240, 40, "y"], [110, 140, "b"], [370, 140, "o"]], [("late payment", "просрочка"), ("collection calls", "звонки взыскания"), ("default", "дефолт")],
                  [[0, 1, "s"], [0, 2, "s"], [1, 2, "x"]], ["", "", ("“calls → default”", "«звонки → дефолт»")]),
   "say": ("Being late comes first: it brings the calls, and it leads to default. Calling less would leave the late loans alone — and probably raise the losses.",
           "Первой идёт просрочка: она вызывает звонки и ведёт к дефолту. Если звонить меньше, просроченные кредиты никуда не денутся — а потери, скорее всего, вырастут.")},
  {"show": sc(pts=A25, big=True, **AUTO_AX),
   "say": ("Round 3. Bigger Auto loans, bigger payments: r = {y|0.90} on these 25 loans.", "Раунд 3. Крупнее автокредит — больше платёж: r = {y|0,90} на этих 25 кредитах.")
   , "ask": {"q": ("Does a bigger principal cause a bigger payment?", "Большая сумма — причина большого платежа?"),
             "options": (["Yes", "No — a third thing drives both", "No — the arrow runs backwards"], ["Да", "Нет — обоих двигает третье", "Нет — стрелка обратная"]), "answer": 0,
             "why": ("Yes — but not because r is high. The pricing formula computes the payment from the amount: a known mechanism.",
                     "Да — но не потому, что r высокий. Формула расчёта вычисляет платёж из суммы: механизм известен.")}},
  {"show": arrows([[110, 75, "b"], [370, 75, "o"]], [("principal", "сумма кредита"), ("payment", "платёж")], [[0, 1, "s"]], [("the pricing formula", "формула расчёта платежа")], h=130),
   "f": ("correlation ≠ causation", "корреляция ≠ причинность"),
   "say": ("A cause is shown by a mechanism (the pricing formula) or by an experiment (Week 7: change x at random, watch y). A correlation alone never shows it.",
           "Причину доказывает механизм (формула расчёта) или эксперимент (неделя 7: меняем x случайно и смотрим на y). Одна лишь корреляция — никогда.")},
  {"show": {"legend": [("① Could a third thing drive both?", "① Может ли что-то третье двигать оба числа?"), ("② Does the link hold inside each group?", "② Держится ли связь внутри каждой группы?"),
                       ("③ Which came first?", "③ Что было раньше?")]},
   "say": ("Before you write “X drives Y”, ask the three questions under the picture.", "Прежде чем написать «X двигает Y», задайте три вопроса под картинкой.")},
 ]},

 {"id": "w09d1-s4", "min": 5, "title": ("When r is fooled", "Когда r ошибается"), "steps": [
  {"show": sc(pts=U, xr=[-4, 4], yr=[0, 10], xt=1, yt=2, words=WT, big=True),
   "say": ("Seven made-up dots on a perfect U: each y is x × x. Every y is fully decided by its x — and yet r = {y|0}.",
           "Семь придуманных точек на идеальной букве U: каждый y равен x × x. Каждый y полностью задан своим x — и всё же r = {y|0}.")},
  {"show": {"quad": True},
   "say": ("Why? The left half falls and the right half rises. The pluses and the minuses of the corners cancel out exactly.",
           "Почему? Левая половина убывает, правая растёт. Плюсы и минусы углов в точности гасят друг друга.")},
  {"show": {"quad": None},
   "f": ("r ≈ 0: no straight line — a curve may still be there", "r ≈ 0: прямой нет — но кривая может быть"),
   "say": ("So r = 0 means **no straight-line** link — not “no link”. Always look at the picture next to r.",
           "Значит, r = 0 — это **нет прямолинейной** связи, а не «нет связи». Всегда смотрите на картинку рядом с r.")},
  {"say": ("Sales say rich customers ask for bigger loans. On 13 162 applications with an income on file: r = {y|0.002}.",
           "Продажи говорят: богатые клиенты просят больше. На 13 162 заявках, где доход известен: r = {y|0,002}.")
   , "ask": {"q": ("Which sentence goes in Nilufar's note?", "Какую фразу написать Нилуфар?"),
             "options": (["Income and the amount are unrelated — proven", "The amount does not rise or fall with income in a straight line; a curve could still hide", "Income should be dropped from every model"],
                         ["Доход и сумма не связаны — доказано", "Сумма не растёт и не падает с доходом по прямой; кривая всё ещё может прятаться", "Доход надо убрать из всех моделей"]), "answer": 1,
             "why": ("r rules out only a straight line, like the U above. Say how many rows r used, look at the scatter, and keep “does income predict repayment?” as a separate question.",
                     "r исключает только прямую — как с буквой U. Назовите, на скольких строках посчитан r, посмотрите на диаграмму, а «предсказывает ли доход возврат?» — отдельный вопрос.")}},
  {"show": sc(pts=TYPO, xr=[0, 7], yr=[0, 64], xt=1, yt=10, words=WT, big=True, drag=5),
   "say": ("Another trap. Six loans on a neat rising line — but the sixth has a typo: {o|60.0}. One wrong value, and r falls to {y|0.70}.",
           "Ещё ловушка. Шесть кредитов на аккуратной возрастающей прямой — но у шестого опечатка: {o|60,0}. Одно неверное значение — и r падает до {y|0,70}.")},
  {"act": [btn(0, "Fix the typo: 6.0", "Исправить: 6,0", do="nudge", i=5, to=6.0)],
   "say": ("Drag the orange dot down, or tap **Fix the typo**: r jumps back to almost 1. One far-out value can drag Pearson's r a long way.",
           "Перетащите оранжевую точку вниз или нажмите **Исправить**: r снова почти 1. Одно далёкое значение способно сильно утащить r Пирсона.")},
  {"show": {"reset": True, "drag": None, "rank": True, "read": ["sp"]},
   "say": ("Keep the typo, but replace each value by its **rank**: 1 for the smallest, 2, 3… The typo becomes just “the largest”, rank 6 — and the ranks lie on a perfect line.",
           "Оставим опечатку, но заменим каждое значение его **рангом**: 1 — самое маленькое, потом 2, 3… Опечатка становится просто «самым большим», ранг 6, — и ранги лежат на идеальной прямой.")},
  {"f": ("Pearson r = {b|0.699} · Spearman ρ = {g|1.0}", "Пирсон r = {b|0,699} · Спирмен ρ = {g|1,0}"),
   "say": ("r on the ranks is [[Spearman's correlation|Pearson's r computed on the ranks instead of the values; written ρ, “rho”]]: here {g|1.0}. It asks only whether y keeps rising as x rises — straight or curved.",
           "r по рангам — это [[корреляция Спирмена|r Пирсона, посчитанный по рангам вместо значений; пишут ρ, «ро»]]: здесь {g|1,0}. Она спрашивает лишь, продолжает ли y расти вместе с x — по прямой или по кривой.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("One customer's income was typed with three extra zeros. Which correlation barely moves?", "Доход одного клиента набрали с тремя лишними нулями. Какая корреляция почти не сдвинется?"),
           "options": (["Pearson's r", "Spearman's ρ", "both move a lot"], ["r Пирсона", "ρ Спирмена", "обе сильно сдвинутся"]), "answer": 1,
           "why": ("To the ranks the typo is just one step up the ladder, however big the number.", "Для рангов опечатка — лишь одна ступенька вверх, каким бы огромным ни было число.")}},
  {"show": {"rank": None},
   "f": ("term and principal, all loans: Pearson {b|0.581} · Spearman {g|0.713}", "срок и сумма, все кредиты: Пирсон {b|0,581} · Спирмен {g|0,713}"),
   "say": ("On real loans, principal is very skewed: many small loans, a few huge ones. Term against principal: Pearson {b|0.581}, Spearman {g|0.713}. For money columns, report Spearman next to Pearson.",
           "В настоящих данных сумма кредита сильно скошена: много мелких кредитов, несколько огромных. Срок против суммы: Пирсон {b|0,581}, Спирмен {g|0,713}. Для денежных столбцов указывайте Спирмена рядом с Пирсоном.")},
 ]},

 {"id": "w09d1-s5", "min": 6, "title": ("Draw the best line", "Проведите лучшую линию"), "steps": [
  {"show": sc(pts=A6, line="guess", guess=[2.0, 0.02], **SIX_AX),
   "say": ("Six Auto loans again. Lay a ruler through them: drag the two round ends of the teal line until it looks right to you.",
           "Снова шесть автокредитов. Положите через них линейку: тяните за два круглых конца бирюзовой линии, пока она не покажется вам правильной.")},
  {"show": {"res": True},
   "f": ("residual = y − ŷ", "остаток = y − ŷ"), "fs": ("A residual is y minus y-hat.", "Остаток — это y минус y с крышкой."),
   "say": ("Each dashed line is what your line misses for one loan: the dot's payment {o|y} minus the line's payment {b|ŷ} (“y-hat”). It is called a [[residual|y − ŷ: how far a dot is above (+) or below (−) the line]].",
           "Каждый пунктир — то, что ваша линия упускает для одного кредита: платёж точки {o|y} минус платёж линии {b|ŷ} («y с крышкой»). Это [[остаток|y − ŷ: насколько точка выше (+) или ниже (−) линии]].")},
  {"show": {"sq": True, "read": ["ss"]},
   "f": ("the line's score = Σ (y − ŷ)²", "оценка линии = Σ (y − ŷ)²"),
   "say": ("Square every miss — the orange squares. Big misses make huge squares. Their total is your line's score: smaller is better. Drag the ends and watch it.",
           "Возведите каждый промах в квадрат — оранжевые квадраты. Большой промах — огромный квадрат. Их сумма — оценка вашей линии: чем меньше, тем лучше. Потяните концы и следите.")},
  {"act": [btn(0, "Find the best line", "Найти лучшую линию", do="fit")],
   "say": ("Exactly one line has the smallest total. Tap **Find the best line**: that is the [[least-squares line|the one line whose squared misses add up to the least]].",
           "Самая маленькая сумма — ровно у одной линии. Нажмите **Найти лучшую линию**: это [[линия наименьших квадратов|единственная линия, у которой сумма квадратов промахов меньше всех]].")},
  {"show": {"line": "fit", "res": None, "sq": None, "tri": 100, "read": ["line"], "sk": 1000, "sdp": 1, "adp": 2},
   "say": ("Read it in words. The **slope**: 100 m more principal, and the line rises {b|4.44 m} a month — {b|44.4 thousand soum} per 1 m. We call the slope {b|b}.",
           "Прочитаем её словами. **Наклон**: на 100 млн больше суммы — и линия поднимается на {b|4,44 млн} в месяц, то есть {b|44,4 тыс. сумов} на 1 млн. Наклон называют {b|b}.")},
  {"show": {"tri": None, "yr": [-2, 20]},
   "f": ("ŷ = {y|a} + {b|b} × x = {y|−0.54} + {b|0.0444} × principal", "ŷ = {y|a} + {b|b} × x = {y|−0,54} + {b|0,0444} × сумма"),
   "fs": ("y-hat equals a plus b times x.", "y с крышкой равен a плюс b умножить на x."),
   "say": ("The **intercept** is where the line meets x = 0: {y|−0.54 m}, the “payment of a 0-soum loan”. No such loan exists — it only places the line. We call it {y|a}.",
           "**Свободный член** — где линия встречает x = 0: {y|−0,54 млн}, «платёж по кредиту в 0 сумов». Такого кредита нет — число лишь ставит линию на место. Его называют {y|a}.")},
  {"say": ("Use the line.", "Воспользуйтесь линией."),
   "ask": {"q": ("What payment does this line give for a 200 m Auto loan?", "Какой платёж эта линия даёт для автокредита в 200 млн?"),
           "options": (["about 8.3 m a month", "about 4.4 m a month", "about 20 m a month"], ["около 8,3 млн в месяц", "около 4,4 млн в месяц", "около 20 млн в месяц"]), "answer": 0,
           "why": ("−0.54 + 0.0444 × 200 = 8.34 m: go up from 200 to the line (next picture).", "−0,54 + 0,0444 × 200 = 8,34 млн: поднимитесь от 200 до линии (следующая картинка).")}},
  {"show": {"yr": [0, 20], "pred": 200, "mean": True, "read": ["pred", "mean"]},
   "f": ("b = r × s_y ÷ s_x  ·  a = ȳ − b × x̄", "b = r × s_y ÷ s_x  ·  a = ȳ − b × x̄"),
   "fs": ("b is r times s y divided by s x; a is y-bar minus b times x-bar.", "b равно r, умноженному на s y и делённому на s x; a равно y с чертой минус b на x с чертой."),
   "say": ("Two lines of arithmetic give the same line: the slope {b|b = r × s_y ÷ s_x} ([[s|the standard deviation: the typical distance from the average]]), and {y|a = ȳ − b × x̄}. So the line always passes through the {p|average loan}.",
           "Ту же линию дают две строки арифметики: наклон {b|b = r × s_y ÷ s_x} ([[s|стандартное отклонение: типичное расстояние до среднего]]) и {y|a = ȳ − b × x̄}. Поэтому линия всегда проходит через {p|средний кредит}.")},
  {"show": sc(pts=A391, line="fit", read=["n", "line"], sk=1000, sdp=2, adp=3, **AUTO_AX),
   "say": ("All 391 Auto loans: slope {b|41.49} thousand soum per 1 m, intercept {y|−12.1} thousand. Always say the slope with its units: “41 490 soum more a month for every extra 1 m lent”.",
           "Все 391 автокредит: наклон {b|41,49} тыс. сумов на 1 млн, свободный член {y|−12,1} тыс. Всегда называйте наклон с единицами: «на 41 490 сумов в месяц больше за каждый лишний 1 млн».")},
  {"show": sc(pts=[[p[1], p[0]] for p in A6], line="fit", xr=[0, 20], yr=[0, 400], xt=5, yt=100,
              words={"x": ("payment a month, m soum", "платёж в месяц, млн сумов"), "y": ("principal, m soum", "сумма кредита, млн сумов")}),
   "f": ("np.polyfit(x, y, 1) — x first · SLOPE(y's, x's) — y first", "np.polyfit(x, y, 1) — сначала x · НАКЛОН(y; x) — сначала y"),
   "say": ("A tip for the code: numpy takes **x first** — `np.polyfit(x, y, 1)`; Excel's `SLOPE` takes **y first**. Swap them and you get this: the principal explained by the payment — another line.",
           "Совет для кода: numpy принимает **сначала x** — `np.polyfit(x, y, 1)`; функция Excel `НАКЛОН` (SLOPE) — **сначала y**. Перепутайте — и получите вот это: сумму, объяснённую платежом, — другую линию.")},
 ]},

 {"id": "w09d1-s6", "min": 6, "title": ("What share does the line explain?", "Какую долю объясняет линия?"), "steps": [
  {"show": sc(pts=A6, ybar=True, res0=True, read=["tot"], **SIX_AX),
   "f": ("SS_tot = Σ (y − ȳ)² = {p|153.9}", "SS_tot = Σ (y − ȳ)² = {p|153,9}"),
   "say": ("Without any line, the best single guess for every payment is the average — the flat {p|purple} line. Square the dashed gaps and add them: {p|153.9}, all the spread there is ({p|SS_tot}).",
           "Без всякой линии лучшая общая догадка для любого платежа — среднее: плоская {p|фиолетовая} линия. Возведите пунктирные расстояния в квадрат и сложите: {p|153,9} — весь разброс, какой есть ({p|SS_tot}).")},
  {"show": {"res0": None, "line": "fit", "res": True, "read": ["ss", "tot"]},
   "f": ("SS_res = Σ (y − ŷ)² = {o|31.6}", "SS_res = Σ (y − ŷ)² = {o|31,6}"),
   "say": ("Now the least-squares line. Its misses are much shorter: squared and added, only {o|31.6} — what is left after the line ({o|SS_res}).",
           "Теперь линия наименьших квадратов. Её промахи гораздо короче: в квадрате и в сумме — всего {o|31,6}, то, что осталось после линии ({o|SS_res}).")},
  {"show": {"read": ["r2ss"]},
   "f": ("R² = 1 − {o|SS_res} ÷ {p|SS_tot} = 1 − {o|31.6} ÷ {p|153.9} = {y|0.794}", "R² = 1 − {o|SS_res} ÷ {p|SS_tot} = 1 − {o|31,6} ÷ {p|153,9} = {y|0,794}"),
   "fs": ("R squared is one minus 31.6 divided by 153.9: 0.794.", "R квадрат — один минус 31,6, делённое на 153,9: 0,794."),
   "say": ("The line removed 1 − 31.6 ÷ 153.9 = {y|79 %} of the spread. That share is [[R²|the share of the spread of y the line explains: 0 = no better than the average, 1 = every dot on the line]].",
           "Линия убрала 1 − 31,6 ÷ 153,9 = {y|79 %} разброса. Эта доля называется [[R²|доля разброса y, которую объясняет линия: 0 — не лучше среднего, 1 — все точки на линии]].")},
  {"show": {"read": ["r", "r2"]},
   "f": ("one x: R² = r × r = 0.891² = {y|0.794}", "один x: R² = r × r = 0,891² = {y|0,794}"),
   "say": ("With one x there is a shortcut: R² = r × r. Here 0.891² = {y|0.794}. The sign drops out: r = −0.7 explains 49 %, just like +0.7.",
           "С одним x есть короткий путь: R² = r × r. Здесь 0,891² = {y|0,794}. Знак исчезает: r = −0,7 объясняет 49 %, как и +0,7.")},
  {"say": ("Your turn.", "Ваша очередь."),
   "ask": {"q": ("A line has r = 0.8. What share of the spread does it explain?", "У линии r = 0,8. Какую долю разброса она объясняет?"),
           "options": (["80 %", "64 %", "40 %"], ["80 %", "64 %", "40 %"]), "answer": 1,
           "why": ("R² = 0.8 × 0.8 = 0.64: 64 %.", "R² = 0,8 × 0,8 = 0,64: 64 %.")}},
  {"show": sc(pts=A391, line="fit", read=["n", "r2"], **AUTO_AX),
   "say": ("All 391 Auto loans: R² = {y|0.797}. The principal alone explains 79.7 % of the spread of the payments. What explains the other 20 %?",
           "Все 391 автокредит: R² = {y|0,797}. Одна только сумма объясняет 79,7 % разброса платежей. А что объясняет остальные 20 %?")},
  {"show": {"line": None, "resplot": True, "one": True, "read": None},
   "say": ("Lay the line flat: plot each loan's **residual** against its principal — a [[residual plot|the residuals against x: a good line leaves a shapeless band around 0]]. The purple 0 is the line itself.",
           "Положите линию плашмя: отложите **остаток** каждого кредита против его суммы — это [[график остатков|остатки против x: хорошая линия оставляет бесформенную полосу вокруг 0]]. Фиолетовый 0 — сама линия.")},
  {"show": {"one": None, "cols": TERM_COLS, "gmean": True, "read": ["gm"]},
   "say": ("Colour by term: three bands. The {o|24-month} loans sit {o|2.48 m} above the line on average, the {p|48-month} ones {p|1.95 m} below. The line is missing the term.",
           "Раскрасим по сроку: три полосы. {o|24-месячные} кредиты в среднем на {o|2,48 млн} выше линии, {p|48-месячные} — на {p|1,95 млн} ниже. Линии не хватает срока.")},
  {"say": ("Look at the right end of the picture.", "Посмотрите на правый край картинки."),
   "ask": {"q": ("The bands are further apart at the right than at the left. What does that say?", "Справа полосы дальше друг от друга, чем слева. О чём это говорит?"),
           "options": (["The gap between terms grows with the amount: the term multiplies the payment", "The line is fine", "The big loans are typos"],
                       ["Разрыв между сроками растёт с суммой: срок умножает платёж", "Линия в порядке", "Крупные кредиты — опечатки"]), "answer": 0,
           "why": ("A payment is the principal times a factor for its term, so the terms differ by a share of the amount: a fan.",
                   "Платёж — это сумма, умноженная на множитель срока, поэтому сроки различаются на долю суммы: получается веер.")}},
  {"show": {"cols": None, "one": True, "read": ["gm"]},
   "say": ("One trap: the residuals of a least-squares line always average exactly {p|0} — over all 391 loans too. So “the average error is 0” proves nothing; look at the shape and the averages by group.",
           "Одна ловушка: остатки линии наименьших квадратов в среднем всегда ровно {p|0} — и на всех 391 кредите тоже. Поэтому «средняя ошибка 0» ничего не доказывает; смотрите на форму и на средние по группам.")},
 ]},

 {"id": "w09d1-s7", "min": 5, "title": ("One loan pulls the line", "Один кредит тянет линию"), "steps": [
  {"show": sc(pts=A25, line="fit", ghost=True, read=["line"], sk=1000, sdp=1, adp=2, xr=[0, 420], yr=[0, 32], xt=100, yt=5, words=WA),
   "say": ("25 real Auto loans and their least-squares line: slope {b|47.9} thousand soum per 1 m. A dashed grey copy stays where the line started.",
           "25 настоящих автокредитов и их линия наименьших квадратов: наклон {b|47,9} тыс. сумов на 1 млн. Серая пунктирная копия остаётся там, где линия была вначале.")},
  {"show": {"drag": 8, "read": ["chg"]}, "act": [btn(0, "Typo: +12 m", "Опечатка: +12 млн", do="nudge", by=12)],
   "say": ("A typo: this loan's payment entered {o|12 m} too high. It sits in the **middle** of the principals. Tap **Typo: +12 m** (or drag it): the line barely moves.",
           "Опечатка: платёж этого кредита ввели на {o|12 млн} больше. Он стоит в **середине** по сумме. Нажмите **Опечатка: +12 млн** (или перетащите): линия почти не двигается.")},
  {"show": {"reset": True, "drag": 15}, "act": [btn(0, "Typo: +12 m", "Опечатка: +12 млн", do="nudge", by=12)],
   "say": ("Start again. The same typo on a loan at the **far right** (380.6 m): the slope jumps by about {o|18 %}.",
           "Начнём сначала. Та же опечатка у кредита **на правом краю** (380,6 млн): наклон прыгает примерно на {o|18 %}.")},
  {"show": {"mean": True, "read": ["chg", "lev"]},
   "f": ("leverage h = 1 ÷ n + (x − x̄)² ÷ Σ (x − x̄)²", "рычаг h = 1 ÷ n + (x − x̄)² ÷ Σ (x − x̄)²"),
   "fs": ("Leverage is one over n, plus the squared distance from the average x, divided by the sum of all such squares.",
          "Рычаг — это единица на n плюс квадрат расстояния до среднего x, делённый на сумму всех таких квадратов."),
   "say": ("Why? The line pivots round the {p|average loan}. A loan near it sits on the pivot; one far away works the line like a long lever. That distance is its [[leverage|how far a loan's x is from the average x: the length of its lever]].",
           "Почему? Линия вращается вокруг {p|среднего кредита}. Кредит рядом с ним сидит на оси; далёкий работает как длинный рычаг. Это расстояние и есть его [[рычаг|насколько x кредита далёк от среднего x: длина его рычага]].")},
  {"say": ("Think with the cross.", "Думайте по кресту."),
   "ask": {"q": ("Which has more leverage here: a 50 m loan or a 220 m loan?", "У кого здесь рычаг больше: у кредита в 50 млн или в 220 млн?"),
           "options": (["the 50 m loan", "the 220 m loan", "the same"], ["у кредита в 50 млн", "у кредита в 220 млн", "одинаковый"]), "answer": 0,
           "why": ("Leverage is the distance from the **average** principal (221 m), not the size: 50 m is far from it, 220 m sits on it.",
                   "Рычаг — это расстояние до **средней** суммы (221 млн), а не размер: 50 млн далеко от неё, 220 млн — прямо на ней.")}},
  {"show": {"reset": True, "drag": 11}, "act": [btn(0, "Typo: +12 m", "Опечатка: +12 млн", do="nudge", by=12)],
   "say": ("Check it: give the 50 m loan the same typo. The slope falls by about {o|20 %} — the 50 m loan has the most leverage of all 25.",
           "Проверим: дадим кредиту в 50 млн ту же опечатку. Наклон падает примерно на {o|20 %} — у кредита в 50 млн самый большой рычаг из всех 25.")},
  {"show": {"reset": True, "drag": None, "mean": None, "res": True, "read": None},
   "say": ("A loan far from the line (a long dash) is an [[outlier|a loan with a big residual: far above or below the line]]. One whose removal moves the slope a lot is [[influential|an outlier with leverage: far from the line AND far from the average x]] — it needs both.",
           "Кредит далеко от линии (длинный пунктир) — [[выброс|кредит с большим остатком: далеко над линией или под ней]]. Тот, чьё удаление сильно двигает наклон, — [[влиятельный|выброс с рычагом: далеко от линии И далеко от среднего x]]: нужно и то, и другое.")},
  {"show": sc(pts=A391, line="fit", ghost=True, hot=BIG, pull=[BIG, 2.112], read=["chg"], sk=1000, sdp=2, xr=[0, 420], yr=[0, 22], xt=100, yt=5, words=WA),
   "say": ("With many loans one lever matters less. All 391 Auto loans: the biggest (399.5 m) with its payment typed ten times too small moves the slope only from 41.49 to 40.55 — {o|−2.3 %}.",
           "Когда кредитов много, один рычаг значит меньше. Все 391 автокредит: самый крупный (399,5 млн) с платежом, набранным в десять раз меньше, сдвигает наклон лишь с 41,49 до 40,55 — {o|−2,3 %}.")},
  {"say": ("A slope looks odd and you find that loan.", "Наклон выглядит странно, и вы находите этот кредит."),
   "ask": {"q": ("What do you do with it?", "Что с ним делать?"),
           "options": (["Delete it — it spoils the fit", "Check its raw data: fix a typo, filter out another product, keep a real case; fit with and without it", "Nothing — 391 loans outvote one"],
                       ["Удалить — он портит линию", "Проверить исходные данные: опечатку исправить, чужой продукт отфильтровать, настоящий случай оставить; посчитать с ним и без него", "Ничего — 391 кредит перевешивает один"]), "answer": 1,
           "why": ("Never delete a point because it is inconvenient. Find out what it is, and report the line with it and without it.",
                   "Никогда не удаляйте точку только потому, что она неудобна. Выясните, что это, и покажите линию с ней и без неё.")}},
 ]},

 {"id": "w09d1-s8", "min": 6, "title": ("A rule, and where it stops", "Правило и его границы"), "steps": [
  {"show": sc(pts=A391, cols=TERM_COLS, line="fit", read=["r2", "key"], **AUTO_AX),
   "say": ("One straight line through three fans: R² = {y|0.797}. The residuals asked for the term.",
           "Одна прямая через три веера: R² = {y|0,797}. Остатки просили добавить срок.")},
  {"show": {"line": None, "lines": TERM_LINES, "read": ["key"]},
   "f": ("payment ≈ 6 582 + {b|41.83} × principal − {o|184.3} × term  (thousand soum)", "платёж ≈ 6 582 + {b|41,83} × сумма − {o|184,3} × срок  (тыс. сумов)"),
   "fs": ("The payment is about 6582 plus 41.83 times the principal minus 184.3 times the term, in thousand soum.",
          "Платёж — примерно 6582 плюс 41,83 на сумму минус 184,3 на срок, в тысячах сумов."),
   "say": ("Give the model the term too. A fit with two x's — [[multiple regression|least squares with several x's: ŷ = a + b₁·x₁ + b₂·x₂ + …]] — draws one line per term, all with one slope. R² rises to {y|0.961}.",
           "Дадим модели и срок. Подгонка с двумя x — [[множественная регрессия|метод наименьших квадратов с несколькими x: ŷ = a + b₁·x₁ + b₂·x₂ + …]] — рисует по линии на срок, все с одним наклоном. R² растёт до {y|0,961}.")},
  {"show": {"tri": 100, "triOn": 0},
   "say": ("Each coefficient is the change in y for one unit of its x **with the others held fixed**. Same term, 1 m more principal: {b|+41 830 soum}. Same principal, one month longer: {o|−184 300 soum} a month.",
           "Каждый коэффициент — изменение y на единицу своего x **при неизменных остальных**. Тот же срок, на 1 млн больше: {b|+41 830 сумов}. Та же сумма, на месяц дольше: {o|−184 300 сумов} в месяц.")},
  {"show": {"tri": None, "pred": 300, "predOn": 1, "read": ["pred"]},
   "f": ("ŷ = a + b₁ × principal + b₂ × term", "ŷ = a + b₁ × сумма + b₂ × срок"),
   "say": ("To predict, put the loan's numbers in. A 300 m Auto loan over {b|36} months: 6 582 + 41.83 × 300 − 184.3 × 36 ≈ {y|12 496} thousand soum, 12.5 m a month.",
           "Чтобы предсказать, подставьте числа кредита. Автокредит на 300 млн на {b|36} месяцев: 6 582 + 41,83 × 300 − 184,3 × 36 ≈ {y|12 496} тыс. сумов, 12,5 млн в месяц.")},
  {"f": ("X = [ 1 | principal | term ]  →  np.linalg.lstsq(X, y)", "X = [ 1 | сумма | срок ]  →  np.linalg.lstsq(X, y)"),
   "say": ("A tip for the homework: the computer finds a, b₁ and b₂ with `np.linalg.lstsq(X, y)`. X is a table: a column of 1s (for a), then one column per x.",
           "Совет для домашки: компьютер находит a, b₁ и b₂ через `np.linalg.lstsq(X, y)`. X — таблица: столбец единиц (для a), потом по столбцу на каждый x.")},
  {"say": ("A yes / no column can join too: a [[dummy|a 0/1 column: 1 for this group, 0 for the others]]. Three terms need only **two** dummies; the term left out is the reference the others are compared with.",
           "В модель можно добавить и столбец «да/нет» — [[фиктивную переменную|столбец 0/1: 1 для этой группы, 0 для остальных]]. Трём срокам нужны всего **две** такие; оставленный срок — точка отсчёта, с ним сравнивают остальные.")
   , "ask": {"q": ("Five products in one model: how many product dummies?", "Пять продуктов в одной модели: сколько фиктивных переменных продукта?"),
             "options": (["5", "4", "1 column with the codes 1–5"], ["5", "4", "1 столбец с кодами 1–5"]), "answer": 1,
             "why": ("k groups need k − 1 dummies; the left-out product is the reference. Codes 1–5 would claim SME is “five times” Micro.",
                     "k группам нужно k − 1 фиктивных переменных; оставленный продукт — точка отсчёта. Коды 1–5 означали бы, что SME «в пять раз больше» микрозайма.")}},
  {"say": ("Never put two copies of one number in. The requested amount and the principal have r = 1.000 — every loan was paid as asked. Together they make the coefficients meaningless: keep one.",
           "Никогда не кладите в модель две копии одного числа. У запрошенной суммы и суммы кредита r = 1,000 — каждый кредит выдан как просили. Вместе они делают коэффициенты бессмысленными: оставьте одну.")},
  {"show": sc(pts=MIC, lines=[[0.0007, 0.2716, "b"]], range=[0.5, 4.99], marks=[[300, 16.012]], pred=300, predOn=0, read=["pred"],
              xr=[0, 320], yr=[0, 90], xt=50, yt=20, words=WX),
   "f": ("outside the data's range, a line is a guess", "за пределами данных линия — это догадка"),
   "say": ("The Micro line was fitted on loans of 0.5 to 5 m — the thin strip on the left. Ask it about 300 m: {y|81.5 m} a month. Real SME loans of about 300 m pay a median {y|16.0 m}.",
           "Линию микрозаймов подогнали на кредитах от 0,5 до 5 млн — узкая полоска слева. Спросите её про 300 млн: {y|81,5 млн} в месяц. Настоящие SME-кредиты около 300 млн платят в медиане {y|16,0 млн}.")},
  {"say": ("Using a rule outside the range it has seen is [[extrapolation|predicting outside the range of data a model was fitted on]]. A high R² inside the range says nothing outside it.",
           "Применять правило за пределами того, что оно видело, — [[экстраполяция|прогноз за пределами диапазона данных, на которых модель подгоняли]]. Высокий R² внутри диапазона ничего не говорит о том, что снаружи.")
   , "ask": {"q": ("Where may the Auto rule (R² 0.961) be used?", "Где можно применять правило для автокредитов (R² 0,961)?"),
             "options": (["Anywhere — R² is 0.961", "For Auto loans of 50–400 m over 24–48 months", "For any loan over 24 months"],
                         ["Везде — R² ведь 0,961", "Для автокредитов от 50 до 400 млн на 24–48 месяцев", "Для любого кредита дольше 24 месяцев"]), "answer": 1,
             "why": ("Say the range next to every rule. A 10 m loan over 6 months is outside it: the model would say 5.9 m a month.",
                     "Называйте диапазон рядом с каждым правилом. Кредит на 10 млн на 6 месяцев — за его пределами: модель дала бы 5,9 млн в месяц.")}},
 ]},
]

TOPICS = [
    ("w09d1-s1", "Two numbers, one picture — the scatter plot", "Два числа на одной картинке — диаграмма рассеяния", []),
    ("w09d1-s2", "How close to a line — Pearson's r", "Насколько близко к прямой — r Пирсона", ["w09d1-x2"]),
    ("w09d1-s3", "Cause or coincidence? A game", "Причина или совпадение? Игра", []),
    ("w09d1-s4", "When r is fooled — curves, typos and Spearman's ranks", "Когда r ошибается — кривые, опечатки и ранги Спирмена", []),
    ("w09d1-s5", "The line that misses least — slope, intercept and least squares", "Линия с наименьшими промахами — наклон, свободный член и МНК", ["w09d1-g1"]),
    ("w09d1-s6", "What the line explains — R² and the residual plot", "Что объясняет линия — R² и график остатков", []),
    ("w09d1-s7", "One loan can tilt the line — outliers and leverage", "Один кредит может наклонить линию — выбросы и рычаг", ["w09d1-x1"]),
    ("w09d1-s8", "A rule you can use — more predictors, and where the rule stops", "Правило для работы — несколько предикторов и границы правила", ["w09d1-g2", "w09d1-g3"]),
]

CLIPS_EN = {}
CLIPS_RU = {}
GF = {"min": 60,
      "en": "The same ideas as the stories, written out in full with Python and Excel, plus the correlation matrix, fitting with numpy, scipy and Excel, a product dummy in code, prediction against explanation, and the Depth notes (the annuity behind the fans, interactions, logs). Optional: nothing here counts toward the day.",
      "ru": "Те же идеи, что в историях, но полностью, с Python и Excel, а также корреляционная матрица, подгонка в numpy, scipy и Excel, фиктивная переменная продукта в коде, прогноз против объяснения и углублённые заметки (аннуитет за веерами, взаимодействия, логарифмы). По желанию: здесь ничего не входит в зачёт дня."}


def build(lang):
    return _b(STORIES, lang)


if __name__ == "__main__":
    import json
    for lang in ("en", "ru"):
        b2 = build(lang)
        print(lang, len(b2), sum(len(json.loads(v)["steps"]) for v in b2.values()), "steps")
