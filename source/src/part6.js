// ===================== Editing =====================
function transformEntity(e, M) {
  const P = (p) => mApply(M, p); const sc = mScaleOf(M); const det = mDet(M); const ang = mAngle(M);
  switch (e.t) {
    case 'LINE': e.a = P(e.a); e.b = P(e.b); break;
    case 'PLINE': e.v = e.v.map(v => { const q = P(v); return [q[0], q[1], det < 0 ? -(v[2] || 0) : (v[2] || 0)]; }); if (e.w) e.w *= sc; break;
    case 'CIRCLE': e.ce = P(e.ce); e.r *= sc; break;
    case 'ARC': { const d0 = mVec(M, [Math.cos(e.a0), Math.sin(e.a0)]), d1 = mVec(M, [Math.cos(e.a1), Math.sin(e.a1)]); e.ce = P(e.ce); e.r *= sc; const b0 = Math.atan2(d0[1], d0[0]), b1 = Math.atan2(d1[1], d1[0]); if (det < 0) { e.a0 = b1; e.a1 = b0; } else { e.a0 = b0; e.a1 = b1; } break; }
    case 'ELLIPSE': { e.ce = P(e.ce); e.m = mVec(M, e.m); if (det < 0) { const a0 = e.a0, a1 = e.a1; e.a0 = normAng(-a1); e.a1 = normAng(-a0); if (Math.abs(a1 - a0 - TAU) < 1e-9 || Math.abs(normAng(a1 - a0)) < 1e-9) { e.a0 = 0; e.a1 = TAU; } } break; }
    case 'SPLINE': e.cp = (e.cp || []).map(c => { const q = P(c); return [q[0], q[1], c[2] || 1]; }); e.fit = (e.fit || []).map(P); break;
    case 'TEXT': { e.p = P(e.p); if (e.ap) e.ap = P(e.ap); e.h *= sc; const d = mVec(M, [Math.cos(e.rot || 0), Math.sin(e.rot || 0)]); e.rot = Math.atan2(d[1], d[0]); if (det < 0) e.rot = Math.atan2(-d[1], -d[0]) + Math.PI; e.rot = normAng(e.rot); break; }
    case 'MTEXT': { e.p = P(e.p); e.h *= sc; if (e.w) e.w *= sc; const d = mVec(M, [Math.cos(e.rot || 0), Math.sin(e.rot || 0)]); e.rot = normAng(Math.atan2(d[1], d[0]) + (det < 0 ? Math.PI : 0)); if (det < 0) e.rot = normAng(e.rot + Math.PI); break; }
    case 'INSERT': { e.p = P(e.p); const xv = mVec(M, [Math.cos(e.rot || 0) * (e.sx || 1), Math.sin(e.rot || 0) * (e.sx || 1)]); const yv = mVec(M, [-Math.sin(e.rot || 0) * (e.sy || 1), Math.cos(e.rot || 0) * (e.sy || 1)]); e.rot = Math.atan2(xv[1], xv[0]); e.sx = Math.hypot(xv[0], xv[1]); const cross = xv[0] * yv[1] - xv[1] * yv[0]; e.sy = Math.hypot(yv[0], yv[1]) * (cross < 0 ? -1 : 1); if (e.cs) e.cs *= sc; if (e.rs) e.rs *= sc; if (e.att) for (const a of e.att) { a.p = P(a.p); a.ap = P(a.ap); a.h *= sc; const d = mVec(M, [Math.cos(a.rot || 0), Math.sin(a.rot || 0)]); a.rot = Math.atan2(d[1], d[0]); } break; }
    case 'HATCH': {
      for (const loop of e.paths) { if (loop.v) loop.v = loop.v.map(v => { const q = P(v); return [q[0], q[1], det < 0 ? -(v[2] || 0) : (v[2] || 0)]; }); else for (const ed of loop.e) { if (ed.t === 1) { ed.a = P(ed.a); ed.b = P(ed.b); } else if (ed.t === 2) { // clockwise edges store negated angles: work on the real angles, then store back
            const s0 = ed.ccw ? ed.a0 : -ed.a0, s1 = ed.ccw ? ed.a1 : -ed.a1; const d0 = mVec(M, [Math.cos(s0), Math.sin(s0)]), d1 = mVec(M, [Math.cos(s1), Math.sin(s1)]); const b0 = Math.atan2(d0[1], d0[0]), b1 = Math.atan2(d1[1], d1[0]);
            ed.c = P(ed.c); ed.r *= sc; const ccw = det < 0 ? !ed.ccw : !!ed.ccw; ed.ccw = ccw ? 1 : 0; ed.a0 = ccw ? b0 : -b0; ed.a1 = ccw ? b1 : -b1; }
          else if (ed.t === 3) { ed.c = P(ed.c); ed.m = mVec(M, ed.m); if (det < 0) ed.ccw = ed.ccw ? 0 : 1; /* parameters are relative to the major axis; a mirror only reverses direction */ } else if (ed.t === 4) { ed.cp = (ed.cp || []).map(c => { const q = P(c); return [q[0], q[1], c[2] || 1]; }); ed.fit = (ed.fit || []).map(P); } } }
      if (e.pat) { e.pat.lines = e.pat.lines.map(ln => { const dir = mVec(M, [Math.cos(ln.a), Math.sin(ln.a)]); return { a: Math.atan2(dir[1], dir[0]), b: P(ln.b), o: mVec(M, ln.o), d: ln.d.map(v => v * sc) }; }); e.pat.sc *= sc; e.pat.ang += ang; }
      break;
    }
    case 'WIPEOUT': case 'IMAGE': case 'FACE': case 'SOLID': case 'LEADER': e.pts = e.pts.map(P); break;
    case 'POINT': e.p = P(e.p); break;
    case 'VIEWPORT': e.ce = P(e.ce); e.w *= sc; e.h *= sc; e.sc = (e.sc || 1); break;
  }
  return e;
}
function cloneEnt(e) { return structuredClone(e); }
function pushUndo(action) { state.undo.push(action); if (state.undo.length > 100) state.undo.shift(); state.redo.length = 0; state.dirty = true; updateUndoBtns(); }
function updateUndoBtns() { const show = !!(state.drawing && $('welcome').style.display === 'none'); $('btnUndo').hidden = !show; $('btnRedo').hidden = !show; $('btnUndo').disabled = !state.undo.length; $('btnRedo').disabled = !state.redo.length; $('btnUndo').title = state.undo.length ? 'Undo (' + state.undo.length + ')' : 'Nothing to undo'; }
function applyAction(a, reverse) {
  const sp = state.drawing.spaces[a.space]; const ents = sp.ents;
  if (a.type === 'add') { if (reverse) { const ids = new Set(a.ents.map(e => e.id)); sp.ents = ents.filter(e => !ids.has(e.id)); } else { for (const e of a.ents) ents.push(e); } }
  else if (a.type === 'remove') { if (reverse) { const list = a.items.slice().sort((x, y) => x.index - y.index); for (const it of list) ents.splice(Math.min(it.index, ents.length), 0, it.ent); } else { const ids = new Set(a.items.map(i => i.ent.id)); sp.ents = ents.filter(e => !ids.has(e.id)); } }
  else if (a.type === 'modify') { const map = new Map(a.items.map(i => [i.id, reverse ? i.prev : i.next])); for (let i = 0; i < ents.length; i++) { const n = map.get(ents[i].id); if (n) ents[i] = cloneEnt(n); } }
  else if (a.type === 'order') { const ids = reverse ? a.prev : a.next; const byId = new Map(ents.map(e => [e.id, e])); const out = []; for (const id of ids) { const e = byId.get(id); if (e) { out.push(e); byId.delete(id); } } for (const e of byId.values()) out.push(e); sp.ents = out; }
  else if (a.type === 'blockdefs') { for (const d of a.defs) { const b = state.drawing.blocks[d.name]; if (b) b.ents = (reverse ? d.prev : d.next).map(cloneEnt); } blockCache.clear(); state.scenes.clear(); lastFull = null; }
  else if (a.type === 'multi') { const list = reverse ? a.steps.slice().reverse() : a.steps; for (const st of list) applyAction(st, reverse); return; }
  invalidateScene(a.space); requestFull();
}
function undo() { const a = state.undo.pop(); if (!a) return; applyAction(a, true); state.redo.push(a); updateUndoBtns(); toast('Undo'); }
function redo() { const a = state.redo.pop(); if (!a) return; applyAction(a, false); state.undo.push(a); updateUndoBtns(); toast('Redo'); }
function nextId() { return state.drawing.nextId++; }
function addEntities(list, mergeWithLast) {
  const sp = curSpace(); for (const e of list) { e.id = nextId(); e.hd = ''; sp.ents.push(e); }
  if (mergeWithLast && state.undo.length && state.undo[state.undo.length - 1].type === 'add' && state.undo[state.undo.length - 1].space === state.spaceIdx && state.undo[state.undo.length - 1].chain) { state.undo[state.undo.length - 1].ents.push(...list); state.dirty = true; }
  else pushUndo({ type: 'add', space: state.spaceIdx, ents: list.slice(), chain: !!mergeWithLast || list.length === 1 && list[0].t === 'LINE' });
  invalidateScene(state.spaceIdx); requestFull();
}
function selectedEnts() { const sp = curSpace(); return sp.ents.filter(e => state.selection.has(e.id)); }
function applyTransform(M, copy) {
  const sel = selectedEnts(); if (!sel.length) { toast('Nothing selected'); return; }
  if (copy) { const copies = sel.map(e => { const c = cloneEnt(e); c.hd = ''; return transformEntity(c, M); }); addEntities(copies, false); state.selection.clear(); }
  else { const items = sel.map(e => ({ id: e.id, prev: cloneEnt(e), next: transformEntity(cloneEnt(e), M) })); pushUndo({ type: 'modify', space: state.spaceIdx, items }); applyAction(state.undo[state.undo.length - 1], false); state.selection.clear(); }
}
function deleteSelection() {
  const sp = curSpace(); const items = []; sp.ents.forEach((e, i) => { if (state.selection.has(e.id)) items.push({ ent: e, index: i }); });
  if (!items.length) return; pushUndo({ type: 'remove', space: state.spaceIdx, items }); applyAction(state.undo[state.undo.length - 1], false); state.selection.clear(); toast(items.length + ' deleted'); setResult(null);
}
// ===================== Properties =====================
// Strip content for the current selection (Select / Box select tools)
function showSelection() {
  const ids = state.selection; const n = ids.size;
  if (!n) { setResult(null); return; }
  if (n === 1) { const S = getScene(state.spaceIdx); const it = S.items.find(i => ids.has(i.ent.id)); if (it) { setResult(describeItem(it)); return; } }
  setResult([['Selected', n + ' objects'], ['Change', 'tap ✎ for properties, or Edit → Move, Copy, Rotate…']]);
}
const ltName = (lt) => (!lt || /^bylayer$/i.test(lt)) ? 'ByLayer' : /^byblock$/i.test(lt) ? 'ByBlock' : lt;
const alName = (al) => al == null ? 'ByLayer' : al === -1 ? 'ByBlock' : Math.round((1 - al) * 100) + '%';
function openProps() {
  const sel = selectedEnts(); if (!sel.length) { toast('Select objects first'); return; }
  const D = state.drawing; const body = $('propsBody'); body.innerHTML = '';
  const same = (f) => { const v0 = f(sel[0]); for (const e of sel) if (f(e) !== v0) return undefined; return v0; };
  const one = sel.length === 1 ? sel[0] : null; const types = new Set(sel.map(e => e.dim ? 'DIM' : e.t)); const t1 = types.size === 1 ? [...types][0] : null;
  $('propsTitle').textContent = one ? (one.dim ? 'Dimension' : one.t === 'INSERT' ? blockLabel(one.n) : one.t.charAt(0) + one.t.slice(1).toLowerCase()) : sel.length + ' objects';
  const ch = {}; // field -> new value (only fields the user touched)
  const row = (label, el, sub) => { const r = document.createElement('div'); r.className = 'prop-row'; const l = document.createElement('label'); l.textContent = label; r.append(l, el); if (sub) { const d = document.createElement('div'); d.className = 'prop-sub'; d.textContent = sub; r.append(d); } body.append(r); return r; };
  const head = (t) => { const h = document.createElement('div'); h.className = 'prop-head'; h.textContent = t; body.append(h); };
  const mark = (el) => el.classList.add('changed');
  const numInput = (val, key, conv) => { const i = document.createElement('input'); i.type = 'text'; i.inputMode = 'decimal'; i.value = val === undefined ? '' : String(val); if (val === undefined) i.placeholder = 'varies'; i.addEventListener('input', () => { const v = parseFloat(i.value.replace(/,/g, '')); if (isFinite(v)) { ch[key] = conv ? conv(v) : v; mark(i); } else delete ch[key]; }); return i; };
  head('General');
  // Layer
  const selL = document.createElement('select'); const curL = same(e => e.L || '0'); if (curL === undefined) selL.append(new Option('(varies)', '', true, true));
  for (const l of D.layers.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))) selL.append(new Option(l.name, l.name, false, l.name === curL));
  selL.addEventListener('change', () => { if (selL.value) { ch.L = selL.value; mark(selL); } }); row('Layer', selL);
  // Colour
  const curC = same(e => e.rgb ? 'rgb:' + e.rgb : String(e.c == null ? 256 : e.c));
  const sw = document.createElement('div'); sw.className = 'swatches'; const btns = [];
  const pick = (v) => { ch.c = v; for (const b of btns) b.setAttribute('aria-pressed', b.dataset.v === String(v) ? 'true' : 'false'); aciIn.classList.toggle('changed', !btns.some(b => b.dataset.v === String(v))); };
  for (const v of [256, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 250, 252, 254]) { const b = document.createElement('button'); b.type = 'button'; b.dataset.v = String(v); if (v === 256) b.textContent = 'Layer'; else if (v === 0) b.textContent = 'Block'; else { b.style.background = aciCss(v, false, true); b.title = 'Colour ' + v; } b.setAttribute('aria-pressed', curC === String(v) ? 'true' : 'false'); b.addEventListener('click', () => pick(v)); btns.push(b); sw.append(b); }
  const aciIn = document.createElement('input'); aciIn.type = 'text'; aciIn.inputMode = 'numeric'; aciIn.placeholder = '1–255'; if (curC && !btns.some(b => b.dataset.v === curC) && !curC.startsWith('rgb')) aciIn.value = curC;
  aciIn.addEventListener('input', () => { const v = parseInt(aciIn.value, 10); if (v >= 1 && v <= 255) pick(v); }); sw.append(aciIn);
  const cSub = curC === undefined ? 'varies' : curC.startsWith('rgb:') ? 'now true colour ' + curC.slice(4) : curC === '256' ? 'now ByLayer' : curC === '0' ? 'now ByBlock' : 'now colour ' + curC;
  row('Colour', sw, cSub);
  const blockSel = sel.filter(e => e.t === 'INSERT' && !e.dim);
  if (blockSel.length) {
    const names = blockNamesDeep(blockSel.map(e => e.n)); let notBB = 0; for (const n of names) for (const c of (D.blocks[n] ? D.blocks[n].ents : [])) if (c.c !== 0 || c.rgb) notBB++;
    if (notBB) {
      const lab = document.createElement('label'); lab.style.cssText = 'display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:var(--fg)';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = true; cb.style.cssText = 'width:18px;height:18px;flex:0 0 auto;margin-top:1px;accent-color:var(--accent)';
      cb.addEventListener('change', () => { ch.blockContents = cb.checked; }); ch.blockContents = true;
      const txt = document.createElement('span'); txt.textContent = 'Make everything inside follow this colour. Objects inside this block have their own colour, so without this the block colour does not show. Sets the contents to ByBlock in the block definition (' + names.length + ' block' + (names.length === 1 ? '' : 's') + '); other copies then show their own block colour.';
      lab.append(cb, txt); row('', lab);
    }
  }
  // Linetype
  const selT = document.createElement('select'); const curT = same(e => ltName(e.lt)); if (curT === undefined) selT.append(new Option('(varies)', '', true, true));
  const ltNames = ['ByLayer', 'ByBlock', 'Continuous'].concat(Object.keys(D.ltypes || {}).filter(n => !/^(bylayer|byblock|continuous)$/i.test(n)).sort());
  for (const n of ltNames) selT.append(new Option(n, n, false, n === curT));
  selT.addEventListener('change', () => { if (selT.value) { ch.lt = selT.value; mark(selT); } }); row('Linetype', selT);
  row('Linetype scale', numInput(same(e => e.lts || 1), 'lts', v => v > 0 ? v : 1));
  // Transparency
  const selA = document.createElement('select'); const curA = same(e => alName(e.al)); if (curA === undefined) selA.append(new Option('(varies)', '', true, true));
  const aOpts = ['ByLayer', 'ByBlock', '0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%']; if (curA && !aOpts.includes(curA)) aOpts.push(curA);
  for (const n of aOpts) selA.append(new Option(n, n, false, n === curA));
  selA.addEventListener('change', () => { const v = selA.value; if (!v) return; ch.al = v === 'ByLayer' ? null : v === 'ByBlock' ? -1 : Math.max(0, 1 - parseFloat(v) / 100); mark(selA); }); row('Transparency', selA);
  // Type specific
  if (t1 === 'INSERT') {
    head('Block');
    row('Rotation °', numInput(same(e => +fmtFixed(deg(normAng(e.rot || 0)), 4)), 'rot', v => rad(v)));
    row('Scale X', numInput(same(e => +fmtFixed(e.sx || 1, 6)), 'sx', v => v || 1));
    row('Scale Y', numInput(same(e => +fmtFixed(e.sy || 1, 6)), 'sy', v => v || 1));
    if (one) { row('Position X', numInput(+fmtFixed(one.p[0], 4), 'px')); row('Position Y', numInput(+fmtFixed(one.p[1], 4), 'py')); }
  } else if (t1 === 'TEXT' || t1 === 'MTEXT') {
    head('Text');
    if (one) { const ta = document.createElement(one.t === 'MTEXT' ? 'textarea' : 'input'); const plain = one.t === 'MTEXT' ? mtextPlain(one.s).join('\n') : textPlain(one.s); ta.value = plain; ta.addEventListener('input', () => { if (ta.value !== plain) { ch.s = ta.value; mark(ta); } else delete ch.s; }); row('Contents', ta, one.t === 'MTEXT' ? 'Editing replaces any inline formatting' : null); }
    row('Height', numInput(same(e => +fmtFixed(e.h, 4)), 'h', v => v > 0 ? v : undefined));
    row('Rotation °', numInput(same(e => +fmtFixed(deg(normAng(e.rot || 0)), 4)), 'rot', v => rad(v)));
  } else if ((t1 === 'CIRCLE' || t1 === 'ARC') && one) {
    head(t1 === 'CIRCLE' ? 'Circle' : 'Arc'); row('Radius', numInput(+fmtFixed(one.r, 4), 'r', v => v > 0 ? v : undefined));
  }
  head('Draw order');
  const ord = document.createElement('div'); ord.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap';
  for (const [lbl, fn] of [['Bring to front', () => reorderSelection('front')], ['Send to back', () => reorderSelection('back')]]) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = lbl; b.addEventListener('click', () => { closeSheets(); fn(); }); ord.append(b); }
  row('Order', ord, 'Applies right away. More options: Edit → Order');
  $('propsApply').onclick = () => { for (const k of Object.keys(ch)) if (ch[k] === undefined) delete ch[k]; if (!Object.keys(ch).filter(k => k !== 'blockContents').length) { closeSheets(); return; } applyProps(sel.map(e => e.id), ch); closeSheets(); };
  openSheet('propsPanel');
}
// All block definitions reachable from these block names (nested blocks included)
function blockNamesDeep(names) { const D = state.drawing; const seen = new Set(); const stack = names.slice(); while (stack.length) { const n = stack.pop(); if (seen.has(n) || !D.blocks[n]) continue; seen.add(n); for (const c of D.blocks[n].ents) if (c.t === 'INSERT' && !c.dim && c.n) stack.push(c.n); } return [...seen]; }
// ----- Draw order -----
function reorderSelection(mode, refId) {
  const sp = curSpace(); if (!sp) return; const sel = state.selection; if (!sel.size && mode !== 'hatchesBack') { toast('Select objects first'); return; }
  const prev = sp.ents.map(e => e.id); let moved = [], rest = [];
  if (mode === 'hatchesBack') { for (const e of sp.ents) ((e.t === 'HATCH' || e.t === 'SOLID') ? moved : rest).push(e); }
  else for (const e of sp.ents) (sel.has(e.id) && e.id !== refId ? moved : rest).push(e);
  if (!moved.length) { toast(mode === 'hatchesBack' ? 'No hatches here' : 'Nothing to move'); return; }
  let out;
  if (mode === 'front') out = rest.concat(moved);
  else if (mode === 'back' || mode === 'hatchesBack') out = moved.concat(rest);
  else { const i = rest.findIndex(e => e.id === refId); if (i < 0) { toast('Pick an object that is not selected'); return; } out = mode === 'above' ? rest.slice(0, i + 1).concat(moved, rest.slice(i + 1)) : rest.slice(0, i).concat(moved, rest.slice(i)); }
  const next = out.map(e => e.id); if (next.every((id, i) => id === prev[i])) { toast('Already in that order'); return; }
  pushUndo({ type: 'order', space: state.spaceIdx, prev, next }); applyAction(state.undo[state.undo.length - 1], false);
  toast({ front: 'Brought to front', back: 'Sent to back', above: 'Placed above', under: 'Placed under', hatchesBack: moved.length + ' hatches sent to back' }[mode]);
}
function fmtFixed(v, d) { return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toString(); }
function applyProps(ids, ch) {
  const sp = curSpace(); const idset = new Set(ids); const items = [];
  for (const e of sp.ents) {
    if (!idset.has(e.id)) continue; const n = cloneEnt(e);
    if ('L' in ch) n.L = ch.L;
    if ('c' in ch) { n.c = ch.c; delete n.rgb; }
    if ('lt' in ch) { if (ch.lt === 'ByLayer') n.lt = ''; else n.lt = ch.lt; }
    if ('lts' in ch) { if (Math.abs(ch.lts - 1) < 1e-12) delete n.lts; else n.lts = ch.lts; }
    if ('al' in ch) { if (ch.al == null) delete n.al; else n.al = ch.al; }
    if (n.t === 'INSERT' && ('rot' in ch || 'sx' in ch || 'sy' in ch || 'px' in ch || 'py' in ch)) {
      const blk = state.drawing.blocks[n.n]; const base = blk ? blk.base : [0, 0];
      const tgt = { ...n, rot: 'rot' in ch ? ch.rot : n.rot, sx: 'sx' in ch ? ch.sx : n.sx, sy: 'sy' in ch ? ch.sy : n.sy, p: ['px' in ch ? ch.px : n.p[0], 'py' in ch ? ch.py : n.p[1]] };
      const M = mMul(mInsert(tgt, base), mInverse(mInsert(n, base))); transformEntity(n, M); // moves attributes with the block
      n.rot = tgt.rot; n.sx = tgt.sx; n.sy = tgt.sy; n.p = tgt.p.slice();
    }
    if (n.t === 'TEXT' || n.t === 'MTEXT') {
      if ('rot' in ch) { const d = ch.rot - (n.rot || 0); const anc = (n.t === 'TEXT' && (n.ha || n.va) && n.ap && (n.ap[0] || n.ap[1])) ? n.ap : n.p; const R = mMul(mTranslate(anc[0], anc[1]), mMul(mRotate(d), mTranslate(-anc[0], -anc[1]))); n.p = mApply(R, n.p); if (n.ap && n.t === 'TEXT') n.ap = mApply(R, n.ap); n.rot = ch.rot; }
      if ('h' in ch) n.h = ch.h;
      if ('s' in ch) n.s = n.t === 'MTEXT' ? ch.s.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\r?\n/g, '\\P') : ch.s.replace(/\r?\n/g, ' ');
    }
    if ((n.t === 'CIRCLE' || n.t === 'ARC') && 'r' in ch) n.r = ch.r;
    items.push({ id: e.id, prev: cloneEnt(e), next: n });
  }
  if (!items.length) return;
  const steps = [{ type: 'modify', space: state.spaceIdx, items }];
  if ('c' in ch && ch.blockContents) { // block contents follow the block's colour: set them to ByBlock (definitions)
    const names = blockNamesDeep(items.filter(i => i.next.t === 'INSERT' && !i.next.dim).map(i => i.next.n)); const defs = [];
    for (const nm of names) { const b = state.drawing.blocks[nm]; if (!b) continue; const prev = b.ents.map(cloneEnt); const next = b.ents.map(x => { const y = cloneEnt(x); y.c = 0; delete y.rgb; if (y.att) for (const a of y.att) { a.c = 0; delete a.rgb; } return y; }); defs.push({ name: nm, prev, next }); }
    if (defs.length) steps.push({ type: 'blockdefs', space: state.spaceIdx, defs });
  }
  pushUndo(steps.length === 1 ? steps[0] : { type: 'multi', space: state.spaceIdx, steps }); applyAction(state.undo[state.undo.length - 1], false);
  toast(items.length === 1 ? 'Properties updated' : items.length + ' objects updated'); showSelection(); requestFull();
}
$('btnProps').addEventListener('click', openProps);

