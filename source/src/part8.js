// ===================== v15: category toolbar; layer, measure, dimension and draw tools =====================

// ----- Icons and names -----
Object.assign(ICON, {
  c_draw: '<path d="M4 20l1.2-4.2L16.5 4.5l3 3L8.2 18.8z"/><path d="M14.5 6.5l3 3"/>',
  c_edit: '<path d="M11 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6"/><path d="M10 14l.8-3.2L18.5 3l2.5 2.5-7.8 7.7z"/>',
  c_layer: '<path d="M12 4 3 9l9 5 9-5zM3 14l9 5 9-5"/>',
  c_measure: '<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4.5M14 8v3M18 8v4.5"/>',
  c_dim: '<path d="M4 5v14M20 5v14M4 12h16M7.5 9 4.5 12l3 3M16.5 9l3 3-3 3"/>',
  more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  clearsel: '<rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="3 2.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
  cont: '<path d="M3 15l5-7 5 4 8-7"/><circle cx="3" cy="15" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="13" cy="12" r="1.3"/><circle cx="21" cy="5" r="1.3"/><path d="M3 20h18M3 18.5v3M21 18.5v3"/>',
  batch: '<path d="M18 5H7l5.5 7L7 19h11"/>',
  facade: '<rect x="3" y="7" width="14" height="13"/><path d="M8 20v-5h4v5"/><path d="M21 7v13M19.5 8.5 21 7l1.5 1.5M19.5 18.5 21 20l1.5-1.5"/>',
  arclen: '<path d="M5 19a10 10 0 0 1 14 0"/><path d="M3.2 13.6a13 13 0 0 1 17.6 0"/><path d="M4 16.5l1.5-1M20 16.5l-1.5-1"/>',
  entity: '<rect x="3" y="4" width="12" height="10" rx="1"/><path d="M13 12l8 3.2-3.4 1.4L16.2 20z"/>',
  mscale: '<rect x="2" y="14" width="20" height="6" rx="1"/><path d="M6 14v2.5M10 14v3M14 14v2.5M18 14v3"/><path d="M3 8h18M6 5 3 8l3 3M18 5l3 3-3 3"/>',
  results: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  totals: '<path d="M4 20h16M7 20v-6M12 20V7M17 20v-10"/>',
  precision: '<text x="12" y="13.5" text-anchor="middle" font-size="9.5" font-family="Jost,sans-serif" font-weight="600" fill="currentColor" stroke="none">0.00</text><path d="M4 18h16M12 18l-2 2.5M12 18l2 2.5"/>',
  dimrad: '<circle cx="12" cy="12" r="8"/><path d="M12 12l5.2-5.2M14.2 6.6h3.2v3.2"/><circle cx="12" cy="12" r=".6"/>',
  dimdia: '<circle cx="12" cy="12" r="8"/><path d="M6.6 17.4 17.4 6.6M6.6 14v3.4H10M17.4 10V6.6H14"/>',
  dimarc: '<path d="M5 19a10 10 0 0 1 14 0"/><path d="M3.2 13.6a13 13 0 0 1 17.6 0"/><path d="M5 19l-1.6-5.2M19 19l1.6-5.2"/>',
  dimcont: '<path d="M3 7v10M11 7v10M21 7v10M3 12h18"/><path d="M1.6 13.4l2.8-2.8M9.6 13.4l2.8-2.8M19.6 13.4l2.8-2.8"/>',
  ellipse: '<ellipse cx="12" cy="12" rx="9" ry="5.5"/>',
  sketch: '<path d="M3 16c3-6 5 2 8-3s4-6 6-2 2 4 4 2"/>',
  revcloud: '<path d="M6.5 18a3.2 3.2 0 0 1-.4-6.4 4.3 4.3 0 0 1 8-2.2 3.6 3.6 0 0 1 5.6 3.4A2.6 2.6 0 0 1 19 18z"/>',
  divide: '<path d="M3 18 21 6"/><circle cx="9" cy="14" r="1.7"/><circle cx="15" cy="10" r="1.7"/><path d="M2.5 15.5l1 3.5M20.5 4.5l1 3"/>',
  laylist: '<path d="M11 4 3 8.5l8 4.5 8-4.5z"/><path d="M3 13.5l8 4.5"/><path d="M15 15h7M15 18h7M15 21h7"/>',
  laynew: '<path d="M11 4 3 8.5l8 4.5 8-4.5zM3 13.5l8 4.5 3-1.7"/><path d="M19 14v7M15.5 17.5h7"/>',
  laycur: '<path d="M12 4 3 9l9 5 9-5zM3 14l9 5 9-5"/><path d="M9 9l2 2 4-3.5"/>',
  layoff: '<path d="M12 4 3 9l9 5 9-5zM3 14l9 5 9-5" opacity=".45"/><path d="M4 21 20 3"/>',
  layiso: '<path d="M12 4 3 9l9 5 9-5z" fill="currentColor" fill-opacity=".4"/><path d="M3 14l9 5 9-5" opacity=".4"/>',
  layon: '<path d="M12 4 3 9l9 5 9-5zM3 14l9 5 9-5"/><path d="M12 9h.01" stroke-width="3"/>',
  layprev: '<path d="M13 7 6 11l7 4 7-4zM6 16l7 4 7-4"/><path d="M3 6h7M3 6l3-3M3 6l3 3"/>'
});
// names shown on the instruction bar while a tool runs
Object.assign(LABEL, { cont: 'Continuous', arclen: 'Arc length', entity: 'Object', batch: 'Total of many', facade: 'Wall area', mscale: 'Set scale', dimrad: 'Dim radius', dimdia: 'Dim diameter', dimarc: 'Dim arc length', dimcont: 'Dim continue', dimang: 'Dim angular', ellipse: 'Ellipse', sketch: 'Sketch', revcloud: 'Revcloud', divide: 'Divide', laycur: 'Make current', layoff: 'Layer off', layiso: 'Off others', arc: 'Arc' });
// names in the tool grid (shorter where the category already says what it is)
const GRID_LABEL = { dimlin: 'Linear', dimali: 'Aligned', dimang: 'Angular', dimrad: 'Radius', dimdia: 'Diameter', dimarc: 'Arc length', dimcont: 'Continue', laylist: 'Layer list', laynew: 'New layer', laycur: 'Make current', layoff: 'Layer off', layiso: 'Off others', layon: 'All on', layprev: 'Previous', results: 'Results', totals: 'Totals', precision: 'Decimals', arc: 'Arc', more: 'More', props: 'Properties', clearsel: 'Clear', batch: 'Total of many' };
const gridLabel = (k) => GRID_LABEL[k] || LABEL[k] || k;

