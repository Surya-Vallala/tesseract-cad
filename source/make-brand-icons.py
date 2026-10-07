# Tesseract CAD Tools mark: the logo's red half-T bracket + a square bracket "C" (TC), on the Studio Dark background.
# One set of proportions (fractions of the drawable width w) drives the PNG icons and the SVG used in the app bar.
from PIL import Image, ImageDraw
import os, sys
A, GAP, C, H, T = 0.42, 0.17, 0.38, 0.46, 0.085   # T-bar width, centre gap, C width, height, stroke
RED, BG = (255, 0, 0), (12, 12, 13)
def strokes(x0, y0, w):
    # returns rectangles (x0,y0,x1,y1) for the mark inside a w-wide box starting at x0, vertically centred at y0
    t = T * w; tw = A * w; g = GAP * w; cw = C * w; h = H * w
    total = tw + g + cw; ox = x0 + (w - total) / 2; top = y0 - h / 2; bot = y0 + h / 2
    tvx = ox + tw                      # T: bar from ox to tvx, vertical at tvx going down
    cvx = tvx + g                      # C: vertical at cvx, bars to the right
    return [(ox, top - t / 2, tvx + t / 2, top + t / 2), (tvx - t / 2, top - t / 2, tvx + t / 2, bot),
            (cvx - t / 2, top - t / 2, cvx + cw, top + t / 2), (cvx - t / 2, top - t / 2, cvx + t / 2, bot + t / 2), (cvx - t / 2, bot - t / 2, cvx + cw, bot + t / 2)]
def icon(size, pad_frac, path):
    S = size * 4; im = Image.new('RGB', (S, S), BG); d = ImageDraw.Draw(im)
    p = S * pad_frac; w = S - 2 * p
    for r in strokes(p, S / 2, w): d.rectangle(r, fill=RED)
    im.resize((size, size), Image.LANCZOS).save(path)
def svg_paths(box=28, margin=2.5):
    w = box - 2 * margin; t = T * w; tw = A * w; g = GAP * w; cw = C * w; h = H * w
    total = tw + g + cw; ox = margin + (w - total) / 2; top = box / 2 - h / 2; bot = box / 2 + h / 2; tvx = ox + tw; cvx = tvx + g
    f = lambda v: f'{v:.2f}'
    return f'<path d="M{f(ox)} {f(top)}H{f(tvx)}V{f(bot)}"/><path d="M{f(cvx + cw)} {f(top)}H{f(cvx)}V{f(bot)}H{f(cvx + cw)}"/>', t
out = sys.argv[1] if len(sys.argv) > 1 else 'site'
icon(192, 0.15, f'{out}/icon-192.png'); icon(512, 0.15, f'{out}/icon-512.png'); icon(512, 0.26, f'{out}/icon-maskable-512.png'); icon(180, 0.15, f'{out}/apple-touch-icon.png')
paths, sw = svg_paths()
open('brand/mark.svg.txt', 'w').write(paths + '\n' + f'{sw:.2f}')
print(paths, sw)
