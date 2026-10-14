// Drives Tesseract CAD inside the emulator's WebView over Chrome DevTools and records what happens.
import { execSync } from 'node:child_process';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (name) => { try { execSync(`adb exec-out screencap -p > out/shot-${name}.png`); } catch (e) { } };
const out = { steps: [] };
const log = (k, v) => { out[k] = v; out.steps.push(k); };
let list = [];
for (let i = 0; i < 20 && !list.length; i++) { try { list = (await (await fetch('http://127.0.0.1:9222/json')).json()).filter((p) => p.type === 'page'); } catch (e) { } if (!list.length) await sleep(1000); }
log('pages', list.map((p) => p.url));
const page = list.find((p) => /appassets/.test(p.url)) || list[0];
if (!page) { console.log(JSON.stringify({ error: 'no WebView page to attach to', pages: list })); process.exit(0); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let seq = 0; const waits = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waits.has(d.id)) { waits.get(d.id)(d); waits.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; waits.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); return r.result && r.result.exceptionDetails ? 'EXCEPTION ' + JSON.stringify(r.result.exceptionDetails).slice(0, 400) : (r.result && r.result.result ? r.result.result.value : r); };
try {
  for (let i = 0; i < 90; i++) { const s = await ev("document.getElementById('engineStatus').textContent"); out.engine = s; if (/ready|could not/i.test(s)) break; await sleep(1000); }
  log('engine', out.engine);
  log('version', await ev("document.getElementById('verName').textContent + ' | ' + document.getElementById('verSub').textContent"));
  log('native', await ev("typeof NATIVE + ' ' + !!NATIVE + ' ' + window.TCNative.appInfo()"));
  log('fonts', await ev("document.fonts.ready.then(() => ['Jost','IBM Plex Mono','IBM Plex Sans'].map(f => f + ':' + document.fonts.check('16px \"' + f + '\"')).join(' '))"));
  log('storage', await ev("(async () => { localStorage.setItem('tct-ci', '1'); const d = await idb(); return 'localStorage ' + localStorage.getItem('tct-ci') + ' · indexedDB ' + (d && d.name); })()"));
  log('layout', await ev("JSON.stringify({ w: innerWidth, h: innerHeight, top: document.getElementById('top').getBoundingClientRect().top, dpr: devicePixelRatio })"));
  shot('home');
  // the sample plan, then a DXF made from it, read by the worker
  await ev("document.getElementById('btnSample').click()"); await sleep(3000);
  log('sample', await ev("state.drawing ? 'objects ' + state.drawing.spaces[0].ents.length + ' · strip ' + document.getElementById('spaceTabs').textContent : 'not open'"));
  shot('sample');
  log('dxf', await ev("(async () => { const { text } = buildDxf(sampleDrawing()); goHome(); parseFile(new TextEncoder().encode(text).buffer, 'ci-sample.dxf'); for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 500)); if (state.drawing && activeDoc && /ci-sample/.test(docTitle(activeDoc))) return 'opened ' + state.drawing.spaces[0].ents.length + ' objects'; } return 'timeout · ' + document.getElementById('engineStatus').textContent; })()"));
  shot('dxf');
  // Check for updates: first the question, then the real check against the published version file
  await ev("goHome(); localStorage.removeItem('tct-net-ok'); document.getElementById('btnUpd').click()"); await sleep(600);
  log('ask', await ev("document.getElementById('updTitle').textContent"));
  shot('update-ask');
  execSync('adb shell input keyevent KEYCODE_BACK'); await sleep(1200);
  log('backClosesSheet', await ev("document.getElementById('updSheet').hidden"));
  await ev("document.getElementById('btnUpd').click()"); await sleep(400);
  await ev("document.getElementById('updGo').click()");
  for (let i = 0; i < 30; i++) { await sleep(1000); const t = await ev("document.getElementById('updTitle') ? document.getElementById('updTitle').textContent : ''"); if (!/Checking/.test(t)) break; }
  log('check', await ev("document.getElementById('updTitle').textContent + ' · ' + (document.querySelector('#updSheet p') || {}).textContent"));
  shot('update-result');
  await ev("updClose()");
  // share sheet for an exported DXF (Android's chooser should open)
  await ev("document.getElementById('btnSample').click()"); await sleep(2500);
  log('share', await ev("(async () => { const f = new File([buildDxf(state.drawing).text], 'ci-share.dxf', { type: 'application/dxf' }); return await nativeShare(f) ? 'share sheet opened' : 'share failed'; })()"));
  await sleep(2000); shot('share');
  execSync('adb shell input keyevent KEYCODE_BACK'); await sleep(1000);
  // back button in a drawing goes home; at home the app goes to the background
  execSync('adb shell input keyevent KEYCODE_BACK'); await sleep(1200);
  log('backInDrawing', await ev("atHome() ? 'home' : 'still in drawing'"));
  log('errors', await ev("(window.__errs || []).join(' | ')"));
} catch (e) { out.error = String(e && e.stack || e); }
console.log(JSON.stringify(out, null, 1));
process.exit(0);
