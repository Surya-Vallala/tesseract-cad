// ===================== App state =====================
const state = {
  drawing: null, spaceIdx: 0, scenes: new Map(), // space index -> scene
  view: { s: 1, tx: 0, ty: 0 }, dpr: Math.max(1, Math.min(3, window.devicePixelRatio || 1)),
  layerVis: new Map(), layerMap: new Map(), curLayer: '0',
  canvasLight: false, unitMode: 'auto', snapOn: true, patOn: true,
  selection: new Set(), undo: [], redo: [], dirty: false,
  tool: null, group: 'view', lastPt: null, hover: null,
  fileBytes: null, fileName: '', kind: 'dwg'
};
const curSpace = () => state.drawing ? state.drawing.spaces[state.spaceIdx] : null;
function layerOn(name) { const v = state.layerVis.get(name); return v === undefined ? true : v; }
function layerAci(name) { const l = state.layerMap.get(name); return l ? l.aci : 7; }
function layerCol(name) { const l = state.layerMap.get(name); return l ? (l.rgb || l.aci) : 7; }

// ===================== Snap grid =====================
class SnapGrid {
  constructor() { this.pts = []; this.cells = new Map(); this.cs = 1; this.bb = emptyBox(); }
  add(x, y, kind) { if (!isFinite(x) || !isFinite(y)) return; this.pts.push(x, y, kind); bboxAdd(this.bb, x, y); }
  build() {
    const bb = this.bb; if (!boxOk(bb)) return;
    const n = this.pts.length / 3; const span = Math.max(bb[2] - bb[0], bb[3] - bb[1], 1e-9);
    this.cs = span / clamp(Math.sqrt(n) * 2, 32, 512);
    for (let i = 0; i < this.pts.length; i += 3) { const k = ((this.pts[i] / this.cs) | 0) + ',' + ((this.pts[i + 1] / this.cs) | 0); let a = this.cells.get(k); if (!a) { a = []; this.cells.set(k, a); } a.push(i); }
  }
  query(x, y, r, on) { // returns best {x,y,kind,d}; `on` (optional) lists which snap kinds are switched on
    let best = null; const i0 = ((x - r) / this.cs) | 0, i1 = ((x + r) / this.cs) | 0, j0 = ((y - r) / this.cs) | 0, j1 = ((y + r) / this.cs) | 0;
    if ((i1 - i0) * (j1 - j0) > 12000) return null; // (was 400: snapping stopped working when zoomed out)
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const a = this.cells.get(i + ',' + j); if (!a) continue; for (const idx of a) { const px = this.pts[idx], py = this.pts[idx + 1]; const d = Math.hypot(px - x, py - y); if (d <= r) { const kind = this.pts[idx + 2]; if (on && !on[kind]) continue; const score = d * (kind === 1 ? 0.8 : kind === 3 ? 0.9 : 1); if (!best || score < best.score) best = { x: px, y: py, kind, d, score }; } } }
    return best;
  }
}

// ===================== Scene build =====================
const KEY_SEP = '\u0001';
function makeScene() { return { items: [], viewports: [], bbox: emptyBox(), snap: new SnapGrid(), textBox: emptyBox(), nFills: 0, nTexts: 0 }; }
let curAl = 1, curLts = 1, curLw = -3, curScene = null; // opacity, linetype scale and lineweight of the entity being emitted (set in emitEntity)
function sceneKey(S, layer, aci, lt, item, al, lts, lw) {
  if (al == null) al = curAl; if (lts == null) lts = lt ? curLts : 1; if (lw == null) lw = curLw;
  const k = layer + KEY_SEP + aci + KEY_SEP + (lt || '') + KEY_SEP + al + KEY_SEP + lts + KEY_SEP + lw;
  let e = item.pathMap.get(k); if (!e) { e = { layer, aci, lt: lt || '', al, lts, lw, path: new Path2D(), n: 0 }; item.pathMap.set(k, e); item.paths.push(e); } return e;
}
function resolveLayer(e, ctx) { return (e.L === '0' && ctx.layer) ? ctx.layer : (e.L || '0'); }
// Colour is an ACI number (1..255) or a true colour string '#rrggbb'.
function resolveColor(e, ctx, layer) { if (e.rgb) return e.rgb; let c = e.c; if (c === 0 && ctx.color != null) return ctx.color; if (c === 0 || c === 256 || c == null || c < 0 || c > 255) return layerCol(layer); return c; }
// Opacity 0..1: explicit value, ByBlock (-1) takes the insert's, ByLayer/none is opaque.
function resolveAlpha(e, ctx, layer) { const a = e.al; if (a === -1) return ctx.al != null ? ctx.al : 1; if (a != null && a >= 0) return a; const l = state.layerMap.get(layer); return l && l.al != null ? l.al : 1; }
// Lineweight in 1/100 mm (-3 = Default): the object's own, its block's (ByBlock) or its layer's (ByLayer)
function resolveLw(e, ctx, layer) { const v = e.lw; if (v != null && v >= 0) return v; if (v === -3) return -3; if (v === -2) return ctx.lw != null ? ctx.lw : -3; const l = state.layerMap.get(layer); return l && l.lw != null && l.lw >= 0 ? l.lw : -3; }
function resolveLt(e, ctx, layer) { let lt = e.lt || ''; if (!lt || /^bylayer$/i.test(lt)) { const l = state.layerMap.get(layer); lt = l ? l.lt : ''; } if (/^byblock$/i.test(lt)) lt = ctx.lt || ''; if (/^continuous$/i.test(lt)) lt = ''; return lt; }

