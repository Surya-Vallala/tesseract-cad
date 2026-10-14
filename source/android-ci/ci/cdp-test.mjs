// Drives Tesseract CAD inside the emulator's WebView over Chrome DevTools and records what happens.
import { execSync } from 'node:child_process';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (name) => { try { execSync(`adb exec-out screencap -p > out/shot-${name}.png`); } catch (e) { } };
const out = { steps: [] };
import { writeFileSync } from 'node:fs';
const log = (k, v) => { out[k] = v; out.steps.push(k); try { writeFileSync('out/cdp-test.json', JSON.stringify(out, null, 1)); } catch (e) { } };
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
const ev = async (expression) => { const r = await Promise.race([send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }), sleep(20000).then(() => ({ result: { result: { value: 'TIMEOUT (page gone)' } } }))]); return r.result && r.result.exceptionDetails ? 'EXCEPTION ' + JSON.stringify(r.result.exceptionDetails).slice(0, 400) : (r.result && r.result.result ? r.result.result.value : r); };
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
  // Back in a drawing: first closes an open panel, then the drawing (→ home)
  await ev("document.getElementById('btnSample').click()"); await sleep(2500);
  await ev("window.__back = 0; const f0 = window.tcNativeBack; window.tcNativeBack = () => { window.__back++; return f0(); }; openSheet('menuPanel')"); await sleep(500);
  execSync('adb shell input keyevent KEYCODE_BACK'); await sleep(1500);
  log('back1', await ev("'calls ' + __back + ' · menu open ' + !!document.querySelector('.sheet.open') + ' · ' + (atHome() ? 'home' : 'in drawing')"));
  execSync('adb shell input keyevent KEYCODE_BACK'); await sleep(1500);
  log('backInDrawing', await ev("'calls ' + __back + ' · ' + (atHome() ? 'home' : 'still in drawing') + ' · docs ' + docs.length"));
  // share sheet for an exported DXF (Android's chooser should open)
  await ev("document.getElementById('btnSample').click()"); await sleep(2500);
  log('share', await ev("(async () => { const f = new File([buildDxf(state.drawing).text], 'ci-share.dxf', { type: 'application/dxf' }); return await nativeShare(f) ? 'share sheet opened' : 'share failed'; })()"));
  await sleep(2000); shot('share');
  execSync('adb shell input keyevent KEYCODE_BACK'); await sleep(1000);
  log('fontsLater', await ev(`['IBM Plex Mono','IBM Plex Sans'].map(f => f + ':' + document.fonts.check('16px "' + f + '"')).join(' ')`));
  // the whole update path against a test channel: question skipped (remembered), download, Android's permission, installer
  const repo = process.env.GITHUB_REPOSITORY || 'Surya-Vallala/tesseract-cad';
  await ev(`localStorage.setItem('tct-net-ok','1'); localStorage.setItem('tct-upd-url','https://raw.githubusercontent.com/${repo}/apk-channel/version.json'); location.reload()`);
  await sleep(6000);
  await ev("document.getElementById('btnUpd').click()");
  for (let i = 0; i < 30; i++) { await sleep(1000); const t = await ev("(document.getElementById('updTitle') || {}).textContent || ''"); if (!/Checking/.test(t)) break; }
  log('updOffer', await ev("document.getElementById('updTitle').textContent + ' · ' + document.querySelector('#updSheet .meta').textContent"));
  shot('update-offer');
  await ev("document.getElementById('updNow').click()");
  let st = '';
  for (let i = 0; i < 60; i++) { await sleep(1000); st = await ev("(document.getElementById('updMsg') || {}).textContent || ''"); if (/Allow from this source|Android window|didn't finish/i.test(st)) break; }
  log('updAfterDownload', st);
  shot('update-permission');
  const fg = () => { try { return execSync("adb shell dumpsys activity activities | grep -m1 -E 'topResumedActivity|mResumedActivity'").toString().trim(); } catch (e) { return ''; } };
  log('foregroundAfterDownload', fg());
  if (/Allow from this source/.test(st)) {
    execSync('adb shell appops set co.tesseractstudio.cad REQUEST_INSTALL_PACKAGES allow'); await sleep(800);
    execSync('adb shell input keyevent KEYCODE_BACK'); await sleep(3000);
  }
  log('updMsgAfterPermission', await ev("(document.getElementById('updMsg') || {}).textContent || ''"));
  // the system installer asks "Do you want to update this app?": find its Update button and tap it
  let tapped = 'no installer button found';
  for (let i = 0; i < 15; i++) {
    await sleep(1500);
    let xml = ''; try { execSync('adb shell uiautomator dump /sdcard/ui.xml'); xml = execSync('adb shell cat /sdcard/ui.xml').toString(); } catch (e) { }
    const m = /text="(Update|UPDATE|Install|INSTALL)"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/.exec(xml);
    if (m) { const x = (+m[2] + +m[4]) >> 1, y = (+m[3] + +m[5]) >> 1; shot('installer'); execSync(`adb shell input tap ${x} ${y}`); tapped = 'tapped ' + m[1] + ' at ' + x + ',' + y; break; }
    if (i === 14) { out.installerScreen = xml.slice(0, 3000); shot('installer-missing'); }
  }
  log('installer', tapped);
  await sleep(15000);
  try { log('installedVersion', execSync("adb shell dumpsys package co.tesseractstudio.cad | grep -E 'versionCode|versionName' | head -2").toString().trim()); } catch (e) { log('installedVersion', 'dumpsys failed'); }
} catch (e) { out.error = String(e && e.stack || e); }
try { writeFileSync('out/cdp-test.json', JSON.stringify(out, null, 1)); } catch (e) { }
process.exit(0);
