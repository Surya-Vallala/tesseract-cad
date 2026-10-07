// ===================== Picking & snapping =====================
function pickAt(wx, wy, tolWorld, S) {
  S = S || getScene(state.spaceIdx); let best = null;
  for (const it of S.items) {
    if (!layerOn(resolveLayer(it.ent, { layer: null }))) continue;
    const bb = it.bbox; if (wx < bb[0] - tolWorld || wx > bb[2] + tolWorld || wy < bb[1] - tolWorld || wy > bb[3] + tolWorld) continue;
    let d = Infinity, q = null;
    for (const poly of it.polys) { const r = distToPoly(wx, wy, poly, false); if (r.d < d) { d = r.d; q = r; } }
    if (it.inst) for (const ins of it.inst) { const l = mApply(ins.Minv, [wx, wy]); const g = ins.g; const tl = tolWorld / ins.scale; if (l[0] < g.bbox[0] - tl || l[0] > g.bbox[2] + tl || l[1] < g.bbox[1] - tl || l[1] > g.bbox[3] + tl) continue; for (const poly of g.polys) { const r = distToPoly(l[0], l[1], poly, false); const dw = r.d * ins.scale; if (dw < d) { const w = mApply(ins.M, [r.x, r.y]); d = dw; q = { x: w[0], y: w[1] }; } } if (d > tolWorld && g.polys.length === 0 && g.fills.length) { for (const f of g.fills) if (f.loops && f.loops.some(lp => pointInPoly(l[0], l[1], lp))) { d = tolWorld * 0.95; q = { x: wx, y: wy }; break; } } }
    if (d > tolWorld && it.fillPoly && (it.hatch || it.isText) && pointInPoly(wx, wy, it.fillPoly)) { d = tolWorld * 0.95; q = { x: wx, y: wy }; }
    if (d <= tolWorld && (!best || d < best.d)) best = { item: it, d, x: q.x, y: q.y };
  }
  return best;
}
// ----- Layout viewports: map between the sheet (paper) and the model seen through a viewport -----
function vpAt(x, y) { const sp = curSpace(); if (!sp || !sp.paper) return null; const S = getScene(state.spaceIdx); for (let i = S.viewports.length - 1; i >= 0; i--) { const vp = S.viewports[i]; if (!layerOn(vp.layer)) continue; if (x >= vp.x0 && x <= vp.x1 && y >= vp.y0 && y <= vp.y1) return vp; } return null; }
function paperToModel(vp, p) { const cx = (vp.x0 + vp.x1) / 2, cy = (vp.y0 + vp.y1) / 2; return [(p[0] - cx) / vp.sc + vp.vc[0], (p[1] - cy) / vp.sc + vp.vc[1]]; }
function modelToPaper(vp, m) { const cx = (vp.x0 + vp.x1) / 2, cy = (vp.y0 + vp.y1) / 2; return [(m[0] - vp.vc[0]) * vp.sc + cx, (m[1] - vp.vc[1]) * vp.sc + cy]; }
// Snap kinds that can be switched on and off (Menu → Snap points). Switched-off kinds are saved on the phone.
const SNAP_ORDER = [1, 2, 3, 11, 7, 5, 9, 10, 4, 8, 6];
const SNAP_HELP = { 1: 'ends of lines, arcs and polyline corners', 2: 'middle of lines, arcs and polyline sides', 3: 'centre of circles and arcs', 11: 'centre of closed polylines (rooms, columns)', 7: '0°, 90°, 180°, 270° points of circles, arcs and ellipses', 5: 'where two objects cross', 9: 'from the last point, square to a line, wall or arc', 10: 'from the last point, touching a circle or arc', 4: 'base point of blocks and text', 8: 'point objects', 6: 'any point along an object' };
const snapOn = {};
(function loadSnapKinds() { let off = []; try { off = (localStorage.getItem('tct-snaps-off') || '').split(',').filter(Boolean).map(Number); } catch (e) { } for (const k of SNAP_ORDER) snapOn[k] = !off.includes(k); })();
function saveSnapKinds() { try { localStorage.setItem('tct-snaps-off', SNAP_ORDER.filter(k => !snapOn[k]).join(',')); } catch (e) { } }
function snapPoint(X, Y, tolPx) { // screen -> world with snapping; returns {x,y,kind,item,vp}
  const V = state.view; const w = toWorld(X, Y, V); const tol = (tolPx || 16) / V.s;
  if (!state.drawing || !state.snapOn) return { x: w[0], y: w[1], kind: 0 };
  const S = getScene(state.spaceIdx);
  let best = null;
  const sn = S.snap.query(w[0], w[1], tol, snapOn);
  if (sn) best = { x: sn.x, y: sn.y, kind: sn.kind, d: Math.hypot(sn.x - w[0], sn.y - w[1]) };
  // In a layout, also snap to the model geometry visible through the viewport under the finger
  const vp = vpAt(w[0], w[1]); let MS = null, m = null, mt = 0;
  if (vp) { MS = getScene(0); m = paperToModel(vp, w); mt = tol / vp.sc; const s2 = MS.snap.query(m[0], m[1], mt, snapOn); if (s2) { const q = modelToPaper(vp, [s2.x, s2.y]); const d = Math.hypot(q[0] - w[0], q[1] - w[1]); if (!best || d < best.d) best = { x: q[0], y: q[1], kind: s2.kind, d, vp }; } }
  if (best) return best;
  // Perpendicular and tangent work from the previous point of the current tool
  const base = (snapOn[9] || snapOn[10]) && state.lastPt ? state.lastPt : null;
  const hit = pickAt(w[0], w[1], tol * 0.8, S);
  if (hit && hit.x != null && !(vp && hit.item.ent.t === 'VIEWPORT')) {
    if (snapOn[5]) { const hit2 = findIntersection(w[0], w[1], tol, S, hit.item); if (hit2) return { x: hit2[0], y: hit2[1], kind: 5, item: hit.item }; }
    if (base) { const d = dynSnap(hit.item, w, base, tol); if (d) return { x: d[0], y: d[1], kind: d[2], item: hit.item }; }
    if (snapOn[6]) return { x: hit.x, y: hit.y, kind: 6, item: hit.item };
    return { x: w[0], y: w[1], kind: 0 };
  }
  if (vp) {
    const h = pickAt(m[0], m[1], mt * 0.8, MS);
    if (h && h.x != null) {
      if (snapOn[5]) { const i2 = findIntersection(m[0], m[1], mt, MS, h.item); if (i2) { const q = modelToPaper(vp, i2); return { x: q[0], y: q[1], kind: 5, item: h.item, vp }; } }
      if (base && vpAt(base[0], base[1]) === vp) { const d = dynSnap(h.item, m, paperToModel(vp, base), mt); if (d) { const q = modelToPaper(vp, d); return { x: q[0], y: q[1], kind: d[2], item: h.item, vp }; } }
      if (snapOn[6]) { const q = modelToPaper(vp, [h.x, h.y]); return { x: q[0], y: q[1], kind: 6, item: h.item, vp }; }
    }
  }
  if (hit && hit.x != null && snapOn[6]) return { x: hit.x, y: hit.y, kind: 6, item: hit.item };
  return { x: w[0], y: w[1], kind: 0 };
}
// Perpendicular / tangent from `base` to the object under the finger `f`. The snapped point may sit a little away
// from the finger (up to 4× the snap distance), so you can slide along a wall until it locks on.
function dynSnap(item, f, base, tol) {
  const pull = tol * 4; let best = null;
  const consider = (x, y, kind) => { const d = Math.hypot(x - f[0], y - f[1]); if (d <= pull && Math.hypot(x - base[0], y - base[1]) > tol * 0.05 && (!best || d < best[3])) best = [x, y, kind, d]; };
  for (const cv of itemCurvesNear(item, f, tol)) {
    const dx = base[0] - cv.c[0], dy = base[1] - cv.c[1]; const dd = Math.hypot(dx, dy); if (dd < 1e-12) continue; const th = Math.atan2(dy, dx);
    if (snapOn[9]) for (const a of [th, th + Math.PI]) if (cv.full || angInArc(a, cv.a0, cv.a1, cv.ccw)) consider(cv.c[0] + cv.r * Math.cos(a), cv.c[1] + cv.r * Math.sin(a), 9);
    if (snapOn[10] && dd > cv.r * (1 + 1e-9)) { const ph = Math.acos(cv.r / dd); for (const a of [th + ph, th - ph]) if (cv.full || angInArc(a, cv.a0, cv.a1, cv.ccw)) consider(cv.c[0] + cv.r * Math.cos(a), cv.c[1] + cv.r * Math.sin(a), 10); }
  }
  if (best) return best; // the finger is on a circle or arc: its exact points win over its straight approximation
  if (snapOn[9]) for (const [p, q] of itemSegsNear(item, f[0], f[1], tol)) {
    const ux = q[0] - p[0], uy = q[1] - p[1]; const L2 = ux * ux + uy * uy; if (L2 < 1e-18) continue;
    const t = ((base[0] - p[0]) * ux + (base[1] - p[1]) * uy) / L2; if (t < -1e-9 || t > 1 + 1e-9) continue;
    consider(p[0] + ux * t, p[1] + uy * t, 9);
  }
  return best;
}
function itemCurvesNear(it, f, tol) {
  const out = []; const near = (cv) => Math.abs(Math.hypot(f[0] - cv.c[0], f[1] - cv.c[1]) - cv.r) <= tol;
  if (it.curves) for (const cv of it.curves) if (near(cv)) out.push(cv);
  if (it.inst) for (const ins of it.inst) { const cs = ins.g.curves; if (!cs || !cs.length || cs.length > 3000) continue; for (const cv of cs) { const w = curveToWorld(cv, ins.M); if (w && near(w)) out.push(w); } }
  return out;
}
// Straight pieces of an object (blocks included) that pass within `tol` of a point
function itemSegsNear(it, wx, wy, tol) {
  const out = []; const polys = it.polys.slice();
  if (it.inst) for (const ins of it.inst) { if (ins.g.polys.length > 4000) continue; for (const poly of ins.g.polys) { const q = new Array(poly.length); for (let i = 0; i < poly.length; i += 2) { const w = mApply(ins.M, [poly[i], poly[i + 1]]); q[i] = w[0]; q[i + 1] = w[1]; } polys.push(q); } }
  for (const poly of polys) for (let i = 2; i < poly.length; i += 2) { const x1 = poly[i - 2], y1 = poly[i - 1], x2 = poly[i], y2 = poly[i + 1]; if (Math.max(x1, x2) < wx - tol || Math.min(x1, x2) > wx + tol || Math.max(y1, y2) < wy - tol || Math.min(y1, y2) > wy + tol) continue; out.push([[x1, y1], [x2, y2]]); }
  return out;
}
// Measuring in a layout: points inside one viewport are measured in the model (real size), otherwise on the sheet.
function measureSpace(pts) {
  const sp = curSpace(); if (!sp || !sp.paper || !pts.length) return { pts, vp: null };
  const v0 = vpAt(pts[0][0], pts[0][1]); if (!v0) return { pts, vp: null, sheet: true };
  for (const p of pts) if (vpAt(p[0], p[1]) !== v0) return { pts, vp: null, sheet: true };
  return { pts: pts.map(p => paperToModel(v0, p)), vp: v0 };
}
function scaleNote(ms) { if (ms.vp) { const k = 1 / ms.vp.sc; return ['Measured', 'in model through viewport (1:' + (k >= 10 ? fmtNum(k, 0) : fmtNum(k, 2)) + ')']; } if (ms.sheet) return ['Measured', 'on the sheet (paper size)']; return null; }
function findIntersection(wx, wy, tol, S, itemA) {
  const near = []; for (const it of S.items) { if (it === itemA || it.isText) continue; const bb = it.bbox; if (wx < bb[0] - tol || wx > bb[2] + tol || wy < bb[1] - tol || wy > bb[3] + tol) continue; near.push(it); if (near.length > 6) break; }
  let best = null;
  const segsNear = (it) => itemSegsNear(it, wx, wy, tol);
  const A = segsNear(itemA);
  for (const it of near) { for (const sb of segsNear(it)) for (const sa of A) { const p = segIntersect(sa[0], sa[1], sb[0], sb[1]); if (p) { const d = Math.hypot(p[0] - wx, p[1] - wy); if (d <= tol && (!best || d < best.d)) best = { p, d }; } } }
  return best ? best.p : null;
}

