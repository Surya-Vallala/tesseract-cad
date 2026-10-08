
// ===================== Snap points sheet =====================
// Marker icons for the list (same shapes as the on-drawing markers)
const SNAP_ICON = {
  1: '<rect x="5" y="5" width="14" height="14"/>', 2: '<path d="M12 4.5 20.5 19h-17z"/>', 3: '<circle cx="12" cy="12" r="7.5"/>',
  11: '<circle cx="12" cy="12" r="7.5"/><path d="M8 12h8M12 8v8"/>', 7: '<path d="M12 3.5 20.5 12 12 20.5 3.5 12z"/>', 5: '<path d="M5 5l14 14M5 19 19 5"/>',
  9: '<path d="M5 4v15h15M5 11.5h7.5V19"/>', 10: '<circle cx="12" cy="14" r="5.5"/><path d="M3 8.5h18"/>', 4: '<rect x="5" y="5" width="14" height="14"/><path d="M5 12h14M12 5v14"/>',
  8: '<circle cx="12" cy="12" r="7.5"/><path d="M7.5 7.5l9 9M7.5 16.5l9-9"/>', 6: '<path d="M5 5h14L5 19h14z"/>'
};
try { if (localStorage.getItem('tct-snap') === '0') { state.snapOn = false; $('chkSnap').checked = false; } } catch (e) { }
function renderSnapSummary() { const n = SNAP_ORDER.filter(k => snapOn[k]).length; $('snapSummary').textContent = !state.snapOn ? 'off' : n === SNAP_ORDER.length ? 'all on' : n === 0 ? 'none on' : n + ' of ' + SNAP_ORDER.length + ' on'; }
function renderSnapList() {
  const list = $('snapList'); list.innerHTML = ''; $('chkSnap').checked = state.snapOn; list.classList.toggle('disabled', !state.snapOn);
  for (const k of SNAP_ORDER) {
    const row = document.createElement('label'); row.className = 'snaprow' + (snapOn[k] ? '' : ' off');
    row.innerHTML = '<svg viewBox="0 0 24 24">' + SNAP_ICON[k] + '</svg><span class="nm">' + SNAP_NAMES[k] + '<small>' + SNAP_HELP[k] + '</small></span><input type="checkbox"' + (snapOn[k] ? ' checked' : '') + '>';
    row.querySelector('input').addEventListener('change', (ev) => { snapOn[k] = ev.target.checked; row.classList.toggle('off', !snapOn[k]); saveSnapKinds(); renderSnapSummary(); });
    list.appendChild(row);
  }
  renderSnapSummary();
}
$('snapAll').addEventListener('click', () => { for (const k of SNAP_ORDER) snapOn[k] = true; saveSnapKinds(); renderSnapList(); });
$('snapNone').addEventListener('click', () => { for (const k of SNAP_ORDER) snapOn[k] = false; saveSnapKinds(); renderSnapList(); });
renderSnapSummary();

