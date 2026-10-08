// ===================== Renderer =====================
const cv = $('cv'); let ctx = cv.getContext('2d', { alpha: false }); // swapped for a PDF / image context while exporting
const stage = $('stage');
let cssW = 1, cssH = 1;
const offCv = document.createElement('canvas'); const offCtx = offCv.getContext('2d', { alpha: false });
let lastFull = null; // {s,tx,ty} of the bitmap in offCv
let renderQueued = false, fullQueued = false, gesture = false;

function resizeCanvas() {
  const r = stage.getBoundingClientRect(); cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
  const dpr = state.dpr; cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr); offCv.width = cv.width; offCv.height = cv.height; lastFull = null;
  requestFull();
}
new ResizeObserver(resizeCanvas).observe(stage);

const toScreen = (x, y, V) => [x * V.s + V.tx, -y * V.s + V.ty];
const toWorld = (X, Y, V) => [(X - V.tx) / V.s, (V.ty - Y) / V.s];
const V0 = () => state.view;
function worldRect(V) { const a = toWorld(0, 0, V), b = toWorld(cssW, cssH, V); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
// Canvas colours come from the theme (CSS tokens), read once per theme change
const SKIN = { cvDark: '#111214', cvLight: '#ffffff', sheetDark: '#2b2c30', sheetLight: '#e4e4e4' };
function readSkin() { const cs = getComputedStyle(document.documentElement); const g = (k, d) => (cs.getPropertyValue(k) || '').trim() || d; SKIN.cvDark = g('--cv-dark', SKIN.cvDark); SKIN.cvLight = g('--cv-light', SKIN.cvLight); SKIN.sheetDark = g('--sheet-dark', SKIN.sheetDark); SKIN.sheetLight = g('--sheet-light', SKIN.sheetLight); }
function bgColor() { const sp = curSpace(); if (sp && sp.paper) return state.canvasLight ? SKIN.sheetLight : SKIN.sheetDark; return state.canvasLight ? SKIN.cvLight : SKIN.cvDark; }
function onLightBg() { const sp = curSpace(); return state.canvasLight || !!(sp && sp.paper); }

function requestFull() { fullQueued = true; if (!renderQueued) { renderQueued = true; requestAnimationFrame(frame); } }
function requestFast() { if (!renderQueued) { renderQueued = true; requestAnimationFrame(frame); } }
function frame() {
  renderQueued = false;
  if (fullQueued && !gesture) { fullQueued = false; renderFull(); }
  else if (lastFull) fastDraw();
  else { renderFull(); fullQueued = false; }
}

function renderFull() {
  const dpr = state.dpr; const V = V0();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bgColor(); ctx.fillRect(0, 0, cv.width, cv.height);
  drawContent(V, null);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  offCtx.setTransform(1, 0, 0, 1, 0, 0); offCtx.drawImage(cv, 0, 0); lastFull = { s: V.s, tx: V.tx, ty: V.ty };
  drawOverlay();
}
// Draws the current space with view V. wr = world rectangle to draw (null = whole screen).
function drawContent(V, wr) {
  const dpr = state.dpr; const sp = curSpace(); const S = sp ? getScene(state.spaceIdx) : null;
  if (!S) return;
  if (sp.paper) {
    // paper sheet
    ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr);
    const lim = sp.limits && (sp.limits[1][0] > sp.limits[0][0]) ? sp.limits : [[S.bbox[0], S.bbox[1]], [S.bbox[2], S.bbox[3]]];
    ctx.fillStyle = '#ffffff'; ctx.fillRect(lim[0][0], lim[0][1], lim[1][0] - lim[0][0], lim[1][1] - lim[0][1]);
    // viewports: model content
    const MS = getScene(0); const W = wr || worldRect(V);
    for (const vp of S.viewports) {
      if (!layerOn(vp.layer)) continue;
      const cx0 = Math.max(vp.x0, lim[0][0], W[0]), cy0 = Math.max(vp.y0, lim[0][1], W[1]), cx1 = Math.min(vp.x1, lim[1][0], W[2]), cy1 = Math.min(vp.y1, lim[1][1], W[3]); if (cx1 <= cx0 || cy1 <= cy0) continue;
      ctx.save(); ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr); ctx.beginPath(); ctx.rect(cx0, cy0, cx1 - cx0, cy1 - cy0); ctx.clip();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(vp.x0, vp.y0, vp.x1 - vp.x0, vp.y1 - vp.y0);
      const cx = (vp.x0 + vp.x1) / 2, cy = (vp.y0 + vp.y1) / 2; const sc = vp.sc;
      const V2 = { s: V.s * sc, tx: V.tx + V.s * (cx - vp.vc[0] * sc), ty: V.ty - V.s * (cy - vp.vc[1] * sc) };
      drawScene(MS, V2, true, [cx0, cy0, cx1, cy1].map((v, i) => i % 2 === 0 ? (v - cx) / sc + vp.vc[0] : (v - cy) / sc + vp.vc[1]));
      ctx.restore();
    }
    drawScene(S, V, true, wr);
  } else drawScene(S, V, onLightBg(), wr);
}
function fastDraw() {
  const V = V0(); const dpr = state.dpr; const k = V.s / lastFull.s;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = bgColor(); ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(offCv, (V.tx - lastFull.tx * k) * dpr, (V.ty - lastFull.ty * k) * dpr, cv.width * k, cv.height * k);
  drawOverlay();
}