// ===================== Pointer handling =====================
// One finger: tap = pick, drag = pan. Press and hold (still) = precise pick with a magnifier:
// drag to the exact spot, let go to place the point. Two fingers: pinch zoom / pan.
const pointers = new Map(); let pinch0 = null; let dragStart = null, dragMoved = false, panStartView = null; let tapTimer = null;
let holdTimer = null; const HOLD_MS = 330, PRECISE_SNAP_PX = 7;
function loupeAllowed() { const t = state.tool; return !!(t && PICK_TOOLS.has(t.name) && t.phase !== 'select'); }
function cancelHold() { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }
function enterPrecise(X, Y) {
  holdTimer = null; if (!state.drawing || pointers.size !== 1 || dragMoved) return;
  try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { }
  gesture = false; state.loupe = { X, Y, sn: snapPoint(X, Y, PRECISE_SNAP_PX) }; updatePrecise(X, Y); startEdgePan();
}
function updatePrecise(X, Y) {
  const lp = state.loupe; if (!lp) return; lp.X = X; lp.Y = Y;
  const sn = snapPoint(X, Y, PRECISE_SNAP_PX); lp.sn = sn; state.snapMark = sn.kind ? sn : null; showCoord(sn.x, sn.y, sn.kind); requestFast();
}
function exitPrecise(place) {
  const lp = state.loupe; state.loupe = null; stopEdgePan(); if (!lp) return;
  if (place && state.drawing) { const sn = lp.sn || snapPoint(lp.X, lp.Y, PRECISE_SNAP_PX); state.snapMark = sn.kind ? sn : null; const V = state.view; const q = toScreen(sn.x, sn.y, V); const hit = pickAt(sn.x, sn.y, 6 / V.s); if (state.tool && state.tool.onTap) state.tool.onTap(sn, hit, null); }
  requestFull();
}
// While holding near a screen edge, scroll the drawing so you can reach points just off screen.
let edgeRaf = 0, lastEdgeFull = 0;
function startEdgePan() { stopEdgePan(); const step = (t) => { edgeRaf = requestAnimationFrame(step); const lp = state.loupe; if (!lp) return; const E = 34; let dx = 0, dy = 0; if (lp.X < E) dx = (E - lp.X); else if (lp.X > cssW - E) dx = -(lp.X - (cssW - E)); if (lp.Y < E) dy = (E - lp.Y); else if (lp.Y > cssH - E) dy = -(lp.Y - (cssH - E)); if (!dx && !dy) return; const k = 0.35; state.view = { ...state.view, tx: state.view.tx + dx * k, ty: state.view.ty + dy * k }; const sn = snapPoint(lp.X, lp.Y, PRECISE_SNAP_PX); lp.sn = sn; state.snapMark = sn.kind ? sn : null; if (t - lastEdgeFull > 120) { lastEdgeFull = t; requestFull(); } else requestFast(); }; edgeRaf = requestAnimationFrame(step); }
function stopEdgePan() { if (edgeRaf) cancelAnimationFrame(edgeRaf); edgeRaf = 0; }
cv.addEventListener('contextmenu', (ev) => ev.preventDefault());
cv.addEventListener('pointerdown', (ev) => {
  cv.setPointerCapture(ev.pointerId); pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY, X: ev.offsetX, Y: ev.offsetY });
  if (pointers.size === 1) { dragStart = { X: ev.offsetX, Y: ev.offsetY, t: performance.now(), button: ev.button }; dragMoved = false; panStartView = { ...state.view }; state.boxSel = null; cancelHold(); if (state.drawing && loupeAllowed()) { const X = ev.offsetX, Y = ev.offsetY; holdTimer = setTimeout(() => { const p = pointers.get(ev.pointerId); enterPrecise(p ? p.X : X, p ? p.Y : Y); }, HOLD_MS); } }
  if (pointers.size === 2) { cancelHold(); if (state.loupe) { state.loupe = null; stopEdgePan(); } const [a, b] = [...pointers.values()]; pinch0 = { d: Math.hypot(a.X - b.X, a.Y - b.Y), mx: (a.X + b.X) / 2, my: (a.Y + b.Y) / 2, view: { ...state.view } }; gesture = true; dragStart = null; }
});
cv.addEventListener('pointermove', (ev) => {
  const p = pointers.get(ev.pointerId);
  if (!p) { if (ev.pointerType === 'mouse' && state.drawing) hoverAt(ev.offsetX, ev.offsetY); return; }
  p.X = ev.offsetX; p.Y = ev.offsetY;
  if (state.loupe && pointers.size === 1) { updatePrecise(ev.offsetX, ev.offsetY); return; }
  if (pointers.size === 2 && pinch0) {
    const [a, b] = [...pointers.values()]; const d = Math.hypot(a.X - b.X, a.Y - b.Y); const mx = (a.X + b.X) / 2, my = (a.Y + b.Y) / 2;
    const k = clamp(d / (pinch0.d || 1), 0.05, 20); const v = pinch0.view; const s2 = clamp(v.s * k, 1e-7, 1e7); const kk = s2 / v.s;
    state.view = { s: s2, tx: mx - (pinch0.mx - v.tx) * kk, ty: my - (pinch0.my - v.ty) * kk }; requestFast(); return;
  }
  if (pointers.size === 1 && dragStart) {
    const dx = ev.offsetX - dragStart.X, dy = ev.offsetY - dragStart.Y;
    if (!dragMoved && Math.hypot(dx, dy) > 7) { dragMoved = true; gesture = true; cancelHold(); }
    if (dragMoved) {
      if (state.tool && state.tool.boxSelect && (dragStart.button === 0)) { state.boxSel = { x0: dragStart.X, y0: dragStart.Y, x1: ev.offsetX, y1: ev.offsetY }; gesture = false; requestFast(); return; }
      state.view = { s: panStartView.s, tx: panStartView.tx + dx, ty: panStartView.ty + dy }; requestFast();
    }
  }
});
function endPointer(ev) {
  const p = pointers.get(ev.pointerId); pointers.delete(ev.pointerId); cancelHold();
  if (state.loupe) { if (pointers.size === 0) { exitPrecise(ev.type === 'pointerup'); gesture = false; dragStart = null; } return; }
  if (pinch0 && pointers.size < 2) { pinch0 = null; gesture = false; dragStart = null; requestFull(); return; }
  if (p && dragStart && pointers.size === 0) {
    const wasBox = state.boxSel;
    if (wasBox) { state.boxSel = null; gesture = false; finishBoxSelect(wasBox); dragStart = null; requestFull(); return; }
    if (!dragMoved) { dragStart = null; onTap(p.X, p.Y, ev); }
    else { dragStart = null; gesture = false; requestFull(); }
  }
  if (pointers.size === 0) { gesture = false; dragStart = null; }
}
cv.addEventListener('pointerup', endPointer); cv.addEventListener('pointercancel', endPointer);
cv.addEventListener('wheel', (ev) => { ev.preventDefault(); zoomAt(ev.offsetX, ev.offsetY, ev.deltaY < 0 ? 1.15 : 1 / 1.15); requestFull(); }, { passive: false });
cv.addEventListener('dblclick', (ev) => { ev.preventDefault(); });
window.addEventListener('keydown', (ev) => { if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT')) { if (ev.key === 'Escape') ev.target.blur(); return; } if (ev.key === 'Escape') exitToSelect(); else if (ev.key === 'Enter') doneTool(); else if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') { ev.shiftKey ? redo() : undo(); } else if (ev.key === 'Delete' || ev.key === 'Backspace') { if (state.selection.size) deleteSelection(); } });

