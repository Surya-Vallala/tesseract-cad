// ===================== v15: category toolbar; layer, measure, dimension and draw tools =====================

// ----- Icons and names -----
Object.assign(ICON, {
  clipcopy: '<rect x="6" y="4" width="12" height="17" rx="1.5"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  paste: '<rect x="5" y="4" width="12" height="16" rx="1.5"/><path d="M8 4V3h6v1"/><path d="M13 13h8M18 10l3 3-3 3"/>',
  point: '<circle cx="12" cy="12" r="6.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
  c_markup: '<path d="M4 4h16v11H10l-5 4.5V15H4z"/><path d="M8 8.5h8M8 11.5h5"/>',
  mpen: '<path d="M3 18c3-1 3-5 6-5s2 4 5 4 3-3 3-3"/><path d="M15 9l4-4 2 2-4 4-3 1z"/>',
  marrow: '<path d="M5 19 19 5M10 5h9v9"/>',
  mtext: '<path d="M6 19 12 5l6 14M8.5 14h7"/>',
  mcloud: '<path d="M6.5 18a3.2 3.2 0 0 1-.4-6.4 4.3 4.3 0 0 1 8-2.2 3.6 3.6 0 0 1 5.6 3.4A2.6 2.6 0 0 1 19 18z"/>',
  mline: '<path d="M4 20 20 4"/><circle cx="4" cy="20" r="1.5"/><circle cx="20" cy="4" r="1.5"/>',
  mrect: '<rect x="4" y="6" width="16" height="12"/>',
  mellipse: '<ellipse cx="12" cy="12" rx="9" ry="5.5"/>',
  leader: '<path d="M3 21l8-10h3"/><path d="M3 21l.6-3.6M3 21l3.6-.6"/><path d="M15 7h6M15 11h6M15 15h4"/>',
  mleader: '<path d="M3 21l8-10h3"/><path d="M3 21l.6-3.6M3 21l3.6-.6"/><path d="M15 7h6M15 11h6M15 15h4"/>',
  mnum: '<circle cx="12" cy="12" r="8.5"/><text x="12" y="15.6" text-anchor="middle" font-size="10.5" font-family="Jost,sans-serif" font-weight="600" fill="currentColor" stroke="none">1</text>',
  mhide: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 20 20 4"/>',
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
Object.assign(LABEL, { clipcopy: 'Copy to clipboard', paste: 'Paste', point: 'Point', mpen: 'Pen', marrow: 'Arrow', mtext: 'Text note', mcloud: 'Cloud', mline: 'Line', mrect: 'Rectangle', mellipse: 'Ellipse', mleader: 'Leader', mnum: 'Number tag', leader: 'Leader', cont: 'Continuous', arclen: 'Arc length', entity: 'Object', batch: 'Total of many', facade: 'Wall area', mscale: 'Set scale', dimrad: 'Dim radius', dimdia: 'Dim diameter', dimarc: 'Dim arc length', dimcont: 'Dim continue', dimang: 'Dim angular', ellipse: 'Ellipse', sketch: 'Sketch', revcloud: 'Revcloud', divide: 'Divide', laycur: 'Make current', layoff: 'Layer off', layiso: 'Off others', arc: 'Arc' });
// names in the tool grid (shorter where the category already says what it is)
const GRID_LABEL = { dimlin: 'Linear', dimali: 'Aligned', dimang: 'Angular', dimrad: 'Radius', dimdia: 'Diameter', dimarc: 'Arc length', dimcont: 'Continue', laylist: 'Layer list', laynew: 'New layer', laycur: 'Make current', layoff: 'Layer off', layiso: 'Off others', layon: 'All on', layprev: 'Previous', results: 'Results', totals: 'Totals', precision: 'Decimals', arc: 'Arc', more: 'More', props: 'Properties', clearsel: 'Clear', batch: 'Total of many' };
const gridLabel = (k) => k === 'mhide' ? (state.drawing && state.layerMap.has(MK_LAYER) && !layerOn(MK_LAYER) ? 'Show markups' : 'Hide markups') : GRID_LABEL[k] || LABEL[k] || k;

// ----- Bottom bar: categories; a category opens a grid of its tools -----
const CATS = [
  { id: 'markup', name: 'Markup', icon: 'c_markup', tools: ['mpen', 'marrow', 'mtext', 'mcloud', 'mline', 'mrect', 'mellipse', 'mleader', 'mnum', 'mhide'] },
  { id: 'draw', name: 'Draw', icon: 'c_draw', tools: ['line', 'pline', 'rect', 'circle', 'arc', 'ellipse', 'spline', 'point', 'text', 'leader', 'sketch', 'revcloud', 'divide'] },
  { id: 'edit', name: 'Edit', icon: 'c_edit', tools: ['box', 'move', 'copy', 'rotate', 'mirror', 'scale', 'align', 'order', 'delete', 'paste'] },
  { id: 'layer', name: 'Layer', icon: 'c_layer', tools: ['laylist', 'laynew', 'laycur', 'layoff', 'layiso', 'layon', 'layprev'] },
  { id: 'measure', name: 'Measure', icon: 'c_measure', tools: ['dist', 'cont', 'area', 'angle', 'coord', 'arclen', 'entity', 'batch', 'facade', 'mscale', 'results', 'totals', 'precision'] },
  { id: 'dim', name: 'Dimension', icon: 'c_dim', tools: ['dimlin', 'dimali', 'dimang', 'dimrad', 'dimdia', 'dimarc', 'dimcont'] }
];
// something selected: the bar shows actions for it; More holds the rest
const SEL_MAIN = ['move', 'copy', 'rotate', 'mirror', 'delete', 'props', 'more'];
const SEL_MORE = ['clipcopy', 'scale', 'align', 'order', 'similar', 'batch', 'laycur', 'layoff', 'layiso', 'clearsel'];
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
    case 'mhide': toggleMarkups(); return;
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
function placeCloud(poly, layer) {
  if (poly.length < 3) { toast('Draw around an area'); return false; }
  const ring = poly.concat([poly[0]]); let L = 0; for (let i = 1; i < ring.length; i++) L += Math.hypot(ring[i][0] - ring[i - 1][0], ring[i][1] - ring[i - 1][1]); if (!(L > 0)) return false;
  let chord = 26 / state.view.s; const p10 = Math.pow(10, Math.floor(Math.log10(chord))); chord = [1, 2, 2.5, 5, 10].map(f => f * p10).reduce((a, b) => Math.abs(b - chord) < Math.abs(a - chord) ? b : a); // a round size
  const n = Math.max(6, Math.round(L / chord)); const step = L / n; const out = []; let seg = 1, acc = 0;
  for (let k = 0; k < n; k++) { const target = k * step; while (seg < ring.length - 1 && acc + Math.hypot(ring[seg][0] - ring[seg - 1][0], ring[seg][1] - ring[seg - 1][1]) < target) { acc += Math.hypot(ring[seg][0] - ring[seg - 1][0], ring[seg][1] - ring[seg - 1][1]); seg++; } const a = ring[seg - 1], b = ring[seg]; const sl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; const t = Math.min(1, (target - acc) / sl); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  const flat = []; for (const p of out) flat.push(p[0], p[1]); const bulge = polyArea(flat) > 0 ? 0.55 : -0.55; // outward for either direction
  addEntities([{ t: 'PLINE', L: layer || state.curLayer, c: 256, lt: '', v: out.map(p => [p[0], p[1], bulge]), closed: true, w: 0 }]); toast(layer === MK_LAYER ? 'Cloud placed' : 'Revision cloud placed'); return true;
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
      T.start = () => { T.pts = []; state.lastPt = null; setPrompt('Tap one end of an axis.'); };
      T.centre = () => [(T.pts[0][0] + T.pts[1][0]) / 2, (T.pts[0][1] + T.pts[1][1]) / 2]; // the two taps are opposite ends of one axis
      T.minorFrom = (p) => { const [a, b] = T.pts; const c = T.centre(); const ux = b[0] - a[0], uy = b[1] - a[1], L = Math.hypot(ux, uy) || 1; return Math.abs((p[0] - c[0]) * -uy / L + (p[1] - c[1]) * ux / L); };
      T.onTap = (sn) => { const n = T.pts.length; if (n < 2) { addPt(sn); setPrompt(n === 0 ? 'Tap the other end of that axis.' : 'Tap a point for the other axis, or type its half-length.'); return; } T.place(T.minorFrom([sn.x, sn.y])); };
      T.onNum = (v) => { if (T.pts.length === 2 && v > 0) T.place(v); };
      T.place = (b) => { const c = T.centre(), a = T.pts[1]; let m = [a[0] - c[0], a[1] - c[1]]; const A = Math.hypot(m[0], m[1]); if (!(A > 0) || !(b > 0)) { toast('Pick different points'); return; } let k = b / A; if (k > 1) { m = [-m[1] * k, m[0] * k]; k = 1 / k; } addEntities([{ t: 'ELLIPSE', L: state.curLayer, c: 256, lt: '', ce: c.slice(), m, k, a0: 0, a1: TAU }]); toast('Ellipse ' + fmtLen(2 * A) + ' × ' + fmtLen(2 * b)); T.start(); };
      T.onBack = () => { if (T.pts.length) { T.pts.pop(); state.lastPt = T.pts.length ? T.pts[T.pts.length - 1] : null; setPrompt(T.pts.length ? 'Tap the other end of that axis.' : 'Tap one end of an axis.'); } };
      T.rubber = (c, V, acc, lp) => { const P = T.pts; if (!P.length) return; c.save(); c.strokeStyle = acc; c.lineWidth = 1.6; c.setLineDash([]); if (P.length === 1) { const A0 = toScreen(P[0][0], P[0][1], V), L = toScreen(lp.x, lp.y, V); c.beginPath(); c.moveTo(A0[0], A0[1]); c.lineTo(L[0], L[1]); c.stroke(); } else { const m = T.centre(); const C = toScreen(m[0], m[1], V); const a = P[1]; const A = Math.hypot(a[0] - m[0], a[1] - m[1]); const b = T.minorFrom([lp.x, lp.y]); const rot = Math.atan2(a[1] - m[1], a[0] - m[0]); c.beginPath(); c.ellipse(C[0], C[1], A * V.s, Math.max(0.5, b * V.s), -rot, 0, TAU); c.stroke(); } c.restore(); };
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
    case 'leader': leaderTool(T, false); break;
    case 'clipcopy':
      T.verb = 'copy to the clipboard'; T.boxSelect = true;
      T.start = () => { if (needSelection(T)) { T.phase = 'base'; setPrompt('Tap the base point (it goes where you tap when pasting), or ✓ for the bottom-left corner.'); } };
      T.onTap = (sn, hit) => { if (T.phase === 'select') { if (hit && !hit.model) { const id = hit.item.ent.id; state.selection.has(id) ? state.selection.delete(id) : state.selection.add(id); setResult([['Selected', state.selection.size + '']]); } return; } clipCopy([sn.x, sn.y]); startTool('select', true); };
      T.onDone = () => { if (T.phase === 'select') { if (needSelection(T)) { T.phase = 'base'; setPrompt('Tap the base point, or ✓ for the bottom-left corner.'); } return; } clipCopy(null); startTool('select', true); };
      T.draw = (c) => { if (state.boxSel) drawBoxSel(c); };
      break;
    case 'paste':
      T.start = () => { if (!clip.ents.length) { toast('Nothing copied yet: select objects, then More → Copy to clipboard'); exitSoon(); return; } setPrompt('Tap where the base point goes (' + clip.ents.length + ' object' + (clip.ents.length === 1 ? '' : 's') + ' from ' + clip.src + '). ✓ pastes at the same coordinates.'); };
      T.onTap = (sn) => { clipPaste([sn.x, sn.y]); };
      T.onDone = () => clipPaste(null);
      T.rubber = (c, V, acc, lp) => drawClipPreview(c, V, [lp.x, lp.y], acc);
      break;
    case 'point':
      T.start = () => setPrompt('Tap to place a point, or type x,y (or @dx,dy). × ends.');
      T.onTap = (sn) => { addEntities([{ t: 'POINT', L: state.curLayer, c: 256, lt: '', p: [sn.x, sn.y] }]); state.lastPt = [sn.x, sn.y]; T.n = (T.n || 0) + 1; setResult([['Point', 'X ' + fmtNum(sn.x, 3) + ' · Y ' + fmtNum(sn.y, 3)], ['Placed', String(T.n)]]); };
      T.onBack = () => { if (T.n > 0) { undo(); T.n--; } };
      break;
    case 'mpen': case 'marrow': case 'mtext': case 'mcloud': case 'mline': case 'mrect': case 'mellipse': case 'mleader': case 'mnum': markupTool(T, name); break;
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

// ===================== Markup (drawn): red, on its own layer inside the drawing =====================
// Sizes follow the zoom when you draw (a round number of drawing units), so notes read the same on screen at any scale.
const MK_LAYER = 'TS - Markup';
function ensureMarkupLayer() {
  const D = state.drawing; let l = state.layerMap.get(MK_LAYER);
  if (!l) { l = { name: MK_LAYER, aci: 1, off: false, frozen: false, locked: false, lw: 35, lt: 'Continuous' }; D.layers.push(l); state.layerMap.set(MK_LAYER, l); state.layerVis.set(MK_LAYER, true); renderLayers(); }
  else if (!layerOn(MK_LAYER)) { state.layerVis.set(MK_LAYER, true); layersChanged(); toast('Markups shown'); }
  return MK_LAYER;
}
function toggleMarkups() {
  if (!state.layerMap.has(MK_LAYER)) { toast('No markups in this drawing yet'); return; }
  const on = !layerOn(MK_LAYER); pushLayerHist(); state.layerVis.set(MK_LAYER, on); layersChanged(); toast(on ? 'Markups shown' : 'Markups hidden · Hide/Show markups brings them back');
}
function mkSize(px) { const v = px / state.view.s; const p10 = Math.pow(10, Math.floor(Math.log10(v))); return [1, 2, 2.5, 5, 10].map(f => f * p10).reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a); }
// several pieces kept as one object: a block (pieces ByBlock) inserted on the layer, like the app's dimensions
function placeGroup(kind, pieces, layer, extra) {
  const D = state.drawing; let name; do { name = 'TC_MK_' + Math.random().toString(36).slice(2, 8).toUpperCase(); } while (D.blocks[name]);
  D.blocks[name] = { base: [0, 0], ents: pieces.map(e => Object.assign({ id: nextId(), hd: '', L: '0', c: 0, lt: '' }, e)) };
  addEntities([Object.assign({ t: 'INSERT', L: layer, c: 256, lt: '', n: name, p: [0, 0], sx: 1, sy: 1, rot: 0, mk: kind }, extra || {})]);
}
function arrowHead(tip, from, hl) { const dx = tip[0] - from[0], dy = tip[1] - from[1], L = Math.hypot(dx, dy) || 1; const u = [dx / L, dy / L]; const hw = hl * 0.32; const b = [tip[0] - u[0] * hl, tip[1] - u[1] * hl]; const n = [-u[1] * hw, u[0] * hw]; return { solid: { t: 'SOLID', pts: [tip.slice(), [b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]], [b[0] - n[0], b[1] - n[1]]] }, neck: [tip[0] - u[0] * hl * 0.85, tip[1] - u[1] * hl * 0.85] }; }
// geometry of the two-point markups, shared by the live preview and the objects created
function mkShape(kind, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  switch (kind) {
    case 'mline': return Math.hypot(dx, dy) > 0 ? { ents: [{ t: 'LINE', a: a.slice(), b: b.slice() }] } : null;
    case 'mrect': return Math.abs(dx) > 0 && Math.abs(dy) > 0 ? { ents: [{ t: 'PLINE', v: [[a[0], a[1], 0], [b[0], a[1], 0], [b[0], b[1], 0], [a[0], b[1], 0]], closed: true, w: 0 }] } : null;
    case 'mellipse': { const rx = Math.abs(dx) / 2, ry = Math.abs(dy) / 2; if (!(rx > 0 && ry > 0)) return null; const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; return { ents: [rx >= ry ? { t: 'ELLIPSE', ce: c, m: [rx, 0], k: ry / rx, a0: 0, a1: TAU } : { t: 'ELLIPSE', ce: c, m: [0, ry], k: rx / ry, a0: 0, a1: TAU }] }; }
    case 'marrow': { const hl = mkSize(14); if (Math.hypot(dx, dy) < hl * 1.4) return null; const h = arrowHead(b, a, hl); return { group: true, ents: [{ t: 'LINE', a: a.slice(), b: h.neck }, h.solid] }; }
  }
  return null;
}
function drawMkPreview(c, V, kind, a, b, col) {
  const sh = mkShape(kind, a, b); if (!sh) return; c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2; c.setLineDash([]);
  for (const e of sh.ents) {
    c.beginPath();
    if (e.t === 'LINE') { const A = toScreen(e.a[0], e.a[1], V), B = toScreen(e.b[0], e.b[1], V); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); }
    else if (e.t === 'PLINE') { e.v.forEach((p, i) => { const Q = toScreen(p[0], p[1], V); i ? c.lineTo(Q[0], Q[1]) : c.moveTo(Q[0], Q[1]); }); c.closePath(); c.stroke(); }
    else if (e.t === 'ELLIPSE') { const C = toScreen(e.ce[0], e.ce[1], V); const A = Math.hypot(e.m[0], e.m[1]); c.ellipse(C[0], C[1], A * V.s, A * e.k * V.s, -Math.atan2(e.m[1], e.m[0]), 0, TAU); c.stroke(); }
    else if (e.t === 'SOLID') { e.pts.forEach((p, i) => { const Q = toScreen(p[0], p[1], V); i ? c.lineTo(Q[0], Q[1]) : c.moveTo(Q[0], Q[1]); }); c.closePath(); c.fill(); }
  }
  c.restore();
}
function nextTagNumber() { let n = 0; for (const e of curSpace().ents) if (e.mk === 'tag' && e.num > n) n = e.num; return n + 1; }
// Leader: an arrow to a point, a short landing and a text. Markup: red, sizes from the zoom; Draw: current layer, text height as dimensions.
function placeLeader(tip, at, text, h, layer, mk) {
  const hl = mk ? mkSize(14) : h * 1.2; const dir = at[0] >= tip[0] ? 1 : -1; const land = h * 1.2, gap = h * 0.5;
  const arrow = arrowHead(tip, at, hl); const end = [at[0] + dir * land, at[1]];
  const pieces = [{ t: 'LINE', a: at.slice(), b: arrow.neck }, arrow.solid, { t: 'LINE', a: at.slice(), b: end }, { t: 'TEXT', p: [end[0] + dir * gap, end[1]], ap: [end[0] + dir * gap, end[1]], h, rot: 0, s: text, ha: dir > 0 ? 0 : 2, va: 2, wf: 1 }];
  placeGroup(mk ? 'leader' : 'dleader', pieces, layer); toast('Leader placed');
}
function leaderTool(T, mk) {
  const layer = () => mk ? ensureMarkupLayer() : state.curLayer; const th = () => mk ? mkSize(13) : dimTextHeight();
  const msg = 'Tap the point the arrow shows' + (mk ? ' (or drag from it to where the text goes).' : '.');
  T.pts = [];
  T.start = () => { T.pts = []; state.lastPt = null; setPrompt(msg); };
  const ask = (tip, at) => { if (Math.hypot(at[0] - tip[0], at[1] - tip[1]) < (mk ? mkSize(14) : th()) * 1.4) { toast('Put the text a little further from the point'); T.start(); return; } T.pts = [tip, at]; openTextDialog(at, { h: th(), onText: (s, h) => { placeLeader(tip, at, s, h, layer(), mk); T.start(); }, onCancel: () => T.start() }); setPrompt('Type the text for the leader.'); };
  T.onTap = (sn, hit, ev, w) => { const p = mk ? (w || [sn.x, sn.y]) : [sn.x, sn.y]; if (!T.pts.length) { T.pts = [p]; state.lastPt = p; setPrompt('Tap where the text goes.'); return; } ask(T.pts[0], p); };
  if (mk) { T.freehand = true; T.strokeMove = (X, Y, ds) => { const V = state.view; if (!T.stroke) T.stroke = [toWorld(ds.X, ds.Y, V)]; T.stroke[1] = toWorld(X, Y, V); }; T.strokeEnd = () => { const S = T.stroke; T.stroke = null; if (S && S.length === 2) ask(S[0], S[1]); }; }
  T.onBack = () => { if (T.pts.length) { T.start(); return; } undo(); };
  T.draw = (c, V, acc) => { const S = T.stroke || (T.pts.length === 2 ? T.pts : null); if (S && S.length === 2) { drawMkPreview(c, V, 'marrow', S[1], S[0], acc); } drawDots(c, T.pts.slice(0, 1), V, acc); };
  T.rubber = (c, V, acc, lp) => { if (T.pts.length === 1) drawMkPreview(c, V, 'marrow', [lp.x, lp.y], T.pts[0], acc); };
}
function markupTool(T, name) {
  const col = '#ff3b30'; const twoPt = ['marrow', 'mline', 'mrect', 'mellipse'].includes(name);
  if (name === 'mleader') { leaderTool(T, true); return; }
  T.n = 0; T.pts = [];
  if (twoPt) {
    const what = { marrow: 'Tap where the arrow starts, then where it points', mline: 'Tap the two ends of the line', mrect: 'Tap two opposite corners', mellipse: 'Tap two opposite corners of the box around the ellipse' }[name];
    T.freehand = true;
    T.start = () => { T.pts = []; setPrompt(what + ', or drag. Two fingers move and zoom.'); };
    const make = (a, b) => { const sh = mkShape(name, a, b); if (!sh) { toast(name === 'marrow' ? 'Make the arrow a little longer' : 'Make it a little bigger'); return false; } const L = ensureMarkupLayer(); if (sh.group) placeGroup('arrow', sh.ents, L); else addEntities(sh.ents.map(e => Object.assign({ L, c: 256, lt: '' }, e))); T.n++; return true; };
    T.strokeMove = (X, Y, ds) => { const V = state.view; if (!T.stroke) T.stroke = [toWorld(ds.X, ds.Y, V)]; T.stroke[1] = toWorld(X, Y, V); };
    T.strokeEnd = () => { const S = T.stroke; T.stroke = null; T.pts = []; if (S && S.length === 2) make(S[0], S[1]); T.start(); };
    T.onTap = (sn, hit, ev, w) => { const p = w || [sn.x, sn.y]; T.pts.push(p); if (T.pts.length < 2) { setPrompt(name === 'marrow' ? 'Now tap where it points.' : 'Now tap the other ' + (name === 'mline' ? 'end.' : 'corner.')); return; } const [a, b] = T.pts; T.pts = []; make(a, b); T.start(); };
    T.onBack = () => { if (T.pts.length) { T.start(); return; } if (T.n > 0) { undo(); T.n--; } };
    T.draw = (c, V, acc) => { const S = T.stroke; if (S && S.length === 2) drawMkPreview(c, V, name, S[0], S[1], col); else if (T.pts.length === 1 && state.hoverSn) drawMkPreview(c, V, name, T.pts[0], [state.hoverSn.x, state.hoverSn.y], col); drawDots(c, T.pts, V, col); };
    return;
  }
  switch (name) {
    case 'mpen': case 'mcloud':
      T.freehand = true;
      T.start = () => setPrompt(name === 'mpen' ? 'Draw with one finger. Two fingers move and zoom. Back removes the last stroke.' : 'Drag around what you want to cloud, or tap two opposite corners. Two fingers move and zoom.');
      T.strokeMove = (X, Y, ds) => { const V = state.view; if (!T.stroke) T.stroke = [toWorld(ds.X, ds.Y, V)]; const l = T.stroke[T.stroke.length - 1]; const q = toScreen(l[0], l[1], V); if (Math.hypot(X - q[0], Y - q[1]) >= 2.5) T.stroke.push(toWorld(X, Y, V)); };
      T.strokeEnd = () => {
        const S = T.stroke; T.stroke = null; if (!S || S.length < 2) return; const V = state.view; const L = ensureMarkupLayer();
        if (name === 'mpen') { const pts = simplifyDP(S, 1 / V.s); if (pts.length < 2) return; addEntities([{ t: 'PLINE', L, c: 256, lt: '', v: pts.map(p => [p[0], p[1], 0]), closed: false, w: 0 }]); T.n++; }
        else if (placeCloud(simplifyDP(S, 2 / V.s), L)) T.n++;
        T.pts = [];
      };
      T.onTap = (sn, hit, ev, w) => { if (name !== 'mcloud') return; const p = w || [sn.x, sn.y]; T.pts.push(p); if (T.pts.length < 2) { setPrompt('Now tap the opposite corner.'); return; } const [a, b] = T.pts; T.pts = []; if (Math.abs(a[0] - b[0]) > 0 && Math.abs(a[1] - b[1]) > 0 && placeCloud([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], ensureMarkupLayer())) T.n++; T.start(); };
      T.onBack = () => { if (T.pts.length) { T.pts = []; T.start(); return; } if (T.n > 0) { undo(); T.n--; } };
      T.draw = (c, V, acc) => { if (T.stroke && T.stroke.length > 1) { c.save(); c.strokeStyle = col; c.lineWidth = 2; c.lineJoin = 'round'; c.lineCap = 'round'; c.setLineDash([]); drawPolyScreen(c, T.stroke, V, false); c.restore(); } drawDots(c, T.pts, V, col); };
      break;
    case 'mtext':
      T.start = () => setPrompt('Tap where the note starts.');
      T.onTap = (sn, hit, ev, w) => { const p = w || [sn.x, sn.y]; T.pt = p; openTextDialog(p, { h: mkSize(14), onText: (s, h) => { addEntities([{ t: 'TEXT', L: ensureMarkupLayer(), c: 256, lt: '', p: p.slice(), ap: [0, 0], h, rot: 0, s, ha: 0, va: 0, wf: 1 }]); T.n++; toast('Note placed'); T.pt = null; }, onCancel: () => { T.pt = null; requestFast(); } }); };
      T.onBack = () => { if (T.n > 0) { undo(); T.n--; } };
      T.draw = (c, V, acc) => { if (T.pt) drawDots(c, [T.pt], V, col); };
      break;
    case 'mnum':
      T.next = null;
      T.start = () => { const n = T.next || nextTagNumber(); setPrompt('Tap to place tag ' + n + '. Each tap counts up. Type a number to start from another.'); };
      T.onTypedRaw = (str) => { const n = parseInt(str, 10); if (!(n >= 0) || String(n) !== str.trim()) { toast('Type a whole number'); return true; } T.next = n; closeTyped(); T.start(); return true; };
      T.onTap = (sn, hit, ev, w) => {
        const p = w || [sn.x, sn.y]; const n = T.next || nextTagNumber(); const digits = String(n).length; const R = mkSize(12) * (digits > 2 ? 1 + 0.28 * (digits - 2) : 1);
        placeGroup('tag', [{ t: 'CIRCLE', ce: p.slice(), r: R }, { t: 'TEXT', p: p.slice(), ap: p.slice(), h: R * 0.9, rot: 0, s: String(n), ha: 1, va: 2, wf: 1 }], ensureMarkupLayer(), { num: n });
        T.next = n + 1; T.n++; T.start();
      };
      T.onBack = () => { if (T.n > 0) { undo(); T.n--; T.next = null; T.start(); } };
      break;
  }
}

// ===================== Polar tracking =====================
// From the last picked point, the pointer locks onto every `inc` degrees and onto the extra angles (and their opposite).
// Point snaps (endpoint, midpoint…) win when close; the polar ray also snaps to where it crosses an object.
const POLAR_TOOLS = new Set(['line', 'pline', 'spline', 'dist', 'cont', 'area', 'facade', 'move', 'copy', 'rotate', 'mirror', 'dimlin', 'dimali', 'dimcont', 'leader']);
const POLAR_STEPS = [90, 45, 30, 22.5, 15, 10, 5];
const polar = { on: true, inc: 90, extra: [] };
try { const o = JSON.parse(localStorage.getItem('tct-polar') || 'null'); if (o) { polar.on = o.on !== false; if (o.inc > 0 && o.inc <= 180) polar.inc = o.inc; if (Array.isArray(o.extra)) polar.extra = o.extra.filter(a => isFinite(a)).slice(0, 12); } } catch (e) { }
function savePolar() { try { localStorage.setItem('tct-polar', JSON.stringify(polar)); } catch (e) { } renderPolarSummary(); }
const angTxt = (a) => (Math.abs(a - Math.round(a)) < 1e-9 ? String(Math.round(a)) : String(+a.toFixed(3))) + '°';
/* Snap name for the magnifier and the coordinate chip; polar and tracking snaps also give the angle they lock to */
function snapLabel(sn) { if (!sn) return ''; const nm = SNAP_NAMES[sn.kind] || ''; if (sn.kind === 15 && sn.lines && sn.lines.length > 1) return nm + ' ' + sn.lines.slice(0, 2).map(l => angTxt(l.ang)).join(' × '); return nm + ((sn.kind === 12 || sn.kind === 13 || sn.kind === 14 || sn.kind === 16) && sn.ang != null ? ' ' + angTxt(sn.ang) : ''); }
function polarAngles() {
  const out = new Set(); const n = Math.round(360 / polar.inc); if (Math.abs(n * polar.inc - 360) < 1e-6) { for (let i = 0; i < n; i++) out.add(+(i * polar.inc).toFixed(6)); } else for (let a = 0; a < 360 - 1e-9; a += polar.inc) out.add(+a.toFixed(6));
  for (const a of polar.extra) { const b = ((a % 360) + 360) % 360; out.add(+b.toFixed(6)); out.add(+((b + 180) % 360).toFixed(6)); }
  return [...out];
}
function polarBase() {
  const T = state.tool; if (!polar.on || !T || !POLAR_TOOLS.has(T.name) || T.phase === 'select' || state.handleDrag) return null;
  if (T.name === 'dist' && T.pts && T.pts.length >= 2) return null; // the next tap starts a new distance
  if ((T.name === 'dimlin' || T.name === 'dimali') && T.pts && T.pts.length >= 2) return null; // placing the dimension line
  return state.lastPt || null;
}
// ----- Object snap tracking: pause on a snap point (holding, or with a mouse over it) to pick it up; lines run through it -----
const otrack = { on: true, polar: false, pause: 500 };
try { const o = JSON.parse(localStorage.getItem('tct-otrack') || 'null'); if (o) { otrack.on = o.on !== false; otrack.polar = !!o.polar; if ([300, 500, 800].includes(o.pause)) otrack.pause = o.pause; } } catch (e) { }
function saveOtrack() { try { localStorage.setItem('tct-otrack', JSON.stringify(otrack)); } catch (e) { } renderOtrackSummary(); }
const ACQ_KINDS = new Set([1, 2, 3, 4, 5, 7, 8, 11]); // real points only
let acqPend = null, acqTimer = 0, acqTipShown = false;
function trackPts() { const T = state.tool; return otrack.on && T && PICK_TOOLS.has(T.name) && T.phase !== 'select' && state.otrack && state.otrack.length ? state.otrack : null; }
function otrackFeed(sn) {
  const T = state.tool; if (!otrack.on || !sn || !ACQ_KINDS.has(sn.kind) || !T || !PICK_TOOLS.has(T.name) || T.phase === 'select') { clearTimeout(acqTimer); acqPend = null; return; }
  if (acqPend && Math.hypot(acqPend.x - sn.x, acqPend.y - sn.y) * state.view.s < 1) return; // still on the same point
  clearTimeout(acqTimer); const p = acqPend = { x: sn.x, y: sn.y };
  acqTimer = setTimeout(() => { if (acqPend === p) acquirePoint(p); }, otrack.pause);
}
function acquirePoint(p) {
  const L = state.otrack || (state.otrack = []); const i = L.findIndex(q => Math.hypot(q[0] - p.x, q[1] - p.y) * state.view.s < 2);
  if (i >= 0) L.splice(i, 1); else { L.push([p.x, p.y]); if (L.length > 4) L.shift(); } // pausing again on a picked-up point drops it
  try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) { }
  if (i < 0 && !acqTipShown) { acqTipShown = true; toast('Point picked up for tracking · move away along a line through it', 2600); }
  if (state.loupe) { const lp = state.loupe; const sn = snapPoint(lp.X, lp.Y, PRECISE_SNAP_PX); lp.sn = sn; state.snapMark = sn.kind ? sn : null; }
  requestFast();
}
function trackAngles() { if (!otrack.polar) return [0, 90]; const out = new Set(); for (const a of polarAngles()) out.add(+(a % 180).toFixed(6)); return [...out]; }
// The polar ray from the last point, and lines through picked-up points: the crossing of two lines wins, then the closest line
// (where it crosses an object near the finger, if it does), else nothing.
function alignSnap(w, base, pts, tol, S) {
  const lines = [];
  if (base) { const dx = w[0] - base[0], dy = w[1] - base[1]; if (Math.hypot(dx, dy) >= tol * 2) for (const a of polarAngles()) { const r = rad(a); const u = [Math.cos(r), Math.sin(r)]; const t = dx * u[0] + dy * u[1]; if (t <= 0) continue; const perp = Math.abs(dy * u[0] - dx * u[1]); if (perp <= tol) lines.push({ o: base, u, ang: a, src: 'polar', perp }); } }
  if (pts) for (const A of pts) { const dx = w[0] - A[0], dy = w[1] - A[1]; for (const a of trackAngles()) { const r = rad(a); let u = [Math.cos(r), Math.sin(r)]; const t = dx * u[0] + dy * u[1]; if (Math.abs(t) < tol * 1.5) continue; const perp = Math.abs(dy * u[0] - dx * u[1]); if (perp <= tol) { let ang = a; if (t < 0) { u = [-u[0], -u[1]]; ang = (a + 180) % 360; } lines.push({ o: A, u, ang, src: 'track', perp }); } } }
  if (!lines.length) return null;
  const pack = (x, y, kind, ls) => ({ x, y, kind, lines: ls.map(l => ({ o: l.o.slice(), ang: l.ang, src: l.src })), base: base ? base.slice() : null, ang: ls[0].ang });
  // two lines: their crossing
  let bx = null, bd = tol * 1.6;
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const L1 = lines[i], L2 = lines[j]; if (L1.o === L2.o) continue;
    const q = lineX([L1.o, [L1.o[0] + L1.u[0], L1.o[1] + L1.u[1]]], [L2.o, [L2.o[0] + L2.u[0], L2.o[1] + L2.u[1]]]); if (!q) continue;
    if (L1.src === 'polar' && (q[0] - L1.o[0]) * L1.u[0] + (q[1] - L1.o[1]) * L1.u[1] <= 0) continue; if (L2.src === 'polar' && (q[0] - L2.o[0]) * L2.u[0] + (q[1] - L2.o[1]) * L2.u[1] <= 0) continue;
    const d = Math.hypot(q[0] - w[0], q[1] - w[1]); if (d < bd) { bd = d; bx = { q, L1, L2 }; }
  }
  if (bx) return pack(bx.q[0], bx.q[1], 15, [bx.L1, bx.L2]);
  // one line: the nearest, onto an object it crosses near the finger if there is one
  lines.sort((a, b) => a.perp - b.perp); const L = lines[0]; const t = (w[0] - L.o[0]) * L.u[0] + (w[1] - L.o[1]) * L.u[1];
  let p = [L.o[0] + L.u[0] * t, L.o[1] + L.u[1] * t], kind = L.src === 'polar' ? 12 : 14;
  if (S) { const q = rayHitObject(L.o, L.u, w, tol, S); if (q) { p = q; kind = L.src === 'polar' ? 13 : 16; } }
  return pack(p[0], p[1], kind, [L]);
}
function rayHitObject(o, u, w, tol, S) {
  const hit = pickAt(w[0], w[1], tol * 1.3, S, true); if (!hit) return null; let best = null, bd = Infinity;
  const take = (q) => { const t = (q[0] - o[0]) * u[0] + (q[1] - o[1]) * u[1]; if (t <= tol * 0.5) return; const d = Math.hypot(q[0] - w[0], q[1] - w[1]); if (d <= tol * 1.3 && d < bd) { bd = d; best = q; } };
  for (const sg of itemSegsNear(hit.item, w[0], w[1], tol * 1.3)) { const q = lineX([o, [o[0] + u[0], o[1] + u[1]]], sg); if (!q) continue; const sx = sg[1][0] - sg[0][0], sy = sg[1][1] - sg[0][1], L2 = sx * sx + sy * sy || 1e-18; const s = ((q[0] - sg[0][0]) * sx + (q[1] - sg[0][1]) * sy) / L2; if (s >= -1e-9 && s <= 1 + 1e-9) take(q); }
  for (const cv of itemCurvesNear(hit.item, w, tol * 1.3)) { const fx = o[0] - cv.c[0], fy = o[1] - cv.c[1]; const bq = fx * u[0] + fy * u[1], cq = fx * fx + fy * fy - cv.r * cv.r, disc = bq * bq - cq; if (disc < 0) continue; for (const t of [-bq - Math.sqrt(disc), -bq + Math.sqrt(disc)]) { const q = [o[0] + u[0] * t, o[1] + u[1] * t]; if (cv.full || angInArc(Math.atan2(q[1] - cv.c[1], q[0] - cv.c[0]), cv.a0, cv.a1, cv.ccw)) take(q); } }
  return best;
}
// after a point is placed (or Done) the tracking lines that led to it go away; the snap mark stays as feedback
function dropTrackLines() { if (state.snapMark && state.snapMark.lines) state.snapMark = Object.assign({}, state.snapMark, { lines: null, kind: state.snapMark.kind >= 12 ? 0 : state.snapMark.kind }); }
function trackStillValid(sn) {
  const pb = polarBase(), tp = trackPts();
  for (const l of sn.lines) { if (l.src === 'polar' && !(pb && Math.abs(pb[0] - l.o[0]) < 1e-9 && Math.abs(pb[1] - l.o[1]) < 1e-9)) return false; if (l.src === 'track' && !(tp && tp.some(p => Math.abs(p[0] - l.o[0]) < 1e-9 && Math.abs(p[1] - l.o[1]) < 1e-9))) return false; }
  return true;
}
// dotted green lines from the polar base / picked-up points through the point, and (without the magnifier) a label
function drawTrack(c, V, sn, label) {
  const P = toScreen(sn.x, sn.y, V); const far = Math.hypot(cssW, cssH) * 2;
  c.save(); c.setLineDash([2, 4]); c.lineWidth = 1.4; c.strokeStyle = '#2fd27a'; c.globalAlpha = 0.95;
  for (const l of sn.lines) { const O = toScreen(l.o[0], l.o[1], V); const r = rad(l.ang); const ux = Math.cos(r), uy = -Math.sin(r); c.beginPath(); if (l.src === 'polar') c.moveTo(O[0], O[1]); else c.moveTo(O[0] - ux * 14, O[1] - uy * 14); const t = Math.max((P[0] - O[0]) * ux + (P[1] - O[1]) * uy, 0); c.lineTo(O[0] + ux * (t + far), O[1] + uy * (t + far)); c.stroke(); }
  c.restore();
  if (!label) return;
  const from = sn.base || sn.lines[0].o; const name = SNAP_NAMES[sn.kind] || 'Tracking';
  drawChip(c, P[0] + 14, P[1] + 22, name + (sn.kind === 15 ? '' : ' ' + angTxt(sn.ang)) + ' · ' + fmtLen(mLen(from, [sn.x, sn.y])), 0, null, 'left');
}
// picked-up points: a small green + while a tool is picking
function drawTrackPts(c, V) {
  const pts = trackPts(); if (!pts) return; c.save(); c.strokeStyle = '#2fd27a'; c.lineWidth = 2; c.setLineDash([]);
  for (const p of pts) { const Q = toScreen(p[0], p[1], V); c.beginPath(); c.moveTo(Q[0] - 6, Q[1]); c.lineTo(Q[0] + 6, Q[1]); c.moveTo(Q[0], Q[1] - 6); c.lineTo(Q[0], Q[1] + 6); c.stroke(); }
  c.restore();
}
function renderOtrackSummary() { const el = $('otrackSummary'); if (el) el.textContent = otrack.on ? 'on · ' + (otrack.polar ? 'polar angles' : 'horizontal and vertical') : 'off'; }
function renderOtrack() {
  $('chkOtrack').checked = otrack.on; $('otrackBody').classList.toggle('disabled', !otrack.on);
  for (const b of $('otrackDir').children) b.setAttribute('aria-pressed', (b.dataset.v === 'polar') === otrack.polar ? 'true' : 'false');
  for (const b of $('otrackPause').children) b.setAttribute('aria-pressed', +b.dataset.v === otrack.pause ? 'true' : 'false');
  renderOtrackSummary();
}
$('miOtrack').addEventListener('click', () => { closeSheets(); renderOtrack(); openSheet('otrackPanel'); });
$('chkOtrack').addEventListener('change', (ev) => { otrack.on = ev.target.checked; if (!otrack.on) state.otrack = []; saveOtrack(); renderOtrack(); requestFast(); });
$('otrackDir').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; otrack.polar = b.dataset.v === 'polar'; saveOtrack(); renderOtrack(); });
$('otrackPause').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; otrack.pause = +b.dataset.v; saveOtrack(); renderOtrack(); });
renderOtrackSummary();
function renderPolarSummary() { const el = $('polarSummary'); if (!el) return; el.textContent = polar.on ? 'on · every ' + angTxt(polar.inc) + (polar.extra.length ? ' + ' + polar.extra.length + ' extra' : '') : 'off'; }
function renderPolar() {
  $('chkPolar').checked = polar.on; $('polarBody').classList.toggle('disabled', !polar.on);
  const inc = $('polarInc'); inc.innerHTML = ''; const steps = POLAR_STEPS.includes(polar.inc) ? POLAR_STEPS : POLAR_STEPS.concat([polar.inc]);
  for (const v of steps) { const b = document.createElement('button'); b.type = 'button'; b.textContent = angTxt(v); b.setAttribute('aria-pressed', v === polar.inc ? 'true' : 'false'); b.addEventListener('click', () => { polar.inc = v; savePolar(); renderPolar(); }); inc.append(b); }
  const ex = $('polarExtra'); ex.innerHTML = '';
  if (!polar.extra.length) { const d = document.createElement('span'); d.className = 'empty'; d.textContent = 'None yet'; ex.append(d); }
  for (const a of polar.extra) { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Remove ' + angTxt(a)); b.innerHTML = '<span></span><span class="x">✕</span>'; b.firstChild.textContent = angTxt(a); b.addEventListener('click', () => { polar.extra = polar.extra.filter(x => x !== a); savePolar(); renderPolar(); }); ex.append(b); }
  renderPolarSummary();
}
const readAng = (v) => { const a = parseFloat(String(v).replace(',', '.').replace('°', '')); return isFinite(a) ? a : NaN; };
$('miPolar').addEventListener('click', () => { closeSheets(); renderPolar(); openSheet('polarPanel'); });
$('chkPolar').addEventListener('change', (ev) => { polar.on = ev.target.checked; savePolar(); renderPolar(); });
$('polarIncSet').addEventListener('click', () => { const a = readAng($('polarIncIn').value); if (!(a >= 0.5 && a <= 180)) { toast('Type a step between 0.5° and 180°'); return; } polar.inc = +a.toFixed(4); $('polarIncIn').value = ''; savePolar(); renderPolar(); toast('Polar every ' + angTxt(polar.inc)); });
$('polarExtraAdd').addEventListener('click', () => { let a = readAng($('polarExtraIn').value); if (!isFinite(a)) { toast('Type an angle, e.g. 37.5'); return; } a = +(((a % 360) + 360) % 360).toFixed(4); if (polar.extra.includes(a)) { toast(angTxt(a) + ' is already there'); return; } if (polar.extra.length >= 12) { toast('Up to 12 extra angles'); return; } polar.extra.push(a); polar.extra.sort((x, y) => x - y); $('polarExtraIn').value = ''; savePolar(); renderPolar(); });
for (const id of ['polarIncIn', 'polarExtraIn']) $(id).addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); $(id === 'polarIncIn' ? 'polarIncSet' : 'polarExtraAdd').click(); } });
renderPolarSummary();