// ===================== Share: PDF, DWG, DXF, PNG =====================
const fmtSize = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const fileBase = () => baseName(state.fileName || 'drawing').replace(/\.(dwg|dxf)$/i, '').trim() || 'drawing';
const spaceSlug = () => (curSpace() ? curSpace().name : 'Model').replace(/[^\w-]+/g, '_');
const isEditedDoc = () => !!(state.dirty || String(state.fileName || '').endsWith(EDIT_SUFFIX));
function openShare() {
  if (!state.drawing) return;
  const hasDwg = state.kind === 'dwg' && !!state.fileBytes && !state.drawing.sample;
  $('shDwg').disabled = !hasDwg;
  $('shDwgHint').textContent = state.drawing.sample ? 'not available for the sample' : state.kind === 'new' ? 'not available for a new drawing: share a DXF' : !hasDwg ? 'not available: this drawing was opened from a DXF' : isEditedDoc() ? 'the original file as opened: your edits are not in it' : 'the original file as it was opened';
  openSheet('sharePanel');
}
// The file is made first, then shared from a button, because Android only allows sharing straight after a tap.
let readyFile = null;
function showFileReady(name, blob, type, note, detail) {
  const file = new File([blob], name, { type }); readyFile = file;
  let canShare = false; try { canShare = !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { canShare = false; }
  $('fileTitle').textContent = name;
  $('fileMsg').textContent = (detail ? detail + ' · ' : '') + fmtSize(blob.size);
  $('fileNote').textContent = note || (canShare ? '' : 'Android lets web apps share only PDFs and pictures directly. Save this file, then share it from Files, WhatsApp or Gmail (attach it as a document).');
  $('fileShare').hidden = !canShare; $('fileSave').className = canShare ? 'btn' : 'btn primary';
  $('fileDlg').classList.add('on');
}
function closeFileDlg() { $('fileDlg').classList.remove('on'); readyFile = null; }
$('fileClose').addEventListener('click', closeFileDlg);
$('fileSave').addEventListener('click', async () => { const f = readyFile; if (!f) return; if (await saveFile(f.name, f)) closeFileDlg(); });
$('fileShare').addEventListener('click', async () => {
  const f = readyFile; if (!f) return;
  try { await navigator.share({ files: [f], title: f.name }); closeFileDlg(); }
  catch (e) { if (e && e.name === 'AbortError') return; toast('Could not share (' + (e && e.message || e) + '). Use Save to phone instead.', 5000); }
});
$('shDwg').addEventListener('click', () => {
  if (!state.fileBytes) return; closeSheets();
  showFileReady(fileBase() + '.dwg', new Blob([state.fileBytes]), 'application/acad', isEditedDoc() ? 'This is the original DWG as you opened it. Your edits are not in it: share a DXF or PDF to include them.' : '', 'DWG');
});
$('shDxf').addEventListener('click', async () => {
  closeSheets(); showLoading(true, 'Building DXF…', 40); await new Promise(r => setTimeout(r, 30));
  try {
    const { text, skipped } = buildDxf(state.drawing); const sk = Object.entries(skipped).map(([k, v]) => k + ' ×' + v).join(', ');
    showLoading(false);
    showFileReady(fileBase() + (isEditedDoc() ? '-edited' : '') + '.dxf', new Blob([text], { type: 'application/dxf' }), 'application/dxf', sk ? 'Not included: ' + sk + '. ' : '', 'DXF · model space and blocks');
    if (sk) $('fileNote').textContent += ' Android lets web apps share only PDFs and pictures directly: save the file, then share it from Files.';
  } catch (e) { showLoading(false); toast('Could not build the DXF: ' + (e.message || e), 6000); }
});
$('shPng').addEventListener('click', async () => {
  closeSheets(); renderFull();
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  if (blob) showFileReady(fileBase() + '-' + spaceSlug() + '.png', blob, 'image/png', '', 'Image of the screen');
});
$('shPdf').addEventListener('click', () => { closeSheets(); openPdfPanel(); });

// ===================== PDF options =====================
const PAPER_MM = { A4: [297, 210], A3: [420, 297], A2: [594, 420], A1: [841, 594], A0: [1189, 841], Letter: [279.4, 215.9], Tabloid: [431.8, 279.4] }; // landscape
const UNIT_MM = { 1: 25.4, 2: 304.8, 4: 1, 5: 10, 6: 1000, 8: 0.0000254, 9: 0.0254, 10: 914.4, 14: 100 };
const PDF_MAX_PX = 24e6; // image PDFs: largest picture a phone can draw comfortably
const pdfOpts = { area: null, paper: 'A3', orient: 'auto', scale: 'fit', color: 'color', lw: true, alpha: true, qual: 'vector', win: null, winKey: '' };
try { const o = JSON.parse(localStorage.getItem('tct-pdf') || '{}'); for (const k of ['paper', 'orient', 'color', 'lw', 'alpha', 'qual']) if (o[k] != null) pdfOpts[k] = o[k]; } catch (e) { }
function savePdfOpts() { try { localStorage.setItem('tct-pdf', JSON.stringify({ paper: pdfOpts.paper, orient: pdfOpts.orient, color: pdfOpts.color, lw: pdfOpts.lw, alpha: pdfOpts.alpha, qual: pdfOpts.qual })); } catch (e) { } }
const pdfKey = () => (activeDoc ? activeDoc.id : 0) + ':' + state.spaceIdx;
function hasSheet() { const sp = curSpace(); return !!(sp && sp.paper && sp.limits && sp.limits[1][0] > sp.limits[0][0] && sp.limits[1][1] > sp.limits[0][1]); }
function spaceExtents() {
  const sp = curSpace(); const S = getScene(state.spaceIdx); let bb = S.bbox;
  if (hasSheet()) { const L = sp.limits; bb = boxOk(S.bbox) ? [Math.min(L[0][0], bb[0]), Math.min(L[0][1], bb[1]), Math.max(L[1][0], bb[2]), Math.max(L[1][1], bb[3])] : [L[0][0], L[0][1], L[1][0], L[1][1]]; }
  return boxOk(bb) ? bb : [0, 0, 1, 1];
}
// millimetres per drawing unit (sheets of a layout are in paper mm, or inches in imperial drawings)
function spaceMm() { const u = state.drawing.header.units; if (curSpace().paper) return (u === 1 || u === 2) ? 25.4 : 1; return UNIT_MM[u] || 1; }
function pdfAreaRect() {
  const a = pdfOpts.area;
  if (a === 'window' && pdfOpts.win && pdfOpts.winKey === pdfKey()) return pdfOpts.win.slice();
  if (a === 'sheet' && hasSheet()) { const L = curSpace().limits; return [L[0][0], L[0][1], L[1][0], L[1][1]]; }
  if (a === 'extents') return spaceExtents();
  return worldRect(state.view);
}
function pdfPlan() {
  const A = pdfAreaRect(); const aw = Math.max(A[2] - A[0], 1e-9), ah = Math.max(A[3] - A[1], 1e-9);
  const P = PAPER_MM[pdfOpts.paper] || PAPER_MM.A3; const mmU = spaceMm();
  const land = pdfOpts.orient === 'auto' ? aw >= ah : pdfOpts.orient === 'landscape';
  const pw = land ? P[0] : P[1], ph = land ? P[1] : P[0]; const M = pdfOpts.area === 'sheet' ? 0 : Math.min(pw, ph) <= 216 ? 7 : 10; // margin (mm); a layout sheet is the paper itself
  const iw = pw - 2 * M, ih = ph - 2 * M; const fit = Math.min(iw / aw, ih / ah);
  const k = pdfOpts.scale === 'fit' ? fit : mmU / Number(pdfOpts.scale); // paper mm per drawing unit
  const ratio = mmU / k;
  return { A, aw, ah, pw, ph, M, iw, ih, k, ratio, land, mmU, usedW: aw * k, usedH: ah * k, fits: aw * k <= iw + 0.05 && ah * k <= ih + 0.05 };
}
const ratioText = (r) => r >= 1 ? '1:' + (r >= 10 ? Math.round(r) : +r.toFixed(2)) : +(1 / r).toFixed(2) + ':1';
const mmText = (v) => v >= 100 ? Math.round(v) : +v.toFixed(1);
function pdfDpi(plan) { const want = Number(pdfOpts.qual) || 150; const px = (plan.pw / 25.4) * (plan.ph / 25.4); const cap = Math.sqrt(PDF_MAX_PX / px); return Math.max(72, Math.min(want, Math.floor(cap), Math.floor(16000 / (Math.max(plan.pw, plan.ph) / 25.4)))); }
// The standard paper that matches a layout's sheet size, if any
function sheetPaper() { if (!hasSheet()) return null; const L = curSpace().limits; const k = spaceMm(); const a = Math.max(L[1][0] - L[0][0], L[1][1] - L[0][1]) * k, b = Math.min(L[1][0] - L[0][0], L[1][1] - L[0][1]) * k; for (const [n, [pa, pb]] of Object.entries(PAPER_MM)) if (Math.abs(a - pa) / pa < 0.02 && Math.abs(b - pb) / pb < 0.02) return n; return null; }
function useSheetPaper() { const n = sheetPaper(); if (n) { pdfOpts.paper = n; pdfOpts.scale = 'fit'; $('pdfPaper').value = n; $('pdfScale').value = 'fit'; } }
function setSeg(id, v) { for (const b of $(id).children) b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'); }
function openPdfPanel() {
  if (!state.drawing) return;
  if (!pdfOpts.area || (pdfOpts.area === 'sheet' && !hasSheet()) || (pdfOpts.area === 'window' && pdfOpts.winKey !== pdfKey())) pdfOpts.area = hasSheet() ? 'sheet' : 'view';
  $('pdfArea').querySelector('[data-v="sheet"]').hidden = !hasSheet();
  setSeg('pdfArea', pdfOpts.area); setSeg('pdfOrient', pdfOpts.orient); setSeg('pdfColor', pdfOpts.color); setSeg('pdfQual', pdfOpts.qual);
  $('pdfPaper').value = pdfOpts.paper; $('pdfScale').value = pdfOpts.scale; $('pdfLw').checked = !!pdfOpts.lw; $('pdfAlpha').checked = pdfOpts.alpha !== false;
  if (pdfOpts.area === 'sheet') useSheetPaper();
  updatePdfInfo(); openSheet('pdfPanel');
}
function updatePdfInfo() {
  const plan = pdfPlan(); const sp = curSpace(); const fmtA = (v) => sp.paper ? mmText(v * plan.mmU) + ' mm' : fmtLen(v);
  const areaName = { view: 'What is on screen', extents: 'The whole ' + (sp.paper ? 'layout' : 'drawing'), sheet: 'The layout sheet', window: 'Your window' }[pdfOpts.area] || '';
  let html = '<b>' + areaName + '</b>: ' + fmtA(plan.aw) + ' × ' + fmtA(plan.ah) + '<br>' + pdfOpts.paper + ' ' + (plan.land ? 'landscape' : 'portrait') + ', ';
  if (pdfOpts.scale === 'fit') html += 'fitted at about <b>' + ratioText(plan.ratio) + '</b>';
  else html += 'at <b>' + ratioText(plan.ratio) + '</b> it takes ' + mmText(plan.usedW) + ' × ' + mmText(plan.usedH) + ' mm of ' + mmText(plan.iw) + ' × ' + mmText(plan.ih) + ' mm';
  if (!plan.fits) html += '<br><span class="warn">Too big for ' + pdfOpts.paper + ' at this scale: the edges will be cut. Pick a larger paper or a smaller scale (larger number).</span>';
  if (pdfOpts.qual !== 'vector') { const d = pdfDpi(plan); if (d < Number(pdfOpts.qual)) html += '<br><span class="warn">' + pdfOpts.paper + ' at ' + pdfOpts.qual + ' dpi is too large for a phone; it will be made at ' + d + ' dpi.</span>'; }
  html += '<br>' + (pdfOpts.qual === 'vector' ? 'Vector: sharp at any zoom, small file' : 'Picture at ' + pdfDpi(plan) + ' dpi: bigger file, softer when zoomed');
  $('pdfInfo').innerHTML = html;
  $('pdfScaleHint').textContent = pdfOpts.scale === 'fit' ? '≈ ' + ratioText(plan.ratio) : '';
}
for (const id of ['pdfArea', 'pdfOrient', 'pdfColor', 'pdfQual']) $(id).addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b) return; const v = b.dataset.v;
  if (id === 'pdfArea') { if (v === 'window') { closeSheets(); startTool('pdfwin'); return; } pdfOpts.area = v; if (v === 'sheet') useSheetPaper(); }
  else pdfOpts[{ pdfOrient: 'orient', pdfColor: 'color', pdfQual: 'qual' }[id]] = v;
  setSeg(id, v); savePdfOpts(); updatePdfInfo();
});
$('pdfPaper').addEventListener('change', (ev) => { pdfOpts.paper = ev.target.value; savePdfOpts(); updatePdfInfo(); });
$('pdfScale').addEventListener('change', (ev) => { pdfOpts.scale = ev.target.value; updatePdfInfo(); });
$('pdfLw').addEventListener('change', (ev) => { pdfOpts.lw = ev.target.checked; savePdfOpts(); });
$('pdfAlpha').addEventListener('change', (ev) => { pdfOpts.alpha = ev.target.checked; savePdfOpts(); });
function pdfWindowPicked(r) { pdfOpts.win = r; pdfOpts.winKey = pdfKey(); pdfOpts.area = 'window'; startTool('select', true); openPdfPanel(); }
$('pdfGo').addEventListener('click', createPdf);