// text dialog
function openTextDialog(pt) {
  const dlg = $('textDlg'); dlg.classList.add('on'); $('txtVal').value = ''; $('txtH').value = state.textH || defaultTextHeight(); setTimeout(() => $('txtVal').focus(), 50);
  const close = () => { dlg.classList.remove('on'); ok.removeEventListener('click', onOk); cancel.removeEventListener('click', onCancel); };
  const ok = $('txtOk'), cancel = $('txtCancel');
  const onOk = () => { const s = $('txtVal').value.trim(); const h = parseFloat($('txtH').value); if (!s || !(h > 0)) { toast('Enter text and a height'); return; } state.textH = h; addEntities([{ t: 'TEXT', L: state.curLayer, c: 256, lt: '', p: pt.slice(), ap: [0, 0], h, rot: 0, s, ha: 0, va: 0, wf: 1 }]); close(); toast('Text placed'); setPrompt('Tap where the next text should start.'); };
  const onCancel = () => { close(); };
  ok.addEventListener('click', onOk); cancel.addEventListener('click', onCancel);
}
function defaultTextHeight() { const sp = curSpace(); const hs = []; for (const e of sp.ents) if ((e.t === 'TEXT' || e.t === 'MTEXT') && e.h > 0) hs.push(e.h); if (hs.length) { hs.sort((a, b) => a - b); return +hs[hs.length >> 1].toPrecision(3); } const u = state.drawing.header.units; return u === 4 ? 250 : u === 6 ? 0.25 : u === 1 ? 10 : 2.5; }