function buildScene(space) {
  const S = makeScene();
  const D = state.drawing;
  // A layout's own full-sheet viewport (lowest id, 1:1) is the sheet itself, not a window into the model.
  if (space.paper) { let mv = null; for (const e of space.ents) if (e.t === 'VIEWPORT' && (mv === null || e.vid < mv.vid)) mv = e; if (mv && Math.abs((mv.h || 0) / (mv.vh || 1) - 1) < 1e-6) S.sheetVid = mv.vid; }
  curScene = S;
  for (const e of space.ents) {
    const item = { ent: e, polys: [], bbox: emptyBox(), fillPoly: null, closed: false, kind: e.t, paths: [], pathMap: new Map(), fills: [], wipes: [], texts: [], diag: 0 };
    try { emitEntity(e, IDM, { layer: null, color: null, lt: '' }, S, item, 0); } catch (err) { console.warn('emit failed', e.t, err); }
    if (item.polys.length || item.fillPoly || (item.inst && item.inst.length)) { item.pathMap = null; item.diag = boxOk(item.bbox) ? Math.hypot(item.bbox[2] - item.bbox[0], item.bbox[3] - item.bbox[1]) : 0; S.items.push(item); S.nFills += item.fills.length; S.nTexts += item.texts.length; if (boxOk(item.bbox) && e.t !== 'VIEWPORT') { bboxAdd(S.bbox, item.bbox[0], item.bbox[1]); bboxAdd(S.bbox, item.bbox[2], item.bbox[3]); } }
  }
  if (!boxOk(S.bbox) && boxOk(S.textBox)) S.bbox = S.textBox.slice();
  S.snap.build();
  return S;
}

