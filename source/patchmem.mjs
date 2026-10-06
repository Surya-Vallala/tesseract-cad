import fs from 'fs';
const [src, dst, pagesStr] = process.argv.slice(2);
const buf = Buffer.from(fs.readFileSync(src));
const pages = parseInt(pagesStr);
let p = 8;
function leb(){ let r=0,s=0,b; do { b=buf[p++]; r|= (b&0x7f)<<s; s+=7;} while(b&0x80); return r>>>0; }
while (p < buf.length) { const id = buf[p++]; const size = leb(); const start=p;
  if (id===5) { leb(); p++; const initPos = p; const init = leb(); const len = p-initPos;
    // encode pages in exactly `len` bytes
    const bytes=[]; let v=pages; for (let i=0;i<len;i++){ let b=v&0x7f; v>>>=7; if(i<len-1) b|=0x80; bytes.push(b);} if (v!==0) throw new Error('does not fit');
    for (let i=0;i<len;i++) buf[initPos+i]=bytes[i];
    console.log('patched initial pages', init, '->', pages, 'in', len, 'bytes'); }
  p = start+size; }
fs.writeFileSync(dst, buf);
