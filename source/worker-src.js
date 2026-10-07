// Tesseract CAD Tools — parse worker. Reads DWG/DXF with LibreDWG (WASM) and
// returns a compact drawing model to the page.
import { Dwg_File_Type, Dwg_Object_Type, LibreDwg } from '@mlightcad/libredwg-web';
import { parseDxf } from './dxf-parser.js';

let libPromise = null;
function getLib() {
  if (!libPromise) {
    postMessage({ type: 'progress', stage: 'Loading DWG engine', pct: 5 });
    libPromise = LibreDwg.create().catch((err) => { libPromise = null; throw err; });
  }
  return libPromise;
}

const P = (p) => p ? [p.x || 0, p.y || 0] : [0, 0];
const num = (v, d = 0) => (typeof v === 'number' && isFinite(v)) ? v : (typeof v === 'bigint' ? Number(v) : d);

function convEdge(ed) {
  switch (ed.type) {
    case 1: return { t: 1, a: P(ed.start), b: P(ed.end) };
    case 2: return { t: 2, c: P(ed.center), r: num(ed.radius), a0: num(ed.startAngle), a1: num(ed.endAngle), ccw: ed.isCCW ? 1 : 0 };
    case 3: return { t: 3, c: P(ed.center), m: P(ed.majorAxisEndPoint || ed.majorAxis || ed.end), k: num(ed.axisRatio || ed.minorAxisRatio || ed.lengthOfMinorAxis, 1), a0: num(ed.startAngle), a1: num(ed.endAngle), ccw: ed.isCCW ? 1 : 0 };
    case 4: return { t: 4, deg: num(ed.degree, 3), knots: (ed.knots || []).map(num), cp: (ed.controlPoints || []).map(p => [p.x, p.y, (p.w && p.w > 0) ? p.w : 1]), fit: (ed.fitPoints || []).map(P) };
  }
  return null;
}