// ----- Bottom bar: categories; a category opens a grid of its tools -----
const CATS = [
  { id: 'draw', name: 'Draw', icon: 'c_draw', tools: ['line', 'pline', 'rect', 'circle', 'arc', 'ellipse', 'spline', 'text', 'sketch', 'revcloud', 'divide'] },
  { id: 'edit', name: 'Edit', icon: 'c_edit', tools: ['box', 'move', 'copy', 'rotate', 'mirror', 'scale', 'align', 'order', 'delete'] },
  { id: 'layer', name: 'Layer', icon: 'c_layer', tools: ['laylist', 'laynew', 'laycur', 'layoff', 'layiso', 'layon', 'layprev'] },
  { id: 'measure', name: 'Measure', icon: 'c_measure', tools: ['dist', 'cont', 'area', 'angle', 'coord', 'arclen', 'entity', 'batch', 'facade', 'mscale', 'results', 'totals', 'precision'] },
  { id: 'dim', name: 'Dimension', icon: 'c_dim', tools: ['dimlin', 'dimali', 'dimang', 'dimrad', 'dimdia', 'dimarc', 'dimcont'] }
];
// something selected: the bar shows actions for it; More holds the rest
const SEL_MAIN = ['move', 'copy', 'rotate', 'mirror', 'delete', 'props', 'more'];
const SEL_MORE = ['scale', 'align', 'order', 'similar', 'batch', 'laycur', 'layoff', 'layiso', 'clearsel'];
const SCALED_TOOLS = new Set(['dist', 'cont', 'area', 'arclen', 'entity', 'batch', 'facade']);
const catOf = (k) => CATS.find(c => c.tools.includes(k)) || null;
const pop = { cat: null };
const popOpen = () => !!pop.cat;
let barKey = '';
function barBtn(k, icon, label, fn, cls) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'cat' + (cls ? ' ' + cls : ''); b.dataset.k = k;
  b.innerHTML = '<svg viewBox="0 0 24 24">' + (icon || '') + '</svg><span></span>'; b.querySelector('span').textContent = label; b.addEventListener('click', fn); return b;
}
function renderBar(force) {
  const bar = $('catBar'); if (!bar) return;
  const t = state.tool ? state.tool.name : 'select'; const sm = selMode();
  const key = (sm ? 'S' + state.selection.size : 'C') + '|' + t + '|' + (pop.cat || '');
  if (!force && key === barKey) return; barKey = key;
  bar.innerHTML = ''; bar.classList.toggle('sel', sm);
  if (sm) {
    for (const k of SEL_MAIN) { const b = barBtn(k, ICON[k], gridLabel(k), () => selAction(k), (k === 'delete' ? 'danger' : '') + (k === 'more' && pop.cat === 'more' ? ' on' : '')); if (k === 'more') b.setAttribute('aria-haspopup', 'menu'); bar.appendChild(b); }
    return;
  }
  const tc = catOf(t);
  for (const c of CATS) {
    const running = tc === c; const on = running || pop.cat === c.id;
    const b = barBtn('cat-' + c.id, running ? ICON[t] : ICON[c.icon], running ? gridLabel(t) : c.name, () => togglePop(c.id), on ? 'on' : '');
    b.dataset.cat = c.id; b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', pop.cat === c.id ? 'true' : 'false'); b.title = c.name;
    bar.appendChild(b);
  }
}
function togglePop(id) { if (pop.cat === id) closePop(); else openPop(id); }
function openPop(id) {
  if (!state.drawing) return;
  let title, sub = '', keys;
  if (id === 'more') { title = state.selection.size + ' selected'; sub = selSummary(); keys = SEL_MORE; }
  else { const c = CATS.find(x => x.id === id); if (!c) return; title = c.name; keys = c.tools; }
  pop.cat = id; $('tpTitle').textContent = title; $('tpSub').textContent = sub;
  const g = $('tpGrid'); g.innerHTML = ''; const t = state.tool ? state.tool.name : '';
  for (const k of keys) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.tool = k; if (k === 'delete') b.className = 'danger';
    b.innerHTML = '<svg viewBox="0 0 24 24">' + (ICON[k] || '') + '</svg><span></span>'; b.querySelector('span').textContent = gridLabel(k);
    b.setAttribute('aria-pressed', k === t ? 'true' : 'false');
    b.addEventListener('click', () => { closePop(); if (id === 'more') selAction(k); else runTool(k); });
    g.appendChild(b);
  }
  $('toolPop').hidden = false; $('popScrim').classList.add('on');
  renderBar(true); placePop();
}
function closePop() { if (!pop.cat && $('toolPop').hidden) return; pop.cat = null; $('toolPop').hidden = true; $('popScrim').classList.remove('on'); renderBar(true); }
// the notch points at the button that opened the grid; on wide screens the grid sits over that button
function placePop() {
  const P = $('toolPop'), n = $('tpNotch'); const btn = document.querySelector(pop.cat === 'more' ? '#catBar [data-k="more"]' : '#catBar [data-cat="' + pop.cat + '"]');
  if (!btn) { n.style.display = 'none'; return; }
  const sr = stage.getBoundingClientRect(), br = btn.getBoundingClientRect(); const cx = br.left + br.width / 2 - sr.left;
  if (sr.width >= 720) { const w = P.offsetWidth; P.style.left = clamp(cx - w / 2, 6, sr.width - w - 6) + 'px'; } else P.style.left = '';
  const pl = P.getBoundingClientRect().left - sr.left; n.style.display = ''; n.style.left = clamp(cx - pl - 7, 10, P.offsetWidth - 22) + 'px';
}
$('popScrim').addEventListener('click', closePop);
window.addEventListener('resize', () => { if (pop.cat) placePop(); });
// Tools that do their job at once (no picking on the drawing)
function runTool(k) {
  if (!state.drawing) return;
  switch (k) {
    case 'laylist': openSheet('layersPanel'); return;
    case 'laynew': openNewLayer(); return;
    case 'layon': layersAllOn(); return;
    case 'layprev': layerPrevious(); return;
    case 'results': openResults('list'); return;
    case 'totals': openResults('totals'); return;
    case 'precision': openDecimals(); return;
  }
  startTool(k);
}
function selAction(k) {
  if (k === 'more') { togglePop('more'); return; }
  if (k === 'props') { openProps(); return; }
  if (k === 'similar') { selectSimilar(); return; }
  if (k === 'clearsel') { state.selection.clear(); if (state.tool && state.tool.onSelChange) state.tool.onSelChange(); else setResult(null); requestFull(); renderBar(); return; }
  startTool(k); // move, copy, rotate, mirror, delete, scale, align, order, total, layer actions: they use the selection
}
const exitSoon = () => setTimeout(() => startTool('select', true), 0);

// ----- Typed input helpers -----
const TYPED_PH = typed.placeholder;
function resetTyped() { typed.placeholder = TYPED_PH; typed.inputMode = 'text'; }
function openTyped(mode, ph) { typed.inputMode = mode || 'text'; if (ph) typed.placeholder = ph; typed.value = ''; $('promptRow').hidden = false; $('btnKeys').hidden = false; $('btnKeys').setAttribute('aria-pressed', 'true'); setTimeout(() => typed.focus(), 30); }
function closeTyped() { $('promptRow').hidden = true; $('btnKeys').setAttribute('aria-pressed', 'false'); try { typed.blur(); } catch (e) { } }
// A length typed by hand, in drawing units: 2.4 m, 2400 mm, 240 cm, 8' 6", 96 in, or a plain number in the units shown
// (metres for metric drawings). guessMm: a plain number over 50 shown in metres is read as millimetres (heights, openings).
function parseLenIn(str, guessMm) {
  str = String(str).trim().toLowerCase().replace(/,/g, '.');
  const code = state.drawing ? state.drawing.header.units : 4; const toM = UNIT_TO_M[code] || 0.001; const fromM = (x) => x / toM;
  let m = str.match(/^(\d*\.?\d+)\s*(?:'|ft)\s*(?:(\d*\.?\d+)\s*(?:"|in)?)?$/);
  if (m) return code === 0 ? parseFloat(m[1]) * 12 + (m[2] ? parseFloat(m[2]) : 0) : fromM(parseFloat(m[1]) * 0.3048 + (m[2] ? parseFloat(m[2]) * 0.0254 : 0));
  m = str.match(/^(\d*\.?\d+)\s*(mm|cm|m|in|"|)$/); if (!m) return NaN;
  const v = parseFloat(m[1]), u = m[2];
  if (u === 'mm') return fromM(v / 1000); if (u === 'cm') return fromM(v / 100); if (u === 'm') return fromM(v); if (u === 'in' || u === '"') return fromM(v * 0.0254);
  const mode = lenMode();
  if (mode === 'm') return fromM(guessMm && v > 50 ? v / 1000 : v);
  if (mode === 'mm') return fromM(v / 1000);
  if (mode === 'ft') return fromM(v * 0.3048);
  return v;
}

// ----- Geometry helpers -----
const pol = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
const ccwArc = (cv) => cv.full ? { s: 0, sw: TAU } : cv.ccw ? { s: cv.a0, sw: normAng(cv.a1 - cv.a0) || TAU } : { s: cv.a1, sw: normAng(cv.a0 - cv.a1) || TAU };
function plineSegs(v, closed) { // exact pieces of a polyline: straight or arc, with lengths
  const out = []; const n = v.length; const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) { const a = v[i], b = v[(i + 1) % n]; const arc = (a[2] || 0) ? bulgeArc(a, b, a[2]) : null; if (arc) { const th = 4 * Math.atan(Math.abs(a[2])); out.push({ arc, th, len: arc.r * th, a, b }); } else out.push({ a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) }); }
  return out;
}
function plineLen(v, closed) { let L = 0; for (const s of plineSegs(v, closed)) L += s.len; return L; }
function plineArea(v) { // exact, with arc segments
  const n = v.length; let A = 0; for (let i = 0; i < n; i++) { const a = v[i], b = v[(i + 1) % n]; A += a[0] * b[1] - b[0] * a[1]; } A /= 2;
  for (let i = 0; i < n; i++) { const bu = v[i][2] || 0; if (!bu) continue; const a = v[i], b = v[(i + 1) % n]; const arc = bulgeArc(a, b, bu); if (!arc) continue; const th = 4 * Math.atan(Math.abs(bu)); A += Math.sign(bu) * arc.r * arc.r / 2 * (th - Math.sin(th)); }
  return Math.abs(A);
}
function plineAt(seg, t) { if (!seg.arc) return [seg.a[0] + (seg.b[0] - seg.a[0]) * t, seg.a[1] + (seg.b[1] - seg.a[1]) * t]; const { c, r, a0, ccw } = seg.arc; return pol(c, r, a0 + (ccw ? 1 : -1) * seg.th * t); }
function simplifyDP(pts, tol) { // Douglas–Peucker
  if (pts.length < 3) return pts.slice(); const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const st = [[0, pts.length - 1]];
  while (st.length) { const [i, j] = st.pop(); const a = pts[i], b = pts[j]; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); let md = -1, mi = -1; for (let k = i + 1; k < j; k++) { const d = L > 1e-12 ? Math.abs((pts[k][0] - a[0]) * dy - (pts[k][1] - a[1]) * dx) / L : Math.hypot(pts[k][0] - a[0], pts[k][1] - a[1]); if (d > md) { md = d; mi = k; } } /* a closed loop starts and ends at the same point: use the distance from it */ if (md > tol) { keep[mi] = 1; st.push([i, mi], [mi, j]); } }
  return pts.filter((p, i) => keep[i]);
}
// the arc or circle under the finger, in this space's coordinates (objects seen through a viewport are mapped onto the sheet)
function pickCurve(hit, w, tol) {
  const tryItem = (it, f, t) => { let best = null, bs = Infinity; for (const cv of itemCurvesNear(it, f, t)) { const a = Math.atan2(f[1] - cv.c[1], f[0] - cv.c[0]); const inA = cv.full || angInArc(a, cv.a0, cv.a1, cv.ccw); const d = Math.abs(Math.hypot(f[0] - cv.c[0], f[1] - cv.c[1]) - cv.r) + (inA ? 0 : t * 10); if (d < bs) { bs = d; best = cv; } } return best; };
  let cv = null, vp = null;
  if (hit) { if (hit.model && hit.vp) { vp = hit.vp; cv = tryItem(hit.item, paperToModel(vp, w), tol / vp.sc); } else cv = tryItem(hit.item, w, tol); }
  if (!cv) { vp = null; const h2 = pickAt(w[0], w[1], tol, null, true); if (h2) cv = tryItem(h2.item, w, tol); }
  if (!cv) return null;
  const out = { c: cv.c.slice(), r: cv.r, a0: cv.a0, a1: cv.a1, ccw: cv.ccw, full: cv.full };
  if (vp) { out.c = modelToPaper(vp, out.c); out.r *= vp.sc; out.vp = vp; }
  return out;
}
// the straight piece of a line or polyline under the finger
function segAt(w) {
  const tol = 14 / state.view.s; const hit = pickAt(w[0], w[1], tol, null, true); if (!hit) return null;
  let best = null, bd = Infinity; for (const sg of itemSegsNear(hit.item, w[0], w[1], tol)) { const r = distToPoly(w[0], w[1], [sg[0][0], sg[0][1], sg[1][0], sg[1][1]], false); if (r.d < bd) { bd = r.d; best = sg; } }
  return best && bd <= tol ? best : null;
}
function projSeg(sg, p) { const [a, b] = sg; const ux = b[0] - a[0], uy = b[1] - a[1]; const L2 = ux * ux + uy * uy || 1e-18; const t = ((p[0] - a[0]) * ux + (p[1] - a[1]) * uy) / L2; return [a[0] + ux * t, a[1] + uy * t]; }
function lineX(s1, s2) { const [a, b] = s1, [c, d] = s2; const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]]; const den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-12 * Math.hypot(...r) * Math.hypot(...s)) return null; const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den; return [a[0] + r[0] * t, a[1] + r[1] * t]; }
// Angular dimension by tapping two lines: their crossing is the corner, the tapped points pick the sides
function dimAngLineTap(T, sn, w) {
  if (T.pts.length) return false; w = w || [sn.x, sn.y];
  if (!T.line1 && sn.kind && sn.kind !== 6) return false; // a snapped point is the corner
  const sg = segAt(w);
  if (!T.line1) { if (!sg) return false; T.line1 = { seg: sg, p: projSeg(sg, w) }; setPrompt('Tap the second line.'); return true; }
  if (!sg) { toast('Tap the second line'); return true; }
  const v = lineX(T.line1.seg, sg); if (!v) { toast('Those lines are parallel'); T.line1 = null; T.start(); return true; }
  const arm = (seg, p) => { if (Math.hypot(p[0] - v[0], p[1] - v[1]) > 1e-6 * (1 + Math.hypot(...v))) return p; const [a, b] = seg; return Math.hypot(a[0] - v[0], a[1] - v[1]) > Math.hypot(b[0] - v[0], b[1] - v[1]) ? a.slice() : b.slice(); };
  T.pts = [v, arm(T.line1.seg, T.line1.p), arm(sg, projSeg(sg, w))]; T.line1 = null; state.lastPt = v; T.start(); return true;
}
// highlight an object (world geometry) while a tool works on it
function hlItem(c, V, it, col) { const dpr = state.dpr; c.save(); c.setTransform(V.s * dpr, 0, 0, -V.s * dpr, V.tx * dpr, V.ty * dpr); c.setLineDash([]); c.strokeStyle = col; c.lineJoin = 'round'; c.lineCap = 'round'; c.globalAlpha = 0.35; c.lineWidth = 6 / V.s; highlightItem(it, V); c.globalAlpha = 0.95; c.lineWidth = 1.8 / V.s; highlightItem(it, V); c.restore(); }
function hlCurve(c, V, cv, col) { const A = ccwArc(cv); const C = toScreen(cv.c[0], cv.c[1], V); c.save(); c.setLineDash([]); c.strokeStyle = col; c.lineWidth = 4; c.globalAlpha = 0.8; c.beginPath(); c.arc(C[0], C[1], cv.r * V.s, -A.s, -(A.s + A.sw), true); c.stroke(); c.restore(); }
function zoomToPts(pts, bb0) {
  const bb = bb0 ? bb0.slice() : emptyBox(); if (!bb0) for (const p of pts) bboxAdd(bb, p[0], p[1]); if (!boxOk(bb)) return;
  const span = Math.max(bb[2] - bb[0], bb[3] - bb[1], 160 / state.view.s); const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2; const h = span * 0.8;
  zoomToBox([cx - h, cy - h, cx + h, cy + h]);
}