// ===================== DXF export =====================
function dxfString(s) { return (s || '').replace(/[^\x00-\x7f]/g, (c) => '\\U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')); }
function buildDxf(D) {
  const out = []; let hs = 0x100; const H = () => (hs++).toString(16).toUpperCase();
  const w = (c, v) => { out.push(c, v); };
  const num = (v) => (Math.round(v * 1e8) / 1e8).toString();
  const safeName = (n) => n.replace(/^\*U/, 'U_').replace(/^\*D/, 'D_').replace(/^\*/, 'X_').replace(/[<>\/\\":;?*|=`]/g, '_');
  const MS = '1F', PS = '1B', LAYER_CTRL = '2', LTYPE_CTRL = '5', STYLE_CTRL = '3', BLKREC_CTRL = '1';
  const ltNames = new Set(['ByBlock', 'ByLayer', 'Continuous']);
  for (const l of D.layers) if (l.lt && !/^(continuous|bylayer|byblock)$/i.test(l.lt)) ltNames.add(l.lt);
  w(0, 'SECTION'); w(2, 'HEADER'); w(9, '$ACADVER'); w(1, 'AC1015'); w(9, '$INSUNITS'); w(70, D.header.units || 0); w(9, '$EXTMIN'); w(10, num(D.header.extmin[0])); w(20, num(D.header.extmin[1])); w(30, '0'); w(9, '$EXTMAX'); w(10, num(D.header.extmax[0])); w(20, num(D.header.extmax[1])); w(30, '0'); w(9, '$LTSCALE'); w(40, num(D.header.ltscale || 1)); w(9, '$CLAYER'); w(8, dxfString(state.curLayer)); w(9, '$HANDSEED'); w(5, 'FFFFF'); w(9, '$DWGCODEPAGE'); w(3, 'ANSI_1252'); w(0, 'ENDSEC');
  w(0, 'SECTION'); w(2, 'TABLES');
  w(0, 'TABLE'); w(2, 'VPORT'); w(5, '8'); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, 1); w(0, 'VPORT'); w(5, H()); w(330, '8'); w(100, 'AcDbSymbolTableRecord'); w(100, 'AcDbViewportTableRecord'); w(2, '*ACTIVE'); w(70, 0); w(10, '0'); w(20, '0'); w(11, '1'); w(21, '1'); w(12, num((D.header.extmin[0] + D.header.extmax[0]) / 2)); w(22, num((D.header.extmin[1] + D.header.extmax[1]) / 2)); w(13, '0'); w(23, '0'); w(14, '10'); w(24, '10'); w(15, '10'); w(25, '10'); w(16, '0'); w(26, '0'); w(36, '1'); w(17, '0'); w(27, '0'); w(37, '0'); w(40, num(Math.max(1, D.header.extmax[1] - D.header.extmin[1]))); w(41, '1.5'); w(42, '50'); w(43, '0'); w(44, '0'); w(50, '0'); w(51, '0'); w(71, 0); w(72, 100); w(73, 1); w(74, 3); w(75, 0); w(76, 0); w(77, 0); w(78, 0); w(281, 0); w(65, 1); w(110, '0'); w(120, '0'); w(130, '0'); w(111, '1'); w(121, '0'); w(131, '0'); w(112, '0'); w(122, '1'); w(132, '0'); w(79, 0); w(146, '0'); w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'LTYPE'); w(5, LTYPE_CTRL); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, ltNames.size);
  for (const n of ltNames) { w(0, 'LTYPE'); w(5, H()); w(330, LTYPE_CTRL); w(100, 'AcDbSymbolTableRecord'); w(100, 'AcDbLinetypeTableRecord'); w(2, dxfString(n)); w(70, 0); w(3, n === 'Continuous' ? 'Solid line' : ''); w(72, 65); const pat = (D.ltypes[n] || []).filter(v => isFinite(v)); w(73, pat.length); let tot = 0; for (const v of pat) tot += Math.abs(v); w(40, num(tot)); for (const v of pat) { w(49, num(v)); w(74, 0); } }
  w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'LAYER'); w(5, LAYER_CTRL); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, D.layers.length);
  for (const l of D.layers) { w(0, 'LAYER'); w(5, H()); w(330, LAYER_CTRL); w(100, 'AcDbSymbolTableRecord'); w(100, 'AcDbLayerTableRecord'); w(2, dxfString(l.name)); w(70, (l.frozen ? 1 : 0) | (l.locked ? 4 : 0)); w(62, (l.off ? -1 : 1) * (l.aci || 7)); w(6, ltNames.has(l.lt) ? dxfString(l.lt) : 'Continuous'); w(370, l.lw >= 0 && l.lw <= 211 ? l.lw : -3); w(390, 'F'); }
  w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'STYLE'); w(5, STYLE_CTRL); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, 1); w(0, 'STYLE'); w(5, H()); w(330, STYLE_CTRL); w(100, 'AcDbSymbolTableRecord'); w(100, 'AcDbTextStyleTableRecord'); w(2, 'Standard'); w(70, 0); w(40, '0'); w(41, '1'); w(50, '0'); w(71, 0); w(42, '2.5'); w(3, 'arial.ttf'); w(4, ''); w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'VIEW'); w(5, '6'); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, 0); w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'UCS'); w(5, '7'); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, 0); w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'APPID'); w(5, '9'); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, 1); w(0, 'APPID'); w(5, H()); w(330, '9'); w(100, 'AcDbSymbolTableRecord'); w(100, 'AcDbRegAppTableRecord'); w(2, 'ACAD'); w(70, 0); w(0, 'ENDTAB');
  w(0, 'TABLE'); w(2, 'DIMSTYLE'); w(5, 'A'); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, 0); w(100, 'AcDbDimStyleTable'); w(0, 'ENDTAB');
  const blockNames = Object.keys(D.blocks); const blkRec = new Map();
  w(0, 'TABLE'); w(2, 'BLOCK_RECORD'); w(5, BLKREC_CTRL); w(330, '0'); w(100, 'AcDbSymbolTable'); w(70, blockNames.length + 2);
  w(0, 'BLOCK_RECORD'); w(5, MS); w(330, BLKREC_CTRL); w(100, 'AcDbSymbolTableRecord'); w(100, 'AcDbBlockTableRecord'); w(2, '*Model_Space'); w(340, '0');
  w(0, 'BLOCK_RECORD'); w(5, PS); w(330, BLKREC_CTRL); w(100, 'AcDbSymbolTableRecord'); w(100, 'AcDbBlockTableRecord'); w(2, '*Paper_Space'); w(340, '0');
  for (const n of blockNames) { const h = H(); blkRec.set(n, h); w(0, 'BLOCK_RECORD'); w(5, h); w(330, BLKREC_CTRL); w(100, 'AcDbSymbolTableRecord'); w(100, 'AcDbBlockTableRecord'); w(2, dxfString(safeName(n))); w(340, '0'); }
  w(0, 'ENDTAB'); w(0, 'ENDSEC');
  // entities writer
  const skipped = {};
  const ent = (e, owner, paper) => {
    const common = (type, sub) => { w(0, type); w(5, H()); w(330, owner); w(100, 'AcDbEntity'); if (paper) w(67, 1); w(8, dxfString(e.L || '0')); if (e.lt && !/^bylayer$/i.test(e.lt)) w(6, dxfString(ltNames.has(e.lt) || /^byblock$/i.test(e.lt) ? e.lt : 'Continuous')); if (e.c != null && e.c !== 256) w(62, e.c); if (e.lts && Math.abs(e.lts - 1) > 1e-12) w(48, e.lts); if (sub) w(100, sub); };
    const pt = (code, p, z) => { w(code, num(p[0])); w(code + 10, num(p[1])); if (z !== false) w(code + 20, '0'); };
    switch (e.t) {
      case 'LINE': common('LINE', 'AcDbLine'); pt(10, e.a); pt(11, e.b); break;
      case 'PLINE': common('LWPOLYLINE', 'AcDbPolyline'); w(90, e.v.length); w(70, e.closed ? 1 : 0); if (e.w) w(43, num(e.w)); for (const v of e.v) { w(10, num(v[0])); w(20, num(v[1])); if (v[2]) w(42, num(v[2])); } break;
      case 'CIRCLE': common('CIRCLE', 'AcDbCircle'); pt(10, e.ce); w(40, num(e.r)); break;
      case 'ARC': common('ARC', 'AcDbCircle'); pt(10, e.ce); w(40, num(e.r)); w(100, 'AcDbArc'); w(50, num(deg(e.a0))); w(51, num(deg(e.a1))); break;
      case 'ELLIPSE': common('ELLIPSE', 'AcDbEllipse'); pt(10, e.ce); pt(11, e.m); w(40, num(e.k)); w(41, num(e.a0)); w(42, num(e.a1)); break;
      case 'SPLINE': { common('SPLINE', 'AcDbSpline'); w(210, '0'); w(220, '0'); w(230, '1'); const hasCp = e.cp && e.cp.length >= 2 && e.knots && e.knots.length === e.cp.length + e.deg + 1; const rational = hasCp && e.cp.some(c => c[2] && Math.abs(c[2] - 1) > 1e-9); w(70, (e.closed ? 1 : 0) | (rational ? 4 : 0) | 8); w(71, e.deg || 3); w(72, hasCp ? e.knots.length : 0); w(73, hasCp ? e.cp.length : 0); w(74, hasCp ? 0 : (e.fit || []).length); if (hasCp) { for (const k of e.knots) w(40, num(k)); for (const c of e.cp) { pt(10, c); if (rational) w(41, num(c[2] || 1)); } } else for (const f of e.fit) pt(11, f); break; }
      case 'TEXT': common('TEXT', 'AcDbText'); pt(10, e.p); w(40, num(e.h)); w(1, dxfString(e.s)); if (e.rot) w(50, num(deg(e.rot))); if (e.wf && e.wf !== 1) w(41, num(e.wf)); if (e.ha) w(72, e.ha); if (e.ha || e.va) pt(11, e.ap); w(100, 'AcDbText'); if (e.va) w(73, e.va); break;
      case 'MTEXT': { common('MTEXT', 'AcDbMText'); pt(10, e.p); w(40, num(e.h)); w(41, num(e.w || 0)); w(71, e.at || 1); w(72, 1); const s = dxfString(e.s); for (let i = 0; i + 250 < s.length; i += 250) w(3, s.slice(i, i + 250)); w(1, s.length > 250 ? s.slice(s.length - (s.length % 250 || 250)) : s); if (e.rot) w(50, num(deg(e.rot))); w(44, num(e.ls || 1)); break; }
      case 'INSERT': if (!D.blocks[e.n]) { skipped.INSERT = (skipped.INSERT || 0) + 1; return; } common('INSERT', 'AcDbBlockReference'); w(2, dxfString(safeName(e.n))); pt(10, e.p); w(41, num(e.sx || 1)); w(42, num(e.sy || 1)); w(43, '1'); if (e.rot) w(50, num(deg(e.rot))); if (e.cols) { w(70, e.cols); w(71, e.rows || 1); w(44, num(e.cs || 0)); w(45, num(e.rs || 0)); } break;
      case 'HATCH': {
        common('HATCH', 'AcDbHatch'); w(10, '0'); w(20, '0'); w(30, '0'); w(210, '0'); w(220, '0'); w(230, '1'); w(2, dxfString(e.solid ? 'SOLID' : e.name)); w(70, e.solid ? 1 : 0); w(71, 0); w(91, e.paths.length);
        for (const loop of e.paths) {
          if (loop.v) { w(92, 2 | 1); w(72, loop.v.some(v => v[2]) ? 1 : 0); w(73, 1); w(93, loop.v.length); for (const v of loop.v) { w(10, num(v[0])); w(20, num(v[1])); if (loop.v.some(x => x[2])) w(42, num(v[2] || 0)); } w(97, 0); }
          else { w(92, 1); w(93, loop.e.length); for (const ed of loop.e) { w(72, ed.t); if (ed.t === 1) { w(10, num(ed.a[0])); w(20, num(ed.a[1])); w(11, num(ed.b[0])); w(21, num(ed.b[1])); } else if (ed.t === 2) { w(10, num(ed.c[0])); w(20, num(ed.c[1])); w(40, num(ed.r)); w(50, num(deg(ed.a0))); w(51, num(deg(ed.a1))); w(73, ed.ccw ? 1 : 0); } else if (ed.t === 3) { w(10, num(ed.c[0])); w(20, num(ed.c[1])); w(11, num(ed.m[0])); w(21, num(ed.m[1])); w(40, num(ed.k)); w(50, num(deg(ed.a0))); w(51, num(deg(ed.a1))); w(73, ed.ccw ? 1 : 0); } else if (ed.t === 4) { const rational = ed.cp.some(c => c[2] && Math.abs(c[2] - 1) > 1e-9); w(94, ed.deg || 3); w(73, rational ? 1 : 0); w(74, 0); w(95, ed.knots.length); w(96, ed.cp.length); for (const k of ed.knots) w(40, num(k)); for (const c of ed.cp) { w(10, num(c[0])); w(20, num(c[1])); if (rational) w(42, num(c[2] || 1)); } w(97, 0); } } w(97, 0); }
        }
        w(75, e.style || 0); w(76, 1); if (!e.solid && e.pat) { w(52, num(deg(e.pat.ang || 0))); w(41, num(e.pat.sc || 1)); w(77, 0); w(78, e.pat.lines.length); for (const ln of e.pat.lines) { w(53, num(deg(ln.a))); w(43, num(ln.b[0])); w(44, num(ln.b[1])); w(45, num(ln.o[0])); w(46, num(ln.o[1])); w(79, ln.d.length); for (const d of ln.d) w(49, num(d)); } }
        w(47, '1'); w(98, 0); break;
      }
      case 'POINT': common('POINT', 'AcDbPoint'); pt(10, e.p); break;
      case 'FACE': common('3DFACE', 'AcDbFace'); pt(10, e.pts[0]); pt(11, e.pts[1]); pt(12, e.pts[2]); pt(13, e.pts[3] || e.pts[2]); break;
      case 'SOLID': common('SOLID', 'AcDbTrace'); pt(10, e.pts[0]); pt(11, e.pts[1]); pt(12, e.pts[3]); pt(13, e.pts[2]); break;
      case 'LEADER': common('LEADER', 'AcDbLeader'); w(3, 'Standard'); w(71, e.arrow ? 1 : 0); w(72, 0); w(73, 3); w(74, 0); w(75, 0); w(40, '0'); w(41, '0'); w(76, e.pts.length); for (const p of e.pts) pt(10, p); break;
      default: skipped[e.t] = (skipped[e.t] || 0) + 1; return;
    }
  };
  w(0, 'SECTION'); w(2, 'BLOCKS');
  const blockDef = (name, h, base, ents, paper) => { const bh = H(); w(0, 'BLOCK'); w(5, bh); w(330, h); w(100, 'AcDbEntity'); if (paper) w(67, 1); w(8, '0'); w(100, 'AcDbBlockBegin'); w(2, dxfString(name)); w(70, 0); w(10, num(base[0])); w(20, num(base[1])); w(30, '0'); w(3, dxfString(name)); w(1, ''); for (const e of ents) ent(e, h, paper); w(0, 'ENDBLK'); w(5, H()); w(330, h); w(100, 'AcDbEntity'); if (paper) w(67, 1); w(8, '0'); w(100, 'AcDbBlockEnd'); };
  blockDef('*Model_Space', MS, [0, 0], [], false); blockDef('*Paper_Space', PS, [0, 0], [], true);
  for (const n of blockNames) blockDef(safeName(n), blkRec.get(n), D.blocks[n].base, D.blocks[n].ents, false);
  w(0, 'ENDSEC');
  w(0, 'SECTION'); w(2, 'ENTITIES'); for (const e of D.spaces[0].ents) ent(e, MS, false); w(0, 'ENDSEC');
  w(0, 'SECTION'); w(2, 'OBJECTS'); w(0, 'DICTIONARY'); w(5, 'C'); w(330, '0'); w(100, 'AcDbDictionary'); w(281, 1); w(3, 'ACAD_GROUP'); w(350, 'D'); w(0, 'DICTIONARY'); w(5, 'D'); w(330, 'C'); w(100, 'AcDbDictionary'); w(281, 1); w(0, 'ENDSEC'); w(0, 'EOF');
  // serialize
  let s = ''; const chunks = []; for (let i = 0; i < out.length; i += 2) { const code = out[i]; chunks.push((code < 10 ? '  ' : code < 100 ? ' ' : '') + code + '\r\n' + out[i + 1] + '\r\n'); if (chunks.length > 5000) { s += chunks.join(''); chunks.length = 0; } }
  s += chunks.join('');
  return { text: s, skipped };
}
// Minimal STORE zip
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(name, u8) {
  const nm = new TextEncoder().encode(name); const crc = crc32(u8); const now = new Date(); const dt = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF; const dd = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
  const lh = new Uint8Array(30 + nm.length); const dv = new DataView(lh.buffer);
  dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true); dv.setUint16(10, dt, true); dv.setUint16(12, dd, true); dv.setUint32(14, crc, true); dv.setUint32(18, u8.length, true); dv.setUint32(22, u8.length, true); dv.setUint16(26, nm.length, true); dv.setUint16(28, 0, true); lh.set(nm, 30);
  const cd = new Uint8Array(46 + nm.length); const dv2 = new DataView(cd.buffer);
  dv2.setUint32(0, 0x02014b50, true); dv2.setUint16(4, 20, true); dv2.setUint16(6, 20, true); dv2.setUint16(8, 0x0800, true); dv2.setUint16(10, 0, true); dv2.setUint16(12, dt, true); dv2.setUint16(14, dd, true); dv2.setUint32(16, crc, true); dv2.setUint32(20, u8.length, true); dv2.setUint32(24, u8.length, true); dv2.setUint16(28, nm.length, true); dv2.setUint16(30, 0, true); dv2.setUint16(32, 0, true); dv2.setUint16(34, 0, true); dv2.setUint16(36, 0, true); dv2.setUint32(38, 0, true); dv2.setUint32(42, 0, true); cd.set(nm, 46);
  const eocd = new Uint8Array(22); const dv3 = new DataView(eocd.buffer); dv3.setUint32(0, 0x06054b50, true); dv3.setUint16(4, 0, true); dv3.setUint16(6, 0, true); dv3.setUint16(8, 1, true); dv3.setUint16(10, 1, true); dv3.setUint32(12, cd.length, true); dv3.setUint32(16, lh.length + u8.length, true); dv3.setUint16(20, 0, true);
  return new Blob([lh, u8, cd, eocd], { type: 'application/zip' });
}
let downloadsNs = null; (async () => { try { if (window.claude && window.claude.use) downloadsNs = await window.claude.use('downloads'); } catch (e) { downloadsNs = null; } })();
async function saveFile(filename, data) {
  if (downloadsNs) { try { await downloadsNs.save({ filename, data }); toast('Saved ' + filename); return true; } catch (err) { if (err && err.code === 'declined') { toast('Save cancelled'); return false; } toast('Could not save: ' + (err && err.message ? err.message : err)); return false; } }
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); toast('Download started'); return true; } catch (e) { toast('Saving is not available in this view'); return false; }
}
async function exportDxf() {
  if (!state.drawing) return; toast('Building DXF…', 4000);
  await new Promise(r => setTimeout(r, 30));
  const { text, skipped } = buildDxf(state.drawing);
  const base = (state.fileName || 'drawing').replace(/\.(dwg|dxf)$/i, '');
  const u8 = new TextEncoder().encode(text); const zip = makeZip(base + '.dxf', u8);
  const sk = Object.entries(skipped).map(([k, v]) => k + ' ×' + v).join(', ');
  await saveFile(base + '-TesseractCAD.zip', zip);
  if (sk) toast('DXF ready. Not exported: ' + sk, 4000);
}
async function exportPng() {
  if (!state.drawing) return; renderFull();
  const blob = await new Promise(r => cv.toBlob(r, 'image/png')); const base = (state.fileName || 'drawing').replace(/\.(dwg|dxf)$/i, '');
  await saveFile(base + '-' + (curSpace().name.replace(/[^\w-]+/g, '_')) + '.png', blob);
}