function drawScene(S, V, onLight, clipWorld) {
  const dpr = state.dpr; const T = () => ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr);
  const wr = clipWorld || worldRect(V);
  const minDiag = (RENDER.pdf ? 0.05 : 1.1) / V.s; // objects smaller than ~1px are skipped (on paper: almost nothing is)
  const vis = [];
  for (const it of S.items) { const bb = it.bbox; if (bb[2] < wr[0] || bb[0] > wr[2] || bb[3] < wr[1] || bb[1] > wr[3]) continue; if (it.diag < minDiag && !it.points && !state.selection.has(it.ent.id)) continue; vis.push(it); }
  const _t0 = performance.now(); T();
  // Objects are drawn one after another in draw order (fills, then lines, per object), so a hatch or
  // wipeout brought to the front covers what is behind it, as in AutoCAD. Text is drawn last.
  let budget = RENDER.pdf ? 3e6 : 60000; const wipeCol = (RENDER.pdf || (curSpace() && curSpace().paper)) ? '#ffffff' : bgColor();
  const lwOut = (lw, sc) => (RENDER.lw ? RENDER.lw(lw) : 1) / (V.s * sc); // line width in world units
  ctx.lineWidth = 1 / V.s; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  const lts = state.drawing ? state.drawing.ltypes : {}; const ltscale = state.drawing ? state.drawing.header.ltscale : 1;
  let lastCol = null, dashed = false, lastAl = 1; ctx.globalAlpha = 1;
  const setAl = (a) => { a = a == null ? 1 : a; if (a !== lastAl) { ctx.globalAlpha = a; lastAl = a; } };
  const fillOne = (f, Vs, wrL) => {
    if (!layerOn(f.layer)) return; const col = aciCss(f.aci, onLight, true); const fa = RENDER.solidFills || f.al == null ? 1 : f.al;
    if (f.solid || !f.pat) { ctx.globalAlpha = fa; ctx.fillStyle = col; ctx.fill(f.path, 'evenodd'); }
    else if (state.patOn && f.pat.minSp * Vs >= (RENDER.pdf ? 0.9 : 2.6) && budget > 0) budget -= drawPattern(f, { s: Vs }, RENDER.color ? aciCss(f.aci, onLight, false) : col, wrL); // printed in black/grey, pattern lines count as lines
    else { ctx.globalAlpha = 0.16 * fa; ctx.fillStyle = col; ctx.fill(f.path, 'evenodd'); }
    ctx.globalAlpha = 1; lastAl = 1;
  };
  for (const it of vis) {
    // fills and wipeouts of this object
    if (it.fills.length) { if (dashed) { ctx.setLineDash([]); dashed = false; } for (const f of it.fills) fillOne(f, V.s, wr); }
    if (it.wipes.length) { ctx.globalAlpha = 1; lastAl = 1; ctx.fillStyle = wipeCol; for (const w of it.wipes) if (layerOn(w.layer)) ctx.fill(w.path); }
    // its own lines
    for (const k of it.paths) {
      if (!k.n || !layerOn(k.layer)) continue;
      const col = aciCss(k.aci, onLight); if (col !== lastCol) { ctx.strokeStyle = col; lastCol = col; } setAl(k.al);
      let wantDash = null;
      if (k.lt) { const pat = lts[k.lt]; if (pat && pat.length) { let per = 0; const arr = []; const f = ltscale * (k.lts || 1); for (const v of pat) { const a = Math.abs(v) * f; arr.push(a < 1e-9 ? 0.5 / V.s : a); per += a; } if (per * V.s > 6) wantDash = arr; } }
      if (wantDash) { ctx.setLineDash(wantDash); dashed = true; } else if (dashed) { ctx.setLineDash([]); dashed = false; }
      if (RENDER.lw) ctx.lineWidth = lwOut(k.lw, 1);
      const bold = !RENDER.lw && k.layer === MK_LAYER; if (bold) ctx.lineWidth = 2 / V.s; // markups a little bolder on screen
      ctx.stroke(k.path); if (bold) ctx.lineWidth = 1 / V.s;
    }
    // block instances: the block's fills, wipeouts, then its lines
    if (it.inst) for (const ins of it.inst) {
      const g = ins.g; if (!g.paths.length && !g.fills.length && !g.wipes.length) continue;
      if (dashed) { ctx.setLineDash([]); dashed = false; }
      ctx.save(); ctx.transform(ins.M.a, ins.M.b, ins.M.c, ins.M.d, ins.M.e, ins.M.f); ctx.lineWidth = 1 / (V.s * ins.scale);
      if (g.fills.length) { const wrL = localRect(wr, ins.Minv); for (const f of g.fills) fillOne(f, V.s * ins.scale, wrL); }
      if (g.wipes.length) { ctx.globalAlpha = 1; ctx.fillStyle = wipeCol; for (const w of g.wipes) if (layerOn(w.layer)) ctx.fill(w.path); }
      if (g.paths.length) {
        const dpx = g.diag * ins.scale * V.s;
        if (!RENDER.pdf && g.segs > 150 && g.segs > dpx * 12) { // too dense to matter at this size: draw its outline only
          const k0 = g.paths[0]; ctx.strokeStyle = aciCss(k0.aci, onLight); ctx.globalAlpha = 0.7 * (k0.al == null ? 1 : k0.al); ctx.strokeRect(g.bbox[0], g.bbox[1], g.bbox[2] - g.bbox[0], g.bbox[3] - g.bbox[1]);
        } else for (const k of g.paths) { if (!k.n || !layerOn(k.layer)) continue; ctx.strokeStyle = aciCss(k.aci, onLight); ctx.globalAlpha = k.al == null ? 1 : k.al; if (RENDER.lw) ctx.lineWidth = lwOut(k.lw, ins.scale); else ctx.lineWidth = (k.layer === MK_LAYER ? 2 : 1) / (V.s * ins.scale); ctx.stroke(k.path); }
      }
      ctx.restore(); lastCol = null; lastAl = 1; ctx.globalAlpha = 1;
    }
  }
  const _t1 = performance.now();
  if (dashed) ctx.setLineDash([]); ctx.globalAlpha = 1; const _t2 = performance.now();
  // pass 3: texts
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // point objects: a small × at screen size, so divisions and survey points can be seen
  { let started = false; for (const it of vis) if (it.points) for (const p of it.points) { if (!layerOn(p.layer)) continue; const q = toScreen(p.x, p.y, V); if (!started) { ctx.lineWidth = 1.2; started = true; } ctx.globalAlpha = p.al == null ? 1 : p.al; ctx.strokeStyle = aciCss(p.aci, onLight); ctx.beginPath(); ctx.moveTo(q[0] - 3.5, q[1] - 3.5); ctx.lineTo(q[0] + 3.5, q[1] + 3.5); ctx.moveTo(q[0] + 3.5, q[1] - 3.5); ctx.lineTo(q[0] - 3.5, q[1] + 3.5); ctx.stroke(); } ctx.globalAlpha = 1; }
  for (const it of vis) if (it.texts.length) for (const t of it.texts) { if (!layerOn(t.layer)) continue; const hp = t.h * V.s; if (hp < (RENDER.pdf ? 0.5 : 2.4)) continue; drawText(t, V, aciCss(t.aci, onLight)); }
  if (window.__prof) window.__prof.push({ vis: vis.length, fills: _t1 - _t0, strokes: _t2 - _t1, texts: performance.now() - _t2 });
}
function localRect(wr, Minv) { const bb = emptyBox(); for (const q of [[wr[0], wr[1]], [wr[2], wr[1]], [wr[2], wr[3]], [wr[0], wr[3]]]) { const l = mApply(Minv, q); bboxAdd(bb, l[0], l[1]); } return bb; }
function drawText(t, V, col) {
  const dpr = state.dpr; const [X, Y] = toScreen(t.x, t.y, V); if (X < -4000 || X > cssW + 4000 || Y < -4000 || Y > cssH + 4000) return;
  const px = t.h * V.s / CAP;
  ctx.save(); ctx.translate(X, Y); ctx.rotate(-t.rot); ctx.fillStyle = col; if (t.al != null && t.al < 1) ctx.globalAlpha = t.al; ctx.font = px + 'px ' + TEXT_FONT; ctx.textBaseline = 'alphabetic';
  if (t.mt) {
    const lineH = t.h * 1.667 * (t.ls || 1) * V.s; const n = t.lines.length; const H = (t.h + (n - 1) * t.h * 1.667 * (t.ls || 1)) * V.s;
    const col3 = (t.at - 1) % 3, row = Math.floor((t.at - 1) / 3);
    ctx.textAlign = col3 === 1 ? 'center' : col3 === 2 ? 'right' : 'left';
    const yTop = row === 0 ? 0 : row === 1 ? -H / 2 : -H;
    for (let i = 0; i < n; i++) ctx.fillText(t.lines[i], 0, yTop + t.h * V.s + i * lineH);
  } else {
    ctx.textAlign = (t.ha === 1 || t.ha === 4 || t.ha === 3 || t.ha === 5) ? 'center' : t.ha === 2 ? 'right' : 'left';
    let y = 0; if (t.va === 2 || t.ha === 4) y = t.h * V.s / 2; else if (t.va === 3) y = t.h * V.s;
    if (t.wf && t.wf !== 1) ctx.scale(t.wf, 1);
    ctx.fillText(t.lines[0], 0, y);
  }
  ctx.restore();
}
function drawPattern(f, V, col, wr) {
  const bb = f.bbox; const x0 = Math.max(bb[0], wr[0]), y0 = Math.max(bb[1], wr[1]), x1 = Math.min(bb[2], wr[2]), y1 = Math.min(bb[3], wr[3]);
  if (x1 <= x0 || y1 <= y0) return 0;
  let count = 0;
  ctx.save(); ctx.clip(f.path, 'evenodd'); ctx.strokeStyle = col; ctx.lineWidth = (RENDER.lw ? RENDER.lw(f.lw) : 1) / V.s; const maxLines = RENDER.pdf ? 200000 : 6000; ctx.globalAlpha = 0.9 * (f.al == null ? 1 : f.al);
  const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  for (const ln of f.pat.lines) {
    const nx = -ln.dy, ny = ln.dx; let tmin = Infinity, tmax = -Infinity, smin = Infinity, smax = -Infinity;
    for (const c of corners) { const rx = c[0] - ln.b[0], ry = c[1] - ln.b[1]; const tn = rx * nx + ry * ny; const ts = rx * ln.dx + ry * ln.dy; if (tn < tmin) tmin = tn; if (tn > tmax) tmax = tn; if (ts < smin) smin = ts; if (ts > smax) smax = ts; }
    let k0 = Math.floor(Math.min(tmin / ln.nd, tmax / ln.nd)), k1 = Math.ceil(Math.max(tmin / ln.nd, tmax / ln.nd));
    if (k1 - k0 > (RENDER.pdf ? 40000 : 4000)) { k0 = 0; k1 = -1; }
    const dashed = ln.dash.length > 0 && ln.per > 0;
    if (dashed) ctx.setLineDash(ln.dash.map(v => Math.max(Math.abs(v), 0.001)));
    ctx.beginPath();
    for (let k = k0; k <= k1; k++) {
      const ox = ln.b[0] + ln.o[0] * k, oy = ln.b[1] + ln.o[1] * k;
      // s range relative to this origin
      const shift = (ln.o[0] * k) * ln.dx + (ln.o[1] * k) * ln.dy; const sA = smin - shift, sB = smax - shift;
      if (dashed) { ctx.stroke(); ctx.beginPath(); ctx.lineDashOffset = -(((sA % ln.per) + ln.per) % ln.per) + 0; ctx.lineDashOffset = ((sA % ln.per) + ln.per) % ln.per; }
      ctx.moveTo(ox + ln.dx * sA, oy + ln.dy * sA); ctx.lineTo(ox + ln.dx * sB, oy + ln.dy * sB); count++;
      if (dashed) { ctx.stroke(); ctx.beginPath(); }
      if (count > maxLines) break;
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    if (count > maxLines) break;
  }
  ctx.restore(); ctx.globalAlpha = 1;
  return count;
}

// ===================== Overlay (selection, tool graphics, snap) =====================
const SEL_BLUE = '#2f8cff', CROSS_GREEN = '#22b573';
function drawOverlay() {
  const V = V0(); const dpr = state.dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const S = state.drawing ? getScene(state.spaceIdx) : null; if (!S) return;
  const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f0a640';
  // selection
  // selection: translucent blue glow with a thin solid core (no dashes)
  if (state.selection.size) {
    const sel = []; for (const it of S.items) if (state.selection.has(it.ent.id)) sel.push(it);
    ctx.save(); ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr); ctx.setLineDash([]); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = SEL_BLUE;
    ctx.globalAlpha = 0.3; ctx.lineWidth = 6 / V.s; for (const it of sel) highlightItem(it, V);
    ctx.globalAlpha = 0.85; ctx.lineWidth = 1.6 / V.s; for (const it of sel) highlightItem(it, V);
    ctx.restore();
  }
  if (state.hoverItem && !state.selection.has(state.hoverItem.ent.id)) { ctx.save(); ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr); ctx.strokeStyle = SEL_BLUE; ctx.globalAlpha = 0.45; ctx.lineWidth = 3 / V.s; highlightItem(state.hoverItem, V); ctx.restore(); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (state.tool && state.tool.draw) state.tool.draw(ctx, V, acc);
  drawRubber(ctx, V, acc); // line / shape following the finger from the last point
  drawTrackPts(ctx, V); { const ls = state.loupe ? state.loupe.sn : state.snapMark; if (ls && ls.lines) drawTrack(ctx, V, ls, !state.loupe); }
  // snap marker
  const sn = state.snapMark; if (sn) { const [X, Y] = toScreen(sn.x, sn.y, V); drawSnapMarker(ctx, X, Y, sn.kind, 6, acc); }
  // crosshair at last picked point
  if (state.lastPt) { const [X, Y] = toScreen(state.lastPt[0], state.lastPt[1], V); ctx.save(); ctx.strokeStyle = acc; ctx.globalAlpha = 0.8; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X - 10, Y); ctx.lineTo(X + 10, Y); ctx.moveTo(X, Y - 10); ctx.lineTo(X, Y + 10); ctx.stroke(); ctx.restore(); }
  if (state.loupe) drawLoupe(acc);
}
const SNAP_NAMES = { 0: 'Free point', 1: 'Endpoint', 2: 'Midpoint', 3: 'Centre', 4: 'Insertion', 5: 'Intersection', 6: 'Nearest', 7: 'Quadrant', 8: 'Node', 9: 'Perpendicular', 10: 'Tangent', 11: 'Geometric centre', 12: 'Polar', 13: 'Polar + object', 14: 'Tracking', 15: 'Tracking crossing', 16: 'Tracking + object' };
// AutoCAD-style markers: square endpoint, triangle midpoint, circle centre, X intersection, hourglass nearest
function drawSnapMarker(c, X, Y, kind, r, col) {
  if (!kind) return;
  c.save(); c.lineJoin = 'miter';
  const path = () => { c.beginPath();
    if (kind === 1) c.rect(X - r, Y - r, r * 2, r * 2);
    else if (kind === 2) { c.moveTo(X, Y - r * 1.15); c.lineTo(X + r * 1.15, Y + r); c.lineTo(X - r * 1.15, Y + r); c.closePath(); }
    else if (kind === 3) c.arc(X, Y, r, 0, TAU);
    else if (kind === 4) { c.rect(X - r, Y - r, r * 2, r * 2); c.moveTo(X - r, Y); c.lineTo(X + r, Y); c.moveTo(X, Y - r); c.lineTo(X, Y + r); }
    else if (kind === 5) { c.moveTo(X - r, Y - r); c.lineTo(X + r, Y + r); c.moveTo(X - r, Y + r); c.lineTo(X + r, Y - r); }
    else if (kind === 6) { c.moveTo(X - r, Y - r); c.lineTo(X + r, Y - r); c.lineTo(X - r, Y + r); c.lineTo(X + r, Y + r); c.closePath(); }
    else if (kind === 7) { c.moveTo(X, Y - r * 1.2); c.lineTo(X + r * 1.2, Y); c.lineTo(X, Y + r * 1.2); c.lineTo(X - r * 1.2, Y); c.closePath(); }
    else if (kind === 8) { c.arc(X, Y, r, 0, TAU); c.moveTo(X - r * 0.7, Y - r * 0.7); c.lineTo(X + r * 0.7, Y + r * 0.7); c.moveTo(X - r * 0.7, Y + r * 0.7); c.lineTo(X + r * 0.7, Y - r * 0.7); }
    else if (kind === 9) { c.moveTo(X - r, Y - r); c.lineTo(X - r, Y + r); c.lineTo(X + r, Y + r); c.moveTo(X - r, Y); c.lineTo(X, Y); c.lineTo(X, Y + r); }
    else if (kind === 10) { c.arc(X, Y + r * 0.25, r * 0.75, 0, TAU); c.moveTo(X - r, Y - r * 0.5); c.lineTo(X + r, Y - r * 0.5); }
    else if (kind === 11) { c.arc(X, Y, r, 0, TAU); c.moveTo(X - r * 0.55, Y); c.lineTo(X + r * 0.55, Y); c.moveTo(X, Y - r * 0.55); c.lineTo(X, Y + r * 0.55); }
    else if (kind === 15) { c.moveTo(X - r, Y - r); c.lineTo(X + r, Y + r); c.moveTo(X - r, Y + r); c.lineTo(X + r, Y - r); c.rect(X - r * 0.55, Y - r * 0.55, r * 1.1, r * 1.1); }
    else if (kind === 12 || kind === 14) { const q = r * 0.6; c.moveTo(X - q, Y - q); c.lineTo(X + q, Y + q); c.moveTo(X - q, Y + q); c.lineTo(X + q, Y - q); }
    else if (kind === 13 || kind === 16) { c.moveTo(X - r, Y - r); c.lineTo(X + r, Y + r); c.moveTo(X - r, Y + r); c.lineTo(X + r, Y - r); c.moveTo(X + r * 1.25, Y); c.arc(X, Y, r * 1.25, 0, TAU); }
  };
  path(); c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 4; c.stroke();
  path(); c.strokeStyle = col; c.lineWidth = 2; c.stroke();
  c.restore();
}
// Placing or moving a point: the pointer rides above the finger (always visible on the drawing) and a 2.5× magnifier
// box sits in the top corner away from it. state.loupe = { X, Y (pointer), fx, fy (finger), sn } in screen px.
const LOUPE_ZOOM = 2.5, LOUPE_R = 60;
function loupeRect() {
  const L = Math.round(clamp(Math.min(cssW, cssH) * 0.38, 120, 180)); const m = 10; const lp = state.loupe;
  const pr = $('prompt'); const top = (pr && !pr.hidden) ? pr.offsetTop + pr.offsetHeight + 8 : m;
  let left = lp.X > cssW / 2; const y = Math.min(top, Math.max(m, cssH - L - 34)); const x = left ? m : cssW - L - m;
  // never cover the pointer: if it is under the box, use the other corner (or the bottom when both would)
  const under = (bx, by) => lp.X > bx - 16 && lp.X < bx + L + 16 && lp.Y > by - 16 && lp.Y < by + L + 40;
  if (under(x, y)) { const x2 = left ? cssW - L - m : m; if (!under(x2, y)) return { x: x2, y, L }; return { x, y: cssH - L - 40, L }; }
  return { x, y, L };
}
function drawPointer(acc) { // crosshair at the pointer and a dotted lead down to the finger
  const lp = state.loupe; const dpr = state.dpr; if (!lp) return; const X = lp.X, Y = lp.Y;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.strokeStyle = onLightBg() ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.5)';
  if (lp.fy - Y > 36) { ctx.beginPath(); ctx.moveTo(X, Y + 18); ctx.lineTo(lp.fx, lp.fy - 18); ctx.stroke(); }
  ctx.setLineDash([]); const arm = (c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(X - 16, Y); ctx.lineTo(X - 4, Y); ctx.moveTo(X + 4, Y); ctx.lineTo(X + 16, Y); ctx.moveTo(X, Y - 16); ctx.lineTo(X, Y - 4); ctx.moveTo(X, Y + 4); ctx.lineTo(X, Y + 16); ctx.stroke(); };
  arm('rgba(0,0,0,.6)', 3.5); arm(acc, 1.6); ctx.restore();
}
function drawLoupe(acc) {
  const lp = state.loupe; const dpr = state.dpr; const V = V0(); const R = loupeRect(); const { x, y, L } = R;
  const w = toWorld(lp.X, lp.Y, V); const s2 = V.s * LOUPE_ZOOM; const cx = x + L / 2, cy = y + L / 2;
  const V2 = { s: s2, tx: cx - w[0] * s2, ty: cy + w[1] * s2 };
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 10; ctx.fillStyle = bgColor(); ctx.fillRect(x, y, L, L); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.rect(x, y, L, L); ctx.clip();
  const a = toWorld(x, y, V2), b = toWorld(x + L, y + L, V2);
  drawContent(V2, [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1;
  if (state.tool && state.tool.draw && (PICK_TOOLS.has(state.tool.name) || M_TOOLS.has(state.tool.name))) { ctx.save(); state.tool.draw(ctx, V2, acc); ctx.restore(); }
  drawRubber(ctx, V2, acc);
  ctx.strokeStyle = onLightBg() ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 14, cy); ctx.lineTo(cx - 4, cy); ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 14, cy); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx, cy - 4); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy + 14); ctx.stroke();
  if (lp.sn && lp.sn.kind) { const q = toScreen(lp.sn.x, lp.sn.y, V2); drawSnapMarker(ctx, q[0], q[1], lp.sn.kind, 8, acc); }
  ctx.restore();
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, L - 2, L - 2);
  // snap name and the changing value under the box
  const sn = lp.sn; const base = state.handleDrag ? null : rubberBase(); const label = (sn ? SNAP_NAMES[sn.kind] : '') + (sn ? (state.handleDrag ? '  ' + handleDragLabel() : base ? '  ' + fmtLen(mLen(base, [sn.x, sn.y])) : '  ' + fmtNum(sn.x, 2) + ', ' + fmtNum(sn.y, 2)) : '');
  ctx.font = '600 11px ' + UI_FONT; const tw = Math.min(ctx.measureText(label).width + 14, cssW - 20); const lx = x + (x < cssW / 2 ? 0 : L - tw), ly = y + L + 4;
  ctx.fillStyle = 'rgba(20,20,20,.86)'; ctx.fillRect(lx, ly, tw, 18); ctx.fillStyle = sn && sn.kind ? acc : '#e8e4da'; ctx.textBaseline = 'middle'; ctx.fillText(label, lx + 7, ly + 9.5, tw - 12);
  ctx.restore();
  drawPointer(acc);
}
function highlightItem(it, V) {
  ctx.beginPath(); for (const poly of it.polys) { ctx.moveTo(poly[0], poly[1]); for (let i = 2; i < poly.length; i += 2) ctx.lineTo(poly[i], poly[i + 1]); } ctx.stroke();
  if (it.inst) for (const ins of it.inst) { ctx.save(); ctx.transform(ins.M.a, ins.M.b, ins.M.c, ins.M.d, ins.M.e, ins.M.f); ctx.lineWidth = ctx.lineWidth / ins.scale; const g = ins.g; if (g.polys.length > 20000) { ctx.strokeRect(g.bbox[0], g.bbox[1], g.bbox[2] - g.bbox[0], g.bbox[3] - g.bbox[1]); } else { ctx.beginPath(); for (const poly of g.polys) { ctx.moveTo(poly[0], poly[1]); for (let i = 2; i < poly.length; i += 2) ctx.lineTo(poly[i], poly[i + 1]); } ctx.stroke(); } ctx.restore(); }
}
function drawPolyScreen(ctx, pts, V, close) { if (pts.length < 1) return; ctx.beginPath(); const p0 = toScreen(pts[0][0], pts[0][1], V); ctx.moveTo(p0[0], p0[1]); for (let i = 1; i < pts.length; i++) { const p = toScreen(pts[i][0], pts[i][1], V); ctx.lineTo(p[0], p[1]); } if (close) ctx.closePath(); ctx.stroke(); }
function drawDots(ctx, pts, V, col) { ctx.fillStyle = col; for (const p of pts) { const q = toScreen(p[0], p[1], V); ctx.beginPath(); ctx.arc(q[0], q[1], 3.5, 0, TAU); ctx.fill(); } }

