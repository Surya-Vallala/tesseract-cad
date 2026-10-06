# Draws the app icon: a tesseract (cube within a cube) in the studio accent colour.
from PIL import Image, ImageDraw
def icon(size, pad_frac, path):
    S = size * 4  # supersample for smooth lines
    im = Image.new('RGB', (S, S), (28, 27, 24))
    d = ImageDraw.Draw(im)
    acc = (214, 125, 36); soft = (120, 82, 40)
    pad = S * pad_frac
    def sq(f):  # square inset by fraction f of the drawable area
        a = pad + (S - 2*pad) * f; b = S - a; return (a, a, b, b)
    o = sq(0.0); i = sq(0.27)
    w = max(4, int(S * 0.028))
    corners = lambda r: [(r[0], r[1]), (r[2], r[1]), (r[2], r[3]), (r[0], r[3])]
    for p, q in zip(corners(o), corners(i)):
        t = w * 0.9 / (((q[0]-p[0])**2 + (q[1]-p[1])**2) ** 0.5)  # start just inside the outer frame
        d.line([(p[0] + (q[0]-p[0]) * t, p[1] + (q[1]-p[1]) * t), q], fill=soft, width=w)
    d.rectangle(i, outline=acc, width=w)
    d.rectangle(o, outline=acc, width=w)
    im.resize((size, size), Image.LANCZOS).save(path)
icon(192, 0.20, 'site/icon-192.png'); icon(512, 0.20, 'site/icon-512.png')
icon(512, 0.28, 'site/icon-maskable-512.png'); icon(180, 0.20, 'site/apple-touch-icon.png')