// ----- Print preview: the page exactly as it will print (same renderer, drawn as a picture at screen resolution) -----
let prevZoom = false;
function planDetail(plan) { return pdfOpts.paper + ' ' + (plan.land ? 'landscape' : 'portrait') + ' · ' + ratioText(plan.ratio) + ' · ' + ({ color: 'colour', gray: 'grey', bw: 'black lines' }[pdfOpts.color] || '') + (pdfOpts.alpha === false ? ' · solid hatches' : ''); }
async function openPreview() {
  if (pdfOpts.area === 'window' && pdfOpts.winKey !== pdfKey()) { toast('Pick the window first'); return; }
  closeSheets(); prevZoom = false; $('pdfPrev').classList.add('on'); $('prevInfo').textContent = 'Drawing the page…';
  await new Promise(r => setTimeout(r, 30));
  try { renderPreview(); } catch (e) { console.warn('preview', e); toast('Could not draw the preview: ' + (e && e.message || e), 6000); }
}
function renderPreview() {
  const plan = pdfPlan(); const body = $('prevBody'); const bw = Math.max(100, body.clientWidth - 28), bh = Math.max(100, body.clientHeight - 28);
  const fit = Math.min(bw / plan.pw, bh / plan.ph); // css px per paper mm when the page fits
  let upm = fit * state.dpr * 2.5; const maxPx = 9e6; if (plan.pw * plan.ph * upm * upm > maxPx) upm = Math.sqrt(maxPx / (plan.pw * plan.ph)); // canvas px per mm, sharp enough to zoom in
  const O = outView(plan, upm); const W = Math.round(O.W), H = Math.round(O.H);
  const pc = $('prevCv'); pc.width = W; pc.height = H; const c2 = pc.getContext('2d', { alpha: false });
  c2.setTransform(1, 0, 0, 1, 0, 0); c2.fillStyle = '#ffffff'; c2.fillRect(0, 0, W, H);
  withExport(c2, W, H, upm, false, () => { c2.save(); c2.beginPath(); c2.rect(O.clip[0], O.clip[1], O.clip[2], O.clip[3]); c2.clip(); drawContent(O.V, O.wr); c2.restore(); });
  // faint margin line so the printable area is visible
  if (plan.M > 0) { c2.setTransform(1, 0, 0, 1, 0, 0); c2.strokeStyle = 'rgba(47,140,255,.35)'; c2.setLineDash([6, 5]); c2.lineWidth = 1; const m = plan.M * upm; c2.strokeRect(m, m, W - 2 * m, H - 2 * m); c2.setLineDash([]); }
  pc.dataset.fitw = String(plan.pw * fit); pc.dataset.fith = String(plan.ph * fit); setPreviewZoom(false);
  $('prevInfo').textContent = planDetail(plan) + (plan.fits ? '' : ' · edges cut');
}
function setPreviewZoom(on, fx, fy) {
  const pc = $('prevCv'); const body = $('prevBody'); prevZoom = on; const k = on ? 3 : 1;
  pc.style.width = (parseFloat(pc.dataset.fitw) * k) + 'px'; pc.style.height = (parseFloat(pc.dataset.fith) * k) + 'px';
  if (on) { body.scrollLeft = Math.max(0, fx * pc.offsetWidth + 14 - body.clientWidth / 2); body.scrollTop = Math.max(0, fy * pc.offsetHeight + 14 - body.clientHeight / 2); }
}
$('prevCv').addEventListener('click', (ev) => { const r = $('prevCv').getBoundingClientRect(); setPreviewZoom(!prevZoom, (ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height); });
function closePreview(back) { $('pdfPrev').classList.remove('on'); const pc = $('prevCv'); pc.width = pc.height = 1; if (back) openPdfPanel(); }
$('prevBack').addEventListener('click', () => closePreview(true));
$('prevGo').addEventListener('click', () => { closePreview(false); createPdf(); });
$('pdfPrevBtn').addEventListener('click', openPreview);

// ===================== PDF creation =====================
// The PDF is drawn by the same renderer as the screen: its canvas context is swapped for PdfCtx, a small
// canvas-like object that writes PDF drawing commands. Scenes are rebuilt with RecPath (a Path2D that
// remembers its points) so every line, hatch and text comes out as vectors. Image quality draws onto a
// big offscreen canvas instead and puts that picture into the PDF.
async function createPdf() {
  if (!state.drawing) return;
  if (pdfOpts.area === 'window' && pdfOpts.winKey !== pdfKey()) { toast('Pick the window first'); return; }
  const plan = pdfPlan(); closeSheets();
  showLoading(true, 'Creating PDF…', 15); await new Promise(r => setTimeout(r, 40));
  try {
    const t0 = performance.now();
    const bytes = pdfOpts.qual === 'vector' ? await pdfVector(plan) : await pdfRaster(plan, pdfDpi(plan));
    showLoading(false);
    const detail = pdfOpts.paper + ' ' + (plan.land ? 'landscape' : 'portrait') + ' · ' + ratioText(plan.ratio) + ' · ' + (pdfOpts.qual === 'vector' ? 'vector' : pdfDpi(plan) + ' dpi');
    showFileReady(fileBase() + '-' + spaceSlug() + '.pdf', new Blob([bytes], { type: 'application/pdf' }), 'application/pdf', '', detail);
    window.__pdfMs = performance.now() - t0;
  } catch (e) { showLoading(false); console.warn('pdf', e); toast('Could not create the PDF: ' + (e && e.message || e), 7000); }
}
// Output view: maps the chosen area to the middle of the page. upm = output units per paper mm.
function outView(plan, upm) {
  const s = plan.k * upm; const W = plan.pw * upm, H = plan.ph * upm;
  const cx = (plan.A[0] + plan.A[2]) / 2, cy = (plan.A[1] + plan.A[3]) / 2; const V = { s, tx: W / 2 - cx * s, ty: H / 2 + cy * s };
  const m = plan.M * upm; const x0 = Math.max(W / 2 - plan.aw * s / 2, m), x1 = Math.min(W / 2 + plan.aw * s / 2, W - m), y0 = Math.max(H / 2 - plan.ah * s / 2, m), y1 = Math.min(H / 2 + plan.ah * s / 2, H - m);
  const a = toWorld(x0, y0, V), b = toWorld(x1, y1, V);
  return { V, W, H, clip: [x0, y0, x1 - x0, y1 - y0], wr: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])] };
}
function pdfLwFn(upm) { return (lw) => { if (!pdfOpts.lw) return 0.1 * upm; const mm = lw == null || lw < 0 ? 0.25 : lw / 100; return Math.max(mm, 0.05) * upm; }; }
function parseCss(c) { let m = /^#([0-9a-f]{6})$/i.exec(c); if (m) { const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; } m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(c); if (m) return [+m[1], +m[2], +m[3]]; m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c); if (m) return [parseInt(m[1] + m[1], 16), parseInt(m[2] + m[2], 16), parseInt(m[3] + m[3], 16)]; return null; }
function pdfColorFn() {
  const mode = pdfOpts.color; if (mode === 'color') return null;
  // Grey: every colour by its brightness. Black: lines and text black, filled areas keep their grey.
  return (css, fill) => { const c = parseCss(css); if (!c) return css; const l = Math.round(0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]); if (mode === 'gray' || fill) return 'rgb(' + l + ',' + l + ',' + l + ')'; return '#000000'; };
}
// Swap the renderer's globals for an export, run fn, then put everything back.
function withExport(c, W, H, upm, recordPaths, fn) {
  const saved = { ctx, dpr: state.dpr, cssW, cssH, sel: state.selection, hover: state.hoverItem, light: state.canvasLight, R: { ...RENDER }, scenes: state.scenes, bc: blockCache, P2D: window.Path2D };
  try {
    ctx = c; state.dpr = 1; cssW = W; cssH = H; state.selection = new Set(); state.hoverItem = null; state.canvasLight = true;
    RENDER.pdf = true; RENDER.lw = pdfLwFn(upm); RENDER.color = pdfColorFn(); RENDER.solidFills = pdfOpts.alpha === false;
    if (recordPaths) { window.Path2D = RecPath; state.scenes = new Map(); blockCache = new Map(); }
    fn();
  } finally {
    if (recordPaths) { window.Path2D = saved.P2D; state.scenes = saved.scenes; blockCache = saved.bc; }
    ctx = saved.ctx; state.dpr = saved.dpr; cssW = saved.cssW; cssH = saved.cssH; state.selection = saved.sel; state.hoverItem = saved.hover; state.canvasLight = saved.light; Object.assign(RENDER, saved.R);
    lastFull = null; requestFull();
  }
}
async function pdfVector(plan) {
  const upm = 72 / 25.4; const O = outView(plan, upm); const pc = new PdfCtx(O.W, O.H);
  withExport(pc, O.W, O.H, upm, true, () => { pc.save(); pc.beginPath(); pc.rect(O.clip[0], O.clip[1], O.clip[2], O.clip[3]); pc.clip(); drawContent(O.V, O.wr); pc.restore(); });
  return writePdf({ W: O.W, H: O.H, content: pc.out.join('\n'), alphas: pc.alphas, title: fileBase() + ' - ' + curSpace().name });
}
async function pdfRaster(plan, dpi) {
  const upm = dpi / 25.4; const O = outView(plan, upm); const W = Math.round(O.W), H = Math.round(O.H);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const c2 = c.getContext('2d', { alpha: false });
  if (!c2) throw new Error('the phone could not make a picture that large');
  c2.fillStyle = '#ffffff'; c2.fillRect(0, 0, W, H);
  withExport(c2, W, H, upm, false, () => { c2.save(); c2.beginPath(); c2.rect(O.clip[0], O.clip[1], O.clip[2], O.clip[3]); c2.clip(); drawContent(O.V, O.wr); c2.restore(); });
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92)); c.width = c.height = 1;
  if (!blob) throw new Error('the picture could not be encoded');
  const jpg = new Uint8Array(await blob.arrayBuffer()); const pt = 72 / 25.4;
  return writePdf({ W: plan.pw * pt, H: plan.ph * pt, content: 'q ' + pfmt(plan.pw * pt) + ' 0 0 ' + pfmt(plan.ph * pt) + ' 0 0 cm /Im1 Do Q', image: { data: jpg, w: W, h: H }, alphas: new Map(), title: fileBase() + ' - ' + curSpace().name });
}