// ===================== Linetype display: annotation scale, paper-sized linetypes in viewports, a per-drawing factor =====================
state.showLw = true; try { state.showLw = localStorage.getItem('tct-lwt') !== '0'; } catch (e) { }
$('chkLw').checked = state.showLw;
$('chkLw').addEventListener('change', (ev) => { state.showLw = ev.target.checked; try { localStorage.setItem('tct-lwt', state.showLw ? '1' : '0'); } catch (e) { } lastFull = null; requestFull(); });
// model: × the annotation scale (MSLTSCALE = 1); viewports with PSLTSCALE = 1: dashes sized in paper units; × the user's factor everywhere
function ltFactor(where, sc) {
  const D = state.drawing; if (!D) return 1; const H = D.header || {}; const um = state.ltMult || 1; const anno = H.msltscale === 0 ? 1 : (H.annoScale || 1);
  if (where === 'vp') return um * (H.psltscale === 0 ? anno : 1 / (sc || 1));
  if (where === 'paper') return um;
  return um * anno;
}
const LT_CHIPS = [0.5, 1, 2, 5, 10, 25, 50, 100];
const multTxt = (v) => '×' + (+v.toFixed(4));
function renderLtSummary() { const el = $('ltSummary'); if (el) el.textContent = (state.ltMult || 1) === 1 ? 'as drawn' : multTxt(state.ltMult) + ' (this drawing)'; }
function renderLt() {
  const D = state.drawing; if (!D) return; const H = D.header || {}; const cur = state.ltMult || 1;
  $('ltInfo').textContent = 'The drawing’s own scale: LTSCALE ' + (+((H.ltscale || 1).toFixed(4))) + (H.annoScale && H.annoScale !== 1 ? ' · annotation scale ' + (H.annoName || ('1:' + H.annoScale)) + ' (applied in Model)' : '') + ' · layouts size dashes on the paper.';
  const w = $('ltChips'); w.innerHTML = ''; const chips = LT_CHIPS.includes(cur) ? LT_CHIPS : LT_CHIPS.concat([cur]).sort((a, b) => a - b);
  for (const v of chips) { const b = document.createElement('button'); b.type = 'button'; b.textContent = v === 1 ? '×1 as drawn' : multTxt(v); b.setAttribute('aria-pressed', v === cur ? 'true' : 'false'); b.addEventListener('click', () => setLtMult(v)); w.append(b); }
  renderLtSummary();
}
function setLtMult(v) { state.ltMult = v; renderLt(); lastFull = null; requestFull(); }
$('miLtscale').addEventListener('click', () => { closeSheets(); if (!state.drawing) return; renderLt(); openSheet('ltPanel'); });
$('ltSet').addEventListener('click', () => { const v = parseFloat(String($('ltIn').value).replace(',', '.')); if (!(v > 0 && v <= 100000)) { toast('Type a factor such as 40 or 0.5'); return; } $('ltIn').value = ''; setLtMult(+v.toFixed(4)); });
$('ltIn').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); $('ltSet').click(); } });
// Properties: say so when the selected object's dashes are too small to see at this zoom
function ltTooSmallHint(sel) {
  const D = state.drawing; const sp = curSpace(); if (!D || !sp) return null;
  for (const e of sel) {
    const lt = resolveLt(e, { lt: '' }, e.L || '0'); const pat = lt && D.ltypes[lt]; if (!pat || !pat.length) continue;
    let per = 0; for (const v of pat) per += Math.abs(v); per *= (D.header.ltscale || 1) * (e.lts || 1) * ltFactor(sp.paper ? 'paper' : 'model') * state.view.s;
    if (per < 3) return 'Dashes too small to see at this zoom (one repeat ≈ ' + (per < 0.1 ? per.toFixed(2) : per.toFixed(1)) + ' px). Zoom in, raise this, or use Menu → Linetype scale.';
    return null;
  }
  return null;
}

