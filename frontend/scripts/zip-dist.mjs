/**
 * zip-dist.mjs — packages the Vite build output into dist-deploy.zip.
 *
 * Uses only Node.js built-in modules so no extra npm dependencies are needed.
 * Crucially, archive entries are stored with forward-slash paths (POSIX style)
 * so the zip extracts correctly on Linux servers.  PowerShell's Compress-Archive
 * uses backslashes, which causes files to land as flat names like
 * "dist\index.html" instead of inside a "dist/" folder on Unix hosts.
 */
import { createWriteStream, readdirSync, statSync, readFileSync } from "fs";
import { join, relative } from "path";
import { deflateRawSync } from "zlib";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const OUT_ZIP = join(__dirname, "..", "dist-deploy.zip");

// ── Minimal ZIP writer ────────────────────────────────────────────────────────
const buf32LE = (n) => { const b = Buffer.allocUnsafe(4); b.writeUInt32LE(n); return b; };
const buf16LE = (n) => { const b = Buffer.allocUnsafe(2); b.writeUInt16LE(n); return b; };

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function walk(dir, results = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, results);
    } else {
      results.push(full);
    }
  }
  return results;
}

const files = walk(DIST_DIR);
const centralDir = [];
let offset = 0;

// Collect all data in memory first, then write once (simpler than streaming).
const chunks = [];

const write = (chunk) => {
  chunks.push(chunk);
  offset += chunk.length;
};

for (const filePath of files) {
  const raw = readFileSync(filePath);
  const compressed = deflateRawSync(raw, { level: 9 });

  // Use compressed data only when it's genuinely smaller.
  const useDeflate = compressed.length < raw.length;
  const fileData = useDeflate ? compressed : raw;
  const method = useDeflate ? 8 : 0; // 8=deflate, 0=stored

  // Entry path uses forward slashes, relative to dist/ — no leading slash.
  const entryName = relative(DIST_DIR, filePath).replace(/\\/g, "/");
  const entryNameBuf = Buffer.from(entryName, "utf8");
  const crc = crc32(raw);
  const entryOffset = offset;

  write(Buffer.concat([
    Buffer.from("PK\x03\x04"),     // local file header signature
    buf16LE(20),                    // version needed: 2.0
    buf16LE(0),                     // general purpose bit flag
    buf16LE(method),
    buf16LE(0),                     // last mod time
    buf16LE(0),                     // last mod date
    buf32LE(crc),
    buf32LE(fileData.length),       // compressed size
    buf32LE(raw.length),            // uncompressed size
    buf16LE(entryNameBuf.length),
    buf16LE(0),                     // extra field length
    entryNameBuf,
  ]));
  write(fileData);

  centralDir.push(Buffer.concat([
    Buffer.from("PK\x01\x02"),     // central directory file header signature
    buf16LE(20),                    // version made by
    buf16LE(20),                    // version needed
    buf16LE(0),
    buf16LE(method),
    buf16LE(0),
    buf16LE(0),
    buf32LE(crc),
    buf32LE(fileData.length),
    buf32LE(raw.length),
    buf16LE(entryNameBuf.length),
    buf16LE(0),                     // extra field length
    buf16LE(0),                     // file comment length
    buf16LE(0),                     // disk number start
    buf16LE(0),                     // internal file attributes
    buf32LE(0),                     // external file attributes
    buf32LE(entryOffset),
    entryNameBuf,
  ]));
}

const cdOffset = offset;
for (const entry of centralDir) write(entry);
const cdSize = offset - cdOffset;

write(Buffer.concat([
  Buffer.from("PK\x05\x06"),       // end of central directory signature
  buf16LE(0),
  buf16LE(0),
  buf16LE(centralDir.length),
  buf16LE(centralDir.length),
  buf32LE(cdSize),
  buf32LE(cdOffset),
  buf16LE(0),
]));

const outStream = createWriteStream(OUT_ZIP);
outStream.end(Buffer.concat(chunks), () => {
  const kb = (Buffer.concat(chunks).length / 1024).toFixed(1);
  console.log(`Created dist-deploy.zip (${kb} KB, ${files.length} files)`);
  for (const f of files) {
    console.log(`  ${relative(DIST_DIR, f).replace(/\\/g, "/")}`);
  }
});

