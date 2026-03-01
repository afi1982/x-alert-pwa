const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const buf = Buffer.concat([t, data]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(buf));
  return Buffer.concat([len, buf, crc]);
}

function createIcon(size) {
  const bg = [11, 17, 32];       // #0b1120
  const red = [229, 62, 62];     // #e53e3e
  const white = [225, 231, 239]; // #e1e7ef

  const raw = Buffer.alloc(size * (size * 4 + 1));
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.34;
  const dotR = size * 0.06;

  for (let y = 0; y < size; y++) {
    const off = y * (size * 4 + 1);
    raw[off] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const px = off + 1 + x * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r, g, b, a = 255;

      if (dist <= outerR && dist > innerR) {
        // Red ring
        const edge = Math.min(dist - innerR, outerR - dist);
        const aa = Math.min(1, edge * 2);
        r = red[0]; g = red[1]; b = red[2]; a = Math.round(aa * 255);
      } else if (dist <= innerR) {
        // Inner area - draw X lettermark
        const nx = (x - cx) / innerR;
        const ny = (y - cy) / innerR;
        const thickness = 0.22;

        const onDiag1 = Math.abs(nx - ny) / Math.sqrt(2) < thickness && Math.abs(nx) < 0.7;
        const onDiag2 = Math.abs(nx + ny) / Math.sqrt(2) < thickness && Math.abs(nx) < 0.7;

        if (onDiag1 || onDiag2) {
          r = white[0]; g = white[1]; b = white[2];
        } else {
          r = bg[0]; g = bg[1]; b = bg[2];
        }
      } else {
        // Live dot - top right
        const dotCx = cx + size * 0.30;
        const dotCy = cy - size * 0.30;
        const dotDist = Math.sqrt((x - dotCx) ** 2 + (y - dotCy) ** 2);
        if (dotDist <= dotR) {
          r = red[0]; g = red[1]; b = red[2];
        } else {
          r = bg[0]; g = bg[1]; b = bg[2]; a = 0;
        }
      }

      raw[px] = r; raw[px + 1] = g; raw[px + 2] = b; raw[px + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflated), chunk('IEND', Buffer.alloc(0))]);
}

fs.writeFileSync('public/icon-192.png', createIcon(192));
fs.writeFileSync('public/icon-512.png', createIcon(512));
console.log('Icons generated: icon-192.png, icon-512.png');