// ===================== Point style (PDMODE / PDSIZE): shared by every point in the drawing =====================
// Mode: 0 dot, 1 nothing, 2 +, 3 ×, 4 tick; +32 circle, +64 square. Size: negative = % of the screen (or page) height,
// positive = drawing units, 0 = 5 %. Drawings that don't set one (0 / 0) show × in a circle at 2 % (Surya's choice).
function ptStyle() { const H = state.drawing ? state.drawing.header : {}; let mode = (H && H.pdmode) | 0, size = H && +H.pdsize || 0; if (!(H && H.ptSet) && mode === 0 && size === 0) { mode = 35; size = -2; } return { mode, size }; }
function ptSizePx(st, V) { const s = st.size; if (s > 0) return Math.max(2, s * V.s); return Math.max(4, cssH * (s < 0 ? -s : 5) / 100); }
function drawPointMark(c, X, Y, mode, S, col) {
  const h = S / 2, base = mode % 32, circ = (mode & 32) !== 0, sq = (mode & 64) !== 0; const x = circ ? h * 0.72 : h;
  c.save(); c.setLineDash([]); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.2; c.beginPath();
  if (base === 0) { c.moveTo(X + 1.3, Y); c.arc(X, Y, 1.3, 0, TAU); c.fill(); c.beginPath(); }
  else if (base === 2) { c.moveTo(X - h, Y); c.lineTo(X + h, Y); c.moveTo(X, Y - h); c.lineTo(X, Y + h); }
  else if (base === 3) { c.moveTo(X - x, Y - x); c.lineTo(X + x, Y + x); c.moveTo(X - x, Y + x); c.lineTo(X + x, Y - x); }
  else if (base === 4) { c.moveTo(X, Y); c.lineTo(X, Y - h); }
  if (circ) { c.moveTo(X + h, Y); c.arc(X, Y, h, 0, TAU); }
  if (sq) c.rect(X - h, Y - h, S, S);
  c.stroke(); c.restore();
}
function openPointStyle() { if (!state.drawing) return; renderPointStyle(); openSheet('ptPanel'); }
function renderPointStyle() {
  const st = ptStyle(); const g = $('ptGrid'); g.innerHTML = ''; const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#fff';
  for (const enc of [0, 32, 64, 96]) for (const b of [0, 1, 2, 3, 4]) {
    const m = b + enc; const btn = document.createElement('button'); btn.type = 'button'; btn.setAttribute('aria-pressed', m === st.mode ? 'true' : 'false'); btn.title = 'Style ' + m;
    const cvs = document.createElement('canvas'); const d = state.dpr; cvs.width = 36 * d; cvs.height = 36 * d; const c2 = cvs.getContext('2d'); c2.scale(d, d); drawPointMark(c2, 18, 18, m, 20, fg); btn.append(cvs);
    btn.addEventListener('click', () => { setPointStyle(m, st.size); }); g.append(btn);
  }
  const rel = st.size <= 0; for (const b of $('ptMode').children) b.setAttribute('aria-pressed', (b.dataset.v === 'rel') === rel ? 'true' : 'false');
  $('ptSize').value = rel ? String(st.size < 0 ? -st.size : 5) : String(+st.size.toFixed(4)); $('ptUnit').textContent = rel ? '% of screen height' : (UNIT_NAME[state.drawing.header.units] || 'drawing units');
  $('ptNote').textContent = rel ? 'Relative: points keep the same size on screen when you zoom; in a PDF they are that share of the page height.' : 'Absolute: points are a real size in the drawing, grow and shrink with zoom, and print at that size.';
}
function setPointStyle(mode, size) { const H = state.drawing.header; H.pdmode = mode; H.pdsize = size; H.ptSet = true; const was = state.dirty; state.dirty = true; if (!was) renderTabs(); renderPointStyle(); lastFull = null; requestFull(); }
$('ptMode').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; const st = ptStyle(); const rel = b.dataset.v === 'rel'; if (rel === (st.size <= 0)) return; if (rel) setPointStyle(st.mode, -2); else { const px = ptSizePx(st, state.view); setPointStyle(st.mode, +mkSize(px).toFixed(4)); } });
$('ptSet').addEventListener('click', () => { const v = parseFloat(String($('ptSize').value).replace(',', '.')); const st = ptStyle(); if (!(v > 0)) { toast('Type a size above 0'); return; } setPointStyle(st.mode, st.size <= 0 ? -Math.min(v, 50) : v); });
$('ptSize').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); $('ptSet').click(); } });
$('btnPtStyle').addEventListener('click', openPointStyle);

