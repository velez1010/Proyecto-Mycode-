import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules','dist','.git'].includes(entry.name)) out.push(...await walk(path));
    else if (entry.isFile() && /\.(js|html)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const files = await walk(process.cwd());
const forbidden = [
  /localStorage\.setItem\([^)]*(session|token|jwt)/i,
  /sessionStorage\.(setItem|getItem|removeItem)\([^)]*(session|token|jwt)/i,
  /['"](?:Authorization|authorization)['"]\s*:\s*['"]Bearer\s/i
];
const failures = [];
for (const file of files) {
  const content = await readFile(file, 'utf8');
  for (const pattern of forbidden) if (pattern.test(content)) failures.push(`${file}: ${pattern}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Security scan passed for ${files.length} JS/HTML files.`);
