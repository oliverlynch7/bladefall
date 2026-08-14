/* _shot/pngdiff.js — dependency-free PNG A/B diff for screenshot pairs.
   node harness/pngdiff.js a.png b.png [out.png]     (harness/ is ESM; the _shot/ working copy is CJS)
   Decodes with node's own zlib (PNGs from CDP are 8-bit RGB/RGBA, no interlace), un-filters the
   scanlines, and reports how many pixels moved and where. The bounding box is the useful number:
   "the only thing that changed is a 60x40 patch at the far wall" is a different result from
   "half the frame moved", and a byte-size delta cannot tell you which. */
import fs from 'node:fs';
import zlib from 'node:zlib';

function decode(file){
  const b = fs.readFileSync(file);
  if(b.readUInt32BE(0) !== 0x89504e47) throw new Error(file + ': not a PNG');
  let p = 8, w = 0, h = 0, bd = 0, ct = 0, il = 0; const idat = [];
  while(p < b.length){
    const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8), data = b.subarray(p + 8, p + 8 + len);
    if(type === 'IHDR'){ w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; il = data[12]; }
    else if(type === 'IDAT') idat.push(data);
    else if(type === 'IEND') break;
    p += 12 + len;
  }
  if(bd !== 8 || il !== 0) throw new Error(file + ': only 8-bit non-interlaced supported (bd=' + bd + ' interlace=' + il + ')');
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : ct === 0 ? 1 : ct === 4 ? 2 : 0;
  if(!ch) throw new Error(file + ': colour type ' + ct + ' (palette) not supported');
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * ch, out = Buffer.alloc(h * stride);
  for(let y = 0; y < h; y++){
    const ft = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const o = y * stride, up = o - stride;
    for(let x = 0; x < stride; x++){
      const a = x >= ch ? out[o + x - ch] : 0, bU = y ? out[up + x] : 0, c = (y && x >= ch) ? out[up + x - ch] : 0;
      let v = line[x];
      if(ft === 1) v += a; else if(ft === 2) v += bU; else if(ft === 3) v += (a + bU) >> 1;
      else if(ft === 4){ const pp = a + bU - c, pa = Math.abs(pp - a), pb = Math.abs(pp - bU), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? bU : c); }
      out[o + x] = v & 255;
    }
  }
  return { w, h, ch, px: out };
}

const [fa, fb, fout] = process.argv.slice(2);
const A = decode(fa), B = decode(fb);
if(A.w !== B.w || A.h !== B.h) { console.log('SIZE MISMATCH ' + A.w + 'x' + A.h + ' vs ' + B.w + 'x' + B.h); process.exit(1); }
const w = A.w, h = A.h;
let changed = 0, strong = 0, minX = w, maxX = -1, minY = h, maxY = -1;
const vis = fout ? Buffer.alloc(w * h * 3) : null;
for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
  const ia = (y * w + x) * A.ch, ib = (y * w + x) * B.ch;
  const d = Math.abs(A.px[ia] - B.px[ib]) + Math.abs(A.px[ia + 1] - B.px[ib + 1]) + Math.abs(A.px[ia + 2] - B.px[ib + 2]);
  const o = (y * w + x) * 3;
  if(d > 8){
    changed++; if(d > 60) strong++;
    if(x < minX) minX = x; if(x > maxX) maxX = x; if(y < minY) minY = y; if(y > maxY) maxY = y;
    if(vis){ vis[o] = Math.min(255, d); vis[o + 1] = 0; vis[o + 2] = 0; }
  } else if(vis){ const g = ((A.px[ia] + A.px[ia + 1] + A.px[ia + 2]) / 9) | 0; vis[o] = vis[o + 1] = vis[o + 2] = g; }
}
if(vis){
  const stride = w * 3, raw = Buffer.alloc(h * (stride + 1));
  for(let y = 0; y < h; y++){ raw[y * (stride + 1)] = 0; vis.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride); }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]), crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0); return Buffer.concat([len, body, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  fs.writeFileSync(fout, Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
function crc32(buf){ let c = ~0; for(let i = 0; i < buf.length; i++){ c ^= buf[i];
  for(let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return ~c; }
const tot = w * h;
console.log('pixels=' + tot + '  changed=' + changed + ' (' + (100 * changed / tot).toFixed(3) + '%)'
          + '  strong=' + strong + ' (' + (100 * strong / tot).toFixed(3) + '%)'
          + (maxX < 0 ? '  bbox=none' : '  bbox=[' + minX + ',' + minY + ']-[' + maxX + ',' + maxY + ']'));