function hoverAt(X, Y) { state.hoverScreen = [X, Y]; const V = state.view; const w = toWorld(X, Y, V); const hit = pickAt(w[0], w[1], 10 / V.s); const it = hit ? hit.item : null; if (it !== state.hoverItem) { state.hoverItem = it; requestFast(); } const picking = !!(state.tool && PICK_TOOLS.has(state.tool.name) && state.tool.phase !== 'select'); const sn = snapPoint(X, Y); state.snapMark = (picking && sn.kind) ? sn : null; showCoord(sn.x, sn.y, sn.kind); requestFast(); }
function showCoord(x, y, kind) { $('coordChip').textContent = 'X ' + fmtNum(x, 2) + ' · Y ' + fmtNum(y, 2) + (kind ? '  ·  ' + SNAP_NAMES[kind] : ''); }

function onTap(X, Y, ev) {
  if (!state.drawing) return;
  const picking = !!(state.tool && PICK_TOOLS.has(state.tool.name) && state.tool.phase !== 'select');
  const sn = snapPoint(X, Y); state.snapMark = (picking && sn.kind) ? sn : null; if (picking) showCoord(sn.x, sn.y, sn.kind);
  const V = state.view; const w = toWorld(X, Y, V); let hit = pickAt(w[0], w[1], 12 / V.s);
  if (state.tool && (state.tool.name === 'area' || state.tool.name === 'info')) { const vp = vpAt(w[0], w[1]); if (vp && (!hit || hit.item.ent.t === 'VIEWPORT')) { const m = paperToModel(vp, w); const h = pickAt(m[0], m[1], 12 / V.s / vp.sc, getScene(0)); if (h) hit = { ...h, vp, model: true }; } }
  if (state.tool && state.tool.onTap) state.tool.onTap(sn, hit, ev, w);
  requestFast();
}
function finishBoxSelect(b) {
  const V = state.view; const a = toWorld(Math.min(b.x0, b.x1), Math.min(b.y0, b.y1), V), c = toWorld(Math.max(b.x0, b.x1), Math.max(b.y0, b.y1), V);
  const rx0 = Math.min(a[0], c[0]), ry0 = Math.min(a[1], c[1]), rx1 = Math.max(a[0], c[0]), ry1 = Math.max(a[1], c[1]);
  const crossing = b.x1 < b.x0; const S = getScene(state.spaceIdx); let n = 0;
  for (const it of S.items) { if (it.ent.t === 'VIEWPORT' || !layerOn(resolveLayer(it.ent, { layer: null }))) continue; const bb = it.bbox; const inside = bb[0] >= rx0 && bb[2] <= rx1 && bb[1] >= ry0 && bb[3] <= ry1; const overlap = bb[2] >= rx0 && bb[0] <= rx1 && bb[3] >= ry0 && bb[1] <= ry1; if (inside || (crossing && overlap)) { state.selection.add(it.ent.id); n++; } }
  toast(n + ' object' + (n === 1 ? '' : 's') + ' selected · ' + state.selection.size + ' total'); if (state.tool && state.tool.onSelChange) state.tool.onSelChange();
}

// ===================== Tool framework =====================
const promptMsg = $('promptMsg'), toolName = $('toolName'), resultEl = $('result'), typed = $('typed');
function setPrompt(msg) { promptMsg.textContent = msg; }
function setResult(rows) { if (!rows) { resultEl.classList.remove('on'); resultEl.innerHTML = ''; } else { resultEl.innerHTML = rows.map(([k, v]) => '<span><b>' + k + '</b>' + v + '</span>').join(''); resultEl.classList.add('on'); } if (typeof updateChrome === 'function') updateChrome(); }
function toast(msg, ms) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove('on'), ms || 1800); }
function cancelTool() { if (state.tool && state.tool.onCancel) state.tool.onCancel(); state.lastPt = null; state.snapMark = null; startTool(state.tool ? state.tool.name : 'select', true); }
// × on the instruction bar and Esc: close the tool, drop the selection and go back to the Select pointer
function exitToSelect() {
  if (state.tool && state.tool.onCancel) try { state.tool.onCancel(); } catch (e) { }
  if ($('textDlg').classList.contains('on')) $('txtCancel').click();
  state.selection.clear(); state.hoverItem = null; state.boxSel = null; state.lastPt = null; state.snapMark = null; setResult(null);
  if (!TOOL_GROUPS[state.group].includes('select')) setGroup('view');
  startTool('select', true); requestFull();
}
function doneTool() { if (state.tool && state.tool.onDone) state.tool.onDone(); }
function backPoint() { if (state.tool && state.tool.onBack) state.tool.onBack(); requestFast(); }
function parseTyped(str, base) {
  str = str.trim(); if (!str) return null;
  const rel = str.startsWith('@'); if (rel) str = str.slice(1);
  let m = str.match(/^(-?[\d.]+)\s*<\s*(-?[\d.]+)$/); // polar
  if (m) { const L = parseFloat(m[1]), A = rad(parseFloat(m[2])); const b = base || state.lastPt || [0, 0]; return { pt: [b[0] + L * Math.cos(A), b[1] + L * Math.sin(A)], len: L, ang: A }; }
  m = str.match(/^(-?[\d.]+)\s*,\s*(-?[\d.]+)$/);
  if (m) { const x = parseFloat(m[1]), y = parseFloat(m[2]); if (rel) { const b = base || state.lastPt || [0, 0]; return { pt: [b[0] + x, b[1] + y] }; } return { pt: [x, y] }; }
  m = str.match(/^(-?[\d.]+)$/);
  if (m) return { num: parseFloat(m[1]) };
  return null;
}
typed.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); submitTyped(); } });
$('btnEnter').addEventListener('click', submitTyped);
function submitTyped() { const v = parseTyped(typed.value); if (!v) { toast('Use 1200 · @1200,0 · @1500<90 · 100,200'); return; } typed.value = ''; if (state.tool && state.tool.onTyped) state.tool.onTyped(v); requestFast(); }

