/**
 * generate-icons.js
 * Generates PWA icon PNGs for X Live Alert using only Node.js built-ins.
 * Creates a solid-color icon with a white "X" mark on red background.
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ─── CRC32 ────────────────────────────────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf  = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf   = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ─── Icon painter ─────────────────────────────────────────────────────────────
function createIconPNG(size) {
  const BG_R = 0xFF, BG_G = 0x2D, BG_B = 0x4A; // #ff2d4a (red)
  const FG_R = 0xFF, FG_G = 0xFF, FG_B = 0xFF; // white

  // Raw pixels: RGBA
  const pixels = new Uint8Array(size * size * 4);

  // Fill background
  for (let i = 0; i < size * size; i++) {
    pixels[i*4]   = BG_R;
    pixels[i*4+1] = BG_G;
    pixels[i*4+2] = BG_B;
    pixels[i*4+3] = 255;
  }

  // Draw a thick "X" using two diagonal bands
  const pad    = Math.round(size * 0.18);
  const thick  = Math.round(size * 0.13);

  function setPixel(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    pixels[i]   = FG_R;
    pixels[i+1] = FG_G;
    pixels[i+2] = FG_B;
    pixels[i+3] = 255;
  }

  for (let t = -thick; t <= thick; t++) {
    for (let s = pad; s < size - pad; s++) {
      // top-left → bottom-right diagonal
      const x1 = s;
      const y1 = Math.round((s - pad) * (size - 2*pad) / (size - 2*pad)) + pad + t;
      setPixel(x1, y1);
      // top-right → bottom-left diagonal
      const x2 = s;
      const y2 = (size - 1 - pad) - Math.round((s - pad) * (size - 2*pad) / (size - 2*pad)) + t;
      setPixel(x2, y2);
    }
  }

  // Build PNG scanlines: filter byte (0 = None) + RGBA row
  const stride = 1 + size * 4;
  const raw    = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const pi = (y * size + x) * 4;
      const ri = y * stride + 1 + x * 4;
      raw[ri]   = pixels[pi];
      raw[ri+1] = pixels[pi+1];
      raw[ri+2] = pixels[pi+2];
      raw[ri+3] = pixels[pi+3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  // IHDR: width, height, bit-depth=8, color-type=6 (RGBA)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]  = 8; // bit depth
  ihdr[9]  = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

for (const size of [192, 512]) {
  const outPath = path.join(publicDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, createIconPNG(size));
  console.log(`✓ Generated icon-${size}.png`);
}
console.log('Icons ready.');