// Transparency: DWG stores type in the high byte (0 ByLayer, 1 ByBlock, bit 2 = explicit value)
// and opacity in the low byte (255 = opaque). Returns opacity 0..1, -1 for ByBlock, undefined for ByLayer/opaque.
function alphaOf(type, a) {
  type = num(type); a = num(a, 255);
  if ((type & 3) === 1) return -1;
  if (type & 2) { if (a >= 255) return undefined; return Math.max(0, Math.round(a / 255 * 1000) / 1000); }
  return undefined;
}
// LibreDWG gives lineweights as DWG's 5-bit index: 0..23 = 0.00..2.11 mm, 29 ByLayer, 30 ByBlock, 31 Default.
// Stored as AutoCAD's DXF value: 1/100 mm, -1 ByLayer, -2 ByBlock, -3 Default.
const LW_INDEX = [0, 5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100, 106, 120, 140, 158, 200, 211];
function lwOf(v) { v = num(v, 29); if (v >= 0 && v <= 23) return LW_INDEX[v]; return v === 30 ? -2 : v === 31 ? -3 : -1; }
const hex6 = (n) => '#' + (n & 0xffffff).toString(16).padStart(6, '0');
function convEntity(e, idc) {
  const base = { id: idc.n++, hd: e.handle, L: e.layer || '0', c: num(e.colorIndex, 256), lt: e.lineType || '' };
  const al = alphaOf(e.transparencyType, e.transparency); if (al !== undefined) base.al = al;
  const lts = num(e.lineTypeScale, 1); if (lts > 0 && Math.abs(lts - 1) > 1e-9) base.lts = lts;
  const lw = lwOf(e.lineweight); if (lw !== -1) base.lw = lw; // lineweight in 1/100 mm; -2 ByBlock, -3 Default (ByLayer is left out)
  if (typeof e.color === 'number' && e.color > 0 && e.color < 0xffffff) base.rgb = hex6(e.color); // 0 / 0xffffff come back as placeholders
  switch (e.type) {
    case 'LINE': return { ...base, t: 'LINE', a: P(e.startPoint), b: P(e.endPoint) };
    case 'LWPOLYLINE': {
      const v = (e.vertices || []).map(p => [p.x, p.y, num(p.bulge)]);
      if (v.length < 2) return null;
      return { ...base, t: 'PLINE', v, closed: !!(e.flag & 512), w: num(e.constantWidth) };
    }
    case 'POLYLINE2D': {
      let vs = e.vertices || [];
      // Spline-fit / curve-fit polylines: draw generated (flag 8) vertices, skip frame points (flag 16)
      if (vs.some(p => p.flag & 8)) vs = vs.filter(p => (p.flag & 8));
      else vs = vs.filter(p => !(p.flag & 16));
      const v = vs.map(p => [p.x, p.y, num(p.bulge)]);
      if (v.length < 2) return null;
      return { ...base, t: 'PLINE', v, closed: !!(e.flag & 1), w: num(e.startWidth) };
    }
    case 'ARC': return { ...base, t: 'ARC', ce: P(e.center), r: num(e.radius), a0: num(e.startAngle), a1: num(e.endAngle) };
    case 'CIRCLE': return { ...base, t: 'CIRCLE', ce: P(e.center), r: num(e.radius) };
    case 'ELLIPSE': return { ...base, t: 'ELLIPSE', ce: P(e.center), m: P(e.majorAxisEndPoint), k: num(e.axisRatio, 1), a0: num(e.startAngle), a1: num(e.endAngle, Math.PI * 2) };
    case 'SPLINE': return { ...base, t: 'SPLINE', deg: num(e.degree, 3), knots: (e.knots || []).map(num), cp: (e.controlPoints || []).map(p => [p.x, p.y, (p.w && p.w > 0) ? p.w : 1]), fit: (e.fitPoints || []).map(P), closed: !!(e.flag & 1) };
    case 'TEXT': return { ...base, t: 'TEXT', p: P(e.startPoint), ap: P(e.endPoint), h: num(e.textHeight, 2.5), rot: num(e.rotation), s: e.text || '', ha: num(e.halign), va: num(e.valign), wf: num(e.xScale, 1) || 1 };
    case 'MTEXT': {
      let rot = num(e.rotation);
      if (e.direction && (Math.abs(e.direction.x - 1) > 1e-9 || Math.abs(e.direction.y) > 1e-9)) rot = Math.atan2(e.direction.y, e.direction.x);
      return { ...base, t: 'MTEXT', p: P(e.insertionPoint), h: num(e.textHeight, 2.5), w: num(e.rectWidth), rot, s: e.text || '', at: num(e.attachmentPoint, 1), ls: num(e.lineSpacing, 1) || 1 };
    }
    case 'INSERT': {
      const ins = { ...base, t: 'INSERT', n: e.name, p: P(e.insertionPoint), sx: num(e.xScale, 1) || 1, sy: num(e.yScale, 1) || 1, rot: num(e.rotation) };
      if (e.attribs && e.attribs.length) ins.att = e.attribs.map(a => ({ p: P(a.startPoint), ap: P(a.endPoint), h: num(a.textHeight, 2.5), rot: num(a.rotation), s: a.text || '', ha: num(a.halign), va: num(a.valign), L: a.layer || '0', c: num(a.colorIndex, 256), inv: !!(a.flags & 1) || a.isVisible === false, al: alphaOf(a.transparencyType, a.transparency), rgb: typeof a.color === 'number' && a.color > 0 && a.color < 0xffffff ? hex6(a.color) : undefined }));
      if (num(e.columnCount) > 1 || num(e.rowCount) > 1) { ins.cols = num(e.columnCount, 1); ins.rows = num(e.rowCount, 1); ins.cs = num(e.columnSpacing); ins.rs = num(e.rowSpacing); }
      return ins;
    }
    case 'DIMENSION': {
      if (!e.name) return null;
      return { ...base, t: 'INSERT', n: e.name, p: [0, 0], sx: 1, sy: 1, rot: 0, dim: true };
    }
    case 'HATCH': {
      const paths = [];
      for (const bp of e.boundaryPaths || []) {
        if (bp.boundaryPathTypeFlag & 2) {
          const v = (bp.vertices || []).map(p => [p.x, p.y, num(p.bulge)]);
          if (v.length >= 2) paths.push({ v, closed: true });
        } else {
          // libredwg can return empty slots for edges after a spline edge; keep what was read and say how many are missing
          const rawEdges = bp.edges || []; const miss = rawEdges.filter(x => !x).length;
          const edges = rawEdges.filter(Boolean).map(convEdge).filter(Boolean);
          if (edges.length) paths.push(miss ? { e: edges, miss } : { e: edges });
        }
      }
      if (!paths.length) return null;
      const h = { ...base, t: 'HATCH', solid: !!e.solidFill, name: e.patternName || 'SOLID', paths, style: num(e.hatchStyle) };
      if (!h.solid) {
        h.pat = { ang: num(e.patternAngle), sc: num(e.patternScale, 1) || 1, lines: (e.definitionLines || []).map(d => ({ a: num(d.angle), b: P(d.base), o: P(d.offset), d: (d.dashLengths || []).map(num) })) };
      }
      return h;
    }
    case 'WIPEOUT': case 'IMAGE': {
      const pos = P(e.position), u = P(e.uPixel), v = P(e.vPixel);
      const sz = e.imageSize || { x: 1, y: 1 };
      const W = num(sz.x, 1), H = num(sz.y, 1);
      let pts;
      const bp = e.clippingBoundaryPath || [];
      const toW = (x, y) => [pos[0] + u[0] * (x + 0.5) + v[0] * (H - (y + 0.5)), pos[1] + u[1] * (x + 0.5) + v[1] * (H - (y + 0.5))];
      if (e.type === 'WIPEOUT' && bp.length > 2) pts = bp.map(p => toW(p.x, p.y));
      else pts = [toW(-0.5, -0.5), toW(W - 0.5, -0.5), toW(W - 0.5, H - 0.5), toW(-0.5, H - 0.5)];
      return { ...base, t: e.type === 'WIPEOUT' ? 'WIPEOUT' : 'IMAGE', pts };
    }
    case 'VIEWPORT': {
      const flags = num(e.statusBitFlags);
      return { ...base, t: 'VIEWPORT', ce: P(e.viewportCenter), w: num(e.width), h: num(e.height), vc: P(e.displayCenter), vh: num(e.viewHeight, 1) || 1, on: !(flags & 131072), vid: num(e.viewportId), tw: num(e.viewTwistAngle) };
    }
    case 'POINT': return { ...base, t: 'POINT', p: P(e.position) };
    case '3DFACE': return { ...base, t: 'FACE', pts: [P(e.corner1), P(e.corner2), P(e.corner3), P(e.corner4)] };
    case 'SOLID': case 'TRACE': {
      const c = [P(e.corner1 || e.point1), P(e.corner2 || e.point2), P(e.corner3 || e.point3), P(e.corner4 || e.point4)];
      return { ...base, t: 'SOLID', pts: [c[0], c[1], c[3], c[2]] };
    }
    case 'LEADER': {
      const pts = (e.vertices || []).map(P);
      if (pts.length < 2) return null;
      return { ...base, t: 'LEADER', pts, arrow: !!e.isArrowheadEnabled };
    }
    case 'MLINE': {
      const pts = (e.vertices || []).map(v => P(v.vertex || v.position || v));
      if (pts.length < 2) return null;
      return { ...base, t: 'PLINE', v: pts.map(p => [p[0], p[1], 0]), closed: !!(e.flag & 2), w: 0 };
    }
    case 'RAY': case 'XLINE': {
      const p = P(e.basePoint || e.position), d = P(e.unitDirection || e.direction);
      const L = 1e6;
      return { ...base, t: 'LINE', a: e.type === 'RAY' ? p : [p[0] - d[0] * L, p[1] - d[1] * L], b: [p[0] + d[0] * L, p[1] + d[1] * L] };
    }
    default: return null;
  }
}

