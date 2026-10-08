'use strict';
// ===================== Constants & small helpers =====================
const ACI_HEX = 'ACI_TABLE_PLACEHOLDER';
const TAU = Math.PI * 2;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hyp = Math.hypot;
const normAng = (a) => { a = a % TAU; if (a < 0) a += TAU; return a; };
const deg = (r) => r * 180 / Math.PI;
const rad = (d) => d * Math.PI / 180;

// Output switches used when drawing for PDF / image export instead of the screen:
// pdf: draw everything (no small-object culling), lw(lw100) -> line width in output units, color(css, fill) -> printed colour
const RENDER = { pdf: false, lw: null, color: null, solidFills: false }; // solidFills: print hatches without transparency
function aciCss(aci, onLight, fill) { const c = aciCss0(aci, onLight, fill); return RENDER.color ? RENDER.color(c, fill) : c; }
function aciCss0(aci, onLight, fill) {
  if (typeof aci === 'string') return aci; // true colour
  aci = aci | 0;
  if (aci < 1 || aci > 255) aci = 7;
  if (aci === 7) return onLight ? '#1c1b18' : '#f2efe8';
  const hex = ACI_HEX.substr(aci * 6, 6);
  if (onLight && !fill) { // keep very light lines and text readable on white; fills keep their real colour
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum > 0.82) return '#5a5650';
    if (lum > 0.6) { const k = 0.65; return 'rgb(' + (r * k | 0) + ',' + (g * k | 0) + ',' + (b * k | 0) + ')'; }
  }
  return '#' + hex;
}

// ===================== Affine transforms (canvas convention) =====================
// M = {a,b,c,d,e,f}: x' = a x + c y + e ; y' = b x + d y + f
const IDM = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
function mMul(A, B) { // apply B first, then A
  return { a: A.a * B.a + A.c * B.b, b: A.b * B.a + A.d * B.b, c: A.a * B.c + A.c * B.d, d: A.b * B.c + A.d * B.d, e: A.a * B.e + A.c * B.f + A.e, f: A.b * B.e + A.d * B.f + A.f };
}
function mApply(M, p) { return [M.a * p[0] + M.c * p[1] + M.e, M.b * p[0] + M.d * p[1] + M.f]; }
function mVec(M, v) { return [M.a * v[0] + M.c * v[1], M.b * v[0] + M.d * v[1]]; }
function mTranslate(x, y) { return { a: 1, b: 0, c: 0, d: 1, e: x, f: y }; }
function mRotate(t) { const c = Math.cos(t), s = Math.sin(t); return { a: c, b: s, c: -s, d: c, e: 0, f: 0 }; }
function mScale(sx, sy) { return { a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 }; }
function mDet(M) { return M.a * M.d - M.b * M.c; }
function mIsSimilar(M) { const t = 1e-9 * (Math.abs(M.a) + Math.abs(M.b) + 1); return (Math.abs(M.a - M.d) < t && Math.abs(M.b + M.c) < t) || (Math.abs(M.a + M.d) < t && Math.abs(M.b - M.c) < t); }
function mScaleOf(M) { return Math.hypot(M.a, M.b); }
function mAngle(M) { return Math.atan2(M.b, M.a); }
function mInsert(ins, base) { // block space -> parent space
  return mMul(mTranslate(ins.p[0], ins.p[1]), mMul(mRotate(ins.rot || 0), mMul(mScale(ins.sx || 1, ins.sy || 1), mTranslate(-(base ? base[0] : 0), -(base ? base[1] : 0)))));
}
function mMirror(p1, p2) { // reflection about line p1-p2
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1]; const L2 = dx * dx + dy * dy || 1;
  const a = (dx * dx - dy * dy) / L2, b = 2 * dx * dy / L2;
  // x' = a x + b y ; y' = b x - a y (about origin), then translate so p1 fixed
  const M = { a: a, b: b, c: b, d: -a, e: 0, f: 0 };
  const q = mApply(M, p1); M.e = p1[0] - q[0]; M.f = p1[1] - q[1]; return M;
}