// ===================== Storage (recent files) =====================
function idb() { return new Promise((res, rej) => { try { const r = indexedDB.open('tesseract-cad', 1); r.onupgradeneeded = () => { r.result.createObjectStore('files', { keyPath: 'name' }); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); }
async function idbPut(rec) { try { const db = await idb(); await new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(rec); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); } catch (e) { console.warn('idb', e); } }
async function idbAll() { try { const db = await idb(); return await new Promise((res, rej) => { const tx = db.transaction('files', 'readonly'); const r = tx.objectStore('files').getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); }); } catch (e) { return []; } }
async function idbDel(name) { try { const db = await idb(); await new Promise((res) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').delete(name); tx.oncomplete = res; tx.onerror = res; }); } catch (e) { } }
// Recent files: the original file is kept under its own name; edited copies are separate entries
// ("name (edited)") so reopening the original never overwrites saved edits.
const EDIT_SUFFIX = ' (edited)';
const baseName = (n) => String(n || '').endsWith(EDIT_SUFFIX) ? String(n).slice(0, -EDIT_SUFFIX.length) : String(n || '');
async function saveRecent(withEdits) {
  if (!state.drawing || state.drawing.sample) return;
  const orig = baseName(state.fileName);
  const rec = { name: withEdits ? orig + EDIT_SUFFIX : orig, orig, when: Date.now(), bytes: state.fileBytes, kind: state.kind };
  if (withEdits) { rec.drawing = state.drawing; rec.edited = true; }
  await idbPut(rec);
  const all = await idbAll(); all.sort((a, b) => b.when - a.when); for (const r of all.slice(6)) idbDel(r.name);
  renderRecent();
}
async function renderRecent() {
  const all = (await idbAll()).sort((a, b) => b.when - a.when); const el = $('recent'); el.innerHTML = '';
  if (!all.length) { el.innerHTML = '<div class="empty">Recently opened files will appear here.</div>'; return; }
  for (const r of all) { const b = document.createElement('button'); const kb = r.bytes ? Math.round(r.bytes.byteLength / 1024) : 0; b.innerHTML = '<span>' + escapeHtml(r.name) + (r.edited ? ' <small style="color:var(--accent)">edited</small>' : '') + '</span><span>' + (kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB') + '</span>'; b.addEventListener('click', () => openRecent(r)); el.appendChild(b); }
}
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
async function openRecent(r) {
  confirmUnsaved(() => {
    if (r.drawing) { state.fileBytes = r.bytes; state.fileName = r.name; state.kind = r.kind; loadDrawing(r.drawing, r.name); toast('Opened your saved copy with edits'); }
    else if (r.bytes) parseFile(r.bytes, r.name);
  });
}
// Ask before throwing away edits: Save (keeps an edited copy on this phone), Discard, or Cancel.
function confirmUnsaved(then) {
  if (!state.drawing || !state.dirty || state.drawing.sample) { then(); return; }
  const dlg = $('saveDlg'); const name = baseName(state.fileName);
  $('saveTitle').textContent = 'Save changes to ' + name + '?';
  $('saveMsg').textContent = 'Save keeps the edited drawing on this phone under Recent as “' + name + EDIT_SUFFIX + '”. The original file is not changed. To use the edits in AutoCAD, export a DXF from the menu.';
  dlg.classList.add('on');
  const done = () => { dlg.classList.remove('on'); $('saveOk').onclick = $('saveDiscard').onclick = $('saveCancel').onclick = null; };
  $('saveOk').onclick = async () => { done(); await saveRecent(true); state.dirty = false; toast('Saved on this phone · see Recent: ' + name + EDIT_SUFFIX, 3500); then(); };
  $('saveDiscard').onclick = () => { done(); state.dirty = false; then(); };
  $('saveCancel').onclick = () => { done(); };
}
function closeDrawing() { state.drawing = null; state.scenes.clear(); state.undo.length = 0; state.redo.length = 0; state.dirty = false; state.selection.clear(); $('fileName').textContent = 'No drawing open'; $('spaceName').textContent = 'Tesseract CAD Tools'; $('welcome').style.display = ''; $('spaces').innerHTML = ''; setResult(null); updateUndoBtns(); renderRecent(); requestFull(); }

// ===================== Loading =====================
let worker = null, engineReady = false, currentLoad = null, useBlob = false;
// LibreDWG can read only one drawing per engine instance (a second read fails with "null function" /
// "Aborted()"), so every file gets a fresh engine: after each load the old one is shut down and a new
// one warms up in the background, ready for the next file.
function recycleWorker() { const w = worker; worker = null; engineReady = false; try { if (w) w.terminate(); } catch (e) { } setTimeout(warmUpEngine, 60); }
function getWorker() {
  if (!worker) {
    if (useBlob) { startBlobWorker(); return worker; }
    try { worker = new Worker('cad-worker.js', { type: 'module' }); }
    catch (e1) { worker = null; }
    if (!worker) { startBlobWorker(); return worker; }
    wireWorker();
  }
  return worker;
}
function wireWorker() {
  {
    worker.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === 'ready') { engineReady = true; $('engineStatus').textContent = 'DWG engine ready on this device.'; return; }
      if (!currentLoad) { if (m.type === 'error') { $('engineStatus').textContent = m.message; console.warn(m.message); } return; }
      if (m.type === 'progress') showLoading(true, m.stage, m.pct);
      else if (m.type === 'error') { const L = currentLoad; currentLoad = null; recycleWorker(); if (!L.retried && state.fileBytes) { parseFile(state.fileBytes, L.name, true); return; } showLoading(false); toast('Could not open ' + L.name + ': ' + m.message, 7000); }
      else if (m.type === 'done') { const L = currentLoad; currentLoad = null; recycleWorker(); showLoading(true, 'Preparing view', 95); setTimeout(() => { loadDrawing(m.drawing, L.name); showLoading(false); const ms = Math.round(performance.now() - L.t0); const n = m.drawing.spaces[0].ents.length; toast('Opened in ' + (ms / 1000).toFixed(1) + ' s · ' + n.toLocaleString() + ' objects in model'); saveRecent(false); }, 20); }
    };
    worker.onerror = (e) => { const msg = (e && e.message) || 'unknown error'; console.warn('worker error', msg, e && e.filename, e && e.lineno); if (currentLoad && engineReady) { const L = currentLoad; currentLoad = null; recycleWorker(); if (!L.retried && state.fileBytes) { parseFile(state.fileBytes, L.name, true); return; } } if (currentLoad) { showLoading(false); toast('File reader failed: ' + msg, 7000); currentLoad = null; } $('engineStatus').textContent = 'DWG engine could not start here (' + msg + '). DXF files still open.'; worker = null; tryBlobFallback(); };
  }
}
let blobTried = false;
async function startBlobWorker() {
  try {
    const base = new URL('cad-worker.js', location.href).href;
    const txt = await (await fetch(base)).text();
    const src = txt.split('import.meta.url').join(JSON.stringify(base));
    worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })), { type: 'module' });
    useBlob = true; wireWorker(); worker.postMessage({ kind: 'init' });
  } catch (e) { worker = null; $('engineStatus').textContent = 'DWG engine could not start here (' + (e && e.message || e) + ').'; }
}
function tryBlobFallback() { if (blobTried) return; blobTried = true; $('engineStatus').textContent = 'Retrying DWG engine another way…'; startBlobWorker(); }
function warmUpEngine() { try { const w = getWorker(); if (w) w.postMessage({ kind: 'init' }); } catch (e) { $('engineStatus').textContent = 'DWG engine could not start: ' + e.message; } }
setTimeout(warmUpEngine, 600);
function showLoading(on, stage, pct) { $('loading').classList.toggle('on', !!on); if (stage) $('loadStage').textContent = stage; if (pct != null) $('loadBar').style.width = pct + '%'; }
function parseFile(buf, name, retried) {
  state.fileBytes = buf; state.fileName = name; state.kind = /\.dxf$/i.test(name) ? 'dxf' : 'dwg';
  showLoading(true, state.kind === 'dxf' ? 'Reading DXF…' : (engineReady ? 'Reading DWG…' : 'Starting DWG engine…'), 3);
  currentLoad = { name, t0: performance.now(), retried: !!retried };
  let tries = 0;
  const send = () => {
    let w; try { w = getWorker(); } catch (e) { showLoading(false); currentLoad = null; toast('Could not start the file reader: ' + e.message, 6000); return; }
    if (!w) { if (++tries > 40) { showLoading(false); currentLoad = null; toast('DWG engine could not start in this view. ' + $('engineStatus').textContent, 8000); return; } setTimeout(send, 250); return; }
    w.postMessage({ buf: buf.slice(0), name, kind: state.kind });
  };
  send();
}
function loadDrawing(D, name) {
  state.drawing = D; state.scenes.clear(); blockCache.clear(); state.selection.clear(); state.undo.length = 0; state.redo.length = 0; state.dirty = false; state.spaceIdx = 0; lastFull = null;
  state.layerMap = new Map(D.layers.map(l => [l.name, l])); state.layerVis = new Map(D.layers.map(l => [l.name, !(l.off || l.frozen)]));
  state.curLayer = state.layerMap.has(D.header.clayer) ? D.header.clayer : '0';
  $('fileName').textContent = name; $('welcome').style.display = 'none';
  renderSpaces(); renderLayers(); updateUndoBtns(); updateInfo();
  startTool('select', true); zoomExtents();
}
function updateInfo() { const D = state.drawing; if (!D) return; const nM = D.spaces[0].ents.length; const sk = Object.entries(D.skipped || {}).map(([k, v]) => k + ' ×' + v).join(', '); $('infoText').textContent = (D.sample ? 'Sample drawing' : state.fileName) + ' · ' + nM.toLocaleString() + ' objects in model · ' + (D.spaces.length - 1) + ' layout' + (D.spaces.length === 2 ? '' : 's') + ' · ' + D.layers.length + ' layers · units: ' + (UNIT_NAME[D.header.units] || 'unitless') + (D.parseMs ? ' · parsed in ' + (D.parseMs / 1000).toFixed(1) + ' s' : '') + (sk ? ' · not shown: ' + sk : ''); }
function renderSpaces() {
  const nav = $('spaces'); nav.innerHTML = '';
  const setChip = () => { const sp = state.drawing.spaces[state.spaceIdx]; $('spaceName').innerHTML = ''; $('spaceName').append(document.createTextNode(sp.name + ' ')); const t = document.createElement('span'); t.className = 'tag'; t.textContent = sp.paper ? 'LAYOUT' : (state.drawing.spaces.length > 1 ? '· ' + (state.drawing.spaces.length - 1) + ' LAYOUTS' : ''); $('spaceName').append(t); };
  state.drawing.spaces.forEach((sp, i) => { const b = document.createElement('button'); b.append(document.createTextNode(sp.name)); const t = document.createElement('span'); t.className = 'paper-tag'; t.textContent = sp.paper ? 'LAYOUT' : 'MODEL'; b.appendChild(t); b.setAttribute('aria-selected', i === state.spaceIdx ? 'true' : 'false'); b.addEventListener('click', () => { closeSheets(); if (state.spaceIdx === i) return; state.spaceIdx = i; state.selection.clear(); lastFull = null; for (const x of nav.children) x.setAttribute('aria-selected', 'false'); b.setAttribute('aria-selected', 'true'); setChip(); showLoading(true, 'Opening ' + sp.name, 50); setTimeout(() => { zoomExtents(); showLoading(false); }, 20); }); nav.appendChild(b); });
  setChip();
}
function renderLayers() {
  const list = $('layerList'); list.innerHTML = ''; const D = state.drawing; if (!D) return;
  const S = state.scenes.get(state.spaceIdx); const counts = new Map(); if (S) for (const it of S.items) { const l = resolveLayer(it.ent, { layer: null }); counts.set(l, (counts.get(l) || 0) + 1); }
  const layers = D.layers.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  $('layersTitle').textContent = 'Layers (' + layers.length + ')';
  for (const l of layers) {
    const row = document.createElement('label'); row.className = 'layer' + (layerOn(l.name) ? '' : ' off') + (l.name === state.curLayer ? ' cur' : '');
    row.innerHTML = '<input type="checkbox" ' + (layerOn(l.name) ? 'checked' : '') + '><span class="sw" style="background:' + aciCss(l.aci, false) + '"></span><span class="nm">' + escapeHtml(l.name) + '</span><span class="ct">' + (counts.get(l.name) || '') + '</span>';
    row.querySelector('input').addEventListener('change', (ev) => { state.layerVis.set(l.name, ev.target.checked); row.classList.toggle('off', !ev.target.checked); requestFull(); });
    list.appendChild(row);
  }
  const sel = $('selLayer'); sel.innerHTML = ''; for (const l of layers) { const o = document.createElement('option'); o.value = l.name; o.textContent = l.name; if (l.name === state.curLayer) o.selected = true; sel.appendChild(o); }
}
function setAllLayers(fn) { for (const l of state.drawing.layers) state.layerVis.set(l.name, fn(layerOn(l.name))); renderLayers(); requestFull(); }