// Layer transparency lives in each layer's xdata (app "AcCmTransparency", first 1071 value).
// The converter does not pass it through, so read it straight from the LAYER objects.
function layerAlphas(lib, dwg) {
  const out = {};
  try {
    const n = lib.dwg_get_num_objects(dwg);
    for (let i = 0; i < n; i++) {
      const obj = lib.dwg_get_object(dwg, i); if (!obj) continue;
      if (lib.dwg_object_get_fixedtype(obj) !== Dwg_Object_Type.DWG_TYPE_LAYER) continue;
      try {
        const name = lib.dwg_dynapi_entity_data(lib.dwg_object_to_object_tio(obj), 'name');
        const xd = lib.dwg_object_entity_get_xdata(lib.dwg_object_to_object(obj)) || [];
        const app = xd.find(a => a && a.appName === 'AcCmTransparency'); if (!app || !name) continue;
        const v0 = (app.value || []).find(v => v && v.code === 1071); if (!v0) continue;
        const v = Number(v0.value) >>> 0; const al = alphaOf(v >>> 24, v & 255);
        if (al !== undefined && al >= 0) out[name] = al;
      } catch (e) { /* skip this layer */ }
    }
  } catch (e) { /* layer transparency is optional */ }
  return out;
}

// Draw order: AutoCAD keeps it in SORTENTSTABLE objects (per block/space): entity handle -> sort handle.
// Objects are drawn in ascending sort handle (own handle when not listed). The converter drops these
// tables, so read them from LibreDWG directly. Object refs: absolute handle at byte 32 (u64).
function readDrawOrder(lib, dwg) {
  const out = {};
  try {
    const W = lib.wasmInstance; const T = Dwg_Object_Type.DWG_TYPE_SORTENTSTABLE;
    const refAbs = (rp) => rp ? (W.HEAPU32[(rp + 32) >>> 2] + W.HEAPU32[(rp + 36) >>> 2] * 4294967296) : 0;
    const ptr = (v) => Number(v && v.data !== undefined ? v.data : v) || 0;
    const n = lib.dwg_get_num_objects(dwg);
    for (let i = 0; i < n; i++) {
      const obj = lib.dwg_get_object(dwg, i); if (!obj || lib.dwg_object_get_fixedtype(obj) !== T) continue;
      try {
        const tio = lib.dwg_object_to_object_tio(obj); const ne = Number(lib.dwg_dynapi_entity_data(tio, 'num_ents')) || 0; if (!ne || ne > 5e6) continue;
        const ep = ptr(lib.dwg_dynapi_entity_value(tio, 'ents')), sp = ptr(lib.dwg_dynapi_entity_value(tio, 'sort_ents')), op = ptr(lib.dwg_dynapi_entity_value(tio, 'block_owner'));
        if (!ep || !sp || !op) continue;
        const owner = refAbs(op).toString(16).toUpperCase(); const m = out[owner] || (out[owner] = {});
        for (let k = 0; k < ne; k++) { const e = refAbs(W.HEAPU32[(ep >>> 2) + k]), so = refAbs(W.HEAPU32[(sp >>> 2) + k]); if (e && so) m[e.toString(16).toUpperCase()] = so; }
      } catch (e) { /* skip this table */ }
    }
  } catch (e) { /* draw order is optional */ }
  return out;
}
function applyDrawOrder(ents, table) {
  if (!table) return ents;
  const key = (e) => { const h = e.hd || ''; const s = table[h]; return s != null ? s : (parseInt(h, 16) || 0); };
  return ents.map((e, i) => [key(e), i, e]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2]);
}