const TOOL_GROUPS = {
  view: ['select', 'box', 'info', 'fit'],
  measure: ['dist', 'area', 'angle', 'coord', 'info'],
  edit: ['select', 'box', 'move', 'copy', 'rotate', 'mirror', 'scale', 'align', 'order', 'delete'],
  draw: ['line', 'pline', 'rect', 'circle', 'arc', 'spline', 'text']
};
const ICON = {
  select: '<path d="M5 3l14 9-7 1-3 7z"/>', box: '<path d="M4 6V4h2M18 4h2v2M20 18v2h-2M6 20H4v-2M4 10v4M20 10v4M10 4h4M10 20h4"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  dist: '<path d="M3 17 17 3M3 17v-4M3 17h4M17 3h-4M17 3v4"/>', area: '<path d="M4 6l6-2 10 4-3 12-13-3z"/>', angle: '<path d="M4 20 20 6M4 20h16M11 20a8 8 0 0 0-1.5-5"/>', coord: '<path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3"/>',
  move: '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>', rotate: '<path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5"/>', mirror: '<path d="M12 3v18M4 7l5 5-5 5zM20 7l-5 5 5 5z"/>', scale: '<path d="M4 20V10h10v10zM10 4h10v10M14 10l6-6"/>', align: '<path d="M4 8h16M4 16h10M4 4v16M20 4v8"/>', order: '<rect x="3" y="3" width="11" height="11" rx="1"/><path d="M10 10h11v11H10z" fill="currentColor" fill-opacity=".25"/>', delete: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  line: '<path d="M4 20 20 4"/><circle cx="4" cy="20" r="1.5"/><circle cx="20" cy="4" r="1.5"/>', pline: '<path d="M3 19l5-11 5 7 4-9 4 4"/>', rect: '<rect x="4" y="6" width="16" height="12"/>', circle: '<circle cx="12" cy="12" r="8"/>', arc: '<path d="M4 18a10 10 0 0 1 16 0"/>', spline: '<path d="M3 17c4-12 6 12 10 0s4-6 8-2"/>', text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'
};
const LABEL = { select: 'Select', box: 'Box select', info: 'Info', fit: 'Extents', dist: 'Distance', area: 'Area', angle: 'Angle', coord: 'Coords', move: 'Move', copy: 'Copy', rotate: 'Rotate', mirror: 'Mirror', scale: 'Scale', align: 'Align', order: 'Order', delete: 'Delete', line: 'Line', pline: 'Polyline', rect: 'Rectangle', circle: 'Circle', arc: 'Arc (3 pt)', spline: 'Spline', text: 'Text', pdfwin: 'PDF area' };
function renderToolRow() {
  const row = $('toolRow'); row.innerHTML = '';
  for (const t of TOOL_GROUPS[state.group]) { const b = document.createElement('button'); b.className = 'tool' + (t === 'delete' ? ' danger' : ''); b.dataset.tool = t; b.innerHTML = '<svg viewBox="0 0 24 24">' + ICON[t] + '</svg><span>' + LABEL[t] + '</span>'; b.setAttribute('aria-pressed', state.tool && state.tool.name === t ? 'true' : 'false'); b.addEventListener('click', () => { if (t === 'fit') { zoomExtents(); return; } startTool(t); }); row.appendChild(b); }
}
// Group switcher (bottom-left): opens a small menu of View / Measure / Edit / Draw
const GROUP_NAME = { view: 'View', measure: 'Measure', edit: 'Edit', draw: 'Draw' };
function setGroup(g) {
  state.group = g; for (const x of $('groups').children) x.setAttribute('aria-selected', x.dataset.g === g ? 'true' : 'false');
  const src = $('groups').querySelector('[data-g="' + g + '"] svg'); $('grpIcon').innerHTML = src ? src.innerHTML : ''; $('grpName').textContent = GROUP_NAME[g] || g;
  renderToolRow(); updateUndoBtns(); $('toolRow').scrollLeft = 0;
}
$('groups').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; closeGroups(); setGroup(b.dataset.g); });
function closeGroups() { $('groups').classList.remove('open'); if (!document.querySelector('.sheet.open')) $('scrim').classList.remove('on'); }
$('btnGroup').addEventListener('click', () => { const g = $('groups'); if (g.classList.contains('open')) closeGroups(); else { g.classList.add('open'); $('scrim').classList.add('on'); } });
// The instruction strip shows only while a tool needs input or there is a result to read.
const PICK_TOOLS = new Set(['coord', 'dist', 'area', 'angle', 'move', 'copy', 'rotate', 'scale', 'mirror', 'align', 'line', 'pline', 'spline', 'rect', 'circle', 'arc', 'text', 'pdfwin']);
function updateChrome() {
  const t = state.tool ? state.tool.name : 'select'; const hasResult = resultEl.classList.contains('on');
  $('prompt').hidden = !state.drawing || (t === 'select' && !hasResult);
  $('hud').hidden = !state.drawing || !PICK_TOOLS.has(t);
  const keysUseful = ['dist', 'line', 'pline', 'spline', 'rect', 'circle', 'move', 'copy', 'rotate', 'scale', 'coord'].includes(t);
  $('btnKeys').hidden = !keysUseful; if (!keysUseful) { $('promptRow').hidden = true; $('btnKeys').setAttribute('aria-pressed', 'false'); }
  $('btnBack').hidden = ['select', 'info', 'box', 'coord'].includes(t); $('btnDone').hidden = ['select', 'info', 'box', 'coord', 'angle', 'rect', 'circle', 'arc', 'text', 'pdfwin'].includes(t);
  $('btnProps').hidden = !(state.drawing && state.selection.size && ['select', 'box', 'info'].includes(t)); $('btnSimilar').hidden = $('btnProps').hidden;
}
let holdTipShown = false; try { holdTipShown = !!localStorage.getItem('tct-holdtip'); } catch (e) { }
function maybeHoldTip(name) { if (holdTipShown || !PICK_TOOLS.has(name)) return; holdTipShown = true; try { localStorage.setItem('tct-holdtip', '1'); } catch (e) { } setTimeout(() => toast('Tip: press and hold on the drawing to magnify, then drag to the exact point', 4200), 400); }

