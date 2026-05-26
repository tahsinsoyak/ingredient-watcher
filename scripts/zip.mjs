import { createArchive } from 'archiver';
import { createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const outFile = resolve(__dirname, '..', 'ingredient-watchlist.zip');

const output = createWriteStream(outFile);
const archive = createArchive('zip', { zlib: { level: 9 } });

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();

output.on('close', () => {
  console.log(`✅ Created ${outFile} (${(archive.pointer() / 1024).toFixed(1)} KB)`);
});