function slim(db, name, layerAl, drawOrder) {
  const idc = { n: 1 };
  const layers = (db.tables?.LAYER?.entries || []).map(l => ({ name: l.name, aci: num(l.colorIndex, 7), off: !!l.off, frozen: !!l.frozen, locked: !!l.locked, lw: lwOf(l.lineweight), lt: l.lineType || 'Continuous' }));
  if (layerAl) for (const l of layers) if (layerAl[l.name] != null) l.al = layerAl[l.name];
  if (!layers.find(l => l.name === '0')) layers.unshift({ name: '0', aci: 7, off: false, frozen: false, locked: false, lw: -3, lt: 'Continuous' });
  const ltypes = {};
  for (const lt of db.tables?.LTYPE?.entries || []) ltypes[lt.name] = (lt.pattern || []).map(p => num(p.elementLength));
  const blocks = {};
  const records = db.tables?.BLOCK_RECORD?.entries || [];
  const byHandle = {};
  const skipped = {};
  for (const b of records) {
    const ents = [];
    for (const e of b.entities || []) { if (!e || !e.type) continue; if (e.isVisible === false) { skipped.hidden = (skipped.hidden || 0) + 1; continue; } let c = null; try { c = convEntity(e, idc); } catch (err) { skipped[e.type + '!'] = (skipped[e.type + '!'] || 0) + 1; continue; } if (c) ents.push(c); else skipped[e.type] = (skipped[e.type] || 0) + 1; }
    const order = drawOrder && b.handle ? drawOrder[String(b.handle).toUpperCase()] : null;
    const rec = { name: b.name, base: P(b.basePoint), ents: order ? applyDrawOrder(ents, order) : ents, handle: b.handle };
    byHandle[b.handle] = rec;
    blocks[b.name] = rec;
  }
  const spaces = [];
  const model = blocks['*Model_Space'];
  spaces.push({ name: 'Model', paper: false, ents: model ? model.ents : [] });
  const layouts = (db.objects?.LAYOUT || []).slice().sort((a, b) => num(a.tabOrder) - num(b.tabOrder));
  for (const lo of layouts) {
    if (/^model$/i.test(lo.layoutName)) continue;
    const rec = byHandle[lo.paperSpaceTableId];
    if (!rec) continue;
    spaces.push({ name: lo.layoutName, paper: true, ents: rec.ents, blockName: rec.name, limits: [P(lo.minLimit), P(lo.maxLimit)], extents: [P(lo.minExtent), P(lo.maxExtent)] });
  }
  // Fallback: paper blocks not referenced by a LAYOUT object
  for (const b of records) if (/^\*Paper_Space/i.test(b.name) && !spaces.find(s => s.blockName === b.name) && (b.entities || []).length) spaces.push({ name: b.name.replace('*', ''), paper: true, ents: blocks[b.name].ents, blockName: b.name });
  // Blocks referenced by inserts only
  const defs = {};
  for (const [n, rec] of Object.entries(blocks)) if (!/^\*(Model|Paper)_Space/i.test(n)) defs[n] = { base: rec.base, ents: rec.ents };
  const H = db.header || {};
  const header = { units: num(H.INSUNITS, 0), extmin: P(H.EXTMIN), extmax: P(H.EXTMAX), ltscale: num(H.LTSCALE, 1) || 1, clayer: H.CLAYER || '0', luprec: num(H.LUPREC, 2), textsize: num(H.TEXTSIZE, 2.5) };
  return { name, layers, ltypes, blocks: defs, spaces, header, skipped, nextId: idc.n };
}