// ===================== Current colour / lineweight / linetype for new objects (AutoCAD CECOLOR / CELWEIGHT / CELTYPE) =====================
// Three floating buttons above Extents / Full screen while a Draw tool runs; the choice is kept per drawing (ByLayer to start).
const DRAW_PROP_TOOLS = new Set(['line', 'pline', 'rect', 'circle', 'arc', 'ellipse', 'spline', 'point', 'text', 'leader', 'sketch', 'revcloud', 'divide']);
const CUR_COLORS = [256, 1, 2, 3, 4, 5, 6, 7, 8, 9, 250, 251, 252, 253, 254];
const CUR_LWS = [-1, -3, 9, 13, 18, 25, 35, 50, 70, 100, 140, 200];
// standard linetypes added to a drawing when first used (acadiso.lin, in mm; scaled for other units)
const STD_LTS = { DASHED: [12.7, -6.35], HIDDEN: [6.35, -3.175], CENTER: [31.75, -6.35, 6.35, -6.35], DASHDOT: [12.7, -6.35, 0, -6.35], PHANTOM: [31.75, -6.35, 6.35, -6.35, 6.35, -6.35] };
const curOf = () => state.cur || (state.cur = { c: 256, lw: -1, lt: '' });
function applyCurProps(list) {
  const T = state.tool; if (!T || !DRAW_PROP_TOOLS.has(T.name) || !state.drawing) return; const cu = curOf();
  for (const e of list) { if (e.dim || e.mk) continue; if (e.c === 256 && cu.c !== 256) e.c = cu.c; if (cu.lw !== -1 && e.lw == null) e.lw = cu.lw; if (cu.lt && !e.lt) e.lt = cu.lt; }
}
const lwTxt = (v) => v === -1 ? 'ByLayer' : v === -3 ? 'Default' : (v / 100).toFixed(2) + ' mm';
function ltPattern(name) { const D = state.drawing; return (D && D.ltypes[name]) || STD_LTS[name] || null; }
function dashSvg(pat, w, sw) { // a dash sample of a pattern, sized to fit
  w = w || 96; const y = 7; if (!pat || !pat.length) return '<svg viewBox="0 0 ' + w + ' 14"><path d="M2 ' + y + 'H' + (w - 2) + '" stroke="currentColor" stroke-width="' + (sw || 1.6) + '"/></svg>';
  let per = 0; for (const v of pat) per += Math.abs(v); const k = (w - 4) / 3 / (per || 1); let x = 2, d = ''; let i = 0;
  while (x < w - 2 && i < 200) { const v = pat[i % pat.length]; const L = Math.abs(v) * k; if (v > 0) d += 'M' + x.toFixed(1) + ' ' + y + 'H' + Math.min(w - 2, x + L).toFixed(1); else if (v === 0) d += 'M' + x.toFixed(1) + ' ' + y + 'h0.01'; x += Math.max(L, v === 0 ? 0 : 0.5); i++; }
  return '<svg viewBox="0 0 ' + w + ' 14"><path d="' + d + '" stroke="currentColor" stroke-width="' + (sw || 1.6) + '" stroke-linecap="round" fill="none"/></svg>';
}
function renderCurBtns() {
  const T = state.tool; const show = !!(state.drawing && !atHome() && T && DRAW_PROP_TOOLS.has(T.name)); $('curBtns').hidden = !show; if (!show) { closeCurPop(); return; }
  const cu = curOf(); const col = cu.c === 256 ? null : aciCss(cu.c, false, true);
  $('curC').innerHTML = '<svg viewBox="0 0 26 26"><circle cx="13" cy="12" r="8" fill="' + (col || 'none') + '" stroke="currentColor" stroke-width="1.4" ' + (col ? '' : 'stroke-dasharray="2.5 2"') + '/></svg><small>' + (cu.c === 256 ? 'Layer' : cu.c) + '</small>';
  const sw = cu.lw > 0 ? Math.max(1, Math.min(6, cu.lw / 25)) : 1.4;
  $('curW').innerHTML = '<svg viewBox="0 0 26 26"><path d="M4 12H22" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round"/></svg><small>' + (cu.lw === -1 ? 'Layer' : cu.lw === -3 ? 'Def' : (cu.lw / 100).toFixed(2)) + '</small>';
  $('curT').innerHTML = '<svg viewBox="0 0 26 26">' + dashSvg(cu.lt ? ltPattern(cu.lt) : null, 22, 1.6).replace(/^<svg[^>]*>/, '<g transform="translate(2 5)">').replace('</svg>', '</g>') + '</svg><small>' + (cu.lt ? cu.lt.slice(0, 6) : 'Layer') + '</small>';
}
function closeCurPop() { $('curPop').hidden = true; $('curScrim').hidden = true; }
function openCurPop(kind) {
  const cu = curOf(); const body = $('curPopBody'); body.innerHTML = ''; $('curPop').hidden = false; $('curScrim').hidden = false;
  const done = () => { closeCurPop(); renderCurBtns(); };
  if (kind === 'c') {
    $('curPopTtl').textContent = 'Colour for new objects'; const w = document.createElement('div'); w.className = 'cp-sw';
    for (const v of CUR_COLORS) { const b = document.createElement('button'); b.type = 'button'; if (v === 256) b.textContent = 'Layer'; else { b.style.background = aciCss(v, false, true); b.title = 'Colour ' + v; } b.setAttribute('aria-pressed', cu.c === v ? 'true' : 'false'); b.addEventListener('click', () => { cu.c = v; done(); }); w.append(b); }
    const r = document.createElement('div'); r.className = 'cp-row'; const inp = document.createElement('input'); inp.inputMode = 'numeric'; inp.placeholder = 'Colour number 1–255'; const ok = document.createElement('button'); ok.className = 'btn'; ok.textContent = 'Use';
    ok.addEventListener('click', () => { const v = parseInt(inp.value, 10); if (!(v >= 1 && v <= 255)) { toast('Type a colour number 1–255'); return; } cu.c = v; done(); }); r.append(inp, ok); body.append(w, r);
  } else if (kind === 'w') {
    $('curPopTtl').textContent = 'Line thickness for new objects'; const l = document.createElement('div'); l.className = 'cp-list';
    for (const v of CUR_LWS) { const b = document.createElement('button'); b.type = 'button'; const sw = v > 0 ? Math.max(1, Math.min(8, v / 25)) : 1.2; b.innerHTML = '<svg viewBox="0 0 96 14"><path d="M2 7H94" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round"/></svg><span></span>'; b.querySelector('span').textContent = lwTxt(v); b.setAttribute('aria-pressed', cu.lw === v ? 'true' : 'false'); b.addEventListener('click', () => { cu.lw = v; done(); if (v > 25 && !state.showLw) toast('Menu → Show lineweights shows thickness on screen'); }); l.append(b); }
    body.append(l);
  } else {
    $('curPopTtl').textContent = 'Line type for new objects'; const l = document.createElement('div'); l.className = 'cp-list'; const D = state.drawing;
    const names = ['', 'Continuous']; for (const n of Object.keys(D.ltypes || {})) if (!/^(bylayer|byblock|continuous)$/i.test(n) && (D.ltypes[n] || []).length && !names.includes(n)) names.push(n); for (const n of Object.keys(STD_LTS)) if (!names.some(x => x.toUpperCase() === n)) names.push(n);
    for (const n of names) { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = dashSvg(n ? ltPattern(n) : null) + '<span></span>'; b.querySelector('span').textContent = n || 'ByLayer'; b.setAttribute('aria-pressed', cu.lt === n ? 'true' : 'false'); b.addEventListener('click', () => { if (n && !D.ltypes[n] && STD_LTS[n]) { const toM = UNIT_TO_M[D.header.units] || 0.001; D.ltypes[n] = STD_LTS[n].map(v => v * 0.001 / toM); const was = state.dirty; state.dirty = true; if (!was) renderTabs(); } cu.lt = n; done(); }); l.append(b); }
    body.append(l);
  }
}
$('curC').addEventListener('click', () => openCurPop('c')); $('curW').addEventListener('click', () => openCurPop('w')); $('curT').addEventListener('click', () => openCurPop('t'));
$('curScrim').addEventListener('click', closeCurPop);

