#!/usr/bin/env python3
"""Writes android/version.json for Check for updates: app version, notes, the latest APK (size, SHA-256) and the web build."""
import json, sys, os, hashlib, glob
web_build = sys.argv[1] if len(sys.argv) > 1 else ''
here = os.path.dirname(os.path.abspath(__file__))
v = json.load(open(os.path.join(here, 'app-version.json')))
out = {'name': v['name'], 'code': v['code'], 'date': v['date'], 'notes': v.get('notes', []), 'web': {'build': web_build}}
apks = sorted(glob.glob(os.path.join(here, 'releases', '*.apk')))
if apks:
    rel = json.load(open(os.path.join(here, 'releases', 'release.json')))  # version of the APK actually published
    p = apks[-1]; b = open(p, 'rb').read()
    out.update({'name': rel['name'], 'code': rel['code'], 'date': rel['date'], 'notes': rel.get('notes', out['notes'])})
    out['apk'] = {'url': 'https://surya-vallala.github.io/tesseract-cad/android/' + os.path.basename(p), 'size': len(b), 'sha256': hashlib.sha256(b).hexdigest()}
else:
    out['code'] = 0  # no APK published yet: nothing to offer the Android app
print(json.dumps(out, indent=2))