// ----- What one object measures (Object, Total of many). Lengths in drawing units, with Set scale applied. -----
function measureEnt(it) {
  const e = it.ent, k = state.mscale || 1; const rows = [['Object', e.dim ? 'Dimension' : e.t === 'INSERT' ? blockLabel(e.n) : e.t]];
  let len = null, area = null, perim = null, text = '';
  const closedArea = (A, P) => { area = A; perim = P; rows.push(['Area', fmtArea(A)], ['Perimeter', fmtLenAll(P)]); text = fmtAreaShort(A) + ' · perimeter ' + fmtLen(P); };
  const size = () => { const bb = it.bbox; rows.push(['Size', fmtLen((bb[2] - bb[0]) * k) + ' × ' + fmtLen((bb[3] - bb[1]) * k)]); text = 'size ' + fmtLen((bb[2] - bb[0]) * k) + ' × ' + fmtLen((bb[3] - bb[1]) * k); };
  switch (e.t) {
    case 'LINE': len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]) * k; rows.push(['Length', fmtLenAll(len)], ['Angle', fmtAng(deg(Math.atan2(e.b[1] - e.a[1], e.b[0] - e.a[0])))]); text = fmtLen(len); break;
    case 'PLINE': if (e.closed) closedArea(plineArea(e.v) * k * k, plineLen(e.v, true) * k); else { len = plineLen(e.v, false) * k; rows.push(['Length', fmtLenAll(len)]); text = fmtLen(len); } rows.push(['Vertices', String(e.v.length)]); break;
    case 'CIRCLE': { const r = e.r * k; closedArea(Math.PI * r * r, TAU * r); rows.splice(1, 0, ['Radius', fmtLenAll(r)], ['Diameter', fmtLen(2 * r)]); text = 'R ' + fmtLen(r) + ' · ' + fmtAreaShort(Math.PI * r * r); break; }
    case 'ARC': { const r = e.r * k, sw = normAng(e.a1 - e.a0) || TAU; len = r * sw; rows.push(['Arc length', fmtLenAll(len)], ['Radius', fmtLen(r)], ['Angle', fmtAng(deg(sw))]); text = fmtLen(len) + ' · R ' + fmtLen(r); break; }
    case 'ELLIPSE': { const a = Math.hypot(e.m[0], e.m[1]) * k, b = a * e.k; const full = Math.abs(normAng(e.a1 - e.a0)) < 1e-9 || Math.abs(e.a1 - e.a0 - TAU) < 1e-6; const L = polyLength(it.polys[0] || [], false) * k; if (full) closedArea(Math.PI * a * b, L); else { len = L; rows.push(['Length', fmtLenAll(L)]); text = fmtLen(L); } rows.push(['Major radius', fmtLen(a)], ['Minor radius', fmtLen(b)]); break; }
    case 'SPLINE': case 'LEADER': { const L = polyLength(it.polys[0] || [], false) * k; if (it.closed && it.fillPoly) closedArea(Math.abs(polyArea(it.fillPoly.slice(0, -2))) * k * k, L); else { len = L; rows.push(['Length', fmtLenAll(L)]); text = fmtLen(L); } break; }
    case 'HATCH': case 'SOLID': case 'WIPEOUT': if (it.fillPoly) { const fp = it.fillPoly.slice(0, -2); closedArea(Math.abs(polyArea(fp)) * k * k, polyLength(fp, true) * k); } else size(); break;
    case 'TEXT': case 'MTEXT': rows.push(['Text', textPlain(e.s).slice(0, 80)], ['Height', fmtLen(e.h)]); text = textPlain(e.s).slice(0, 40); break;
    case 'INSERT': if (e.dim) { const b = state.drawing.blocks[e.n]; const t = b && b.ents.find(x => x.t === 'TEXT'); rows.push(['Value', t ? textPlain(t.s) : '']); text = 'dimension ' + (t ? textPlain(t.s) : ''); } else size(); break;
    default: size();
  }
  return { rows, len, area, perim, text };
}

