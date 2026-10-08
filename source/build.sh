#!/bin/bash
set -e
cd /home/claude/dwgtest
ACI=$(cat aci.txt)
{ cat src/part1.html; echo '<script>'; cat src/part2.js src/part3.js src/part4.js src/part5.js src/part6.js src/part7.js src/part8.js | sed "s/ACI_TABLE_PLACEHOLDER/$ACI/"; echo '</script>'; } > out/tesseract-cad-tools.html
# syntax check of the script
{ cat src/part2.js src/part3.js src/part4.js src/part5.js src/part6.js src/part7.js src/part8.js | sed "s/ACI_TABLE_PLACEHOLDER/$ACI/"; } > /tmp/claude-0/-home-claude/b4e097ae-5c9f-552c-9908-14cda06ce7f7/scratchpad/app-check.js
node --check /tmp/claude-0/-home-claude/b4e097ae-5c9f-552c-9908-14cda06ce7f7/scratchpad/app-check.js && echo "syntax ok"
ls -la out/tesseract-cad-tools.html