function emitPoly(S, item, pts, closed, key, M) { // pts: flat array in local coords (already transformed if M null)
  if (pts.length < 4) return;
  const p = key.path; p.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]); if (closed) p.closePath(); key.n++;
  item.polys.push(closed ? pts.concat([pts[0], pts[1]]) : pts); bboxPoly(item.bbox, pts);
}
function addSnapEnds(S, pts, closed) {
  const n = pts.length; if (n < 2 || n > 64) return;
  for (let i = 0; i < n; i += 2) { S.snap.add(pts[i], pts[i + 1], 1); if (i >= 2) S.snap.add((pts[i] + pts[i - 2]) / 2, (pts[i + 1] + pts[i - 1]) / 2, 2); }
  if (closed && n >= 4) S.snap.add((pts[0] + pts[n - 2]) / 2, (pts[1] + pts[n - 1]) / 2, 2);
}
function emitArc(S, item, key, c, r, a0, a1, ccw, M, isFull) {
  const flat = [];
  if (mIsSimilar(M)) {
    const sc = mScaleOf(M), det = mDet(M); const cc = mApply(M, c); const rr = r * sc;
    const d0 = mVec(M, [Math.cos(a0), Math.sin(a0)]), d1 = mVec(M, [Math.cos(a1), Math.sin(a1)]);
    const b0 = Math.atan2(d0[1], d0[0]), b1 = Math.atan2(d1[1], d1[0]); const ccw2 = det < 0 ? !ccw : ccw;
    const p = key.path;
    if (isFull) { p.moveTo(cc[0] + rr, cc[1]); p.arc(cc[0], cc[1], rr, 0, TAU); }
    else { p.moveTo(cc[0] + rr * Math.cos(b0), cc[1] + rr * Math.sin(b0)); p.arc(cc[0], cc[1], rr, b0, b1, !ccw2); }
    key.n++;
    arcPoints(cc, rr, isFull ? 0 : b0, isFull ? TAU : b1, isFull ? true : ccw2, flat, null, Math.PI / 12);
    S.snap.add(cc[0], cc[1], 3);
    for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; if (isFull || angInArc(a, b0, b1, ccw2)) S.snap.add(cc[0] + rr * Math.cos(a), cc[1] + rr * Math.sin(a), 7); }
    if (!isFull) { S.snap.add(flat[0], flat[1], 1); S.snap.add(flat[flat.length - 2], flat[flat.length - 1], 1); const mid = (b0 + arcSweep(b0, b1, ccw2) / 2); S.snap.add(cc[0] + rr * Math.cos(mid), cc[1] + rr * Math.sin(mid), 2); }
    addCurve(item, cc, rr, b0, b1, ccw2, isFull);
  } else {
    arcPoints(c, r, isFull ? 0 : a0, isFull ? TAU : a1, isFull ? true : ccw, flat, M, Math.PI / 12);
    const p = key.path; p.moveTo(flat[0], flat[1]); for (let i = 2; i < flat.length; i += 2) p.lineTo(flat[i], flat[i + 1]); key.n++;
    const cc = mApply(M, c); S.snap.add(cc[0], cc[1], 3); S.snap.add(flat[0], flat[1], 1); S.snap.add(flat[flat.length - 2], flat[flat.length - 1], 1);
  }
  item.polys.push(flat); bboxPoly(item.bbox, flat);
}
function emitEllipse(S, item, key, c, m, k, a0, a1, M) {
  const flat = []; const full = Math.abs(normAng(a1 - a0)) < 1e-9 || Math.abs((a1 - a0) - TAU) < 1e-6;
  if (mIsSimilar(M)) {
    const det = mDet(M); const cc = mApply(M, c); const mm = mVec(M, m); const rx = Math.hypot(mm[0], mm[1]), ry = rx * k; const rot = Math.atan2(mm[1], mm[0]);
    const p = key.path;
    if (full) { p.moveTo(cc[0] + mm[0], cc[1] + mm[1]); p.ellipse(cc[0], cc[1], rx, ry, rot, 0, TAU, false); }
    else if (det >= 0) { const sx = cc[0] + Math.cos(a0) * mm[0] - Math.sin(a0) * mm[1] * k, sy = cc[1] + Math.cos(a0) * mm[1] + Math.sin(a0) * mm[0] * k; p.moveTo(sx, sy); p.ellipse(cc[0], cc[1], rx, ry, rot, a0, a1, false); }
    else { const sx = cc[0] + Math.cos(-a0) * mm[0] - Math.sin(-a0) * mm[1] * k, sy = cc[1] + Math.cos(-a0) * mm[1] + Math.sin(-a0) * mm[0] * k; p.moveTo(sx, sy); p.ellipse(cc[0], cc[1], rx, ry, rot, -a0, -a1, true); }
    key.n++;
    const q = []; ellipsePoints(c, m, k, full ? 0 : a0, full ? TAU : a1, q, M); for (const v of q) flat.push(v);
    S.snap.add(cc[0], cc[1], 3);
    if (full) { const mn = [-mm[1] * k, mm[0] * k]; S.snap.add(cc[0] + mm[0], cc[1] + mm[1], 7); S.snap.add(cc[0] - mm[0], cc[1] - mm[1], 7); S.snap.add(cc[0] + mn[0], cc[1] + mn[1], 7); S.snap.add(cc[0] - mn[0], cc[1] - mn[1], 7); }
  } else { ellipsePoints(c, m, k, full ? 0 : a0, full ? TAU : a1, flat, M); const p = key.path; p.moveTo(flat[0], flat[1]); for (let i = 2; i < flat.length; i += 2) p.lineTo(flat[i], flat[i + 1]); key.n++; }
  if (!full) { S.snap.add(flat[0], flat[1], 1); S.snap.add(flat[flat.length - 2], flat[flat.length - 1], 1); }
  item.polys.push(flat); bboxPoly(item.bbox, flat);
}
// polyline with bulges -> adds to path + flat poly
function emitPline(S, item, key, v, closed, M) {
  const n = v.length; if (n < 2) return;
  const p = key.path; const flat = [];
  const first = mApply(M, v[0]); p.moveTo(first[0], first[1]); flat.push(first[0], first[1]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = v[i], b = v[(i + 1) % n]; const bulge = a[2] || 0;
    const arc = bulge ? bulgeArc(a, b, bulge) : null;
    if (arc) {
      if (mIsSimilar(M)) {
        const sc = mScaleOf(M), det = mDet(M); const cc = mApply(M, arc.c); const rr = arc.r * sc; const d0 = mVec(M, [Math.cos(arc.a0), Math.sin(arc.a0)]), d1 = mVec(M, [Math.cos(arc.a1), Math.sin(arc.a1)]); const b0 = Math.atan2(d0[1], d0[0]), b1 = Math.atan2(d1[1], d1[0]); const ccw = det < 0 ? !arc.ccw : arc.ccw;
        p.arc(cc[0], cc[1], rr, b0, b1, !ccw); const q = []; arcPoints(cc, rr, b0, b1, ccw, q, null, Math.PI / 12); for (let j = 2; j < q.length; j++) flat.push(q[j]); S.snap.add(cc[0], cc[1], 3); addCurve(item, cc, rr, b0, b1, ccw, false);
      } else { const q = []; arcPoints(arc.c, arc.r, arc.a0, arc.a1, arc.ccw, q, M, Math.PI / 12); for (let j = 2; j < q.length; j += 2) { p.lineTo(q[j], q[j + 1]); flat.push(q[j], q[j + 1]); } }
    } else { const q = mApply(M, b); p.lineTo(q[0], q[1]); flat.push(q[0], q[1]); }
  }
  if (closed) p.closePath(); key.n++;
  item.polys.push(flat); bboxPoly(item.bbox, flat);
  for (let i = 0; i < n; i++) { const q = mApply(M, v[i]); S.snap.add(q[0], q[1], 1); const b = v[(i + 1) % n]; if ((i < n - 1 || closed) && !(v[i][2])) { const qb = mApply(M, b); S.snap.add((q[0] + qb[0]) / 2, (q[1] + qb[1]) / 2, 2); } }
  return flat;
}
function hatchLoopToPath(S, path, loop, M, flatOut) { // returns flat polygon
  const flat = [];
  if (loop.v) { // polyline loop
    const v = loop.v, n = v.length; const first = mApply(M, v[0]); path.moveTo(first[0], first[1]); flat.push(first[0], first[1]);
    for (let i = 0; i < n; i++) { const a = v[i], b = v[(i + 1) % n]; const arc = (a[2] || 0) ? bulgeArc(a, b, a[2]) : null; if (arc) { const q = []; arcPoints(arc.c, arc.r, arc.a0, arc.a1, arc.ccw, q, M, Math.PI / 16); for (let j = 2; j < q.length; j += 2) { path.lineTo(q[j], q[j + 1]); flat.push(q[j], q[j + 1]); } } else { const q = mApply(M, b); path.lineTo(q[0], q[1]); flat.push(q[0], q[1]); } }
    path.closePath();
  } else {
    let started = false;
    for (const ed of loop.e) {
      const q = [];
      if (ed.t === 1) { const a = mApply(M, ed.a), b = mApply(M, ed.b); q.push(a[0], a[1], b[0], b[1]); }
      // Clockwise hatch arc/ellipse edges store their angles negated (DXF/DWG convention): the edge runs
      // clockwise from -start to -end. Build it counter-clockwise from -end to -start, then reverse.
      else if (ed.t === 2) arcPoints(ed.c, ed.r, ed.ccw ? ed.a0 : -ed.a1, ed.ccw ? ed.a1 : -ed.a0, true, q, M, Math.PI / 16);
      else if (ed.t === 3) { const m = ed.m; const k = ed.k; const a0 = ed.ccw ? ed.a0 : -ed.a1, a1 = ed.ccw ? ed.a1 : -ed.a0; ellipsePoints(ed.c, m, k, a0, a1, q, M); if (!ed.ccw) { const r = []; for (let i = q.length - 2; i >= 0; i -= 2) r.push(q[i], q[i + 1]); q.length = 0; for (const v of r) q.push(v); } }
      else if (ed.t === 4) splinePoints(ed, q, M);
      if (q.length < 4) continue;
      if (!ed.ccw && ed.t === 2) { const r = []; for (let i = q.length - 2; i >= 0; i -= 2) r.push(q[i], q[i + 1]); q.length = 0; for (const v of r) q.push(v); }
      // ensure continuity with previous point
      if (flat.length >= 2) { const lx = flat[flat.length - 2], ly = flat[flat.length - 1]; const dS = Math.hypot(q[0] - lx, q[1] - ly), dE = Math.hypot(q[q.length - 2] - lx, q[q.length - 1] - ly); if (dE < dS) { const r = []; for (let i = q.length - 2; i >= 0; i -= 2) r.push(q[i], q[i + 1]); q.length = 0; for (const v of r) q.push(v); } }
      let j = 0; if (!started) { path.moveTo(q[0], q[1]); flat.push(q[0], q[1]); started = true; j = 2; } else j = 2;
      for (; j < q.length; j += 2) { path.lineTo(q[j], q[j + 1]); flat.push(q[j], q[j + 1]); }
    }
    if (started) path.closePath();
  }
  if (flatOut) for (const v of flat) flatOut.push(v);
  return flat;
}