// ===================== Sample drawing =====================
function sampleDrawing() {
  const ents = []; let id = 1; const E = (o) => { o.id = id++; o.hd = ''; o.lt = o.lt || ''; ents.push(o); };
  const wall = (x0, y0, x1, y1) => E({ t: 'PLINE', L: 'TS - Walls', c: 256, v: [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], closed: true, w: 0 });
  // outer walls 230 thick, inner 115 — a 9.2 m × 6.1 m two-room plan in mm
  wall(0, 0, 9200, 230); wall(0, 5870, 9200, 6100); wall(0, 0, 230, 6100); wall(8970, 0, 9200, 6100); wall(4600, 230, 4715, 5870);
  // door openings and swings
  E({ t: 'LINE', L: 'TS - Doors', c: 256, a: [1500, 230], b: [1500, 1130] }); E({ t: 'ARC', L: 'TS - Doors', c: 256, ce: [1500, 230], r: 900, a0: 0, a1: Math.PI / 2 });
  E({ t: 'LINE', L: 'TS - Doors', c: 256, a: [4715, 3800], b: [5615, 3800] }); E({ t: 'ARC', L: 'TS - Doors', c: 256, ce: [4715, 3800], r: 900, a0: -Math.PI / 2, a1: 0 });
  // windows
  for (const [x0, x1] of [[2200, 3700], [6000, 7800]]) { E({ t: 'LINE', L: 'TS - Windows', c: 256, a: [x0, 5985], b: [x1, 5985] }); E({ t: 'LINE', L: 'TS - Windows', c: 256, a: [x0, 5930], b: [x1, 5930] }); E({ t: 'LINE', L: 'TS - Windows', c: 256, a: [x0, 6040], b: [x1, 6040] }); }
  // furniture: bed and table (block + inserts)
  const blocks = { BED: { base: [0, 0], ents: [{ id: id++, hd: '', t: 'PLINE', L: '0', c: 0, lt: '', v: [[0, 0, 0], [1800, 0, 0], [1800, 2000, 0], [0, 2000, 0]], closed: true, w: 0 }, { id: id++, hd: '', t: 'PLINE', L: '0', c: 0, lt: '', v: [[100, 1500, 0], [850, 1500, 0], [850, 1900, 0], [100, 1900, 0]], closed: true, w: 0 }, { id: id++, hd: '', t: 'PLINE', L: '0', c: 0, lt: '', v: [[950, 1500, 0], [1700, 1500, 0], [1700, 1900, 0], [950, 1900, 0]], closed: true, w: 0 }] } };
  E({ t: 'INSERT', L: 'TS - Furnitures', c: 256, n: 'BED', p: [1300, 3600], sx: 1, sy: 1, rot: 0 });
  E({ t: 'CIRCLE', L: 'TS - Furnitures', c: 256, ce: [6800, 2400], r: 600 });
  // flooring hatch (pattern) and a solid
  E({ t: 'HATCH', L: 'TS - Flooring Hatch', c: 256, solid: false, name: 'ANSI37', style: 1, paths: [{ v: [[4715, 230, 0], [8970, 230, 0], [8970, 5870, 0], [4715, 5870, 0]], closed: true }], pat: { ang: 0, sc: 1, lines: [{ a: Math.PI / 4, b: [0, 0], o: [-212.13, 212.13], d: [] }, { a: 3 * Math.PI / 4, b: [0, 0], o: [-212.13, -212.13], d: [] }] } });
  E({ t: 'HATCH', L: 'TS - Walls Hatch', c: 8, solid: true, name: 'SOLID', style: 1, paths: [{ v: [[4600, 230, 0], [4715, 230, 0], [4715, 5870, 0], [4600, 5870, 0]], closed: true }] });
  // text and dimensions
  E({ t: 'MTEXT', L: 'TS - Text', c: 256, p: [2400, 3200], h: 200, w: 3000, rot: 0, s: 'BEDROOM\\P4.37 × 5.64 m', at: 5, ls: 1 });
  E({ t: 'MTEXT', L: 'TS - Text', c: 256, p: [6850, 3200], h: 200, w: 3000, rot: 0, s: 'LIVING\\P4.26 × 5.64 m', at: 5, ls: 1 });
  E({ t: 'TEXT', L: 'TS - Text', c: 1, p: [300, 6400], ap: [0, 0], h: 250, rot: 0, s: 'SAMPLE PLAN  (not a real project)', ha: 0, va: 0, wf: 1 });
  const dim = (x0, x1, y, txt) => { E({ t: 'LINE', L: 'TS-DIM', c: 256, a: [x0, y], b: [x1, y] }); E({ t: 'LINE', L: 'TS-DIM', c: 256, a: [x0, y - 200], b: [x0, y + 200] }); E({ t: 'LINE', L: 'TS-DIM', c: 256, a: [x1, y - 200], b: [x1, y + 200] }); E({ t: 'TEXT', L: 'TS-DIM', c: 256, p: [(x0 + x1) / 2, y + 80], ap: [(x0 + x1) / 2, y + 80], h: 180, rot: 0, s: txt, ha: 1, va: 0, wf: 1 }); };
  dim(0, 4600, -700, '4600'); dim(4600, 9200, -700, '4600'); dim(0, 9200, -1300, '9200');
  const layers = [['0', 7], ['TS - Walls', 7], ['TS - Walls Hatch', 8], ['TS - Doors', 34], ['TS - Windows', 142], ['TS - Furnitures', 27], ['TS - Flooring Hatch', 8], ['TS - Text', 7], ['TS-DIM', 7]].map(([name, aci]) => ({ name, aci, off: false, frozen: false, locked: false, lw: -3, lt: 'Continuous' }));
  return { name: 'Sample plan', sample: true, layers, ltypes: {}, blocks, spaces: [{ name: 'Model', paper: false, ents }], header: { units: 4, extmin: [-500, -1500], extmax: [9700, 6700], ltscale: 1, clayer: 'TS - Walls', luprec: 2, textsize: 250 }, skipped: {}, nextId: id };
}