// ===================== View control =====================
function getScene(idx) { let S = state.scenes.get(idx); if (!S) { S = buildScene(state.drawing.spaces[idx]); state.scenes.set(idx, S); } return S; }
function invalidateScene(idx) { state.scenes.delete(idx); lastFull = null; }
function zoomExtents() {
  const sp = curSpace(); if (!sp) return; const S = getScene(state.spaceIdx);
  let bb = S.bbox; if (sp.paper && sp.limits && sp.limits[1][0] > sp.limits[0][0]) { bb = [Math.min(sp.limits[0][0], S.bbox[0]), Math.min(sp.limits[0][1], S.bbox[1]), Math.max(sp.limits[1][0], S.bbox[2]), Math.max(sp.limits[1][1], S.bbox[3])]; if (!boxOk(S.bbox)) bb = [sp.limits[0][0], sp.limits[0][1], sp.limits[1][0], sp.limits[1][1]]; }
  if (!boxOk(bb)) { state.view = { s: 1, tx: cssW / 2, ty: cssH / 2 }; requestFull(); return; }
  zoomToBox(bb);
}
function zoomToBox(bb) {
  const w = Math.max(bb[2] - bb[0], 1e-6), h = Math.max(bb[3] - bb[1], 1e-6);
  const s = Math.min((cssW - 40) / w, (cssH - 40) / h); const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
  state.view = { s, tx: cssW / 2 - cx * s, ty: cssH / 2 + cy * s }; requestFull();
}
function zoomAt(X, Y, k) { const V = state.view; const s2 = clamp(V.s * k, 1e-7, 1e7); const kk = s2 / V.s; state.view = { s: s2, tx: X - (X - V.tx) * kk, ty: Y - (Y - V.ty) * kk }; }