// ----- Results: every measurement of the open drawing, to show again, total up or save as CSV -----
const KIND_NAME = { dist: 'Distance', cont: 'Continuous', area: 'Area', angle: 'Angle', coord: 'Coords', arclen: 'Arc length', entity: 'Object', batch: 'Total of many', facade: 'Wall area' };
function saveResult(T, rec) {
  if (!state.drawing || !state.results) return;
  const r = { ...rec, pts: rec.pts ? rec.pts.map(p => p.slice()) : null, space: state.spaceIdx, when: Date.now() };
  if (T.rec && state.results.includes(T.rec)) { const n = T.rec.n; Object.assign(T.rec, r); T.rec.n = n; }
  else { let n = 0; for (const x of state.results) n = Math.max(n, x.n); r.n = n + 1; state.results.push(r); T.rec = r; if (state.results.length > 500) state.results.shift(); }
  if ($('resPanel').classList.contains('open')) renderResults();
}
let resTab = 'list', clearArmed = 0;
function openResults(tab) { resTab = tab || 'list'; renderResults(); openSheet('resPanel'); }
function renderResults() {
  const R = state.results || []; $('resTitle').textContent = 'Measurements (' + R.length + ')';
  for (const b of $('resTabs').children) b.setAttribute('aria-pressed', b.dataset.v === resTab ? 'true' : 'false');
  const body = $('resBody'); body.innerHTML = ''; $('resClear').disabled = $('resCsv').disabled = !R.length;
  if (!R.length) { const d = document.createElement('div'); d.className = 'res-empty'; d.textContent = 'Nothing measured yet in this drawing. Every distance, area, angle and total you measure is kept here until you close the drawing.'; body.append(d); return; }
  if (resTab === 'list') {
    for (const r of R.slice().reverse()) {
      const row = document.createElement('div'); row.className = 'res-row'; row.setAttribute('role', 'button'); row.tabIndex = 0;
      const n = document.createElement('span'); n.className = 'n'; n.textContent = r.n;
      const k = document.createElement('span'); k.className = 'k'; k.textContent = KIND_NAME[r.kind] || r.kind;
      const v = document.createElement('span'); v.className = 'v'; v.textContent = r.text;
      const x = document.createElement('button'); x.className = 'x'; x.setAttribute('aria-label', 'Remove'); x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7 7 17"/></svg>';
      x.addEventListener('click', (ev) => { ev.stopPropagation(); const i = state.results.indexOf(r); if (i >= 0) state.results.splice(i, 1); if (state.tool && state.tool.rec === r) state.tool.rec = null; renderResults(); });
      row.addEventListener('click', () => showResult(r)); row.append(n, k, v, x); body.append(row);
    }
    return;
  }
  // totals by type
  const g = document.createElement('div'); g.className = 'res-tot'; const cell = (t, cls) => { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = t; g.append(s); };
  cell('Type', 'h'); cell('Count', 'h num'); cell('Total', 'h num');
  const sum = (list, f) => list.reduce((a, r) => a + (r[f] || 0), 0);
  const by = (kind, f) => R.filter(r => r.kind === kind && (f ? r[f] != null : true));
  const line = (name, list, val) => { if (!list.length) return; cell(name); cell(String(list.length), 'num'); cell(val, 'num'); };
  line('Distances', by('dist'), fmtLen(sum(by('dist'), 'len')));
  line('Continuous', by('cont'), fmtLen(sum(by('cont'), 'len')));
  line('Arc lengths', by('arclen'), fmtLen(sum(by('arclen'), 'len')));
  line('Object lengths', by('entity', 'len'), fmtLen(sum(by('entity', 'len'), 'len')));
  line('Areas', by('area'), fmtAreaShort(sum(by('area'), 'area')));
  line('Area perimeters', by('area'), fmtLen(sum(by('area'), 'perim')));
  line('Object areas', by('entity', 'area'), fmtAreaShort(sum(by('entity', 'area'), 'area')));
  line('Wall areas (net)', by('facade'), fmtAreaShort(sum(by('facade'), 'area')));
  line('Totals: lengths', by('batch', 'len'), fmtLen(sum(by('batch', 'len'), 'len')));
  line('Totals: areas', by('batch', 'area'), fmtAreaShort(sum(by('batch', 'area'), 'area')));
  line('Angles', by('angle'), '');
  line('Coordinates', by('coord'), '');
  body.append(g);
  const note = document.createElement('div'); note.className = 'res-empty'; note.textContent = 'Save CSV writes every measurement (in metres) for Excel or Google Sheets.'; body.append(note);
}
function showResult(r) {
  if (r.space !== state.spaceIdx) { toast('Measured in ' + (state.drawing.spaces[r.space] ? state.drawing.spaces[r.space].name : 'another space') + '. Switch to it to see this one.', 3000); return; }
  closeSheets();
  if (r.pts && ['dist', 'cont', 'area', 'angle', 'coord', 'facade'].includes(r.kind)) {
    startTool(r.kind); const T = state.tool; T.pts = r.pts.map(p => p.slice()); T.rec = r;
    if (r.kind === 'facade') { T.h = r.h; T.open = (r.open || []).map(o => o.slice()); T.phase = r.h != null ? 'open' : 'run'; }
    if (r.kind === 'coord') T.snapKind = null;
    state.lastPt = T.pts[T.pts.length - 1]; T.update(); zoomToPts(r.pts); requestFull(); return;
  }
  if (r.bb) zoomToPts(null, r.bb); toast((KIND_NAME[r.kind] || '') + ': ' + r.text, 3500);
}
$('resTabs').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; resTab = b.dataset.v; renderResults(); });
$('resClear').addEventListener('click', () => { const b = $('resClear'); if (Date.now() - clearArmed > 3000) { clearArmed = Date.now(); b.textContent = 'Tap again to clear'; setTimeout(() => { b.textContent = 'Clear all'; }, 3000); return; } clearArmed = 0; b.textContent = 'Clear all'; state.results.length = 0; if (state.tool) state.tool.rec = null; renderResults(); toast('Measurements cleared'); });
$('resCsv').addEventListener('click', async () => {
  const R = state.results || []; if (!R.length) return; const code = state.drawing.header.units; const toM = UNIT_TO_M[code] || 0.001;
  const q = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const f = (v, p) => v == null ? '' : v.toFixed(p);
  const lines = [['#', 'Type', 'Result', 'Length (m)', 'Area (m2)', 'Perimeter (m)', 'Angle (deg)', 'Height (m)', 'Space', 'Time'].join(',')];
  for (const r of R) lines.push([r.n, KIND_NAME[r.kind] || r.kind, r.text, f(r.len != null ? r.len * toM : null, 4), f(r.area != null ? r.area * toM * toM : null, 4), f(r.perim != null ? r.perim * toM : null, 4), f(r.ang, 4), f(r.h != null ? r.h * toM : null, 4), state.drawing.spaces[r.space] ? state.drawing.spaces[r.space].name : '', new Date(r.when).toISOString().slice(0, 19).replace('T', ' ')].map(q).join(','));
  const base = (state.fileName || 'drawing').replace(/\.(dwg|dxf)$/i, '').replace(EDIT_SUFFIX, '');
  await saveFile(base + '-measurements.csv', new Blob(['﻿' + lines.join('\r\n') + '\r\n'], { type: 'text/csv' }));
});

// ----- Decimals -----
function openDecimals() { renderDec(); openSheet('decPanel'); }
function renderDec() {
  const cur = PREC == null ? 2 : PREC; for (const b of $('decSeg').children) b.setAttribute('aria-pressed', b.dataset.v === String(cur) ? 'true' : 'false');
  const code = state.drawing ? state.drawing.header.units : 4; const toM = UNIT_TO_M[code] || 0.001;
  $('decEx').textContent = 'Shows as: ' + fmtLen(5.791235 / toM) + ' · ' + fmtAreaShort(31.197194 / (toM * toM)) + ' · ' + fmtAng(45.12345);
}
$('decSeg').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; PREC = Math.max(0, Math.min(4, +b.dataset.v)); try { localStorage.setItem('tct-prec', String(PREC)); } catch (e) { } renderDec(); if (state.tool && state.tool.update) state.tool.update(); if ($('resPanel').classList.contains('open')) renderResults(); requestFull(); });