// ===================== New drawing (Home tab) =====================
function nextDrawingName() { let i = 1; const taken = (n) => docs.some(d => docTitle(d) === n); while (taken('Drawing ' + i)) i++; return 'Drawing ' + i; }
let ndUnits = 4;
$('btnNew').addEventListener('click', () => { if (!canOpenAnother()) return; $('ndName').value = nextDrawingName(); for (const b of $('ndUnits').children) b.setAttribute('aria-pressed', +b.dataset.v === ndUnits ? 'true' : 'false'); $('newDlg').classList.add('on'); setTimeout(() => { $('ndName').focus(); $('ndName').select(); }, 50); });
$('ndUnits').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; ndUnits = +b.dataset.v; for (const x of $('ndUnits').children) x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
$('ndCancel').addEventListener('click', () => $('newDlg').classList.remove('on'));
$('ndName').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); $('ndOk').click(); } });
$('ndOk').addEventListener('click', () => {
  const name = ($('ndName').value || '').trim() || nextDrawingName(); $('newDlg').classList.remove('on');
  const toM = UNIT_TO_M[ndUnits] || 0.001; const W = 12 / toM, H = 8 / toM; // a 12 × 8 m area to start
  const D = { name, layers: [{ name: '0', aci: 7, off: false, frozen: false, locked: false, lw: -3, lt: 'Continuous' }], ltypes: {}, blocks: {}, spaces: [{ name: 'Model', paper: false, ents: [] }], header: { units: ndUnits, extmin: [0, 0], extmax: [W, H], ltscale: 1, clayer: '0', luprec: 2, textsize: 2.5, pdmode: 0, pdsize: 0, psltscale: 1 }, skipped: {}, nextId: 1 };
  loadDrawing(D, name, { fileName: name, kind: 'new', bytes: null }); toast('New drawing · ' + (UNIT_NAME[ndUnits] || '') + ' · draw from the bottom bar');
});

