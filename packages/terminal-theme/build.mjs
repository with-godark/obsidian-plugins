import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import chokidar from 'chokidar';
import postcss from 'postcss';
import postcssImport from 'postcss-import';

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const srcFile = path.join(packageDir, 'src', 'theme.css');
const manifestFile = path.join(packageDir, 'manifest.json');
const outDir = path.join(packageDir, 'dist');
const outCssFile = path.join(outDir, 'theme.css');
const outManifestFile = path.join(outDir, 'manifest.json');

const args = new Set(process.argv.slice(2));
const shouldWatch = args.has('--watch');
const shouldSync = args.has('--sync');

async function readManifest() {
  const raw = await readFile(manifestFile, 'utf8');
  return JSON.parse(raw);
}

async function buildTheme() {
  const inputCss = await readFile(srcFile, 'utf8');
  const result = await postcss([postcssImport()]).process(inputCss, {
    from: srcFile,
    to: outCssFile,
  });

  await mkdir(outDir, { recursive: true });
  await writeFile(outCssFile, result.css);
  await cp(manifestFile, outManifestFile);

  if (shouldSync) {
    await syncTheme();
  }

  console.log(`Built theme into ${path.relative(packageDir, outDir)}`);
}

async function syncTheme() {
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;

  if (!vaultPath) {
    throw new Error(
      'OBSIDIAN_VAULT_PATH is not set. Copy .env.example to .env and export it before syncing.',
    );
  }

  const manifest = await readManifest();
  const targetDir = path.join(vaultPath, '.obsidian', 'themes', manifest.name);

  await mkdir(targetDir, { recursive: true });
  await cp(outCssFile, path.join(targetDir, 'theme.css'));
  await cp(outManifestFile, path.join(targetDir, 'manifest.json'));

  console.log(`Synced theme to ${targetDir}`);
}

async function runBuild() {
  try {
    await buildTheme();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  }
}

await buildTheme();

if (shouldWatch) {
  const watcher = chokidar.watch(
    [path.join(packageDir, 'src', '**/*.css'), manifestFile],
    {
      ignoreInitial: true,
    },
  );

  watcher.on('all', async () => {
    await runBuild();
  });

  console.log('Watching theme source for changes...');
}
