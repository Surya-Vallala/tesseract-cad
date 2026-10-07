// Minimal ASCII DXF reader producing the same compact drawing model as the DWG path.
const R = Math.PI / 180;
const decodeU = (s) => (s || '').replace(/\\U\+([0-9A-Fa-f]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));

export function parseDxf(text, name) {
  const lines = text.split(/\r\n|\n|\r/);
  const N = lines.length; let i = 0;
  const pairs = []; // flattened [code, value] stream for speed
  while (i + 1 < N) { const c = parseInt(lines[i], 10); if (!isNaN(c)) pairs.push(c, lines[i + 1]); i += 2; }
  let p = 0; const P = pairs.length;
  const peekCode = () => pairs[p]; const take = () => { const c = pairs[p], v = pairs[p + 1]; p += 2; return [c, v]; };

  const layers = [], ltypes = {}, blocks = {}, blockRecords = {}, layouts = []; const header = { units: 0, extmin: [0, 0], extmax: [0, 0], ltscale: 1, clayer: '0', luprec: 2, textsize: 2.5 };
  const idc = { n: 1 }; const skipped = {};
  const paperEntsByBlock = {}; // handle -> ents (from ENTITIES section with 67=1)
  let modelEnts = [];

  // read one entity record: returns {type, g: [[code,val],...]}
  function readRecord() {
    const [c0, type] = take(); if (c0 !== 0) return null; const g = [];
    while (p < P && peekCode() !== 0) { const [c, v] = take(); g.push(c, v); }
    return { type: type.trim(), g };
  }
  const first = (g, code, def) => { for (let k = 0; k < g.length; k += 2) if (g[k] === code) return g[k + 1]; return def; };
  const num = (g, code, def = 0) => { const v = first(g, code); if (v === undefined) return def; const f = parseFloat(v); return isNaN(f) ? def : f; };
  const str = (g, code, def = '') => { const v = first(g, code); return v === undefined ? def : decodeU(v); };
  const pt = (g, code) => [num(g, code), num(g, code + 10)];
  const ptsOf = (g, code) => { const out = []; for (let k = 0; k < g.length; k += 2) if (g[k] === code) { let y = 0; for (let j = k + 2; j < g.length; j += 2) if (g[j] === code + 10) { y = parseFloat(g[j + 1]) || 0; break; } out.push([parseFloat(g[k + 1]) || 0, y]); } return out; };
  const allNum = (g, code) => { const out = []; for (let k = 0; k < g.length; k += 2) if (g[k] === code) out.push(parseFloat(g[k + 1]) || 0); return out; };

  function common(rec) {
    const g = rec.g; const o = { id: idc.n++, hd: str(g, 5), L: str(g, 8, '0') || '0', c: Math.round(num(g, 62, 256)), lt: str(g, 6, ''), paper: num(g, 67, 0) === 1, owner: str(g, 330) };
    const tv = first(g, 440); if (tv !== undefined) { const v = parseInt(tv, 10) >>> 0; const type = v >>> 24, a = v & 255; if ((type & 3) === 1) o.al = -1; else if ((type & 2) && a < 255) o.al = Math.round(a / 255 * 1000) / 1000; }
    const tc = first(g, 420); if (tc !== undefined) { const v = parseInt(tc, 10); if (!isNaN(v)) o.rgb = '#' + (v & 0xffffff).toString(16).padStart(6, '0'); }
    if (num(g, 60, 0) === 1) o.hidden = true;
    const lts = num(g, 48, 1); if (lts > 0 && Math.abs(lts - 1) > 1e-9) o.lts = lts;
    const lw = num(g, 370, -1); if (lw !== -1) o.lw = lw;
    return o;
  }

  function convert(rec, queue) { const e = convert0(rec, queue); if (e && e.hidden) { skipped.hidden = (skipped.hidden || 0) + 1; return undefined; } return e; }
  function convert0(rec, queue) {
    const g = rec.g; const b = common(rec); const T = rec.type;
    switch (T) {
      case 'LINE': return { ...b, t: 'LINE', a: pt(g, 10), b: pt(g, 11) };
      case 'LWPOLYLINE': { const v = []; let cur = null; for (let k = 0; k < g.length; k += 2) { const c = g[k]; if (c === 10) { cur = [parseFloat(g[k + 1]) || 0, 0, 0]; v.push(cur); } else if (c === 20 && cur) cur[1] = parseFloat(g[k + 1]) || 0; else if (c === 42 && cur) cur[2] = parseFloat(g[k + 1]) || 0; } if (v.length < 2) return null; return { ...b, t: 'PLINE', v, closed: !!(num(g, 70) & 1), w: num(g, 43, 0) }; }
      case 'POLYLINE': { // vertices follow
        const flag = num(g, 70); const verts = []; let r;
        while (p < P && (r = readRecord())) { if (r.type === 'SEQEND') break; if (r.type === 'VERTEX') verts.push(r); }
        const hasFit = verts.some(vr => num(vr.g, 70) & 8); const use = verts.filter(vr => { const f = num(vr.g, 70); return hasFit ? (f & 8) : !(f & 16); });
        const v = use.map(vr => [num(vr.g, 10), num(vr.g, 20), num(vr.g, 42)]); if (v.length < 2) return null;
        if (flag & 8 || flag & 16 || flag & 64) return null; // 3D polylines / meshes not supported
        return { ...b, t: 'PLINE', v, closed: !!(flag & 1), w: num(g, 40, 0) };
      }
      case 'ARC': return { ...b, t: 'ARC', ce: pt(g, 10), r: num(g, 40), a0: num(g, 50) * R, a1: num(g, 51) * R };
      case 'CIRCLE': return { ...b, t: 'CIRCLE', ce: pt(g, 10), r: num(g, 40) };
      case 'ELLIPSE': return { ...b, t: 'ELLIPSE', ce: pt(g, 10), m: pt(g, 11), k: num(g, 40, 1), a0: num(g, 41, 0), a1: num(g, 42, Math.PI * 2) };
      case 'SPLINE': { const flag = num(g, 70); const knots = allNum(g, 40); const weights = allNum(g, 41); const cps = ptsOf(g, 10).map((q, idx) => [q[0], q[1], weights[idx] || 1]); const fit = ptsOf(g, 11); return { ...b, t: 'SPLINE', deg: num(g, 71, 3), knots, cp: cps, fit, closed: !!(flag & 1) }; }
      case 'TEXT': case 'ATTRIB': case 'ATTDEF': { if (T === 'ATTDEF') return null; return { ...b, t: 'TEXT', p: pt(g, 10), ap: pt(g, 11), h: num(g, 40, 2.5), rot: num(g, 50) * R, s: str(g, 1), ha: num(g, 72), va: num(g, 73), wf: num(g, 41, 1) || 1 }; }
      case 'MTEXT': { let s = ''; for (let k = 0; k < g.length; k += 2) if (g[k] === 3) s += g[k + 1]; s += first(g, 1, ''); let rot = num(g, 50) * R; const dx = first(g, 11), dy = first(g, 21); if (dx !== undefined && dy !== undefined) { const x = parseFloat(dx), y = parseFloat(dy); if (Math.abs(x - 1) > 1e-9 || Math.abs(y) > 1e-9) rot = Math.atan2(y, x); } return { ...b, t: 'MTEXT', p: pt(g, 10), h: num(g, 40, 2.5), w: num(g, 41, 0), rot, s: decodeU(s), at: num(g, 71, 1), ls: num(g, 44, 1) || 1 }; }
      case 'INSERT': { const ins = { ...b, t: 'INSERT', n: str(g, 2), p: pt(g, 10), sx: num(g, 41, 1) || 1, sy: num(g, 42, 1) || 1, rot: num(g, 50) * R }; const cols = num(g, 70, 1), rows = num(g, 71, 1); if (cols > 1 || rows > 1) { ins.cols = cols; ins.rows = rows; ins.cs = num(g, 44); ins.rs = num(g, 45); } if (num(g, 66) === 1) { const att = []; let r; while (p < P && (r = readRecord())) { if (r.type === 'SEQEND') break; if (r.type === 'ATTRIB') att.push({ p: pt(r.g, 10), ap: pt(r.g, 11), h: num(r.g, 40, 2.5), rot: num(r.g, 50) * R, s: str(r.g, 1), ha: num(r.g, 72), va: num(r.g, 74), L: str(r.g, 8, '0'), c: Math.round(num(r.g, 62, 256)), inv: !!(num(r.g, 70) & 1) }); } if (att.length) ins.att = att; } return ins; }
      case 'DIMENSION': { const n = str(g, 2); if (!n) return null; return { ...b, t: 'INSERT', n, p: [0, 0], sx: 1, sy: 1, rot: 0, dim: true }; }
      case 'HATCH': return hatch(g, b);
      case 'POINT': return { ...b, t: 'POINT', p: pt(g, 10) };
      case '3DFACE': return { ...b, t: 'FACE', pts: [pt(g, 10), pt(g, 11), pt(g, 12), pt(g, 13)] };
      case 'SOLID': case 'TRACE': { const c = [pt(g, 10), pt(g, 11), pt(g, 12), pt(g, 13)]; return { ...b, t: 'SOLID', pts: [c[0], c[1], c[3], c[2]] }; }
      case 'LEADER': { const pts = ptsOf(g, 10); if (pts.length < 2) return null; return { ...b, t: 'LEADER', pts, arrow: num(g, 71, 1) === 1 }; }
      case 'VIEWPORT': { const flags = num(g, 90); const st = num(g, 68, 1); return { ...b, t: 'VIEWPORT', ce: pt(g, 10), w: num(g, 40), h: num(g, 41), vc: pt(g, 12), vh: num(g, 45, 1) || 1, on: !(flags & 131072) && st !== 0 ? true : !(flags & 131072), vid: num(g, 69), tw: num(g, 51) * R }; }
      case 'WIPEOUT': case 'IMAGE': { const pos = pt(g, 10), u = pt(g, 11), v = pt(g, 12); const sz = pt(g, 13); const W = sz[0] || 1, H = sz[1] || 1; const bp = ptsOf(g, 14); const toW = (x, y) => [pos[0] + u[0] * (x + 0.5) + v[0] * (H - (y + 0.5)), pos[1] + u[1] * (x + 0.5) + v[1] * (H - (y + 0.5))]; let pts; if (T === 'WIPEOUT' && bp.length > 2) pts = bp.map(q => toW(q[0], q[1])); else pts = [toW(-0.5, -0.5), toW(W - 0.5, -0.5), toW(W - 0.5, H - 0.5), toW(-0.5, H - 0.5)]; return { ...b, t: T, pts }; }
      case 'RAY': case 'XLINE': { const q = pt(g, 10), d = pt(g, 11); const L = 1e6; return { ...b, t: 'LINE', a: T === 'RAY' ? q : [q[0] - d[0] * L, q[1] - d[1] * L], b: [q[0] + d[0] * L, q[1] + d[1] * L] }; }
      default: return null;
    }
  }
  function hatch(g, b) {
    // sequential cursor over groups
    let k = 0; const n = g.length; const at = (code) => { while (k < n && g[k] !== code) k += 2; if (k >= n) return undefined; const v = g[k + 1]; k += 2; return parseFloat(v); };
    const name = str(g, 2, 'SOLID'); const solid = num(g, 70) === 1; const style = num(g, 75, 0);
    const nPaths = at(91) | 0; const paths = [];
    for (let pi = 0; pi < nPaths; pi++) {
      const flag = at(92) | 0; if (flag === undefined) break;
      if (flag & 2) { const hasB = at(72); const closed = at(73); const nv = at(93) | 0; const v = []; for (let vi = 0; vi < nv; vi++) { const x = at(10), y = at(20); let bulge = 0; if (hasB) { const bb = at(42); bulge = bb || 0; } v.push([x || 0, y || 0, bulge]); } if (v.length >= 2) paths.push({ v, closed: true }); }
      else { const ne = at(93) | 0; const edges = []; for (let ei = 0; ei < ne; ei++) { const et = at(72) | 0; if (et === 1) edges.push({ t: 1, a: [at(10) || 0, at(20) || 0], b: [at(11) || 0, at(21) || 0] }); else if (et === 2) { const c = [at(10) || 0, at(20) || 0]; const r = at(40) || 0; const a0 = (at(50) || 0) * R, a1 = (at(51) || 0) * R; const ccw = at(73) | 0; edges.push({ t: 2, c, r, a0, a1, ccw }); } else if (et === 3) { const c = [at(10) || 0, at(20) || 0]; const m = [at(11) || 0, at(21) || 0]; const kk = at(40) || 1; const a0 = (at(50) || 0) * R, a1 = (at(51) || 0) * R; const ccw = at(73) | 0; edges.push({ t: 3, c, m, k: kk, a0, a1, ccw }); } else if (et === 4) { const deg = at(94) | 0; const rational = at(73) | 0; at(74); const nk = at(95) | 0, nc = at(96) | 0; const knots = []; for (let q = 0; q < nk; q++) knots.push(at(40) || 0); const cp = []; for (let q = 0; q < nc; q++) { const x = at(10) || 0, y = at(20) || 0; let w = 1; if (rational) w = at(42) || 1; cp.push([x, y, w]); } const nf = at(97) | 0; const fit = []; for (let q = 0; q < nf; q++) fit.push([at(11) || 0, at(21) || 0]); edges.push({ t: 4, deg, knots, cp, fit }); continue; } }
        if (edges.length) paths.push({ e: edges }); }
      // skip source boundary objects
      const ns = at(97) | 0; for (let q = 0; q < ns; q++) at(330);
    }
    if (!paths.length) return null;
    const h = { ...b, t: 'HATCH', solid, name, paths, style };
    if (!solid) { const ang = (num(g, 52) || 0) * R; const sc = num(g, 41, 1) || 1; const lines = []; let kk = 0; const atk = (code) => { while (kk < n && g[kk] !== code) kk += 2; if (kk >= n) return undefined; const v = g[kk + 1]; kk += 2; return parseFloat(v); }; const nd = atk(78) | 0; for (let li = 0; li < nd; li++) { const a = (atk(53) || 0) * R; const bx = atk(43) || 0, by = atk(44) || 0, ox = atk(45) || 0, oy = atk(46) || 0; const nn = atk(79) | 0; const d = []; for (let q = 0; q < nn; q++) d.push(atk(49) || 0); lines.push({ a, b: [bx, by], o: [ox, oy], d }); } h.pat = { ang, sc, lines }; }
    return h;
  }

  function parseHeader(g) { for (let k = 0; k < g.length; k += 2) if (g[k] === 9) { const nm = g[k + 1].trim(); const sub = []; for (let j = k + 2; j < g.length && g[j] !== 9; j += 2) sub.push(g[j], g[j + 1]); if (nm === '$INSUNITS') header.units = num(sub, 70, 0); else if (nm === '$EXTMIN') header.extmin = pt(sub, 10); else if (nm === '$EXTMAX') header.extmax = pt(sub, 10); else if (nm === '$LTSCALE') header.ltscale = num(sub, 40, 1) || 1; else if (nm === '$CLAYER') header.clayer = str(sub, 8, '0'); else if (nm === '$LUPREC') header.luprec = num(sub, 70, 2); else if (nm === '$TEXTSIZE') header.textsize = num(sub, 40, 2.5); } }
  // ---- walk sections ----
  let section = ''; let r;
  while (p < P) {
    const c = peekCode();
    if (c !== 0) { take(); continue; }
    r = readRecord(); if (!r) break;
    if (r.type === 'SECTION') { section = str(r.g, 2); if (section === 'HEADER') parseHeader(r.g); continue; }
    if (r.type === 'ENDSEC') { section = ''; continue; }
    if (r.type === 'EOF') break;
    if (section === 'HEADER') { parseHeader(r.g); continue; }
    if (false) { const g = r.g; for (let k = 0; k < g.length; k += 2) if (g[k] === 9) { const nm = g[k + 1].trim(); const sub = []; for (let j = k + 2; j < g.length && g[j] !== 9; j += 2) sub.push(g[j], g[j + 1]); if (nm === '$INSUNITS') header.units = num(sub, 70, 0); else if (nm === '$EXTMIN') header.extmin = pt(sub, 10); else if (nm === '$EXTMAX') header.extmax = pt(sub, 10); else if (nm === '$LTSCALE') header.ltscale = num(sub, 40, 1) || 1; else if (nm === '$CLAYER') header.clayer = str(sub, 8, '0'); else if (nm === '$LUPREC') header.luprec = num(sub, 70, 2); else if (nm === '$TEXTSIZE') header.textsize = num(sub, 40, 2.5); } continue; }
    if (section === 'TABLES') {
      if (r.type === 'LAYER' && first(r.g, 2) !== undefined && first(r.g, 100) !== undefined) { const col = num(r.g, 62, 7); const fl = num(r.g, 70); const lay = { name: str(r.g, 2), aci: Math.abs(Math.round(col)) || 7, off: col < 0, frozen: !!(fl & 1), locked: !!(fl & 4), lw: num(r.g, 370, -3), lt: str(r.g, 6, 'Continuous') };
        for (let k = 0; k < r.g.length; k += 2) if (r.g[k] === 1001 && String(r.g[k + 1]).trim() === 'AcCmTransparency') { for (let j = k + 2; j < r.g.length && r.g[j] !== 1001; j += 2) if (r.g[j] === 1071) { const v = parseInt(r.g[j + 1], 10) >>> 0; const type = v >>> 24, a = v & 255; if ((type & 2) && a < 255) lay.al = Math.round(a / 255 * 1000) / 1000; break; } break; }
        layers.push(lay); }
      else if (r.type === 'LTYPE' && first(r.g, 2) !== undefined) ltypes[str(r.g, 2)] = allNum(r.g, 49);
      else if (r.type === 'BLOCK_RECORD' && first(r.g, 2) !== undefined) blockRecords[str(r.g, 5)] = { name: str(r.g, 2), layout: str(r.g, 340) };
      continue;
    }
    if (section === 'BLOCKS') {
      if (r.type === 'BLOCK') { const bname = str(r.g, 2); const base = pt(r.g, 10); const ents = []; let rr; while (p < P && (rr = readRecord())) { if (rr.type === 'ENDBLK') break; let e = null; try { e = convert(rr); } catch (err) { skipped[rr.type + '!'] = (skipped[rr.type + '!'] || 0) + 1; } if (e) ents.push(e); else skipped[rr.type] = (skipped[rr.type] || 0) + 1; } blocks[bname] = { name: bname, base, ents, handle: str(r.g, 330) }; }
      continue;
    }
    if (section === 'ENTITIES') { let e = null; try { e = convert(r); } catch (err) { skipped[r.type + '!'] = (skipped[r.type + '!'] || 0) + 1; } if (!e) { skipped[r.type] = (skipped[r.type] || 0) + 1; continue; } if (e.paper) { (paperEntsByBlock[e.owner] || (paperEntsByBlock[e.owner] = [])).push(e); } else modelEnts.push(e); continue; }
    if (section === 'OBJECTS') { if (r.type === 'LAYOUT') layouts.push({ name: str(r.g, 1), tab: num(r.g, 71, 0), owner: str(r.g, 330), limits: [pt(r.g, 10), pt(r.g, 11)] }); continue; }
  }
  if (!layers.find(l => l.name === '0')) layers.unshift({ name: '0', aci: 7, off: false, frozen: false, locked: false, lw: -3, lt: 'Continuous' });
  // model space entities may also live in *Model_Space block (rare in ENTITIES-less files)
  const ms = blocks['*Model_Space']; if (ms && ms.ents.length && !modelEnts.length) modelEnts = ms.ents;
  const spaces = [{ name: 'Model', paper: false, ents: modelEnts }];
  // paper spaces: entities in ENTITIES with 67=1 belong to the active layout (*Paper_Space); other layouts' entities are inside their blocks
  const psEnts = Object.values(paperEntsByBlock).flat();
  const nameByHandle = {}; for (const [h, rec] of Object.entries(blockRecords)) nameByHandle[h] = rec.name;
  layouts.sort((a, b) => a.tab - b.tab);
  for (const lo of layouts) { if (/^model$/i.test(lo.name)) continue; const bname = nameByHandle[lo.owner]; if (!bname) continue; const blk = blocks[bname]; let ents = blk ? blk.ents : []; if (/^\*Paper_Space$/i.test(bname) && psEnts.length) ents = ents.concat(psEnts); spaces.push({ name: lo.name, paper: true, ents, blockName: bname, limits: lo.limits }); }
  if (spaces.length === 1 && psEnts.length) spaces.push({ name: 'Layout1', paper: true, ents: psEnts, blockName: '*Paper_Space' });
  const defs = {}; for (const [n, rec] of Object.entries(blocks)) if (!/^\*(Model|Paper)_Space/i.test(n)) defs[n] = { base: rec.base, ents: rec.ents };
  for (const sp of spaces) for (const e of sp.ents) { delete e.paper; delete e.owner; }
  for (const d of Object.values(defs)) for (const e of d.ents) { delete e.paper; delete e.owner; }
  return { name, layers, ltypes, blocks: defs, spaces, header, skipped, nextId: idc.n };
}