// ===================== Copy and paste between drawings (AutoCAD COPYCLIP / COPYBASE / PASTECLIP / PASTEORIG) =====================
// The clipboard holds copies of the objects, the blocks, layers and linetypes they use, the source units and the base point.
const clip = { ents: [], blocks: {}, layers: [], ltypes: {}, units: 0, base: [0, 0], src: '', preview: [] };
function clipCopy(base) {
  const D = state.drawing; const sel = selectedEnts(); if (!D || !sel.length) { toast('Select objects first'); return; }
  const S = getScene(state.spaceIdx); const bb = emptyBox(); const preview = []; let npts = 0;
  for (const it of S.items) { if (!state.selection.has(it.ent.id)) continue; bboxAdd(bb, it.bbox[0], it.bbox[1]); bboxAdd(bb, it.bbox[2], it.bbox[3]);
    if (npts < 40000) { for (const p of it.polys) { preview.push(p.slice()); npts += p.length; } if (it.inst) for (const ins of it.inst) for (const p of ins.g.polys) { if (npts > 40000) break; const q = []; for (let i = 0; i < p.length; i += 2) { const w = mApply(ins.M, [p[i], p[i + 1]]); q.push(w[0], w[1]); } preview.push(q); npts += q.length; } } }
  const b = base || [bb[0], bb[1]];
  const names = blockNamesDeep(sel.filter(e => e.t === 'INSERT').map(e => e.n)); const blocks = {}; for (const n of names) if (D.blocks[n]) blocks[n] = structuredClone(D.blocks[n]);
  const usedL = new Set(sel.map(e => e.L || '0')); const usedT = new Set(sel.map(e => e.lt).filter(Boolean));
  for (const n of names) for (const e of (D.blocks[n] ? D.blocks[n].ents : [])) { if (e.L && e.L !== '0') usedL.add(e.L); if (e.lt) usedT.add(e.lt); }
  const layers = D.layers.filter(l => usedL.has(l.name)).map(l => structuredClone(l)); for (const l of layers) if (l.lt) usedT.add(l.lt);
  const ltypes = {}; for (const t of usedT) if (D.ltypes[t]) ltypes[t] = D.ltypes[t].slice();
  Object.assign(clip, { ents: sel.map(e => structuredClone(e)), blocks, layers, ltypes, units: D.header.units || 0, base: b.slice(), src: docTitle(activeDoc).replace(/\.(dwg|dxf)$/i, ''), preview: preview.map(p => { const q = []; for (let i = 0; i < p.length; i += 2) q.push(p[i] - b[0], p[i + 1] - b[1]); return q; }) });
  toast(sel.length + ' object' + (sel.length === 1 ? '' : 's') + ' copied · in another tab: Edit → Paste', 3200);
}
function clipScale() { const D = state.drawing; const a = clip.units, b = D.header.units; if (!a || !b || a === b || !UNIT_TO_M[a] || !UNIT_TO_M[b]) return 1; return UNIT_TO_M[a] / UNIT_TO_M[b]; }
function drawClipPreview(c, V, at, col) {
  const k = clipScale(); c.save(); c.strokeStyle = col; c.globalAlpha = 0.75; c.lineWidth = 1.2; c.setLineDash([]); c.beginPath();
  for (const p of clip.preview) { for (let i = 0; i < p.length; i += 2) { const q = toScreen(at[0] + p[i] * k, at[1] + p[i + 1] * k, V); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } }
  c.stroke(); c.restore();
}
function clipPaste(at) {
  const D = state.drawing; if (!D || !clip.ents.length) return; const k = clipScale();
  const M = at ? mMul(mTranslate(at[0], at[1]), mMul(mScale(k, k), mTranslate(-clip.base[0], -clip.base[1]))) : mScale(k, k);
  let kept = 0, addedL = 0;
  for (const [n, b] of Object.entries(clip.blocks)) { if (D.blocks[n]) { if (!/^TC_(DIM|MK)_/.test(n)) kept++; continue; } const nb = structuredClone(b); for (const e of nb.ents) e.id = nextId(); D.blocks[n] = nb; }
  for (const l of clip.layers) if (!state.layerMap.has(l.name)) { const nl = structuredClone(l); D.layers.push(nl); state.layerMap.set(nl.name, nl); state.layerVis.set(nl.name, !(nl.off || nl.frozen)); addedL++; }
  for (const [t, pat] of Object.entries(clip.ltypes)) if (!D.ltypes[t]) D.ltypes[t] = pat.map(v => v * k);
  const list = clip.ents.map(e => { const c = structuredClone(e); c.hd = ''; return transformEntity(c, M); });
  addEntities(list); state.selection.clear(); for (const e of list) state.selection.add(e.id); if (addedL) renderLayers();
  toast('Pasted ' + list.length + ' object' + (list.length === 1 ? '' : 's') + (at ? '' : ' at the same coordinates') + (k !== 1 ? ' · scaled from ' + (UNIT_NAME[clip.units] || '') + ' to ' + (UNIT_NAME[D.header.units] || '') : '') + (kept ? ' · kept this drawing’s version of ' + kept + ' block' + (kept === 1 ? '' : 's') : '') + (addedL ? ' · ' + addedL + ' layer' + (addedL === 1 ? '' : 's') + ' added' : ''), 3600);
  startTool('select', true); showSelection(); requestFull();
}

