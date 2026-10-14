#!/usr/bin/env python3
"""Writes site/android/index.html: a small download page for the Android app (reads site/android/version.json)."""
import json, sys, html
v = json.load(open(sys.argv[1]))
if not v.get('apk'):
    print('<!doctype html><meta charset="utf-8"><title>Tesseract CAD for Android</title><p>The Android app is not published yet.</p>'); sys.exit()
mb = '%.1f MB' % (v['apk']['size'] / 1048576)
notes = ''.join('<li>%s</li>' % html.escape(n) for n in v.get('notes', []))
name = v['apk']['url'].rsplit('/', 1)[-1]
print(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tesseract CAD for Android</title>
<link rel="stylesheet" href="../fonts/fonts.css">
<style>
:root{{--bg:#0c0c0d;--panel:#1b1b1e;--fg:#f2f2f2;--muted:#a3a3a8;--line:#2c2c30;--accent:#ff2a2a}}
body{{margin:0;background:var(--bg);color:var(--fg);font-family:'Jost',system-ui,sans-serif;display:flex;justify-content:center;padding:16px}}
main{{width:min(100%,460px);background:var(--panel);border-radius:14px;padding:22px 20px;margin:auto 0;display:flex;flex-direction:column;gap:12px}}
img{{width:min(100%,300px);align-self:center}} h1{{margin:4px 0 0;font-size:20px;font-weight:600}} p,li{{color:var(--muted);font-size:14px;line-height:1.5}} p{{margin:0}}
ul{{margin:0;padding-left:18px}} li b,p b{{color:var(--fg);font-weight:600}}
a.dl{{display:block;text-align:center;background:var(--accent);color:#fff;text-decoration:none;font-weight:600;font-size:16px;padding:14px;border-radius:11px}}
.meta{{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--muted);display:flex;justify-content:space-between}}
.small{{font-size:12px;border-top:1px solid var(--line);padding-top:10px}} .small a{{color:var(--accent)}}
</style></head><body><main>
<img src="../logo-ink-light.png" alt="Tesseract · Design | Build">
<h1>Tesseract CAD for Android</h1>
<div class="meta"><span>Version {html.escape(v["name"])} · {html.escape(v["date"])}</span><span>{mb}</span></div>
<a class="dl" href="{html.escape(name)}">Download the app (APK)</a>
<ul>{notes}</ul>
<p><b>Installing:</b> open the downloaded file. Android asks once to allow installing apps from your browser or Files app; allow it, then tap Install.</p>
<p><b>Updates:</b> tap <b>Check for updates</b> at the bottom of the app's home screen. The app asks before going online; your drawings never leave the phone.</p>
<p class="small">Developed by Tesseract Studio · <a href="mailto:tools@tesseractstudio.co">tools@tesseractstudio.co</a> · <a href="../">Open the web version</a><br>Signing certificate SHA-256: <span style="font-family:'IBM Plex Mono',monospace;word-break:break-all">7F:18:97:2B:07:B1:93:6D:4F:D6:ED:DB:25:97:5C:25:2E:A7:0D:D8:70:39:0B:24:E2:C6:67:63:7D:96:CB:BB</span></p>
</main></body></html>''')