self.addEventListener('unhandledrejection', (ev) => { postMessage({ type: 'error', message: 'Worker failure: ' + (ev.reason && ev.reason.message || ev.reason) }); });
onmessage = async (ev) => {
  const { buf, name, kind } = ev.data;
  if (kind === 'init') { try { await getLib(); postMessage({ type: 'ready' }); } catch (err) { postMessage({ type: 'error', message: 'DWG engine failed to load: ' + (err && err.message ? err.message : err) }); } return; }
  try {
    const t0 = performance.now();
    const isDxf = kind === 'dxf';
    let drawing;
    if (isDxf) {
      postMessage({ type: 'progress', stage: 'Reading ' + name, pct: 20 });
      const text = new TextDecoder('utf-8').decode(new Uint8Array(buf));
      if (text.slice(0, 22).indexOf('AutoCAD Binary DXF') >= 0) throw new Error('Binary DXF files are not supported yet. Save as ASCII DXF.');
      postMessage({ type: 'progress', stage: 'Building drawing', pct: 60 });
      drawing = parseDxf(text, name);
    } else {
      const lib = await getLib();
      postMessage({ type: 'progress', stage: 'Reading ' + name, pct: 20 });
      const dwg = lib.dwg_read_data(new Uint8Array(buf), Dwg_File_Type.DWG);
      if (!dwg) throw new Error('LibreDWG could not read this file. Try saving it as AutoCAD 2018 or 2013 DWG and open again.');
      postMessage({ type: 'progress', stage: 'Converting entities', pct: 55 });
      const db = lib.convert(dwg);
      const layerAl = layerAlphas(lib, dwg); const drawOrder = readDrawOrder(lib, dwg);
      try { lib.dwg_free(dwg); } catch (e) { /* ignore */ }
      postMessage({ type: 'progress', stage: 'Building drawing', pct: 80 });
      drawing = slim(db, name, layerAl, drawOrder);
    }
    drawing.parseMs = Math.round(performance.now() - t0);
    postMessage({ type: 'done', drawing });
  } catch (err) {
    postMessage({ type: 'error', message: (err && err.message) ? err.message : String(err) });
  }
};
