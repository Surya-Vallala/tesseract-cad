// ===================== Renderer =====================
const cv = $('cv'); const ctx = cv.getContext('2d', { alpha: false });
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
function bgColor() { const sp = curSpace(); if (sp && sp.paper) return state.canvasLight ? '#e9e7e1' : '#2a2d33'; return state.canvasLight ? '#fafaf7' : '#14161a'; }
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
  const sp = curSpace(); const S = sp ? getScene(state.spaceIdx) : null;
  if (S) {
    if (sp.paper) {
      // paper sheet
      ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr);
      const lim = sp.limits && (sp.limits[1][0] > sp.limits[0][0]) ? sp.limits : [[S.bbox[0], S.bbox[1]], [S.bbox[2], S.bbox[3]]];
      ctx.fillStyle = '#ffffff'; ctx.fillRect(lim[0][0], lim[0][1], lim[1][0] - lim[0][0], lim[1][1] - lim[0][1]);
      // viewports: model content
      const MS = getScene(0);
      for (const vp of S.viewports) {
        if (!layerOn(vp.layer)) continue;
        ctx.save(); ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr); ctx.beginPath(); const cx0 = Math.max(vp.x0, lim[0][0]), cy0 = Math.max(vp.y0, lim[0][1]), cx1 = Math.min(vp.x1, lim[1][0]), cy1 = Math.min(vp.y1, lim[1][1]); if (cx1 <= cx0 || cy1 <= cy0) { ctx.restore(); continue; } ctx.rect(cx0, cy0, cx1 - cx0, cy1 - cy0); ctx.clip();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(vp.x0, vp.y0, vp.x1 - vp.x0, vp.y1 - vp.y0);
        const cx = (vp.x0 + vp.x1) / 2, cy = (vp.y0 + vp.y1) / 2; const sc = vp.sc;
        const V2 = { s: V.s * sc, tx: V.tx + V.s * (cx - vp.vc[0] * sc), ty: V.ty - V.s * (cy - vp.vc[1] * sc) };
        drawScene(MS, V2, true, [vp.x0, vp.y0, vp.x1, vp.y1].map((v, i) => i % 2 === 0 ? (v - cx) / sc + vp.vc[0] : (v - cy) / sc + vp.vc[1]));
        ctx.restore();
      }
      drawScene(S, V, true, null);
    } else drawScene(S, V, onLightBg(), null);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  offCtx.setTransform(1, 0, 0, 1, 0, 0); offCtx.drawImage(cv, 0, 0); lastFull = { s: V.s, tx: V.tx, ty: V.ty };
  drawOverlay();
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
  const minDiag = 1.1 / V.s; // objects smaller than ~1px are skipped
  const vis = [];
  for (const it of S.items) { const bb = it.bbox; if (bb[2] < wr[0] || bb[0] > wr[2] || bb[3] < wr[1] || bb[1] > wr[3]) continue; if (it.diag < minDiag && !state.selection.has(it.ent.id)) continue; vis.push(it); }
  const _t0 = performance.now(); T();
  // pass 1: fills (hatches, solids) and wipeouts in drawing order
  let budget = 60000; const wipeCol = (curSpace() && curSpace().paper) ? '#ffffff' : bgColor();
  for (const it of vis) {
    if (it.fills.length) for (const f of it.fills) {
      if (!layerOn(f.layer)) continue; const col = aciCss(f.aci, onLight);
      if (f.solid || !f.pat) { ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.fill(f.path, 'evenodd'); continue; }
      if (state.patOn && f.pat.minSp * V.s >= 2.6 && budget > 0) budget -= drawPattern(f, V, col, wr);
      else { ctx.globalAlpha = 0.16; ctx.fillStyle = col; ctx.fill(f.path, 'evenodd'); ctx.globalAlpha = 1; }
    }
    if (it.wipes.length) { ctx.globalAlpha = 1; ctx.fillStyle = wipeCol; for (const w of it.wipes) if (layerOn(w.layer)) ctx.fill(w.path); }
    if (it.inst) for (const ins of it.inst) {
      const g = ins.g; if (!g.fills.length && !g.wipes.length) continue;
      ctx.save(); ctx.transform(ins.M.a, ins.M.b, ins.M.c, ins.M.d, ins.M.e, ins.M.f);
      const wrL = localRect(wr, ins.Minv);
      for (const f of g.fills) { if (!layerOn(f.layer)) continue; const col = aciCss(f.aci, onLight); if (f.solid || !f.pat) { ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.fill(f.path, 'evenodd'); continue; } if (state.patOn && f.pat.minSp * V.s * ins.scale >= 2.6 && budget > 0) budget -= drawPattern(f, { s: V.s * ins.scale }, col, wrL); else { ctx.globalAlpha = 0.16; ctx.fillStyle = col; ctx.fill(f.path, 'evenodd'); ctx.globalAlpha = 1; } }
      if (g.wipes.length) { ctx.globalAlpha = 1; ctx.fillStyle = wipeCol; for (const w of g.wipes) if (layerOn(w.layer)) ctx.fill(w.path); }
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1; const _t1 = performance.now();
  // pass 2: strokes
  ctx.lineWidth = 1 / V.s; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  const lts = state.drawing ? state.drawing.ltypes : {}; const ltscale = state.drawing ? state.drawing.header.ltscale : 1;
  let lastCol = null, dashed = false;
  for (const it of vis) {
    for (const k of it.paths) {
      if (!k.n || !layerOn(k.layer)) continue;
      const col = aciCss(k.aci, onLight); if (col !== lastCol) { ctx.strokeStyle = col; lastCol = col; }
      let wantDash = null;
      if (k.lt) { const pat = lts[k.lt]; if (pat && pat.length) { let per = 0; const arr = []; for (const v of pat) { const a = Math.abs(v) * ltscale; arr.push(a < 1e-9 ? 0.5 / V.s : a); per += a; } if (per * V.s > 6) wantDash = arr; } }
      if (wantDash) { ctx.setLineDash(wantDash); dashed = true; } else if (dashed) { ctx.setLineDash([]); dashed = false; }
      ctx.stroke(k.path);
    }
    if (it.inst) for (const ins of it.inst) {
      const g = ins.g; if (!g.paths.length) continue;
      const dpx = g.diag * ins.scale * V.s;
      ctx.save(); ctx.transform(ins.M.a, ins.M.b, ins.M.c, ins.M.d, ins.M.e, ins.M.f); ctx.lineWidth = 1 / (V.s * ins.scale); if (dashed) { ctx.setLineDash([]); dashed = false; }
      if (g.segs > 150 && g.segs > dpx * 12) { // too dense to matter at this size: draw its outline only
        const k0 = g.paths[0]; const col = aciCss(k0.aci, onLight); if (col !== lastCol) { ctx.strokeStyle = col; lastCol = col; } ctx.globalAlpha = 0.7; ctx.strokeRect(g.bbox[0], g.bbox[1], g.bbox[2] - g.bbox[0], g.bbox[3] - g.bbox[1]); ctx.globalAlpha = 1;
      } else for (const k of g.paths) { if (!k.n || !layerOn(k.layer)) continue; const col = aciCss(k.aci, onLight); if (col !== lastCol) { ctx.strokeStyle = col; lastCol = col; } ctx.stroke(k.path); }
      ctx.restore(); lastCol = null;
    }
  }
  if (dashed) ctx.setLineDash([]); const _t2 = performance.now();
  // pass 3: texts
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (const it of vis) if (it.texts.length) for (const t of it.texts) { if (!layerOn(t.layer)) continue; const hp = t.h * V.s; if (hp < 2.4) continue; drawText(t, V, aciCss(t.aci, onLight)); }
  if (window.__prof) window.__prof.push({ vis: vis.length, fills: _t1 - _t0, strokes: _t2 - _t1, texts: performance.now() - _t2 });
}
function localRect(wr, Minv) { const bb = emptyBox(); for (const q of [[wr[0], wr[1]], [wr[2], wr[1]], [wr[2], wr[3]], [wr[0], wr[3]]]) { const l = mApply(Minv, q); bboxAdd(bb, l[0], l[1]); } return bb; }
function drawText(t, V, col) {
  const dpr = state.dpr; const [X, Y] = toScreen(t.x, t.y, V); if (X < -4000 || X > cssW + 4000 || Y < -4000 || Y > cssH + 4000) return;
  const px = t.h * V.s / CAP;
  ctx.save(); ctx.translate(X, Y); ctx.rotate(-t.rot); ctx.fillStyle = col; ctx.font = px + 'px ' + TEXT_FONT; ctx.textBaseline = 'alphabetic';
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
  ctx.save(); ctx.clip(f.path, 'evenodd'); ctx.strokeStyle = col; ctx.lineWidth = 1 / V.s; ctx.globalAlpha = 0.9;
  const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  for (const ln of f.pat.lines) {
    const nx = -ln.dy, ny = ln.dx; let tmin = Infinity, tmax = -Infinity, smin = Infinity, smax = -Infinity;
    for (const c of corners) { const rx = c[0] - ln.b[0], ry = c[1] - ln.b[1]; const tn = rx * nx + ry * ny; const ts = rx * ln.dx + ry * ln.dy; if (tn < tmin) tmin = tn; if (tn > tmax) tmax = tn; if (ts < smin) smin = ts; if (ts > smax) smax = ts; }
    let k0 = Math.floor(Math.min(tmin / ln.nd, tmax / ln.nd)), k1 = Math.ceil(Math.max(tmin / ln.nd, tmax / ln.nd));
    if (k1 - k0 > 4000) { k0 = 0; k1 = -1; }
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
      if (count > 6000) break;
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    if (count > 6000) break;
  }
  ctx.restore(); ctx.globalAlpha = 1;
  return count;
}

// ===================== Overlay (selection, tool graphics, snap) =====================
function drawOverlay() {
  const V = V0(); const dpr = state.dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const S = state.drawing ? getScene(state.spaceIdx) : null; if (!S) return;
  const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f0a640';
  // selection
  if (state.selection.size) {
    ctx.save(); ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr); ctx.strokeStyle = acc; ctx.lineWidth = 2.2 / V.s; ctx.setLineDash([6 / V.s, 4 / V.s]);
    for (const it of S.items) if (state.selection.has(it.ent.id)) highlightItem(it, V);
    ctx.restore();
  }
  if (state.hoverItem && !state.selection.has(state.hoverItem.ent.id)) { ctx.save(); ctx.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr); ctx.strokeStyle = acc; ctx.globalAlpha = 0.6; ctx.lineWidth = 2 / V.s; highlightItem(state.hoverItem, V); ctx.restore(); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (state.tool && state.tool.draw) state.tool.draw(ctx, V, acc);
  // snap marker
  const sn = state.snapMark; if (sn) {
    const [X, Y] = toScreen(sn.x, sn.y, V); ctx.save(); ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.beginPath();
    if (sn.kind === 1) ctx.rect(X - 6, Y - 6, 12, 12); else if (sn.kind === 2) { ctx.moveTo(X, Y - 7); ctx.lineTo(X + 7, Y + 6); ctx.lineTo(X - 7, Y + 6); ctx.closePath(); } else if (sn.kind === 3) ctx.arc(X, Y, 6, 0, TAU); else if (sn.kind === 5) { ctx.moveTo(X - 6, Y - 6); ctx.lineTo(X + 6, Y + 6); ctx.moveTo(X - 6, Y + 6); ctx.lineTo(X + 6, Y - 6); } else if (sn.kind === 6) { ctx.moveTo(X - 7, Y + 6); ctx.lineTo(X + 7, Y + 6); ctx.moveTo(X - 7, Y - 6); ctx.lineTo(X + 7, Y - 6); ctx.moveTo(X, Y - 6); ctx.lineTo(X, Y + 6); } else { ctx.moveTo(X - 5, Y); ctx.lineTo(X + 5, Y); ctx.moveTo(X, Y - 5); ctx.lineTo(X, Y + 5); }
    ctx.stroke(); ctx.restore();
  }
  // crosshair at last picked point
  if (state.lastPt) { const [X, Y] = toScreen(state.lastPt[0], state.lastPt[1], V); ctx.save(); ctx.strokeStyle = acc; ctx.globalAlpha = 0.8; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X - 10, Y); ctx.lineTo(X + 10, Y); ctx.moveTo(X, Y - 10); ctx.lineTo(X, Y + 10); ctx.stroke(); ctx.restore(); }
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