// ----- A Path2D stand-in that remembers its points (arcs become Bézier curves). Ops: 0 M x y, 1 L x y, 2 C x1 y1 x2 y2 x y, 3 Z -----
class RecPath {
  constructor() { this.o = []; this.cx = null; this.cy = 0; this.sx = 0; this.sy = 0; }
  moveTo(x, y) { this.o.push(0, x, y); this.cx = this.sx = x; this.cy = this.sy = y; }
  lineTo(x, y) { if (this.cx === null) { this.moveTo(x, y); return; } this.o.push(1, x, y); this.cx = x; this.cy = y; }
  bezierCurveTo(a, b, c, d, x, y) { if (this.cx === null) this.moveTo(a, b); this.o.push(2, a, b, c, d, x, y); this.cx = x; this.cy = y; }
  closePath() { if (this.cx === null) return; this.o.push(3); this.cx = this.sx; this.cy = this.sy; }
  rect(x, y, w, h) { this.moveTo(x, y); this.lineTo(x + w, y); this.lineTo(x + w, y + h); this.lineTo(x, y + h); this.closePath(); }
  arc(x, y, r, a0, a1, acw) { this.ellipse(x, y, r, r, 0, a0, a1, acw); }
  ellipse(x, y, rx, ry, rot, a0, a1, acw) { // canvas rules for the sweep, then ≤90° Bézier pieces
    let sw;
    if (!acw) { sw = a1 - a0; if (sw >= TAU) sw = TAU; else { sw %= TAU; if (sw < 0) sw += TAU; } }
    else { sw = a0 - a1; if (sw >= TAU) sw = -TAU; else { sw %= TAU; if (sw < 0) sw += TAU; sw = -sw; } }
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const P = (t) => { const ex = rx * Math.cos(t), ey = ry * Math.sin(t); return [x + ex * cr - ey * sr, y + ex * sr + ey * cr]; };
    const D = (t) => { const ex = -rx * Math.sin(t), ey = ry * Math.cos(t); return [ex * cr - ey * sr, ex * sr + ey * cr]; };
    const p0 = P(a0); if (this.cx === null) this.moveTo(p0[0], p0[1]); else this.lineTo(p0[0], p0[1]);
    if (!sw) return;
    const n = Math.max(1, Math.ceil(Math.abs(sw) / (Math.PI / 2) - 1e-9)); const h = sw / n; const k = 4 / 3 * Math.tan(h / 4); let t = a0;
    for (let i = 0; i < n; i++) { const t2 = t + h; const pA = P(t), dA = D(t), pB = P(t2), dB = D(t2); this.bezierCurveTo(pA[0] + k * dA[0], pA[1] + k * dA[1], pB[0] - k * dB[0], pB[1] - k * dB[1], pB[0], pB[1]); t = t2; }
  }
  addPath(p, m) {
    if (!p || !p.o) return; const o = p.o; const T = m ? [m.a, m.b, m.c, m.d, m.e, m.f] : null; let lx = null, ly = 0;
    for (let i = 0; i < o.length;) {
      const c = o[i++]; this.o.push(c); const n = c === 2 ? 3 : c === 3 ? 0 : 1;
      for (let j = 0; j < n; j++) { let x = o[i++], y = o[i++]; if (T) { const X = T[0] * x + T[2] * y + T[4]; y = T[1] * x + T[3] * y + T[5]; x = X; } this.o.push(x, y); lx = x; ly = y; }
    }
    if (lx !== null) { this.cx = lx; this.cy = ly; }
  }
}