for (const b of document.querySelectorAll('#orderPanel [data-order]')) b.addEventListener('click', () => { const mode = b.dataset.order; if (state.tool && state.tool.name === 'order') state.tool.choose(mode); else { closeSheets(); reorderSelection(mode); } });
function needSelection(tool, next) { // returns true if selection exists, otherwise prompts to select
  if (state.selection.size) return true;
  tool.phase = 'select'; setPrompt('Tap objects to ' + tool.verb + ' (drag for a box), then Done.'); return false;
}
function startTool(name, keepSel) {
  if (!keepSel && state.tool && state.tool.name !== name && !['select', 'box'].includes(name) && ['select', 'box', 'info', 'coord', 'dist', 'area', 'angle'].includes(state.tool.name)) { /* keep selection across tools */ }
  state.tool = makeTool(name); state.lastPt = null; state.snapMark = null; setResult(null); typed.value = '';
  toolName.textContent = LABEL[name] || name; state.tool.start();
  for (const b of $('toolRow').children) b.setAttribute('aria-pressed', b.dataset.tool === name ? 'true' : 'false');
  updateChrome(); maybeHoldTip(name);
  requestFast();
}
// Anonymous *U blocks are dynamic blocks in a non-default state
function blockLabel(n) { return /^\*U/i.test(n || '') ? 'Dynamic block' : 'Block · ' + n; }
function describeItem(it) {
  const e = it.ent; const rows = [['Type', e.dim ? 'Dimension' : e.t === 'INSERT' ? blockLabel(e.n) : e.t], ['Layer', resolveLayer(e, { layer: null })]];
  const col = e.rgb ? 'RGB ' + e.rgb : (e.c === 256 || e.c == null) ? 'ByLayer (' + layerAci(e.L) + ')' : e.c === 0 ? 'ByBlock' : String(e.c); rows.push(['Color', col]);
  rows.push(['Linetype', ltName(e.lt) + (e.lts && e.lts !== 1 ? ' ×' + fmtNum(e.lts, 3) : '')]); if (e.al != null) rows.push(['Transparency', alName(e.al)]);
  if (e.t === 'LINE') { const L = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]); rows.push(['Length', fmtLenAll(L)], ['Angle', fmtNum(deg(Math.atan2(e.b[1] - e.a[1], e.b[0] - e.a[0])), 2) + '°'], ['ΔX', fmtLen(e.b[0] - e.a[0])], ['ΔY', fmtLen(e.b[1] - e.a[1])]); }
  else if (e.t === 'PLINE' || e.t === 'SPLINE' || e.t === 'LEADER') { const poly = it.polys[0] || []; rows.push(['Length', fmtLenAll(polyLength(poly, false))]); if (it.closed && it.fillPoly) rows.push(['Area', fmtArea(Math.abs(polyArea(it.fillPoly.slice(0, -2))))]); rows.push(['Vertices', String(e.v ? e.v.length : (e.fit && e.fit.length) || (e.cp && e.cp.length) || poly.length / 2)]); }
  else if (e.t === 'CIRCLE') rows.push(['Radius', fmtLenAll(e.r)], ['Diameter', fmtLen(e.r * 2)], ['Circumference', fmtLen(TAU * e.r)], ['Area', fmtArea(Math.PI * e.r * e.r)], ['Center', fmtNum(e.ce[0], 2) + ', ' + fmtNum(e.ce[1], 2)]);
  else if (e.t === 'ARC') { const sw = normAng(e.a1 - e.a0); rows.push(['Radius', fmtLenAll(e.r)], ['Arc length', fmtLen(e.r * sw)], ['Angle', fmtNum(deg(sw), 2) + '°'], ['Center', fmtNum(e.ce[0], 2) + ', ' + fmtNum(e.ce[1], 2)]); }
  else if (e.t === 'ELLIPSE') { const a = Math.hypot(e.m[0], e.m[1]); rows.push(['Major radius', fmtLen(a)], ['Minor radius', fmtLen(a * e.k)]); }
  else if (e.t === 'TEXT' || e.t === 'MTEXT') rows.push(['Text', textPlain(e.s).slice(0, 120)], ['Height', fmtLen(e.h)]);
  else if (e.t === 'HATCH') { rows.push(['Pattern', e.solid ? 'Solid' : e.name]); if (it.fillPoly) rows.push(['Area', fmtArea(Math.abs(polyArea(it.fillPoly.slice(0, -2))))], ['Perimeter', fmtLen(polyLength(it.fillPoly, false))]); }
  else if (e.t === 'INSERT') { rows.push(['Insert at', fmtNum(e.p[0], 2) + ', ' + fmtNum(e.p[1], 2)], ['Scale', fmtNum(e.sx, 3) + (e.sy !== e.sx ? ' × ' + fmtNum(e.sy, 3) : '')], ['Rotation', fmtNum(deg(e.rot), 2) + '°']); }
  return rows;
}