// ===================== Geometry =====================
function bulgeArc(p1, p2, b) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1]; const d = Math.hypot(dx, dy);
  if (d < 1e-12 || Math.abs(b) < 1e-12) return null;
  const th = 4 * Math.atan(Math.abs(b));
  const r = d / (2 * Math.sin(th / 2));
  const s = Math.abs(b) * d / 2;
  const nx = -dy / d, ny = dx / d; const sg = Math.sign(b);
  const cx = (p1[0] + p2[0]) / 2 + nx * sg * (r - s), cy = (p1[1] + p2[1]) / 2 + ny * sg * (r - s);
  return { c: [cx, cy], r, a0: Math.atan2(p1[1] - cy, p1[0] - cx), a1: Math.atan2(p2[1] - cy, p2[0] - cx), ccw: b > 0 };
}
function arcSweep(a0, a1, ccw) { // signed sweep from a0 to a1 in given direction
  let s = ccw ? normAng(a1 - a0) : -normAng(a0 - a1);
  if (Math.abs(s) < 1e-12) s = ccw ? TAU : -TAU;
  return s;
}
function arcPoints(c, r, a0, a1, ccw, out, M, step) {
  const sw = arcSweep(a0, a1, ccw);
  const n = Math.max(4, Math.ceil(Math.abs(sw) / (step || (Math.PI / 24))));
  for (let i = 0; i <= n; i++) { const a = a0 + sw * i / n; let p = [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; if (M) p = mApply(M, p); out.push(p[0], p[1]); }
  return out;
}
function ellipsePoints(c, m, k, a0, a1, out, M) {
  const mx = m[0], my = m[1]; const px = -my * k, py = mx * k;
  let sw = normAng(a1 - a0); if (sw < 1e-9) sw = TAU;
  const n = Math.max(8, Math.ceil(sw / (Math.PI / 24)));
  for (let i = 0; i <= n; i++) { const t = a0 + sw * i / n; let p = [c[0] + Math.cos(t) * mx + Math.sin(t) * px, c[1] + Math.cos(t) * my + Math.sin(t) * py]; if (M) p = mApply(M, p); out.push(p[0], p[1]); }
  return out;
}
function nurbsPoints(deg, U, P, closed, out, M) {
  const n = P.length; const p = deg | 0;
  const seg = (q) => { if (M) q = mApply(M, q); out.push(q[0], q[1]); };
  if (n < 2) return out;
  if (!U || U.length !== n + p + 1 || p < 1) { for (const c of P) seg([c[0], c[1]]); if (closed) seg([P[0][0], P[0][1]]); return out; }
  const u0 = U[p], u1 = U[n]; if (!(u1 > u0)) { for (const c of P) seg([c[0], c[1]]); return out; }
  const N = Math.max(12, Math.min(600, (n - p) * 6));
  for (let i = 0; i <= N; i++) {
    const u = (i === N) ? u1 : u0 + (u1 - u0) * i / N;
    let k = p; while (k < n - 1 && u >= U[k + 1]) k++;
    const d = [];
    for (let j = 0; j <= p; j++) { const c = P[k - p + j]; const w = c[2] || 1; d.push([c[0] * w, c[1] * w, w]); }
    for (let r = 1; r <= p; r++) for (let j = p; j >= r; j--) {
      const idx = k - p + j; const den = U[idx + p - r + 1] - U[idx]; const a = den === 0 ? 0 : (u - U[idx]) / den;
      d[j] = [(1 - a) * d[j - 1][0] + a * d[j][0], (1 - a) * d[j - 1][1] + a * d[j][1], (1 - a) * d[j - 1][2] + a * d[j][2]];
    }
    const w = d[p][2] || 1; seg([d[p][0] / w, d[p][1] / w]);
  }
  return out;
}
function catmullPoints(pts, closed, out, M) {
  const n = pts.length; if (n < 2) return out;
  const seg = (q) => { if (M) q = mApply(M, q); out.push(q[0], q[1]); };
  if (n === 2) { seg(pts[0]); seg(pts[1]); return out; }
  const get = (i) => closed ? pts[((i % n) + n) % n] : pts[clamp(i, 0, n - 1)];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let j = 0; j < 8; j++) {
      const t = j / 8, t2 = t * t, t3 = t2 * t;
      seg([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  seg(closed ? pts[0] : pts[n - 1]);
  return out;
}
function splinePoints(sp, out, M) {
  if (sp.cp && sp.cp.length >= 2) return nurbsPoints(sp.deg, sp.knots, sp.cp, sp.closed, out, M);
  if (sp.fit && sp.fit.length >= 2) return catmullPoints(sp.fit, sp.closed, out, M);
  return out;
}
function polyLength(poly, closed) { let L = 0; for (let i = 2; i < poly.length; i += 2) L += Math.hypot(poly[i] - poly[i - 2], poly[i + 1] - poly[i - 1]); if (closed && poly.length >= 4) L += Math.hypot(poly[0] - poly[poly.length - 2], poly[1] - poly[poly.length - 1]); return L; }
function polyArea(poly) { let a = 0; const n = poly.length / 2; for (let i = 0; i < n; i++) { const j = (i + 1) % n; a += poly[2 * i] * poly[2 * j + 1] - poly[2 * j] * poly[2 * i + 1]; } return a / 2; }
function pointInPoly(x, y, poly) { let inside = false; const n = poly.length / 2; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = poly[2 * i], yi = poly[2 * i + 1], xj = poly[2 * j], yj = poly[2 * j + 1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside; } return inside; }
function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1; const L2 = dx * dx + dy * dy;
  let t = L2 ? ((px - x1) * dx + (py - y1) * dy) / L2 : 0; t = clamp(t, 0, 1);
  const qx = x1 + t * dx, qy = y1 + t * dy; return { d: Math.hypot(px - qx, py - qy), x: qx, y: qy, t };
}
function distToPoly(px, py, poly, closed) {
  let best = { d: Infinity }; const n = poly.length;
  for (let i = 2; i < n; i += 2) { const r = distToSeg(px, py, poly[i - 2], poly[i - 1], poly[i], poly[i + 1]); if (r.d < best.d) best = r; }
  if (closed && n >= 4) { const r = distToSeg(px, py, poly[n - 2], poly[n - 1], poly[0], poly[1]); if (r.d < best.d) best = r; }
  return best;
}
function segIntersect(a, b, c, d) { // segments ab and cd
  const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-12) return null;
  const qp = [c[0] - a[0], c[1] - a[1]];
  const t = (qp[0] * s[1] - qp[1] * s[0]) / den, u = (qp[0] * r[1] - qp[1] * r[0]) / den;
  if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
  return [a[0] + t * r[0], a[1] + t * r[1]];
}
function bboxAdd(bb, x, y) { if (x < bb[0]) bb[0] = x; if (y < bb[1]) bb[1] = y; if (x > bb[2]) bb[2] = x; if (y > bb[3]) bb[3] = y; }
function bboxPoly(bb, poly) { for (let i = 0; i < poly.length; i += 2) bboxAdd(bb, poly[i], poly[i + 1]); }
const emptyBox = () => [Infinity, Infinity, -Infinity, -Infinity];
const boxOk = (b) => b[0] <= b[2] && b[1] <= b[3];

// ===================== Text helpers =====================
function mtextPlain(s) {
  if (!s) return [''];
  let out = ''; let i = 0; const n = s.length;
  while (i < n) {
    const ch = s[i];
    if (ch === '\\') {
      const nx = s[i + 1]; if (nx === undefined) break;
      if (nx === 'P' || nx === 'X') { out += '\n'; i += 2; continue; }
      if (nx === '~') { out += ' '; i += 2; continue; }
      if (nx === '\\' || nx === '{' || nx === '}') { out += nx; i += 2; continue; }
      if (nx === 'S') { const end = s.indexOf(';', i + 2); const body = end < 0 ? s.slice(i + 2) : s.slice(i + 2, end); out += body.replace(/\^\s?/, '/').replace('#', '/'); i = end < 0 ? n : end + 1; continue; }
      if (nx === 'U' && s[i + 2] === '+') { const cp = parseInt(s.substr(i + 3, 4), 16); if (!isNaN(cp)) { out += String.fromCharCode(cp); i += 7; continue; } }
      if ('LlOoKk'.includes(nx)) { i += 2; continue; }
      if ('ACcfFHQTWpN'.includes(nx)) { const end = s.indexOf(';', i); i = end < 0 ? n : end + 1; continue; }
      i += 2; continue;
    }
    if (ch === '{' || ch === '}') { i++; continue; }
    if (ch === '%' && s[i + 1] === '%') { const c = (s[i + 2] || '').toLowerCase(); if (c === 'd') { out += '°'; i += 3; continue; } if (c === 'p') { out += '±'; i += 3; continue; } if (c === 'c') { out += '⌀'; i += 3; continue; } if (c === '%') { out += '%'; i += 3; continue; } if (c === 'u' || c === 'o') { i += 3; continue; } }
    out += ch; i++;
  }
  return out.split('\n');
}
function textPlain(s) { return mtextPlain(s).join(' '); }
const measureCv = document.createElement('canvas'); const measureCtx = measureCv.getContext('2d');
const TEXT_FONT = "'IBM Plex Sans', system-ui, sans-serif";
const UI_FONT = "'IBM Plex Mono', ui-monospace, monospace";
const CAP = 0.7; // cap height / em for the UI font
function textWidthUnits(str, h) { measureCtx.font = '100px ' + TEXT_FONT; return measureCtx.measureText(str).width / 100 * (h / CAP); }
function wrapLines(lines, h, width) {
  if (!(width > 0)) return lines;
  const out = [];
  for (const ln of lines) {
    const words = ln.split(/(\s+)/); let cur = '';
    for (const w of words) {
      if (!w) continue;
      const test = cur + w;
      if (cur && textWidthUnits(test.trimEnd(), h) > width * 1.02) { out.push(cur.trimEnd()); cur = /^\s+$/.test(w) ? '' : w; }
      else cur = test;
    }
    out.push(cur.trimEnd());
  }
  return out;
}

// ===================== Units =====================
const UNIT_TO_M = { 0: 0.001, 1: 0.0254, 2: 0.3048, 3: 1609.344, 4: 0.001, 5: 0.01, 6: 1, 7: 1000, 8: 0.0000254, 9: 0.0000254 * 0.001, 10: 0.9144, 14: 0.1 };
const UNIT_NAME = { 0: 'units', 1: 'in', 2: 'ft', 3: 'mi', 4: 'mm', 5: 'cm', 6: 'm', 7: 'km', 8: 'µin', 9: 'mil', 10: 'yd', 14: 'dm' };
// Plain numbers: a decimal point and no thousands separators, whatever the phone's language (2,134 read like 2.134)
function fmtNum(v, dp) { if (!isFinite(v)) return '—'; const a = Math.abs(v); const d = dp != null ? dp : (a >= 1000 ? 0 : a >= 10 ? 1 : 2); const s = v.toFixed(d); return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s; }
function fmtFtIn(m) { const totalIn = m / 0.0254; const sign = totalIn < 0 ? '-' : ''; const eighths = Math.round(Math.abs(totalIn) * 8); /* round first, so 11.99" becomes the next foot, not 12" */ const ft = Math.floor(eighths / 96); let frac = eighths - ft * 96; let whole = Math.floor(frac / 8); frac = frac % 8; let f = whole + ''; if (frac) { let n = frac, d = 8; while (n % 2 === 0) { n /= 2; d /= 2; } f += ' ' + n + '/' + d; } return sign + ft + "' " + f + '"'; }
// Which unit lengths are shown in. Auto: metres for metric drawings, feet-inches for imperial ones.
const IMPERIAL = new Set([1, 2, 3, 8, 9, 10]);
function lenMode() { const mode = state.unitMode; if (mode && mode !== 'auto') return mode; const code = state.drawing ? state.drawing.header.units : 4; return IMPERIAL.has(code) ? 'ft' : code === 0 ? 'raw' : 'm'; }
function fmtLen(v) { // v in drawing units
  const code = state.drawing ? state.drawing.header.units : 4; const toM = UNIT_TO_M[code] || 0.001; const m = v * toM;
  const mode = lenMode();
  if (mode === 'mm') return fmtNum(m * 1000, 0) + ' mm';
  if (mode === 'm') return fmtNum(m, 2) + ' m';
  if (mode === 'ft') return fmtFtIn(m);
  return fmtNum(v) + ' ' + (UNIT_NAME[code] || 'units');
}
function fmtLenAll(v) { const code = state.drawing ? state.drawing.header.units : 4; const toM = UNIT_TO_M[code] || 0.001; const m = v * toM; const mode = lenMode(); const parts = [fmtLen(v)]; if (mode !== 'mm' && !IMPERIAL.has(code)) parts.push(fmtNum(m * 1000, 0) + ' mm'); if (mode === 'mm') parts.push(fmtNum(m, 3) + ' m'); if (mode !== 'ft') parts.push(fmtFtIn(m)); return parts.join('  ·  '); }
// Text written into a placed dimension: the number without the unit for metres and millimetres (as on drawings)
function fmtDimText(v) { const t = fmtLen(v); return t.replace(/ (m|mm)$/, ''); }
function fmtAreaShort(a) { const code = state.drawing ? state.drawing.header.units : 4; const toM = UNIT_TO_M[code] || 0.001; const m2 = a * toM * toM; return lenMode() === 'ft' ? fmtNum(m2 / 0.09290304, 1) + ' sq ft' : fmtNum(m2, 2) + ' m²'; } // for labels on the drawing
function fmtArea(a) { const code = state.drawing ? state.drawing.header.units : 4; const toM = UNIT_TO_M[code] || 0.001; const m2 = a * toM * toM; const sqft = m2 / 0.09290304; return fmtNum(m2, 2) + ' m²  ·  ' + fmtNum(sqft, 1) + ' sq ft  ·  ' + fmtNum(sqft / 9, 2) + ' sq yd'; }