// ===================== UI wiring =====================
$('btnOpen').addEventListener('click', () => { closeSheets(); $('file').click(); }); $('btnOpen2').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', async (ev) => { const f = ev.target.files && ev.target.files[0]; ev.target.value = ''; if (!f) return; if (f.size > 120 * 1024 * 1024) { toast('That file is over 120 MB; try a smaller DWG.', 4000); return; } const buf = await f.arrayBuffer(); confirmUnsaved(() => parseFile(buf, f.name)); });
$('btnSample').addEventListener('click', () => confirmUnsaved(() => { state.fileBytes = null; state.fileName = 'Sample plan'; loadDrawing(sampleDrawing(), 'Sample plan (built in)'); }));
$('btnFit').addEventListener('click', zoomExtents);
$('btnSpace').addEventListener('click', () => { if (!state.drawing || $('welcome').style.display !== 'none') { $('file').click(); return; } renderSpaces(); openSheet('spacesPanel'); });
// Full screen: hide the top bar and toolbar; also ask the browser to hide its own bars where it can.
function setFull(on) { document.body.classList.toggle('fs', on); $('btnFull').innerHTML = on ? '<svg viewBox="0 0 24 24"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M14 3h7v7M10 21H3v-7M21 3l-7 7M3 21l7-7"/></svg>'; $('btnFull').title = on ? 'Exit full screen' : 'Full screen'; }
$('btnFull').addEventListener('click', () => { const on = !document.body.classList.contains('fs'); setFull(on); try { if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); else if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => { }); } catch (e) { } });
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.body.classList.contains('fs')) setFull(false); });
$('btnKeys').addEventListener('click', () => { const row = $('promptRow'); row.hidden = !row.hidden; $('btnKeys').setAttribute('aria-pressed', row.hidden ? 'false' : 'true'); if (!row.hidden) setTimeout(() => $('typed').focus(), 30); });
$('btnUndo').addEventListener('click', undo); $('btnRedo').addEventListener('click', redo);
$('btnDone').addEventListener('click', doneTool); $('btnCancel').addEventListener('click', cancelTool); $('btnBack').addEventListener('click', backPoint);
function openSheet(id) { $(id).classList.add('open'); $('scrim').classList.add('on'); if (id === 'layersPanel') renderLayers(); }
function closeSheets() { for (const s of document.querySelectorAll('.sheet')) s.classList.remove('open'); $('groups').classList.remove('open'); $('scrim').classList.remove('on'); }
$('btnLayers').addEventListener('click', () => { if (!state.drawing) { toast('Open a drawing first'); return; } openSheet('layersPanel'); });
$('btnMenu').addEventListener('click', () => openSheet('menuPanel'));
$('scrim').addEventListener('click', closeSheets); for (const b of document.querySelectorAll('[data-close]')) b.addEventListener('click', closeSheets);
$('layersAll').addEventListener('click', () => setAllLayers(() => true)); $('layersNone').addEventListener('click', () => setAllLayers(() => false)); $('layersInvert').addEventListener('click', () => setAllLayers(v => !v));
$('miExport').addEventListener('click', () => { closeSheets(); exportDxf(); }); $('miPng').addEventListener('click', () => { closeSheets(); exportPng(); });
$('miSave').addEventListener('click', async () => { if (!state.drawing) return; if (state.drawing.sample) { toast('The sample cannot be saved'); return; } await saveRecent(true); state.dirty = false; state.fileName = baseName(state.fileName) + EDIT_SUFFIX; $('fileName').textContent = state.fileName; closeSheets(); toast('Saved on this phone · see Recent: ' + state.fileName, 3500); });
$('miClose').addEventListener('click', () => { closeSheets(); confirmUnsaved(closeDrawing); });
$('segCanvas').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; for (const x of $('segCanvas').children) x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); state.canvasLight = b.dataset.v === 'light'; stage.classList.toggle('light', state.canvasLight); try { localStorage.setItem('tct-canvas', b.dataset.v); } catch (e) { } requestFull(); });
$('segUnits').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; for (const x of $('segUnits').children) x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); state.unitMode = b.dataset.v; try { localStorage.setItem('tct-units', b.dataset.v); } catch (e) { } if (state.tool && state.tool.update) state.tool.update(); });
$('chkSnap').addEventListener('change', (ev) => { state.snapOn = ev.target.checked; }); $('chkPat').addEventListener('change', (ev) => { state.patOn = ev.target.checked; requestFull(); });
$('selLayer').addEventListener('change', (ev) => { state.curLayer = ev.target.value; renderLayers(); toast('New objects go on ' + state.curLayer); });
try { const c = localStorage.getItem('tct-canvas'); if (c === 'light') { state.canvasLight = true; stage.classList.add('light'); for (const x of $('segCanvas').children) x.setAttribute('aria-pressed', x.dataset.v === 'light' ? 'true' : 'false'); } const u = localStorage.getItem('tct-units'); if (u) { state.unitMode = u; for (const x of $('segUnits').children) x.setAttribute('aria-pressed', x.dataset.v === u ? 'true' : 'false'); } } catch (e) { }
window.addEventListener('beforeunload', (ev) => { if (state.dirty) { ev.preventDefault(); ev.returnValue = ''; } });
setGroup('view'); renderRecent(); resizeCanvas();
// First frame: show the built-in sample so the app opens in a working state; the welcome card sits on top until a file is chosen.
loadDrawing(sampleDrawing(), 'Sample plan (built in)'); $('welcome').style.display = ''; $('fileName').textContent = 'Sample plan (built in)'; updateUndoBtns();