function makeTool(name) {
  const T = { name, pts: [], phase: 'pick', start() { }, onTap() { }, onDone() { }, onBack() { if (this.pts.length) { this.pts.pop(); state.lastPt = this.pts.length ? this.pts[this.pts.length - 1] : null; this.update(); } }, onCancel() { }, update() { }, draw: null, boxSelect: false, onTyped(v) { if (v.pt) this.onTap({ x: v.pt[0], y: v.pt[1], kind: 0 }, null); else if (v.num != null && this.onNum) this.onNum(v.num); } };
  const addPt = (sn) => { T.pts.push([sn.x, sn.y]); state.lastPt = [sn.x, sn.y]; };
  switch (name) {
    case 'select':
      T.start = () => { setPrompt('Tap an object to select it; tap again to deselect. Drag to pan.'); T.onSelChange(); };
      T.onSelChange = () => { showSelection(); };
      T.onTap = (sn, hit) => { if (hit && !hit.model) { const id = hit.item.ent.id; if (state.selection.has(id)) state.selection.delete(id); else state.selection.add(id); } else state.selection.clear(); T.onSelChange(); };
      T.onCancel = () => { state.selection.clear(); };
      break;
    case 'box': // window / crossing selection: tap two opposite corners, or drag
      T.boxSelect = true; T.corner = null;
      const boxMsg = 'Tap one corner, then the opposite corner (or drag). Left→right: objects fully inside. Right→left: also objects crossing the box.';
      T.start = () => { setPrompt(boxMsg); T.onSelChange(); };
      T.onSelChange = () => { showSelection(); };
      T.onTap = (sn, hit, ev, w) => {
        if (!w) return;
        if (!T.corner) { T.corner = w; setPrompt('Now tap the opposite corner.'); return; }
        const V = state.view; const a = toScreen(T.corner[0], T.corner[1], V), b = toScreen(w[0], w[1], V); T.corner = null;
        finishBoxSelect({ x0: a[0], y0: a[1], x1: b[0], y1: b[1] }); setPrompt(boxMsg); T.onSelChange();
      };
      T.onBack = () => { T.corner = null; setPrompt(boxMsg); };
      T.onCancel = () => { T.corner = null; state.selection.clear(); };
      T.draw = (c, V, acc) => { if (T.corner) { const p = toScreen(T.corner[0], T.corner[1], V); c.save(); c.strokeStyle = acc; c.lineWidth = 2; c.beginPath(); c.moveTo(p[0] - 9, p[1]); c.lineTo(p[0] + 9, p[1]); c.moveTo(p[0], p[1] - 9); c.lineTo(p[0], p[1] + 9); c.stroke(); c.restore(); if (state.hoverScreen) drawBoxSel(c, { x0: p[0], y0: p[1], x1: state.hoverScreen[0], y1: state.hoverScreen[1] }); } if (state.boxSel) drawBoxSel(c); };
      break;
    case 'info':
      T.start = () => setPrompt('Tap an object to read its properties.');
      T.onTap = (sn, hit) => { state.selection.clear(); if (hit) { if (!hit.model) state.selection.add(hit.item.ent.id); setResult(describeItem(hit.item).concat(hit.model ? [['Seen', 'through viewport (model object)']] : [])); if (!hit.model) updateChrome(); } else setResult(null); };
      break;
    case 'coord':
      T.start = () => setPrompt('Tap a point to read its coordinates. Press and hold to magnify for an exact point.');
      T.onTap = (sn) => { addPt(sn); const ms = measureSpace([[sn.x, sn.y]]); const q = ms.pts[0]; const rows = [['X', fmtNum(q[0], 3)], ['Y', fmtNum(q[1], 3)], ['Snap', SNAP_NAMES[sn.kind].toLowerCase()]]; if (ms.vp) rows.push(['Model point', 'through viewport'], ['Sheet', fmtNum(sn.x, 2) + ', ' + fmtNum(sn.y, 2)]); setResult(rows); T.pts = [[sn.x, sn.y]]; };
      T.draw = (c, V, acc) => drawDots(c, T.pts, V, acc);
      break;
    case 'dist':
      T.total = 0;
      T.start = () => { setPrompt('Tap the first point.'); };
      T.update = () => { const n = T.pts.length; if (n === 0) { setPrompt('Tap the first point.'); setResult(null); } else if (n === 1) { setPrompt('Tap the second point (or type @length<angle).'); setResult(null); } else { const ms = measureSpace(T.pts); const P = ms.pts; const a = P[n - 2], b = P[n - 1]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); let tot = 0; for (let i = 1; i < n; i++) tot += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); const rows = [['Distance', fmtLenAll(L)], ['ΔX', fmtLen(b[0] - a[0])], ['ΔY', fmtLen(b[1] - a[1])], ['Angle', fmtNum(deg(Math.atan2(b[1] - a[1], b[0] - a[0])), 2) + '°']]; if (n > 2) rows.push(['Running total', fmtLenAll(tot)]); const note = scaleNote(ms); if (note) rows.push(note); setResult(rows); setPrompt('Tap the next point to continue measuring, or Done to start over.'); } };
      T.onTap = (sn) => { addPt(sn); T.update(); };
      T.onDone = () => { T.pts = []; state.lastPt = null; T.update(); };
      T.draw = (c, V, acc) => { c.strokeStyle = acc; c.lineWidth = 2; c.setLineDash([]); drawPolyScreen(c, T.pts, V, false); drawDots(c, T.pts, V, acc); };
      break;
    case 'area':
      T.mode = 'points';
      T.start = () => { setPrompt('Tap the corners of the area in order, then Done. Or tap a closed shape (hatch, polyline, circle) when no points are placed.'); };
      T.update = () => { const n = T.pts.length; if (n >= 3) { const ms = measureSpace(T.pts); const flat = []; for (const p of ms.pts) flat.push(p[0], p[1]); const A = Math.abs(polyArea(flat)); const P = polyLength(flat, true); const rows = [['Area', fmtArea(A)], ['Area (' + (UNIT_NAME[state.drawing.header.units] || 'units') + '²)', fmtNum(A, 0)], ['Perimeter', fmtLenAll(P)], ['Points', String(n)]]; const note = scaleNote(ms); if (note) rows.push(note); setResult(rows); setPrompt('Keep tapping corners, Back removes the last, Done finishes.'); } else if (n > 0) { setPrompt('Tap the next corner (' + n + ' placed).'); setResult(null); } else { setResult(null); } };
      T.onTap = (sn, hit) => { if (T.pts.length === 0 && hit && hit.item.closed && hit.item.fillPoly && (hit.item.hatch || hit.item.ent.t !== 'INSERT') && sn.kind !== 1 && sn.kind !== 2) { const fp = hit.item.fillPoly.slice(0, -2); const A = Math.abs(polyArea(fp)); setResult([['Object', hit.item.ent.t], ['Area', fmtArea(A)], ['Perimeter', fmtLenAll(polyLength(fp, true))]].concat(hit.model ? [['Measured', 'in model through viewport']] : [])); state.selection.clear(); if (!hit.model) state.selection.add(hit.item.ent.id); setPrompt('Area of the tapped object. Tap elsewhere to start placing points.'); return; } state.selection.clear(); addPt(sn); T.update(); };
      T.onDone = () => { if (T.pts.length >= 3) { T.update(); toast('Area measured'); T.closed = true; } T.pts = []; state.lastPt = null; };
      T.draw = (c, V, acc) => { c.strokeStyle = acc; c.lineWidth = 2; c.setLineDash([]); if (T.pts.length >= 3) { c.fillStyle = acc; c.globalAlpha = 0.15; c.beginPath(); const p0 = toScreen(T.pts[0][0], T.pts[0][1], V); c.moveTo(p0[0], p0[1]); for (let i = 1; i < T.pts.length; i++) { const p = toScreen(T.pts[i][0], T.pts[i][1], V); c.lineTo(p[0], p[1]); } c.closePath(); c.fill(); c.globalAlpha = 1; } drawPolyScreen(c, T.pts, V, T.pts.length >= 3); drawDots(c, T.pts, V, acc); };
      break;
    case 'angle':
      T.start = () => setPrompt('Tap the vertex (corner) of the angle.');
      T.update = () => { const n = T.pts.length; if (n === 1) setPrompt('Tap a point on the first arm.'); else if (n === 2) setPrompt('Tap a point on the second arm.'); else if (n >= 3) { const [v, a, b] = measureSpace(T.pts.slice(0, 3)).pts; const a1 = Math.atan2(a[1] - v[1], a[0] - v[0]), a2 = Math.atan2(b[1] - v[1], b[0] - v[0]); let d = Math.abs(deg(a2 - a1)) % 360; if (d > 180) d = 360 - d; setResult([['Angle', fmtNum(d, 2) + '°'], ['Supplement', fmtNum(180 - d, 2) + '°'], ['Arm 1', fmtNum(deg(a1), 2) + '°'], ['Arm 2', fmtNum(deg(a2), 2) + '°']]); setPrompt('Done. Tap a new vertex to measure another angle.'); } };
      T.onTap = (sn) => { if (T.pts.length >= 3) { T.pts = []; setResult(null); } addPt(sn); T.update(); };
      T.draw = (c, V, acc) => { c.strokeStyle = acc; c.lineWidth = 2; c.setLineDash([]); if (T.pts.length >= 2) { drawPolyScreen(c, [T.pts[1], T.pts[0]], V, false); } if (T.pts.length >= 3) { drawPolyScreen(c, [T.pts[0], T.pts[2]], V, false); const v = toScreen(T.pts[0][0], T.pts[0][1], V); const a1 = -Math.atan2(T.pts[1][1] - T.pts[0][1], T.pts[1][0] - T.pts[0][0]), a2 = -Math.atan2(T.pts[2][1] - T.pts[0][1], T.pts[2][0] - T.pts[0][0]); let d = a2 - a1; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; c.beginPath(); c.arc(v[0], v[1], 28, a1, a1 + d, d < 0); c.stroke(); } drawDots(c, T.pts, V, acc); };
      break;
    case 'order': // draw order: front / back / above or under another object
      T.verb = 'reorder'; T.boxSelect = true;
      T.start = () => { T.phase = 'menu'; setPrompt(state.selection.size ? 'Choose how to reorder the ' + state.selection.size + ' selected object' + (state.selection.size === 1 ? '' : 's') + '.' : 'Choose an option. Front, back, above and under work on objects you select.'); openSheet('orderPanel'); };
      T.onTap = (sn, hit) => {
        if (T.phase === 'select') { if (hit && !hit.model) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); setResult([['Selected', state.selection.size + '']]); } return; }
        if (T.phase === 'ref') { if (!hit || hit.model) { toast('Tap an object'); return; } reorderSelection(T.mode, hit.item.ent.id); startTool('select', true); }
      };
      T.choose = (mode) => { closeSheets(); if (mode !== 'hatchesBack' && !state.selection.size) { T.pending = mode; T.phase = 'select'; setPrompt('Tap the objects to reorder (drag for a box), then Done.'); return; } if (mode === 'hatchesBack') { reorderSelection(mode); startTool('select', true); return; } if (mode === 'front' || mode === 'back') { reorderSelection(mode); startTool('select', true); return; } T.mode = mode; T.phase = 'ref'; setPrompt('Tap the object to place the selection ' + (mode === 'above' ? 'above' : 'under') + '.'); };
      T.onDone = () => { if (T.phase === 'select') { if (!state.selection.size) { toast('Select objects first'); return; } if (T.pending) { const m = T.pending; T.pending = null; T.choose(m); } else { T.phase = 'menu'; openSheet('orderPanel'); } } else startTool('select', true); };
      T.draw = (c) => { if (state.boxSel) drawBoxSel(c); };
      break;
    case 'delete':
      T.verb = 'delete';
      T.start = () => { if (state.selection.size) { deleteSelection(); startTool('select', true); } else { T.phase = 'select'; setPrompt('Tap objects to delete (drag for a box), then Done.'); } };
      T.boxSelect = true;
      T.onTap = (sn, hit) => { if (hit) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); setResult([['Selected', state.selection.size + '']]); } };
      T.onDone = () => { if (state.selection.size) { deleteSelection(); } startTool('select', true); };
      break;
    case 'move': case 'copy':
      T.verb = name; T.boxSelect = true;
      T.start = () => { if (needSelection(T)) { T.phase = 'base'; setPrompt('Tap the base point.'); } };
      T.onTap = (sn, hit) => {
        if (T.phase === 'select') { if (hit) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); setResult([['Selected', state.selection.size + '']]); } return; }
        if (T.phase === 'base') { T.base = [sn.x, sn.y]; state.lastPt = T.base; T.phase = 'to'; setPrompt('Tap the destination point (or type @dx,dy or @dist<angle).'); return; }
        if (T.phase === 'to') { const M = mTranslate(sn.x - T.base[0], sn.y - T.base[1]); if (name === 'move') { applyTransform(M, false); startTool('select', true); toast('Moved'); } else { applyTransform(M, true); toast('Copied'); setPrompt('Tap another destination for more copies, or Done.'); } }
      };
      T.onDone = () => { if (T.phase === 'select') { if (needSelection(T)) { T.phase = 'base'; setPrompt('Tap the base point.'); } } else startTool('select', true); };
      T.onBack = () => { if (T.phase === 'to') { T.phase = 'base'; state.lastPt = null; setPrompt('Tap the base point.'); } };
      T.draw = (c, V, acc) => { if (T.base) drawDots(c, [T.base], V, acc); if (state.boxSel) drawBoxSel(c); };
      break;
    case 'rotate': case 'scale':
      T.verb = name; T.boxSelect = true;
      T.start = () => { if (needSelection(T)) { T.phase = 'base'; setPrompt('Tap the base point.'); } };
      T.onTap = (sn, hit) => {
        if (T.phase === 'select') { if (hit) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); setResult([['Selected', state.selection.size + '']]); } return; }
        if (T.phase === 'base') { T.base = [sn.x, sn.y]; state.lastPt = T.base; T.phase = 'ref'; setPrompt(name === 'rotate' ? 'Type the angle in degrees (e.g. 90 or -45), or tap a reference point then a target point.' : 'Type the scale factor (e.g. 2 or 0.5), or tap a reference point then a target point.'); return; }
        if (T.phase === 'ref') { T.ref = [sn.x, sn.y]; T.phase = 'target'; setPrompt('Tap the target point.'); return; }
        if (T.phase === 'target') { if (name === 'rotate') { const a0 = Math.atan2(T.ref[1] - T.base[1], T.ref[0] - T.base[0]), a1 = Math.atan2(sn.y - T.base[1], sn.x - T.base[0]); T.apply(a1 - a0); } else { const d0 = Math.hypot(T.ref[0] - T.base[0], T.ref[1] - T.base[1]) || 1, d1 = Math.hypot(sn.x - T.base[0], sn.y - T.base[1]); T.apply(d1 / d0); } }
      };
      T.apply = (v) => { const M = name === 'rotate' ? mMul(mTranslate(T.base[0], T.base[1]), mMul(mRotate(v), mTranslate(-T.base[0], -T.base[1]))) : mMul(mTranslate(T.base[0], T.base[1]), mMul(mScale(v, v), mTranslate(-T.base[0], -T.base[1]))); applyTransform(M, false); toast(name === 'rotate' ? 'Rotated ' + fmtNum(deg(v), 2) + '°' : 'Scaled ×' + fmtNum(v, 3)); startTool('select', true); };
      T.onNum = (v) => { if (T.phase === 'ref' || T.phase === 'target') T.apply(name === 'rotate' ? rad(v) : v); };
      T.onDone = () => { if (T.phase === 'select') { if (needSelection(T)) { T.phase = 'base'; setPrompt('Tap the base point.'); } } else startTool('select', true); };
      T.draw = (c, V, acc) => { if (T.base) drawDots(c, [T.base], V, acc); if (T.ref) { c.strokeStyle = acc; c.lineWidth = 1.5; drawPolyScreen(c, [T.base, T.ref], V, false); } if (state.boxSel) drawBoxSel(c); };
      break;
    case 'mirror':
      T.verb = 'mirror'; T.boxSelect = true; T.keep = true;
      T.start = () => { if (needSelection(T)) { T.phase = 'p1'; setPrompt('Tap the first point of the mirror line.'); } };
      T.onTap = (sn, hit) => {
        if (T.phase === 'select') { if (hit) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); setResult([['Selected', state.selection.size + '']]); } return; }
        if (T.phase === 'p1') { T.p1 = [sn.x, sn.y]; state.lastPt = T.p1; T.phase = 'p2'; setPrompt('Tap the second point of the mirror line.'); return; }
        if (T.phase === 'p2') { T.p2 = [sn.x, sn.y]; T.phase = 'ask'; setPrompt('Keep the original? Done = keep both, Back = replace original.'); setResult([['Mirror line', fmtNum(deg(Math.atan2(T.p2[1] - T.p1[1], T.p2[0] - T.p1[0])), 1) + '°']]); }
      };
      T.onDone = () => { if (T.phase === 'select') { if (needSelection(T)) { T.phase = 'p1'; setPrompt('Tap the first point of the mirror line.'); } return; } if (T.phase === 'ask') { applyTransform(mMirror(T.p1, T.p2), true); toast('Mirrored (original kept)'); startTool('select', true); } };
      T.onBack = () => { if (T.phase === 'ask') { applyTransform(mMirror(T.p1, T.p2), false); toast('Mirrored (original replaced)'); startTool('select', true); } else if (T.phase === 'p2') { T.phase = 'p1'; state.lastPt = null; setPrompt('Tap the first point of the mirror line.'); } };
      T.draw = (c, V, acc) => { const pts = [T.p1, T.p2].filter(Boolean); if (pts.length === 2) { c.strokeStyle = acc; c.lineWidth = 1.5; c.setLineDash([8, 6]); drawPolyScreen(c, pts, V, false); c.setLineDash([]); } drawDots(c, pts, V, acc); if (state.boxSel) drawBoxSel(c); };
      break;
    case 'align':
      T.verb = 'align'; T.boxSelect = true; T.doScale = false;
      T.start = () => { if (needSelection(T)) { T.phase = 'pick'; setPrompt('Tap source point 1 (on the objects).'); } };
      T.onTap = (sn, hit) => {
        if (T.phase === 'select') { if (hit) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); setResult([['Selected', state.selection.size + '']]); } return; }
        addPt(sn); const n = T.pts.length;
        const msgs = ['Tap source point 1 (on the objects).', 'Tap destination point 1.', 'Tap source point 2 (Done = move only, using one pair).', 'Tap destination point 2.'];
        if (n < 4) setPrompt(msgs[n]); else { T.phase = 'ask'; setPrompt('Done = align (rotate + move). Back = also scale to fit the two pairs.'); }
      };
      T.apply = (scale) => {
        const [s1, d1, s2, d2] = T.pts; let M;
        if (!s2) M = mTranslate(d1[0] - s1[0], d1[1] - s1[1]);
        else { const a = Math.atan2(d2[1] - d1[1], d2[0] - d1[0]) - Math.atan2(s2[1] - s1[1], s2[0] - s1[0]); const k = scale ? (Math.hypot(d2[0] - d1[0], d2[1] - d1[1]) / (Math.hypot(s2[0] - s1[0], s2[1] - s1[1]) || 1)) : 1; M = mMul(mTranslate(d1[0], d1[1]), mMul(mRotate(a), mMul(mScale(k, k), mTranslate(-s1[0], -s1[1])))); }
        applyTransform(M, false); toast('Aligned'); startTool('select', true);
      };
      T.onDone = () => { if (T.phase === 'select') { if (needSelection(T)) { T.phase = 'pick'; setPrompt('Tap source point 1 (on the objects).'); } return; } if (T.pts.length === 2 || T.pts.length === 4) T.apply(false); else toast('Need 2 or 4 points'); };
      T.onBack = () => { if (T.pts.length === 4) T.apply(true); else { T.pts.pop(); state.lastPt = T.pts.length ? T.pts[T.pts.length - 1] : null; T.phase = 'pick'; setPrompt('Point removed. Tap again.'); } };
      T.draw = (c, V, acc) => { c.strokeStyle = acc; c.lineWidth = 1.5; c.setLineDash([4, 4]); if (T.pts.length >= 2) drawPolyScreen(c, [T.pts[0], T.pts[1]], V, false); if (T.pts.length >= 4) drawPolyScreen(c, [T.pts[2], T.pts[3]], V, false); c.setLineDash([]); drawDots(c, T.pts, V, acc); if (state.boxSel) drawBoxSel(c); };
      break;
    case 'line':
      T.start = () => setPrompt('Tap the start point.');
      T.onTap = (sn) => { addPt(sn); const n = T.pts.length; if (n >= 2) { const a = T.pts[n - 2], b = T.pts[n - 1]; addEntities([{ t: 'LINE', L: state.curLayer, c: 256, lt: '', a: [a[0], a[1]], b: [b[0], b[1]] }], n > 2); } setPrompt(n === 1 ? 'Tap the next point (or type a length like @1200<0). Done ends the line.' : 'Line placed. Tap the next point, or Done.'); };
      T.onDone = () => { T.pts = []; state.lastPt = null; setPrompt('Tap the start point.'); };
      T.onBack = () => { if (T.pts.length >= 2) { undo(); T.pts.pop(); state.lastPt = T.pts[T.pts.length - 1]; } else { T.pts = []; state.lastPt = null; } };
      T.draw = (c, V, acc) => { drawDots(c, T.pts.slice(-1), V, acc); };
      break;
    case 'pline': case 'spline':
      T.start = () => setPrompt('Tap the first point.');
      T.onTap = (sn) => { addPt(sn); setPrompt('Tap the next point. Back removes the last, Done finishes' + (name === 'pline' ? ' (type c + Enter to close).' : '.')); };
      T.onTyped = (v) => { if (v.pt) T.onTap({ x: v.pt[0], y: v.pt[1], kind: 0 }); };
      T.finish = (close) => { if (T.pts.length >= 2) { if (name === 'pline') addEntities([{ t: 'PLINE', L: state.curLayer, c: 256, lt: '', v: T.pts.map(p => [p[0], p[1], 0]), closed: !!close, w: 0 }]); else addEntities([{ t: 'SPLINE', L: state.curLayer, c: 256, lt: '', deg: 3, knots: [], cp: [], fit: T.pts.map(p => [p[0], p[1]]), closed: !!close }]); toast((name === 'pline' ? 'Polyline' : 'Spline') + ' placed'); } T.pts = []; state.lastPt = null; setPrompt('Tap the first point.'); };
      T.onDone = () => T.finish(false);
      T.draw = (c, V, acc) => { c.strokeStyle = acc; c.lineWidth = 2; c.setLineDash([]); if (name === 'spline' && T.pts.length >= 2) { const flat = catmullPoints(T.pts, false, [], null); c.beginPath(); for (let i = 0; i < flat.length; i += 2) { const p = toScreen(flat[i], flat[i + 1], V); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke(); } else drawPolyScreen(c, T.pts, V, false); drawDots(c, T.pts, V, acc); };
      break;
    case 'rect':
      T.start = () => setPrompt('Tap the first corner.');
      T.onTap = (sn) => { addPt(sn); if (T.pts.length === 2) { const [a, b] = T.pts; addEntities([{ t: 'PLINE', L: state.curLayer, c: 256, lt: '', v: [[a[0], a[1], 0], [b[0], a[1], 0], [b[0], b[1], 0], [a[0], b[1], 0]], closed: true, w: 0 }]); toast('Rectangle ' + fmtLen(Math.abs(b[0] - a[0])) + ' × ' + fmtLen(Math.abs(b[1] - a[1]))); T.pts = []; state.lastPt = null; setPrompt('Tap the first corner.'); } else setPrompt('Tap the opposite corner (or type @width,height).'); };
      T.draw = (c, V, acc) => drawDots(c, T.pts, V, acc);
      break;
    case 'circle':
      T.start = () => setPrompt('Tap the centre.');
      T.onTap = (sn) => { addPt(sn); if (T.pts.length === 2) { const [a, b] = T.pts; T.place(Math.hypot(b[0] - a[0], b[1] - a[1])); } else setPrompt('Tap a point on the circle, or type the radius.'); };
      T.onNum = (r) => { if (T.pts.length === 1 && r > 0) T.place(r); };
      T.place = (r) => { const a = T.pts[0]; addEntities([{ t: 'CIRCLE', L: state.curLayer, c: 256, lt: '', ce: a.slice(), r }]); toast('Circle r = ' + fmtLen(r)); T.pts = []; state.lastPt = null; setPrompt('Tap the centre.'); };
      T.draw = (c, V, acc) => drawDots(c, T.pts, V, acc);
      break;
    case 'arc':
      T.start = () => setPrompt('Tap the start point of the arc.');
      T.onTap = (sn) => { addPt(sn); const n = T.pts.length; if (n === 1) setPrompt('Tap a point on the arc.'); else if (n === 2) setPrompt('Tap the end point.'); else { const arc = arc3pt(T.pts[0], T.pts[1], T.pts[2]); if (arc) { addEntities([{ t: 'ARC', L: state.curLayer, c: 256, lt: '', ce: arc.c, r: arc.r, a0: arc.a0, a1: arc.a1 }]); toast('Arc placed'); } else toast('Points are in a line'); T.pts = []; state.lastPt = null; setPrompt('Tap the start point of the arc.'); } };
      T.draw = (c, V, acc) => { c.strokeStyle = acc; c.lineWidth = 1.5; drawPolyScreen(c, T.pts, V, false); drawDots(c, T.pts, V, acc); };
      break;
    case 'pdfwin': // pick the area to print
      T.start = () => setPrompt('Tap one corner of the area to print, then the opposite corner.');
      T.onTap = (sn) => { addPt(sn); if (T.pts.length === 2) { const [a, b] = T.pts; T.pts = []; state.lastPt = null; if (Math.abs(a[0] - b[0]) < 1e-9 || Math.abs(a[1] - b[1]) < 1e-9) { toast('Pick two opposite corners'); T.start(); return; } pdfWindowPicked([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]); } else setPrompt('Now tap the opposite corner.'); };
      T.onBack = () => { T.pts = []; state.lastPt = null; T.start(); };
      T.draw = (c, V, acc) => { drawDots(c, T.pts, V, acc); const sm = state.snapMark || state.loupe && state.loupe.sn; if (T.pts.length === 1 && sm) { const a = toScreen(T.pts[0][0], T.pts[0][1], V), b = toScreen(sm.x, sm.y, V); c.save(); c.strokeStyle = acc; c.setLineDash([6, 4]); c.lineWidth = 1.5; c.strokeRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); c.restore(); } };
      break;
    case 'text':
      T.start = () => setPrompt('Tap where the text should start (bottom-left of the first letter).');
      T.onTap = (sn) => { T.pt = [sn.x, sn.y]; state.lastPt = T.pt; openTextDialog(T.pt); };
      T.draw = (c, V, acc) => { if (T.pt) drawDots(c, [T.pt], V, acc); };
      break;
  }
  return T;
}
function drawBoxSel(c, bx) { const b = bx || state.boxSel; if (!b) return; const acc = b.x1 < b.x0 ? CROSS_GREEN : SEL_BLUE; c.save(); c.strokeStyle = acc; c.fillStyle = acc; c.globalAlpha = 0.12; c.fillRect(Math.min(b.x0, b.x1), Math.min(b.y0, b.y1), Math.abs(b.x1 - b.x0), Math.abs(b.y1 - b.y0)); c.globalAlpha = 1; c.setLineDash(b.x1 < b.x0 ? [6, 4] : []); c.lineWidth = 1.5; c.strokeRect(Math.min(b.x0, b.x1), Math.min(b.y0, b.y1), Math.abs(b.x1 - b.x0), Math.abs(b.y1 - b.y0)); c.restore(); }
function arc3pt(a, b, c) {
  const ax = a[0], ay = a[1], bx = b[0], by = b[1], cx = c[0], cy = c[1];
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)); if (Math.abs(d) < 1e-12) return null;
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
  const r = Math.hypot(ax - ux, ay - uy); const aA = Math.atan2(ay - uy, ax - ux), aB = Math.atan2(by - uy, bx - ux), aC = Math.atan2(cy - uy, cx - ux);
  const ccw = normAng(aB - aA) < normAng(aC - aA);
  return ccw ? { c: [ux, uy], r, a0: aA, a1: aC } : { c: [ux, uy], r, a0: aC, a1: aA };
}