// ===================== Files shared into the app (Android share sheet → Tesseract CAD) =====================
// The service worker parks the shared file(s) in the 'share-inbox' cache and opens ./?app=1&share=N; we open the first drawing.
function sniffCad(buf) { const b = new Uint8Array(buf, 0, Math.min(buf.byteLength, 2048)); const head = String.fromCharCode.apply(null, b.subarray(0, 4)); if (head === 'AC10') return 'dwg'; const txt = String.fromCharCode.apply(null, b); if (/AutoCAD Binary DXF/.test(txt) || /^\s*0\s*[\r\n]+\s*SECTION/.test(txt) || /^\s*999[\r\n]/.test(txt)) return 'dxf'; return null; }
async function takeSharedFiles() {
  let q; try { q = new URLSearchParams(location.search); } catch (e) { return; } if (!q.has('share')) return;
  const n = q.get('share'); try { q.delete('share'); history.replaceState(history.state, '', location.pathname + (q.toString() ? '?' + q : '')); } catch (e) { }
  if (n === 'err') { toast('The shared file could not be read. Try Open DWG / DXF instead.', 5000); return; }
  if (!('caches' in window)) return;
  let c, keys; try { c = await caches.open('share-inbox'); keys = await c.keys(); } catch (e) { return; }
  keys.sort((a, b) => a.url.localeCompare(b.url, undefined, { numeric: true }));
  const got = []; for (const k of keys) { try { const r = await c.match(k); if (r) got.push({ name: decodeURIComponent(r.headers.get('X-Name') || ''), buf: await r.arrayBuffer() }); } catch (e) { } try { await c.delete(k); } catch (e) { } }
  if (!got.length) return;
  let pick = null, skipped = 0;
  for (const g of got) { const kind = /\.dxf$/i.test(g.name) ? 'dxf' : /\.dwg$/i.test(g.name) ? 'dwg' : sniffCad(g.buf); if (!kind) { skipped++; continue; } if (!pick) { pick = g; if (!/\.(dwg|dxf)$/i.test(g.name)) g.name = (g.name || 'Shared drawing').replace(/\.[^.]*$/, '') + '.' + kind; } else skipped++; }
  if (!pick) { toast('That file is not a DWG or DXF drawing' + (got[0].name ? ' (' + got[0].name + ')' : '') + '.', 5000); return; }
  if (pick.buf.byteLength > 120 * 1024 * 1024) { toast('That file is over 120 MB; try a smaller DWG.', 4000); return; }
  if (skipped) toast('Opening ' + pick.name + ' · one drawing at a time, the other ' + (skipped === 1 ? 'file was' : skipped + ' files were') + ' skipped', 4500);
  const open = findOpenDoc(pick.name); if (open) { switchDoc(open); return; } if (!canOpenAnother()) return;
  parseFile(pick.buf, pick.name);
}

// ===================== Start-up (runs once every part has loaded) =====================
renderRecent(); resizeCanvas();
// Start on the Home tab with nothing open; drawings open in their own tabs.
showHomeTitle(); setHome(true); renderTabs(); updateChrome();
takeSharedFiles();