function emitEntity(e, M, ctx, S, item, depth) {
  const layer = resolveLayer(e, ctx); const aci = resolveColor(e, ctx, layer); const al = resolveAlpha(e, ctx, layer); curAl = al; curLts = (e.lts || 1) * (ctx.lts || 1); curLw = resolveLw(e, ctx, layer);
  switch (e.t) {
    case 'LINE': { const a = mApply(M, e.a), b = mApply(M, e.b); const key = sceneKey(S, layer, aci, resolveLt(e, ctx, layer), item); emitPoly(S, item, [a[0], a[1], b[0], b[1]], false, key, M); S.snap.add(a[0], a[1], 1); S.snap.add(b[0], b[1], 1); S.snap.add((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 2); break; }
    case 'PLINE': { const key = sceneKey(S, layer, aci, resolveLt(e, ctx, layer), item); const flat = emitPline(S, item, key, e.v, e.closed, M); if (e.closed && flat) { item.closed = true; item.fillPoly = flat; const gb = boxOfFlat(flat); const gw = gb[2] - gb[0], gh = gb[3] - gb[1]; const gc = Math.min(gw, gh) > Math.max(gw, gh) * 0.15 ? polyCentroid(flat) : null; if (gc) S.snap.add(gc[0], gc[1], 11); /* not for long thin shapes such as wall outlines */ } break; }
    case 'ARC': { const key = sceneKey(S, layer, aci, resolveLt(e, ctx, layer), item); emitArc(S, item, key, e.ce, e.r, e.a0, e.a1, true, M, false); break; }
    case 'CIRCLE': { const key = sceneKey(S, layer, aci, resolveLt(e, ctx, layer), item); emitArc(S, item, key, e.ce, e.r, 0, TAU, true, M, true); item.closed = true; item.fillPoly = item.polys[0]; break; }
    case 'ELLIPSE': { const key = sceneKey(S, layer, aci, resolveLt(e, ctx, layer), item); emitEllipse(S, item, key, e.ce, e.m, e.k, e.a0, e.a1, M); break; }
    case 'SPLINE': { const key = sceneKey(S, layer, aci, resolveLt(e, ctx, layer), item); const flat = splinePoints(e, [], M); if (flat.length >= 4) { emitPoly(S, item, flat, !!e.closed, key, M); S.snap.add(flat[0], flat[1], 1); S.snap.add(flat[flat.length - 2], flat[flat.length - 1], 1); const src = (e.fit && e.fit.length) ? e.fit : []; for (const f of src) { const q = mApply(M, f); S.snap.add(q[0], q[1], 1); } } break; }
    case 'POINT': { const p = mApply(M, e.p); const key = sceneKey(S, layer, aci, '', item); const r = 0; item.polys.push([p[0], p[1], p[0], p[1]]); bboxAdd(item.bbox, p[0], p[1]); S.snap.add(p[0], p[1], 8); key.n += 0; break; }
    case 'FACE': case 'SOLID': { const key = sceneKey(S, layer, aci, '', item); const pts = []; for (const q of e.pts) { const w = mApply(M, q); pts.push(w[0], w[1]); } if (e.t === 'SOLID') { const path = new Path2D(); path.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) path.lineTo(pts[i], pts[i + 1]); path.closePath(); item.fills.push({ layer, aci, al, path, solid: true, bbox: boxOfFlat(pts), id: e.id }); item.fillPoly = pts.concat([pts[0], pts[1]]); item.polys.push(item.fillPoly); bboxPoly(item.bbox, pts); } else emitPoly(S, item, pts, true, key, M); addSnapEnds(S, pts, true); break; }
    case 'LEADER': { const key = sceneKey(S, layer, aci, '', item); const pts = []; for (const q of e.pts) { const w = mApply(M, q); pts.push(w[0], w[1]); } emitPoly(S, item, pts, false, key, M); addSnapEnds(S, pts, false); if (e.arrow && pts.length >= 4) { const ax = pts[0], ay = pts[1], bx = pts[2], by = pts[3]; const L = Math.hypot(bx - ax, by - ay) || 1; const sz = Math.min(L * 0.5, mScaleOf(M) * 180 * (state.drawing && state.drawing.header.units === 4 ? 1 : 0.02)); const ux = (bx - ax) / L, uy = (by - ay) / L; const path = new Path2D(); path.moveTo(ax, ay); path.lineTo(ax + ux * sz - uy * sz * 0.18, ay + uy * sz + ux * sz * 0.18); path.lineTo(ax + ux * sz + uy * sz * 0.18, ay + uy * sz - ux * sz * 0.18); path.closePath(); item.fills.push({ layer, aci, al, path, solid: true, bbox: boxOfFlat([ax, ay, bx, by]), id: e.id }); } break; }
    case 'WIPEOUT': { const pts = []; for (const q of e.pts) { const w = mApply(M, q); pts.push(w[0], w[1]); } const path = new Path2D(); path.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) path.lineTo(pts[i], pts[i + 1]); path.closePath(); item.wipes.push({ layer, path }); item.fillPoly = pts.concat([pts[0], pts[1]]); item.polys.push(item.fillPoly); bboxPoly(item.bbox, pts); break; }
    case 'IMAGE': { const key = sceneKey(S, layer, 8, '', item); const pts = []; for (const q of e.pts) { const w = mApply(M, q); pts.push(w[0], w[1]); } emitPoly(S, item, pts, true, key, M); break; }
    case 'TEXT': { const sc = mScaleOf(M); const anchor = (e.ha || e.va) && (e.ap[0] || e.ap[1]) ? e.ap : e.p; const p = mApply(M, anchor); const dir = mVec(M, [Math.cos(e.rot || 0), Math.sin(e.rot || 0)]); const rot = Math.atan2(dir[1], dir[0]); const h = e.h * sc; const str = textPlain(e.s); if (!str.trim()) break; const t = { layer, aci, al, x: p[0], y: p[1], h, rot, lines: [str], ha: e.ha || 0, va: e.va || 0, mt: false, wf: e.wf || 1, id: e.id }; item.texts.push(t); const w = textWidthUnits(str, h) * (e.wf || 1); textItemBox(item, t, w, h, S); S.snap.add(p[0], p[1], 4); break; }
    case 'MTEXT': { const sc = mScaleOf(M); const p = mApply(M, e.p); const dir = mVec(M, [Math.cos(e.rot || 0), Math.sin(e.rot || 0)]); const rot = Math.atan2(dir[1], dir[0]); const h = e.h * sc; const w = (e.w || 0) * sc; let lines = mtextPlain(e.s); if (!lines.join('').trim()) break; lines = wrapLines(lines, h, w); const t = { layer, aci, al, x: p[0], y: p[1], h, rot, lines, at: e.at || 1, ls: e.ls || 1, mt: true, w, id: e.id }; item.texts.push(t); let mw = 0; for (const ln of lines) mw = Math.max(mw, textWidthUnits(ln, h)); textItemBox(item, t, Math.max(mw, w * 0.5), h + (lines.length - 1) * h * 1.667 * t.ls, S); S.snap.add(p[0], p[1], 4); break; }
    case 'INSERT': {
      if (depth > 12) break; const blk = state.drawing.blocks[e.n]; if (!blk) break;
      const cols = e.cols || 1, rows = e.rows || 1; const ctx2 = { layer, color: aci, lt: resolveLt(e, ctx, layer), al, lts: curLts, lw: curLw };
      const g = getBlockGeom(e.n, ctx2, depth);
      if (!item.inst) item.inst = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const ins = (cols > 1 || rows > 1) ? { ...e, p: [e.p[0] + c * (e.cs || 0) * Math.cos(e.rot || 0) - r * (e.rs || 0) * Math.sin(e.rot || 0), e.p[1] + c * (e.cs || 0) * Math.sin(e.rot || 0) + r * (e.rs || 0) * Math.cos(e.rot || 0)] } : e;
        const M2 = mMul(M, mInsert(ins, blk.base));
        if (depth > 0) flattenBlock(g, M2, S, item); // nested inside another block definition: copy geometry
        else instanceBlock(g, M2, S, item);
      }
      if (e.att) for (const a of e.att) { if (a.inv) continue; emitEntity({ t: 'TEXT', L: a.L, c: a.c, rgb: a.rgb, al: a.al, p: a.p, ap: a.ap, h: a.h, rot: a.rot, s: a.s, ha: a.ha, va: a.va, id: e.id }, M, { layer, color: aci, lt: '', al, lw: ctx2.lw }, S, item, depth + 1); }
      const ip = mApply(M, e.p); S.snap.add(ip[0], ip[1], 4);
      if (!item.polys.length && !item.fillPoly && !(item.inst && item.inst.length)) { item.polys.push([ip[0], ip[1], ip[0], ip[1]]); bboxAdd(item.bbox, ip[0], ip[1]); }
      break;
    }
    case 'HATCH': {
      const path = new Path2D(); let first = null; const loops = [];
      for (const loop of e.paths) {
        if (loop.miss > 1) { // boundary only partly readable: use it only if what was read still closes up
          const tmp = new Path2D(); const fl = hatchLoopToPath(S, tmp, loop, M, null); if (fl.length < 6) continue;
          const lb = boxOfFlat(fl); const diag = Math.hypot(lb[2] - lb[0], lb[3] - lb[1]); const gap = Math.hypot(fl[0] - fl[fl.length - 2], fl[1] - fl[fl.length - 1]);
          if (!(gap <= diag * 0.02)) { S.partialHatch = (S.partialHatch || 0) + 1; continue; }
          path.addPath(tmp); loops.push(fl); if (!first) first = fl; continue;
        }
        const flat = hatchLoopToPath(S, path, loop, M, null); if (flat.length >= 6) { loops.push(flat); if (!first) first = flat; }
      }
      if (!first) break;
      const bb = emptyBox(); for (const l of loops) bboxPoly(bb, l);
      const f = { layer, aci, al, lw: curLw, path, solid: e.solid, bbox: bb, id: e.id, loops };
      if (!e.solid && e.pat) {
        const sc = mScaleOf(M), ang = mAngle(M), det = mDet(M);
        const lines = []; let minSp = Infinity;
        for (const ln of e.pat.lines) {
          const a = det < 0 ? ang - ln.a : ang + ln.a; const b = mApply(M, ln.b); const o = mVec(M, ln.o);
          const dx = Math.cos(a), dy = Math.sin(a); const nd = dx * o[1] - dy * o[0]; if (Math.abs(nd) < 1e-9) continue;
          const dash = ln.d.map(v => v * sc); let per = 0; for (const v of dash) per += Math.abs(v);
          lines.push({ dx, dy, b, o, nd, dash, per }); minSp = Math.min(minSp, Math.abs(nd));
        }
        f.pat = { lines, minSp };
      }
      item.fills.push(f);
      item.fillPoly = first.concat([first[0], first[1]]); for (const l of loops) item.polys.push(l.concat([l[0], l[1]])); bboxPoly(item.bbox, first); item.closed = true; item.hatch = true;
      for (const loop of e.paths) if (loop.v && loop.v.length <= 64) for (const v of loop.v) { const q = mApply(M, v); S.snap.add(q[0], q[1], 1); }
      break;
    }
    case 'VIEWPORT': {
      if (e.vid === 1 || !e.on || (curScene && curScene.sheetVid === e.vid)) break;
      const x0 = e.ce[0] - e.w / 2, y0 = e.ce[1] - e.h / 2, x1 = e.ce[0] + e.w / 2, y1 = e.ce[1] + e.h / 2;
      const key = sceneKey(S, layer, aci, '', item); const pts = [x0, y0, x1, y0, x1, y1, x0, y1];
      emitPoly(S, item, pts, true, key, M); S.viewports.push({ x0, y0, x1, y1, vc: e.vc, sc: e.h / (e.vh || 1), layer, id: e.id });
      break;
    }
  }
}
// Circles and arcs kept exactly (centre, radius, angles) for tangent and perpendicular snaps.
function addCurve(item, c, r, a0, a1, ccw, full) { (item.curves || (item.curves = [])).push({ c: [c[0], c[1]], r, a0, a1, ccw, full: !!full }); }
function angInArc(a, a0, a1, ccw) { if (Math.abs(normAng(a - a0)) < 1e-9 || Math.abs(normAng(a - a1)) < 1e-9) return true; return Math.abs(arcSweep(a0, a, ccw)) <= Math.abs(arcSweep(a0, a1, ccw)) + 1e-9; }
function curveToWorld(cv, M) {
  if (!mIsSimilar(M)) return null; const sc = mScaleOf(M), det = mDet(M); const c = mApply(M, cv.c);
  if (cv.full) return { c, r: cv.r * sc, a0: 0, a1: TAU, ccw: true, full: true };
  const d0 = mVec(M, [Math.cos(cv.a0), Math.sin(cv.a0)]), d1 = mVec(M, [Math.cos(cv.a1), Math.sin(cv.a1)]);
  return { c, r: cv.r * sc, a0: Math.atan2(d0[1], d0[0]), a1: Math.atan2(d1[1], d1[0]), ccw: det < 0 ? !cv.ccw : cv.ccw, full: false };
}
function polyCentroid(f) { // area centroid of a closed flat polygon
  const n = f.length / 2; if (n < 3) return null; let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; const x0 = f[2 * i], y0 = f[2 * i + 1], x1 = f[2 * j], y1 = f[2 * j + 1]; const k = x0 * y1 - x1 * y0; A += k; cx += (x0 + x1) * k; cy += (y0 + y1) * k; }
  if (Math.abs(A) < 1e-12) return null; return [cx / (3 * A), cy / (3 * A)];
}
function boxOfFlat(pts) { const b = emptyBox(); bboxPoly(b, pts); return b; }
function textItemBox(item, t, w, totalH, S) {
  // approximate rotated box around the anchor for picking
  const cs = Math.cos(t.rot), sn = Math.sin(t.rot); let ox = 0, oy = 0;
  if (t.mt) { const col = (t.at - 1) % 3, row = Math.floor((t.at - 1) / 3); ox = col === 1 ? -w / 2 : col === 2 ? -w : 0; oy = row === 0 ? -totalH : row === 1 ? -totalH / 2 : 0; }
  else { ox = t.ha === 1 || t.ha === 4 ? -w / 2 : t.ha === 2 ? -w : 0; oy = t.va === 2 ? -totalH / 2 : t.va === 3 ? -totalH : 0; }
  const corners = [[ox, oy], [ox + w, oy], [ox + w, oy + totalH], [ox, oy + totalH]]; const pts = [];
  for (const [cx, cy] of corners) pts.push(t.x + cx * cs - cy * sn, t.y + cx * sn + cy * cs);
  item.fillPoly = pts.concat([pts[0], pts[1]]); item.polys.push(item.fillPoly); bboxPoly(item.bbox, pts); bboxPoly(S.textBox, pts); item.isText = true;
}