// ----- A canvas-like context that writes PDF page content. Coordinates are page points, y down (like canvas). -----
const pfmt = (v) => { const r = Math.round(v * 100) / 100; return Object.is(r, -0) ? '0' : String(r); };
const pfmt4 = (v) => { const r = Math.round(v * 10000) / 10000; return Object.is(r, -0) ? '0' : String(r); };
function mMul6(A, B) { return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]]; }
class PdfCtx {
  constructor(W, H) {
    this.W = W; this.H = H; this.out = []; this.alphas = new Map(); this.stack = [];
    this.m = [1, 0, 0, 1, 0, 0]; this.path = new RecPath();
    this.lineWidth = 1; this.strokeStyle = '#000000'; this.fillStyle = '#000000'; this.globalAlpha = 1; this.dash = []; this.lineDashOffset = 0;
    this.lineCap = 'butt'; this.lineJoin = 'miter'; this.font = '10px sans-serif'; this.textAlign = 'start'; this.textBaseline = 'alphabetic';
    this.cur = {}; // what has been written to the PDF graphics state
  }
  setTransform(a, b, c, d, e, f) { if (typeof a === 'object' && a) this.m = [a.a, a.b, a.c, a.d, a.e, a.f]; else this.m = [a, b, c, d, e, f]; }
  transform(a, b, c, d, e, f) { this.m = mMul6(this.m, [a, b, c, d, e, f]); }
  translate(x, y) { this.transform(1, 0, 0, 1, x, y); }
  rotate(t) { const c = Math.cos(t), s = Math.sin(t); this.transform(c, s, -s, c, 0, 0); }
  scale(x, y) { this.transform(x, 0, 0, y, 0, 0); }
  save() { this.stack.push({ m: this.m.slice(), lineWidth: this.lineWidth, strokeStyle: this.strokeStyle, fillStyle: this.fillStyle, globalAlpha: this.globalAlpha, dash: this.dash.slice(), lineDashOffset: this.lineDashOffset, lineCap: this.lineCap, lineJoin: this.lineJoin, font: this.font, textAlign: this.textAlign, textBaseline: this.textBaseline, cur: { ...this.cur } }); this.out.push('q'); }
  restore() { const s = this.stack.pop(); if (!s) return; Object.assign(this, s); this.out.push('Q'); }
  setLineDash(a) { this.dash = (a || []).filter(v => isFinite(v)).map(v => Math.max(0, v)); }
  getLineDash() { return this.dash.slice(); }
  beginPath() { this.path = new RecPath(); }
  // current-path building: points are stored already transformed (canvas semantics)
  _local(fn) { const t = new RecPath(); fn(t); const had = this.path.cx !== null; const o = t.o; if (had && o[0] === 0) o[0] = 1; this.path.addPath(t, { a: this.m[0], b: this.m[1], c: this.m[2], d: this.m[3], e: this.m[4], f: this.m[5] }); }
  moveTo(x, y) { const p = this._pt(x, y); this.path.moveTo(p[0], p[1]); }
  lineTo(x, y) { const p = this._pt(x, y); this.path.lineTo(p[0], p[1]); }
  closePath() { this.path.closePath(); }
  rect(x, y, w, h) { const t = this.path; const a = this._pt(x, y), b = this._pt(x + w, y), c = this._pt(x + w, y + h), d = this._pt(x, y + h); t.moveTo(a[0], a[1]); t.lineTo(b[0], b[1]); t.lineTo(c[0], c[1]); t.lineTo(d[0], d[1]); t.closePath(); }
  arc(x, y, r, a0, a1, acw) { this._local(t => t.arc(x, y, r, a0, a1, acw)); }
  ellipse(x, y, rx, ry, rot, a0, a1, acw) { this._local(t => t.ellipse(x, y, rx, ry, rot, a0, a1, acw)); }
  bezierCurveTo(a, b, c, d, x, y) { const p = this._pt(a, b), q = this._pt(c, d), r = this._pt(x, y); this.path.bezierCurveTo(p[0], p[1], q[0], q[1], r[0], r[1]); }
  _pt(x, y) { const m = this.m; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
  _scale() { const m = this.m; return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1; }
  _emitPath(o, T) { // T: matrix to apply (null = already page coords); y is flipped for PDF
    const H = this.H; const parts = []; let n = 0;
    for (let i = 0; i < o.length;) {
      const c = o[i++]; if (c === 3) { parts.push('h'); continue; }
      const k = c === 2 ? 3 : 1; let s = '';
      for (let j = 0; j < k; j++) { let x = o[i++], y = o[i++]; if (T) { const X = T[0] * x + T[2] * y + T[4]; y = T[1] * x + T[3] * y + T[5]; x = X; } s += pfmt(x) + ' ' + pfmt(H - y) + ' '; }
      parts.push(s + (c === 0 ? 'm' : c === 1 ? 'l' : 'c')); n++;
    }
    if (!n) return false; this.out.push(parts.join('\n')); return true;
  }
  _alpha(a) { a = Math.round(clamp(a == null ? 1 : a, 0, 1) * 100) / 100; if (this.cur.a === a) return; let nm = this.alphas.get(a); if (!nm) { nm = 'G' + this.alphas.size; this.alphas.set(a, nm); } this.out.push('/' + nm + ' gs'); this.cur.a = a; }
  _rgb(css) { const c = parseCss(String(css)) || [0, 0, 0]; return pfmt4(c[0] / 255) + ' ' + pfmt4(c[1] / 255) + ' ' + pfmt4(c[2] / 255); }
  _strokeState() {
    const sc = this._scale(); const col = this._rgb(this.strokeStyle); if (this.cur.sc !== col) { this.out.push(col + ' RG'); this.cur.sc = col; }
    const w = pfmt4(Math.max(this.lineWidth * sc, 0.01)); if (this.cur.w !== w) { this.out.push(w + ' w'); this.cur.w = w; }
    const d = this.dash.length ? '[' + this.dash.map(v => pfmt4(v * sc)).join(' ') + '] ' + pfmt4(this.lineDashOffset * sc) : '[] 0'; if (this.cur.d !== d) { this.out.push(d + ' d'); this.cur.d = d; }
    const J = this.lineCap === 'round' ? 1 : this.lineCap === 'square' ? 2 : 0; if (this.cur.J !== J) { this.out.push(J + ' J'); this.cur.J = J; }
    const j = this.lineJoin === 'round' ? 1 : this.lineJoin === 'bevel' ? 2 : 0; if (this.cur.j !== j) { this.out.push(j + ' j'); this.cur.j = j; }
    this._alpha(this.globalAlpha);
  }
  _fillState() { const col = this._rgb(this.fillStyle); if (this.cur.fc !== col) { this.out.push(col + ' rg'); this.cur.fc = col; } this._alpha(this.globalAlpha); }
  stroke(p) { if (p) { if (!p.o || !p.o.length) return; this._strokeState(); if (this._emitPath(p.o, this.m)) this.out.push('S'); } else { if (!this.path.o.length) return; this._strokeState(); if (this._emitPath(this.path.o, null)) this.out.push('S'); } }
  fill(p, rule) { if (typeof p === 'string') { rule = p; p = null; } const o = p ? p.o : this.path.o; if (!o || !o.length) return; this._fillState(); if (this._emitPath(o, p ? this.m : null)) this.out.push(rule === 'evenodd' ? 'f*' : 'f'); }
  clip(p, rule) { if (typeof p === 'string') { rule = p; p = null; } const o = p ? p.o : this.path.o; if (!o || !o.length) { this.out.push('0 0 m h W n'); return; } if (this._emitPath(o, p ? this.m : null)) this.out.push(rule === 'evenodd' ? 'W* n' : 'W n'); }
  fillRect(x, y, w, h) { const keep = this.path; this.path = new RecPath(); this.rect(x, y, w, h); this.fill(); this.path = keep; }
  strokeRect(x, y, w, h) { const keep = this.path; this.path = new RecPath(); this.rect(x, y, w, h); this.stroke(); this.path = keep; }
  _px() { const m = /(\d*\.?\d+(?:e[-+]?\d+)?)px/i.exec(this.font); return m ? parseFloat(m[1]) : 10; }
  measureText(s) { return { width: helvWidth(String(s)) * this._px() / 1000 }; }
  fillText(str, x, y) {
    str = String(str); if (!str.trim()) return; const px = this._px(); const enc = winAnsi(str); const w = enc.w * px / 1000;
    const al = this.textAlign; const dx = al === 'center' ? -w / 2 : (al === 'right' || al === 'end') ? -w : 0;
    const dy = this.textBaseline === 'middle' ? px * 0.35 : this.textBaseline === 'top' || this.textBaseline === 'hanging' ? px * 0.72 : this.textBaseline === 'bottom' ? -px * 0.21 : 0;
    const M = mMul6(this.m, [px, 0, 0, -px, x + dx, y + dy]); const T = [M[0], -M[1], M[2], -M[3], M[4], this.H - M[5]];
    this._fillState(); this.out.push('BT /F1 1 Tf ' + T.map(pfmt4).join(' ') + ' Tm (' + enc.s + ') Tj ET');
  }
  strokeText() { } drawImage() { } createPattern() { return null; }
}
// Helvetica (the standard PDF font) widths for WinAnsi codes 32..126, in 1/1000 em
const HELV_W = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const HELV_HI = { 176: 400, 177: 584, 178: 333, 179: 333, 181: 556, 183: 278, 185: 333, 188: 834, 189: 834, 190: 834, 215: 584, 247: 584, 216: 778, 248: 611, 150: 556, 151: 1000, 145: 222, 146: 222, 147: 333, 148: 333, 149: 350, 133: 1000, 128: 556, 153: 1000, 160: 278 };
const WIN_EXTRA = { 0x2013: 150, 0x2014: 151, 0x2018: 145, 0x2019: 146, 0x201C: 147, 0x201D: 148, 0x2022: 149, 0x2026: 133, 0x20AC: 128, 0x2122: 153, 0x2300: 216, 0x00D8: 216 };
function winAnsi(str) {
  let s = '', w = 0;
  for (const ch of str) {
    let c = ch.codePointAt(0); if (c > 255) c = WIN_EXTRA[c] || 63; else if (c >= 128 && c < 160) c = 63; else if (c < 32) c = 32;
    w += c >= 32 && c <= 126 ? HELV_W[c - 32] : (HELV_HI[c] || 556);
    if (c === 40 || c === 41 || c === 92) s += '\\' + String.fromCharCode(c); else if (c > 126) s += '\\' + c.toString(8).padStart(3, '0'); else s += String.fromCharCode(c);
  }
  return { s, w };
}
function helvWidth(str) { return winAnsi(str).w; }
// ----- PDF file writer -----
async function deflateBytes(u8) {
  try { if (typeof CompressionStream === 'undefined') return null; const st = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate')); return new Uint8Array(await new Response(st).arrayBuffer()); } catch (e) { return null; }
}
const pdfStr = (t) => '(' + String(t).replace(/[^\x20-\x7e]/g, '?').replace(/([()\\])/g, '\\$1') + ')';
async function writePdf({ W, H, content, image, alphas, title }) {
  const enc = new TextEncoder(); const chunks = []; let off = 0; const offs = [];
  const put = (x) => { const u = typeof x === 'string' ? enc.encode(x) : x; chunks.push(u); off += u.length; };
  const obj = (n, body) => { offs[n] = off; put(n + ' 0 obj\n' + body + '\nendobj\n'); };
  const stream = (n, dict, data) => { offs[n] = off; put(n + ' 0 obj\n<< ' + dict + ' /Length ' + data.length + ' >>\nstream\n'); put(data); put('\nendstream\nendobj\n'); };
  put(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A])); // %PDF-1.4 + binary marker
  const gs = [...alphas.entries()]; const firstGs = 7; const imgObj = firstGs + gs.length;
  const gsRes = gs.length ? ' /ExtGState << ' + gs.map(([a, nm], i) => '/' + nm + ' ' + (firstGs + i) + ' 0 R').join(' ') + ' >>' : '';
  const imgRes = image ? ' /XObject << /Im1 ' + imgObj + ' 0 R >>' : '';
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pfmt(W) + ' ' + pfmt(H) + '] /Resources << /Font << /F1 4 0 R >>' + gsRes + imgRes + ' >> /Contents 5 0 R >>');
  obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const raw = enc.encode(content); const z = await deflateBytes(raw);
  if (z) stream(5, '/Filter /FlateDecode', z); else stream(5, '', raw);
  const d = new Date(); const p2 = (v) => String(v).padStart(2, '0');
  obj(6, '<< /Title ' + pdfStr(title || 'Drawing') + ' /Producer (Tesseract CAD Tools) /Creator (Tesseract CAD Tools) /CreationDate (D:' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds()) + ') >>');
  gs.forEach(([a], i) => obj(firstGs + i, '<< /Type /ExtGState /CA ' + a + ' /ca ' + a + ' >>'));
  if (image) stream(imgObj, '/Type /XObject /Subtype /Image /Width ' + image.w + ' /Height ' + image.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode', image.data);
  const n = (image ? imgObj : firstGs + gs.length - 1) + 1; const xref = off;
  let x = 'xref\n0 ' + n + '\n0000000000 65535 f \n'; for (let i = 1; i < n; i++) x += String(offs[i] || 0).padStart(10, '0') + ' 00000 n \n';
  put(x + 'trailer\n<< /Size ' + n + ' /Root 1 0 R /Info 6 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
  const out = new Uint8Array(off); let p = 0; for (const c of chunks) { out.set(c, p); p += c.length; } return out;
}