// ----- Layers: current layer, off, off others, all on, previous, new -----
function pushLayerHist() { if (!state.drawing) return; if (!state.layerHist) state.layerHist = []; state.layerHist.push(new Map(state.layerVis)); if (state.layerHist.length > 40) state.layerHist.shift(); }
function layersChanged() { renderLayers(); requestFull(); }
function layersAllOn() { pushLayerHist(); for (const l of state.drawing.layers) state.layerVis.set(l.name, true); layersChanged(); toast('All layers on · Previous undoes this'); }
function layerPrevious() { const h = state.layerHist; if (!h || !h.length) { toast('No earlier layer change to go back to'); return; } state.layerVis = h.pop(); layersChanged(); toast('Layers back as they were'); }
function setCurLayer(name) { state.curLayer = name; if (!layerOn(name)) { pushLayerHist(); state.layerVis.set(name, true); } layersChanged(); toast('Current layer: ' + name + ' · new objects go on it', 2600); }
function offLayers(names) { pushLayerHist(); for (const n of names) state.layerVis.set(n, false); layersChanged(); toast((names.length === 1 ? 'Layer ' + names[0] : names.length + ' layers') + ' off' + (names.includes(state.curLayer) ? ' (it is the current layer)' : '') + ' · Previous brings ' + (names.length === 1 ? 'it' : 'them') + ' back', 3000); }
function isoLayers() {
  const keep = new Set(selectedEnts().map(e => e.L || '0')); if (!keep.size) return; pushLayerHist();
  for (const l of state.drawing.layers) state.layerVis.set(l.name, keep.has(l.name)); if (!keep.has(state.curLayer)) state.curLayer = [...keep][0];
  state.selection.clear(); layersChanged(); toast('Showing ' + keep.size + ' layer' + (keep.size === 1 ? '' : 's') + ' · Previous or All on brings the rest back', 3200);
}
const NL_COLORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 30, 40, 140, 200, 250];
let nlColor = 1;
function openNewLayer() {
  const D = state.drawing; let i = 1; while (D.layers.some(l => l.name.toLowerCase() === ('Layer ' + i).toLowerCase())) i++;
  $('nlName').value = 'Layer ' + i; $('nlErr').textContent = ''; $('nlCur').checked = true; nlColor = 1; renderNlColors();
  $('layerDlg').classList.add('on'); setTimeout(() => { $('nlName').focus(); $('nlName').select(); }, 50);
}
function renderNlColors() { const w = $('nlColors'); w.innerHTML = ''; for (const v of NL_COLORS) { const b = document.createElement('button'); b.type = 'button'; b.style.background = aciCss(v, false, true); b.title = 'Colour ' + v; b.setAttribute('aria-pressed', v === nlColor ? 'true' : 'false'); b.addEventListener('click', () => { nlColor = v; renderNlColors(); }); w.append(b); } }
$('nlCancel').addEventListener('click', () => $('layerDlg').classList.remove('on'));
$('nlName').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); $('nlOk').click(); } });
$('nlOk').addEventListener('click', () => {
  const D = state.drawing; if (!D) return; const name = $('nlName').value.trim();
  if (!name) { $('nlErr').textContent = 'Type a name.'; return; }
  if (/[<>\/\\":;?*|=`]/.test(name)) { $('nlErr').textContent = 'A layer name cannot contain < > / \\ " : ; ? * | = `'; return; }
  if (D.layers.some(l => l.name.toLowerCase() === name.toLowerCase())) { $('nlErr').textContent = 'There is already a layer called ' + name + '.'; return; }
  const l = { name, aci: nlColor, off: false, frozen: false, locked: false, lw: -3, lt: 'Continuous' };
  D.layers.push(l); state.layerMap.set(name, l); state.layerVis.set(name, true); if ($('nlCur').checked) state.curLayer = name;
  const wasDirty = state.dirty; state.dirty = true; if (!wasDirty) renderTabs(); updateInfo();
  $('layerDlg').classList.remove('on'); layersChanged(); toast('Layer ' + name + ' created' + ($('nlCur').checked ? ' · it is the current layer' : ''), 2600);
});

// ----- Dimensions: radius, diameter, arc length (P = centre, then points on the arc) -----
function dimReadable(ang) { let a = Math.atan2(Math.sin(ang), Math.cos(ang)); if (a > Math.PI / 2 + 1e-9) a -= Math.PI; else if (a <= -Math.PI / 2 + 1e-9) a += Math.PI; return a; }
function dimGeomMore(kind, P, q, th) {
  const gap = th * 0.35, ext = th * 0.6, tick = th * 0.5, tgap = th * 0.35; const lines = [], arcs = [], solids = [];
  const c = P[0]; if (!P[1]) return null; const r = Math.hypot(P[1][0] - c[0], P[1][1] - c[1]); if (r < 1e-9) return null;
  const arrow = (tip, d) => { const al = th * 0.9, aw = th * 0.2; const b = [tip[0] - d[0] * al, tip[1] - d[1] * al]; const n = [-d[1] * aw, d[0] * aw]; solids.push([tip, [b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]], [b[0] - n[0], b[1] - n[1]]]); };
  if (kind === 'radius' || kind === 'diameter') {
    let dq = Math.hypot(q[0] - c[0], q[1] - c[1]); const u = dq > 1e-9 ? [(q[0] - c[0]) / dq, (q[1] - c[1]) / dq] : [1, 0];
    const pa = [c[0] + u[0] * r, c[1] + u[1] * r], pb = [c[0] - u[0] * r, c[1] - u[1] * r];
    const val = kind === 'radius' ? 'R' + fmtDimText(mLen(c, pa)) : '%%c' + fmtDimText(mLen(pb, pa));
    const rot = dimReadable(Math.atan2(u[1], u[0])); const up = [-Math.sin(rot), Math.cos(rot)];
    const outside = dq > r + th * 0.3;
    if (kind === 'diameter') { lines.push([pb, pa]); arrow(pa, u); arrow(pb, [-u[0], -u[1]]); }
    if (outside) {
      lines.push([pa, q.slice()]); if (kind === 'radius') arrow(pa, [-u[0], -u[1]]);
      const tw = textWidthUnits(textPlain(val), th); const tp = [q[0] + u[0] * (tw / 2 + gap), q[1] + u[1] * (tw / 2 + gap)];
      return { lines, arcs, solids, text: { p: [tp[0] - up[0] * th / 2, tp[1] - up[1] * th / 2], rot, s: val } };
    }
    if (kind === 'radius') { lines.push([c.slice(), pa]); arrow(pa, u); }
    const mid = kind === 'radius' ? [(c[0] + pa[0]) / 2, (c[1] + pa[1]) / 2] : c;
    return { lines, arcs, solids, text: { p: [mid[0] + up[0] * tgap, mid[1] + up[1] * tgap], rot, s: val } };
  }
  if (kind === 'arclen') {
    const ps = P[1], pe = P[2]; if (!pe) return null; const as = Math.atan2(ps[1] - c[1], ps[0] - c[0]), ae = Math.atan2(pe[1] - c[1], pe[0] - c[0]); const sw = normAng(ae - as) || TAU;
    const R = Math.max(Math.hypot(q[0] - c[0], q[1] - c[1]), th); arcs.push({ c: c.slice(), r: R, a0: as, a1: as + sw });
    for (const ang of [as, as + sw]) { const e = [Math.cos(ang), Math.sin(ang)]; if (Math.abs(R - r) > gap) { const s0 = R > r ? r + gap : r - gap, s1 = R > r ? R + ext : R - ext; lines.push([[c[0] + e[0] * s0, c[1] + e[1] * s0], [c[0] + e[0] * s1, c[1] + e[1] * s1]]); } const p = [c[0] + e[0] * R, c[1] + e[1] * R]; const t = [-Math.sin(ang), Math.cos(ang)]; const k2 = [(t[0] - t[1]) * 0.7071 * tick, (t[1] + t[0]) * 0.7071 * tick]; lines.push([[p[0] - k2[0], p[1] - k2[1]], [p[0] + k2[0], p[1] + k2[1]]]); }
    const m = as + sw / 2; const o = [Math.cos(m), Math.sin(m)]; const rot = dimReadable(m - Math.PI / 2); const up = [-Math.sin(rot), Math.cos(rot)];
    const flip = up[0] * o[0] + up[1] * o[1] < 0; const rr = R + tgap + (flip ? th * 1.7 : 0); const tp = [c[0] + o[0] * rr, c[1] + o[1] * rr];
    const rReal = mLen(c, ps); const s = fmtDimText(rReal * sw);
    // the arc-length sign: a small arc over the number
    const tw = textWidthUnits(s, th); const hw = Math.max(tw * 0.32, th * 0.4), sg = th * 0.32; const Rs = (hw * hw + sg * sg) / (2 * sg); const phi = Math.asin(Math.min(1, hw / Rs));
    const lc = [0, th * 1.35 + sg - Rs]; const cs = [tp[0] + lc[0] * Math.cos(rot) - lc[1] * Math.sin(rot), tp[1] + lc[0] * Math.sin(rot) + lc[1] * Math.cos(rot)];
    arcs.push({ c: cs, r: Rs, a0: rot + Math.PI / 2 - phi, a1: rot + Math.PI / 2 + phi });
    return { lines, arcs, solids, text: { p: tp, rot, s } };
  }
  return null;
}
// Continue: the next dimension of a chain starts where the last one ended and keeps its line
function contGeom(base, np) {
  const [p1, p2] = base.pts, q = base.q; if (Math.hypot(np[0] - p2[0], np[1] - p2[1]) < 1e-9) return null;
  let kind = base.kind;
  if (kind === 'linear') { const minX = Math.min(p1[0], p2[0]), maxX = Math.max(p1[0], p2[0]), minY = Math.min(p1[1], p2[1]), maxY = Math.max(p1[1], p2[1]); const outY = Math.max(0, q[1] - maxY, minY - q[1]), outX = Math.max(0, q[0] - maxX, minX - q[0]); kind = outY >= outX ? 'hor' : 'ver'; }
  if (kind === 'hor') return { kind, pts: [p2.slice(), np], q: [(p2[0] + np[0]) / 2, q[1]] };
  if (kind === 'ver') return { kind, pts: [p2.slice(), np], q: [q[0], (p2[1] + np[1]) / 2] };
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy) || 1; const n = [-dy / L, dx / L]; const s = (q[0] - p1[0]) * n[0] + (q[1] - p1[1]) * n[1];
  const ex = np[0] - p2[0], ey = np[1] - p2[1], L2 = Math.hypot(ex, ey); let n2 = [-ey / L2, ex / L2]; if (n2[0] * n[0] + n2[1] * n[1] < 0) n2 = [-n2[0], -n2[1]];
  return { kind: 'aligned', pts: [p2.slice(), np], q: [(p2[0] + np[0]) / 2 + n2[0] * s, (p2[1] + np[1]) / 2 + n2[1] * s] };
}

// ----- Revision cloud: arcs along a closed outline, bulging outward -----
function placeCloud(poly) {
  if (poly.length < 3) { toast('Draw around an area'); return false; }
  const ring = poly.concat([poly[0]]); let L = 0; for (let i = 1; i < ring.length; i++) L += Math.hypot(ring[i][0] - ring[i - 1][0], ring[i][1] - ring[i - 1][1]); if (!(L > 0)) return false;
  let chord = 26 / state.view.s; const p10 = Math.pow(10, Math.floor(Math.log10(chord))); chord = [1, 2, 2.5, 5, 10].map(f => f * p10).reduce((a, b) => Math.abs(b - chord) < Math.abs(a - chord) ? b : a); // a round size
  const n = Math.max(6, Math.round(L / chord)); const step = L / n; const out = []; let seg = 1, acc = 0;
  for (let k = 0; k < n; k++) { const target = k * step; while (seg < ring.length - 1 && acc + Math.hypot(ring[seg][0] - ring[seg - 1][0], ring[seg][1] - ring[seg - 1][1]) < target) { acc += Math.hypot(ring[seg][0] - ring[seg - 1][0], ring[seg][1] - ring[seg - 1][1]); seg++; } const a = ring[seg - 1], b = ring[seg]; const sl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; const t = Math.min(1, (target - acc) / sl); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  const flat = []; for (const p of out) flat.push(p[0], p[1]); const bulge = polyArea(flat) > 0 ? 0.55 : -0.55; // outward for either direction
  addEntities([{ t: 'PLINE', L: state.curLayer, c: 256, lt: '', v: out.map(p => [p[0], p[1], bulge]), closed: true, w: 0 }]); toast('Revision cloud placed'); return true;
}
// ----- Divide: points at equal spacing along an object -----
function dividePoints(e, it, n) {
  const pts = [];
  if (e.t === 'LINE') { for (let i = 1; i < n; i++) pts.push([e.a[0] + (e.b[0] - e.a[0]) * i / n, e.a[1] + (e.b[1] - e.a[1]) * i / n]); return pts; }
  if (e.t === 'ARC') { const sw = normAng(e.a1 - e.a0) || TAU; for (let i = 1; i < n; i++) pts.push(pol(e.ce, e.r, e.a0 + sw * i / n)); return pts; }
  if (e.t === 'CIRCLE') { for (let i = 0; i < n; i++) pts.push(pol(e.ce, e.r, TAU * i / n)); return pts; }
  let segs, closed;
  if (e.t === 'PLINE') { segs = plineSegs(e.v, e.closed); closed = !!e.closed; }
  else { const f = it.polys[0] || []; segs = []; for (let i = 2; i < f.length; i += 2) segs.push({ a: [f[i - 2], f[i - 1]], b: [f[i], f[i + 1]], len: Math.hypot(f[i] - f[i - 2], f[i + 1] - f[i - 1]) }); closed = it.closed || (f.length >= 4 && Math.hypot(f[0] - f[f.length - 2], f[1] - f[f.length - 1]) < 1e-9); }
  let L = 0; for (const s of segs) L += s.len; if (!(L > 0)) return pts;
  const ts = []; for (let i = closed ? 0 : 1; i < n; i++) ts.push(L * i / n);
  let si = 0, acc = 0; for (const t of ts) { while (si < segs.length - 1 && acc + segs[si].len < t - 1e-12) { acc += segs[si].len; si++; } const s = segs[si]; pts.push(plineAt(s, s.len ? Math.min(1, (t - acc) / s.len) : 0)); }
  return pts;
}

// ----- The new tools -----
function moreTool(T, name, addPt) {
  switch (name) {
    case 'arclen':
      T.start = () => setPrompt('Tap an arc, a circle or a curved part of a polyline.');
      T.onTap = (sn, hit, ev, w) => {
        const cv = pickCurve(hit, w || [sn.x, sn.y], 14 / state.view.s); if (!cv) { toast('Tap an arc or a circle (Object measures other curves)'); return; }
        const A = ccwArc(cv); const r = mLen(cv.c, [cv.c[0] + cv.r, cv.c[1]]); const L = r * A.sw; T.cv = cv;
        const rows = [['Arc length', fmtLenAll(L)], ['Radius', fmtLen(r)], ['Angle', fmtAng(deg(A.sw))]]; if (!cv.full) rows.push(['Chord', fmtLen(2 * r * Math.sin(A.sw / 2))]); if (cv.vp) rows.push(['Measured', 'in model through viewport']);
        setResult(rows); T.rec = null; saveResult(T, { kind: 'arclen', len: L, bb: [cv.c[0] - cv.r, cv.c[1] - cv.r, cv.c[0] + cv.r, cv.c[1] + cv.r], text: fmtLen(L) + ' · R ' + fmtLen(r) }); T.len = L;
        setPrompt('Tap another arc to measure it.');
      };
      T.draw = (c, V, acc) => { if (!T.cv) return; const cv = T.cv, A = ccwArc(cv); hlCurve(c, V, cv, acc); const C = toScreen(cv.c[0], cv.c[1], V); const m = A.s + A.sw / 2; const R = cv.r * V.s + 24; drawChip(c, C[0] + Math.cos(-m) * R, C[1] + Math.sin(-m) * R, fmtLen(T.len)); };
      break;
    case 'entity':
      T.start = () => setPrompt('Tap any object to measure it: length, area, perimeter or radius.');
      T.onTap = (sn, hit) => {
        T.hl = null; if (!hit) { setResult(null); return; }
        const m = measureEnt(hit.item); if (!hit.model) T.hl = hit.item;
        setResult(m.rows.concat(hit.model ? [['Measured', 'in model through viewport']] : [])); T.rec = null;
        saveResult(T, { kind: 'entity', len: m.len, area: m.area, perim: m.perim, bb: hit.model ? null : hit.item.bbox.slice(), text: m.text });
        setPrompt('Tap another object to measure it.');
      };
      T.draw = (c, V, acc) => { if (T.hl) hlItem(c, V, T.hl, acc); };
      break;
    case 'batch':
      T.boxSelect = true;
      T.start = () => { T.calc(); setPrompt('Tap the objects to add up (drag for a box). Totals update as you go; Done saves them.'); };
      T.onTap = (sn, hit) => { if (hit && !hit.model) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); } T.calc(); };
      T.onSelChange = () => T.calc();
      T.calc = () => {
        const S = getScene(state.spaceIdx); let n = 0, L = 0, nl = 0, A = 0, P = 0, na = 0; const types = new Map(); const bb = emptyBox();
        for (const it of S.items) { if (!state.selection.has(it.ent.id)) continue; n++; const m = measureEnt(it); if (m.len != null) { L += m.len; nl++; } if (m.area != null) { A += m.area; P += m.perim || 0; na++; } const tn = it.ent.dim ? 'Dimension' : it.ent.t === 'INSERT' ? 'Block' : it.ent.t; types.set(tn, (types.get(tn) || 0) + 1); bboxAdd(bb, it.bbox[0], it.bbox[1]); bboxAdd(bb, it.bbox[2], it.bbox[3]); }
        T.sum = { n, L, nl, A, P, na, bb };
        if (!n) { setResult(null); return; }
        const rows = [['Objects', String(n) + ' (' + [...types.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => v + ' ' + k).join(', ') + ')']];
        if (nl) rows.push(['Total length', fmtLenAll(L) + '  (' + nl + ' open)']); if (na) rows.push(['Total area', fmtArea(A) + '  (' + na + ' closed)'], ['Their perimeters', fmtLen(P)]); if (!nl && !na) rows.push(['Total', 'nothing to add up (blocks and text count only)']);
        setResult(rows);
      };
      T.onDone = () => { const s = T.sum; if (!s || !s.n) { toast('Tap objects first'); return; } T.rec = null; saveResult(T, { kind: 'batch', len: s.nl ? s.L : null, area: s.na ? s.A : null, perim: s.na ? s.P : null, bb: s.bb.slice(), text: s.n + ' objects' + (s.nl ? ' · ' + fmtLen(s.L) : '') + (s.na ? ' · ' + fmtAreaShort(s.A) : '') }); T.rec = null; toast('Total saved in Results'); state.selection.clear(); T.calc(); };
      T.onBack = () => { state.selection.clear(); T.calc(); };
      T.onCancel = () => { state.selection.clear(); };
      T.draw = (c) => { if (state.boxSel) drawBoxSel(c); };
      break;
    case 'facade': {
      T.phase = 'run'; T.h = null; T.open = [];
      const msgRun = 'Tap along the walls, corner to corner. Done when the run is complete.';
      T.start = () => setPrompt(msgRun);
      T.runLen = () => { const P = measureSpace(T.pts).pts; let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
      T.update = () => {
        const n = T.pts.length; if (n < 2) { setResult(null); return; } const L = T.runLen(); const rows = [['Wall run', fmtLenAll(L)], ['Corners', String(n)]];
        if (T.h != null) { const gross = L * T.h; let op = 0; for (const o of T.open) op += o[0] * o[1]; const net = gross - op; rows.unshift(['Net wall area', fmtArea(net)]); rows.push(['Height', fmtLen(T.h)], ['Gross area', fmtAreaShort(gross)]); if (T.open.length) rows.push(['Openings', T.open.length + ' · −' + fmtAreaShort(op)]); saveResult(T, { kind: 'facade', pts: T.pts, area: net, len: L, h: T.h, open: T.open.map(o => o.slice()), text: fmtAreaShort(net) + ' net · ' + fmtLen(L) + ' × ' + fmtLen(T.h) + (T.open.length ? ' − ' + T.open.length + ' opening' + (T.open.length === 1 ? '' : 's') : '') }); }
        setResult(rows);
      };
      T.onTap = (sn) => { if (T.phase !== 'run') { toast('Type the height or an opening, or Done to finish'); return; } addPt(sn); T.update(); setPrompt(T.pts.length >= 2 ? 'Tap the next corner. Back removes the last; Done when the run is complete.' : 'Tap the next corner.'); };
      T.askHeight = () => { T.phase = 'height'; setPrompt('Type the wall height (e.g. 3 m or 3000 mm), then Enter.'); openTyped('decimal', 'Wall height, e.g. 3 or 3000 mm'); };
      T.onDone = () => {
        if (T.phase === 'run') { if (T.pts.length < 2) { toast('Tap at least two points along the wall'); return; } T.askHeight(); return; }
        if (T.phase === 'height') { toast('Type the height first'); return; }
        toast('Wall area saved in Results'); T.pts = []; T.h = null; T.open = []; T.rec = null; T.phase = 'run'; state.lastPt = null; setResult(null); setPrompt(msgRun); closeTyped(); resetTyped();
      };
      T.onTypedRaw = (str) => {
        if (T.phase === 'height') { const h = parseLenIn(str, true); if (!(h > 0)) { toast('Type a height like 3 or 3000 mm'); return true; } T.h = h; T.phase = 'open'; T.update(); setPrompt('Type an opening as width x height (e.g. 0.9 x 2.1 or 900x2100) and Enter. Done finishes.'); openTyped('text', 'Opening: width x height, e.g. 0.9 x 2.1'); return true; }
        if (T.phase === 'open') { const p = str.split(/\s*[x×*]\s*/i); if (p.length !== 2) { toast('Type width x height, e.g. 0.9 x 2.1'); return true; } const w = parseLenIn(p[0], true), h = parseLenIn(p[1], true); if (!(w > 0 && h > 0)) { toast('Type width x height, e.g. 0.9 x 2.1'); return true; } T.open.push([w, h]); T.update(); toast('Opening ' + fmtLen(w) + ' × ' + fmtLen(h) + ' taken off'); return true; }
        return false; // tracing the run: typed points as usual
      };
      T.onBack = () => {
        if (T.phase === 'open' && T.open.length) { T.open.pop(); T.update(); return; }
        if (T.phase !== 'run') { T.phase = 'run'; T.h = null; T.open = []; closeTyped(); resetTyped(); setPrompt(msgRun); T.update(); return; }
        if (T.pts.length) { T.pts.pop(); state.lastPt = T.pts.length ? T.pts[T.pts.length - 1] : null; T.update(); }
      };
      T.onHandleMoved = () => T.update();
      T.draw = (c, V, acc) => { const P = T.pts; c.save(); c.strokeStyle = acc; c.lineWidth = 3; c.globalAlpha = 0.75; c.setLineDash([]); drawPolyScreen(c, P, V, false); c.restore(); for (let i = 1; i < P.length; i++) drawDimLine(c, V, P[i - 1], P[i], fmtLen(mLen(P[i - 1], P[i])), acc); if (T.h != null && T.rec && P.length) { const e = toScreen(P[P.length - 1][0], P[P.length - 1][1], V); drawChip(c, e[0] + 12, e[1] + 22, fmtAreaShort(T.rec.area) + ' net', 0, null, 'left'); } drawHandles(c, V, P, acc); };
      break;
    }
    case 'mscale':
      T.start = () => { const k = state.mscale || 1; if (k !== 1) { setPrompt('Measurements are scaled ×' + fmtNum(k, 4) + '. Tap two points of a length you know to change it, or type 1 and Enter to remove the scale.'); openTyped('decimal', '1 removes the scale'); } else setPrompt('Tap the first point of a length you know (a door, a dimension).'); };
      T.rawLen = () => { const P = measureSpace(T.pts, true).pts; return Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]); };
      T.onTap = (sn) => {
        if (T.pts.length >= 2) T.pts = []; addPt(sn);
        if (T.pts.length === 1) { setPrompt('Tap the other end.'); return; }
        const raw = T.rawLen(); setResult([['Measured now', fmtLen(raw * (state.mscale || 1))]]); setPrompt('Type its real length (e.g. 2.4 m or 2400 mm), then Enter.'); openTyped('decimal', 'Real length, e.g. 2.4 m or 2400 mm');
      };
      T.onTypedRaw = (str) => {
        if (T.pts.length < 2) { if (parseFloat(str) === 1) { state.mscale = 1; closeTyped(); setResult(null); toast('Scale removed · measurements use the drawing as it is', 3000); T.pts = []; state.lastPt = null; T.start(); return true; } toast('Tap two points first'); return true; }
        const real = parseLenIn(str, false), raw = T.rawLen(); if (!(real > 0) || !(raw > 0)) { toast('Type a length like 2.4 m or 2400 mm'); return true; }
        state.mscale = real / raw; closeTyped(); setResult([['Scale', '×' + fmtNum(state.mscale, 4)], ['That line', fmtLen(real)]]); T.pts = []; state.lastPt = null;
        toast('Scale set ×' + fmtNum(state.mscale, 4) + ' · measurements and new dimensions use it', 3500); setPrompt('Scale set. Tap two more points to change it, or × to finish.'); return true;
      };
      T.draw = (c, V, acc) => { if (T.pts.length === 2) { c.save(); c.strokeStyle = acc; c.lineWidth = 2; c.setLineDash([]); drawPolyScreen(c, T.pts, V, false); c.restore(); } drawDots(c, T.pts, V, acc); };
      break;
    case 'laycur':
      T.start = () => { const sel = selectedEnts(); if (sel.length) { setCurLayer(sel[0].L || '0'); state.selection.clear(); exitSoon(); return; } setPrompt('Tap an object: its layer becomes the current layer.'); };
      T.onTap = (sn, hit) => { if (!hit || hit.model) { toast('Tap an object'); return; } setCurLayer(hit.item.ent.L || '0'); exitSoon(); };
      break;
    case 'layoff':
      T.start = () => { const sel = selectedEnts(); if (sel.length) { offLayers([...new Set(sel.map(e => e.L || '0'))]); state.selection.clear(); exitSoon(); return; } setPrompt('Tap objects: each one\'s layer turns off. × when you are done.'); };
      T.onTap = (sn, hit) => { if (!hit || hit.model) return; offLayers([hit.item.ent.L || '0']); };
      break;
    case 'layiso':
      T.boxSelect = true;
      T.start = () => { if (state.selection.size) { isoLayers(); exitSoon(); return; } setPrompt('Tap the objects whose layers stay on (drag for a box), then Done.'); };
      T.onTap = (sn, hit) => { if (hit && !hit.model) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); const L = new Set(selectedEnts().map(e => e.L || '0')); setResult([['Selected', state.selection.size + ' objects on ' + L.size + ' layer' + (L.size === 1 ? '' : 's')]]); } };
      T.onSelChange = () => { const L = new Set(selectedEnts().map(e => e.L || '0')); setResult(state.selection.size ? [['Selected', state.selection.size + ' objects on ' + L.size + ' layer' + (L.size === 1 ? '' : 's')]] : null); };
      T.onDone = () => { if (!state.selection.size) { toast('Tap objects first'); return; } isoLayers(); startTool('select', true); };
      T.onBack = () => { state.selection.clear(); setResult(null); };
      T.onCancel = () => { state.selection.clear(); };
      T.draw = (c) => { if (state.boxSel) drawBoxSel(c); };
      break;
    case 'dimrad': case 'dimdia': case 'dimarc': {
      const kind = { dimrad: 'radius', dimdia: 'diameter', dimarc: 'arclen' }[name];
      const ask = name === 'dimarc' ? 'Tap an arc (or a curved part of a polyline).' : 'Tap a circle or an arc.';
      T.start = () => { T.cv = null; T.pts = []; setPrompt(ask); };
      T.onTap = (sn, hit, ev, w) => {
        if (!T.cv) {
          const cv = pickCurve(hit, w || [sn.x, sn.y], 14 / state.view.s); if (!cv) { toast(name === 'dimarc' ? 'Tap an arc' : 'Tap a circle or an arc'); return; }
          if (name === 'dimarc' && cv.full) { toast('That is a full circle: use Radius or Diameter'); return; }
          const A = ccwArc(cv); T.cv = cv; T.pts = kind === 'arclen' ? [cv.c.slice(), pol(cv.c, cv.r, A.s), pol(cv.c, cv.r, A.s + A.sw)] : [cv.c.slice(), pol(cv.c, cv.r, A.s)];
          setPrompt(name === 'dimarc' ? 'Tap where the dimension arc goes.' : 'Tap where the text goes, inside or outside the ' + (cv.full ? 'circle' : 'arc') + '.'); return;
        }
        if (placeDimension(kind, T.pts, [sn.x, sn.y])) toast('Dimension placed'); T.start();
      };
      T.onBack = () => T.start();
      T.rubber = (c, V, acc, lp) => { if (!T.cv) return; const G = dimGeom(kind, T.pts, [lp.x, lp.y], dimTextHeight()); if (G) drawDimPreview(c, V, G, acc); };
      T.draw = (c, V, acc) => { if (T.cv) hlCurve(c, V, T.cv, acc); };
      break;
    }
    case 'dimcont':
      T.chain = [];
      T.start = () => { if (state.lastDim) { T.base = state.lastDim; state.lastPt = T.base.pts[1].slice(); setPrompt('Tap the next point. Each tap adds a dimension to the chain; × when done.'); } else { T.base = null; setPrompt('Tap a linear or aligned dimension to continue from.'); } };
      T.onTap = (sn, hit) => {
        if (!T.base) { const e = hit && !hit.model ? hit.item.ent : null; if (e && e.dim && e.dimDef && ['linear', 'aligned', 'hor', 'ver'].includes(e.dimDef.kind)) { state.lastDim = { kind: e.dimDef.kind, pts: e.dimDef.pts.map(p => p.slice()), q: e.dimDef.q.slice() }; T.start(); } else toast('Tap a linear or aligned dimension made in this app'); return; }
        const np = [sn.x, sn.y]; const g = contGeom(T.base, np); if (!g) { toast('Tap a different point'); return; }
        const prev = T.base; if (placeDimension(g.kind, g.pts, g.q)) { T.chain.push(prev); T.base = state.lastDim; state.lastPt = np.slice(); toast('Dimension placed'); }
      };
      T.onBack = () => { if (!T.chain.length) return; undo(); T.base = T.chain.pop(); state.lastDim = T.base; state.lastPt = T.base.pts[1].slice(); };
      T.rubber = (c, V, acc, lp) => { if (!T.base) return; const g = contGeom(T.base, [lp.x, lp.y]); if (!g) return; const G = dimGeom(g.kind, g.pts, g.q, dimTextHeight()); if (G) drawDimPreview(c, V, G, acc); };
      break;
    case 'ellipse':
      T.start = () => { T.pts = []; state.lastPt = null; setPrompt('Tap the centre.'); };
      T.minorFrom = (p) => { const [c, a] = T.pts; const ux = a[0] - c[0], uy = a[1] - c[1], L = Math.hypot(ux, uy) || 1; return Math.abs((p[0] - c[0]) * -uy / L + (p[1] - c[1]) * ux / L); };
      T.onTap = (sn) => { const n = T.pts.length; if (n < 2) { addPt(sn); setPrompt(n === 0 ? 'Tap the end of one axis.' : 'Tap a point for the other axis, or type its half-length.'); return; } T.place(T.minorFrom([sn.x, sn.y])); };
      T.onNum = (v) => { if (T.pts.length === 2 && v > 0) T.place(v); };
      T.place = (b) => { const [c, a] = T.pts; let m = [a[0] - c[0], a[1] - c[1]]; const A = Math.hypot(m[0], m[1]); if (!(A > 0) || !(b > 0)) { toast('Pick different points'); return; } let k = b / A; if (k > 1) { m = [-m[1] * k, m[0] * k]; k = 1 / k; } addEntities([{ t: 'ELLIPSE', L: state.curLayer, c: 256, lt: '', ce: c.slice(), m, k, a0: 0, a1: TAU }]); toast('Ellipse ' + fmtLen(2 * A) + ' × ' + fmtLen(2 * b)); T.start(); };
      T.onBack = () => { if (T.pts.length) { T.pts.pop(); state.lastPt = T.pts.length ? T.pts[T.pts.length - 1] : null; setPrompt(T.pts.length ? 'Tap the end of one axis.' : 'Tap the centre.'); } };
      T.rubber = (c, V, acc, lp) => { const P = T.pts; if (!P.length) return; const C = toScreen(P[0][0], P[0][1], V); c.save(); c.strokeStyle = acc; c.lineWidth = 1.6; c.setLineDash([]); if (P.length === 1) { const L = toScreen(lp.x, lp.y, V); c.beginPath(); c.moveTo(C[0], C[1]); c.lineTo(L[0], L[1]); c.stroke(); } else { const a = P[1]; const A = Math.hypot(a[0] - P[0][0], a[1] - P[0][1]); const b = T.minorFrom([lp.x, lp.y]); const rot = Math.atan2(a[1] - P[0][1], a[0] - P[0][0]); c.beginPath(); c.ellipse(C[0], C[1], A * V.s, Math.max(0.5, b * V.s), -rot, 0, TAU); c.stroke(); } c.restore(); };
      T.draw = (c, V, acc) => drawDots(c, T.pts, V, acc);
      break;
    case 'sketch': case 'revcloud': {
      T.freehand = true; T.n = 0;
      const msg = name === 'sketch' ? 'Draw with one finger. Two fingers move and zoom. Back removes the last line.' : 'Drag around the area to cloud it, or tap two opposite corners for a rectangle. Two fingers move and zoom.';
      T.start = () => setPrompt(msg);
      T.strokeMove = (X, Y, ds) => { const V = state.view; if (!T.stroke) T.stroke = [toWorld(ds.X, ds.Y, V)]; const l = T.stroke[T.stroke.length - 1]; const q = toScreen(l[0], l[1], V); if (Math.hypot(X - q[0], Y - q[1]) >= 2.5) T.stroke.push(toWorld(X, Y, V)); };
      T.strokeEnd = () => {
        const S = T.stroke; T.stroke = null; if (!S || S.length < 2) return; const V = state.view;
        if (name === 'sketch') { const pts = simplifyDP(S, 1.2 / V.s); const closed = pts.length > 3 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 10 / V.s; if (closed) pts.pop(); if (pts.length < 2) return; addEntities([{ t: 'PLINE', L: state.curLayer, c: 256, lt: '', v: pts.map(p => [p[0], p[1], 0]), closed, w: 0 }]); T.n++; }
        else if (placeCloud(simplifyDP(S, 2 / V.s))) T.n++;
        T.pts = []; state.lastPt = null;
      };
      T.onTap = (sn) => { if (name !== 'revcloud') return; addPt(sn); if (T.pts.length < 2) { setPrompt('Tap the opposite corner.'); return; } const [a, b] = T.pts; T.pts = []; state.lastPt = null; if (Math.abs(a[0] - b[0]) < 1e-9 || Math.abs(a[1] - b[1]) < 1e-9) { toast('Pick two opposite corners'); setPrompt(msg); return; } if (placeCloud([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]])) T.n++; setPrompt(msg); };
      T.onBack = () => { if (T.pts.length) { T.pts = []; state.lastPt = null; setPrompt(msg); return; } if (T.n > 0) { undo(); T.n--; } };
      T.draw = (c, V, acc) => { if (T.stroke && T.stroke.length > 1) { c.save(); c.strokeStyle = acc; c.lineWidth = 2; c.lineJoin = 'round'; c.lineCap = 'round'; c.setLineDash([]); drawPolyScreen(c, T.stroke, V, false); c.restore(); } drawDots(c, T.pts, V, acc); };
      T.rubber = (c, V, acc, lp) => { if (name === 'revcloud' && T.pts.length === 1) { const A = toScreen(T.pts[0][0], T.pts[0][1], V), L = toScreen(lp.x, lp.y, V); c.save(); c.strokeStyle = acc; c.lineWidth = 1.6; c.setLineDash([6, 4]); c.strokeRect(Math.min(A[0], L[0]), Math.min(A[1], L[1]), Math.abs(L[0] - A[0]), Math.abs(L[1] - A[1])); c.restore(); } };
      break;
    }
    case 'divide':
      T.start = () => { T.ent = null; T.item = null; setPrompt('Tap the object to divide: a line, arc, circle, polyline, spline or ellipse.'); };
      T.onTap = (sn, hit) => {
        if (!hit || hit.model) { toast('Tap an object'); return; } const e = hit.item.ent;
        if (!['LINE', 'ARC', 'CIRCLE', 'PLINE', 'SPLINE', 'ELLIPSE'].includes(e.t)) { toast('Divide works on lines, arcs, circles, polylines, splines and ellipses'); return; }
        T.ent = e; T.item = hit.item; setPrompt('Type how many equal parts (2 to 200), then Enter.'); openTyped('numeric', 'Number of parts, e.g. 4');
      };
      T.onTypedRaw = (str) => {
        if (!T.ent) { toast('Tap an object first'); return true; } const n = parseInt(str, 10); if (!(n >= 2 && n <= 200) || String(n) !== str.trim()) { toast('Type a whole number from 2 to 200'); return true; }
        const pts = dividePoints(T.ent, T.item, n); if (!pts.length) { toast('Could not divide that object'); return true; }
        addEntities(pts.map(p => ({ t: 'POINT', L: state.curLayer, c: 256, lt: '', p: [p[0], p[1]] }))); toast(n + ' equal parts · ' + pts.length + ' points placed (Node snap finds them)', 3000); closeTyped(); resetTyped(); T.start(); return true;
      };
      T.draw = (c, V, acc) => { if (T.item) hlItem(c, V, T.item, acc); };
      break;
  }
}

// ===================== Start-up (runs once every part has loaded) =====================
renderRecent(); resizeCanvas();
// First frame: show the built-in sample so the app opens in a working state; the welcome card sits on top until a file is chosen.
loadDrawing(sampleDrawing(), 'Sample plan (built in)', { fileName: 'Sample plan' }); setHome(true); showHomeTitle();