// ===================== Block geometry cache (instancing) =====================
let blockCache = new Map(); // per open drawing (swapped with the active tab)
function newItem(e) { return { ent: e, polys: [], bbox: emptyBox(), fillPoly: null, closed: false, kind: e.t, paths: [], pathMap: new Map(), fills: [], wipes: [], texts: [], diag: 0 }; }
function getBlockGeom(name, ctx, depth) {
  const key = name + '|' + (ctx.layer || '') + '|' + (ctx.color == null ? '' : ctx.color) + '|' + (ctx.lt || '') + '|' + (ctx.al == null ? 1 : ctx.al) + '|' + (ctx.lts || 1) + '|' + (ctx.lw == null ? -3 : ctx.lw);
  let g = blockCache.get(key); if (g) return g;
  const blk = state.drawing.blocks[name]; const S2 = makeScene(); const it = newItem({ t: 'BLOCKDEF', id: -1 });
  for (const sub of blk.ents) { try { emitEntity(sub, IDM, ctx, S2, it, depth + 1); } catch (err) { console.warn('block emit', name, sub.t, err); } }
  let segs = 0; for (const p of it.polys) segs += p.length / 2;
  g = { paths: it.paths, fills: it.fills, wipes: it.wipes, texts: it.texts, polys: it.polys, curves: it.curves || [], bbox: it.bbox, snap: S2.snap.pts, grid: null, segs, diag: boxOk(it.bbox) ? Math.hypot(it.bbox[2] - it.bbox[0], it.bbox[3] - it.bbox[1]) : 0 };
  blockCache.set(key, g); return g;
}
function domMatrix(M) { return new DOMMatrix([M.a, M.b, M.c, M.d, M.e, M.f]); }
function mInverse(M) { const det = mDet(M) || 1e-12; return { a: M.d / det, b: -M.b / det, c: -M.c / det, d: M.a / det, e: (M.c * M.f - M.d * M.e) / det, f: (M.b * M.e - M.a * M.f) / det }; }
function transformText(t, M) { const p = mApply(M, [t.x, t.y]); const sc = mScaleOf(M); const d = mVec(M, [Math.cos(t.rot), Math.sin(t.rot)]); return { ...t, x: p[0], y: p[1], h: t.h * sc, rot: Math.atan2(d[1], d[0]), w: t.w ? t.w * sc : t.w }; }
function transformFill(f, M) {
  const path = new Path2D(); path.addPath(f.path, domMatrix(M)); const bb = emptyBox(); const c = [[f.bbox[0], f.bbox[1]], [f.bbox[2], f.bbox[1]], [f.bbox[2], f.bbox[3]], [f.bbox[0], f.bbox[3]]]; for (const q of c) { const w = mApply(M, q); bboxAdd(bb, w[0], w[1]); }
  const nf = { ...f, path, bbox: bb };
  if (f.pat) { const sc = mScaleOf(M); const det = mDet(M); nf.pat = { minSp: f.pat.minSp * sc, lines: f.pat.lines.map(ln => { const d = mVec(M, [ln.dx, ln.dy]); const L = Math.hypot(d[0], d[1]) || 1; const b = mApply(M, ln.b); const o = mVec(M, ln.o); const dx = d[0] / L, dy = d[1] / L; return { dx, dy, b, o, nd: dx * o[1] - dy * o[0], dash: ln.dash.map(v => v * sc), per: ln.per * sc }; }) }; }
  return nf;
}
function flattenBlock(g, M, S, item) {
  const dm = domMatrix(M);
  for (const k of g.paths) { const key = sceneKey(S, k.layer, k.aci, k.lt, item, k.al, k.lts, k.lw); key.path.addPath(k.path, dm); key.n += k.n; }
  for (const f of g.fills) item.fills.push(transformFill(f, M));
  for (const w of g.wipes) { const path = new Path2D(); path.addPath(w.path, dm); item.wipes.push({ layer: w.layer, path }); }
  for (const t of g.texts) item.texts.push(transformText(t, M));
  for (const poly of g.polys) { const q = new Array(poly.length); for (let i = 0; i < poly.length; i += 2) { const w = mApply(M, [poly[i], poly[i + 1]]); q[i] = w[0]; q[i + 1] = w[1]; } item.polys.push(q); bboxPoly(item.bbox, q); }
  for (const cv of g.curves || []) { const w = curveToWorld(cv, M); if (w) (item.curves || (item.curves = [])).push(w); }
  if (g.snap.length <= 900) for (let i = 0; i < g.snap.length; i += 3) { const w = mApply(M, [g.snap[i], g.snap[i + 1]]); S.snap.add(w[0], w[1], g.snap[i + 2]); }
}
function instanceBlock(g, M, S, item) {
  if (!boxOk(g.bbox)) return;
  const sc = mScaleOf(M); const inst = { g, M, Minv: mInverse(M), scale: sc, det: mDet(M), dm: domMatrix(M) };
  item.inst.push(inst);
  const c = [[g.bbox[0], g.bbox[1]], [g.bbox[2], g.bbox[1]], [g.bbox[2], g.bbox[3]], [g.bbox[0], g.bbox[3]]]; for (const q of c) { const w = mApply(M, q); bboxAdd(item.bbox, w[0], w[1]); }
  for (const t of g.texts) item.texts.push(transformText(t, M));
  if (g.snap.length <= 900) for (let i = 0; i < g.snap.length; i += 3) { const w = mApply(M, [g.snap[i], g.snap[i + 1]]); S.snap.add(w[0], w[1], g.snap[i + 2]); }
  if (!item.fillPoly && g.polys.length === 0 && g.fills.length) item.hatch = true;
}
