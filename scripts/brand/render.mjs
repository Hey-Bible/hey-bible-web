// Renders the brand image sources in brand/ to PNG files.
//
//   npm run brand
//
// Needs a browser for Playwright: either `npx playwright install chromium`, or
// Google Chrome installed on this machine. The fonts come from Google Fonts,
// so it also needs a network connection.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const social = 'brand/social/png';
const post = 'brand/social/post.html';
const wide = `${post}?ref=${encodeURIComponent('John 10:27 · KJV')}&text=${encodeURIComponent(
  'My sheep hear my voice, and I know them, and they follow me.',
)}&art=sheep`;
const night = `${post}?night&ref=${encodeURIComponent('Psalm 4:8 · KJV')}&text=${encodeURIComponent(
  'I will both lay me down in peace, and sleep: for thou, Lord, only makest me dwell in safety.',
)}`;

/** [source, width, height, output] */
export const jobs = [
  ['brand/og-image.html', 1200, 630, 'public/img/og-image.png'],
  ['brand/og-features.html', 1200, 630, 'public/img/og-features.png'],
  ['brand/blog-sticker-look-hero.html', 1600, 900, 'public/img/blog/a-new-look-hero.png'],
  [wide, 1080, 1080, 'public/img/blog/a-new-look-verse.png'],
  ['brand/social/avatar.html', 1024, 1024, `${social}/avatar.png`],
  ['brand/social/x-header.html', 1500, 500, `${social}/x-header.png`],
  // The same header is served from the site, where older links point.
  ['brand/social/x-header.html', 1500, 500, 'public/img/hey-bible-cover.png'],
  ['brand/social/facebook-cover.html', 1640, 624, `${social}/facebook-cover.png`],
  [post, 1080, 1080, `${social}/post-square.png`],
  [post, 1080, 1350, `${social}/post-portrait.png`],
  [post, 1080, 1920, `${social}/post-story.png`],
  [wide, 1080, 1080, `${social}/post-square-sheep.png`],
  [night, 1080, 1350, `${social}/post-portrait-night.png`],
];

export async function launch() {
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ channel: 'chrome' });
  }
}

/** Opens a source page at the given size, and fails if its fonts did not load. */
export async function openSource(browser, source, width, height) {
  const [file, query = ''] = source.split('?');
  const url = pathToFileURL(join(root, file)).href + (query ? `?${query}` : '');
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // fonts.ready also resolves when a face fails to load, and fonts.check()
  // answers true when the stylesheet never arrived, so look for a loaded face
  // for each family the text is set in. Otherwise an offline run would
  // overwrite the committed files with fallback type.
  const missing = await page.evaluate(() => {
    const loaded = new Set(
      [...document.fonts].filter((face) => face.status === 'loaded').map((face) => face.family.replace(/["']/g, '')),
    );
    const used = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim() || !node.parentElement) continue;
      used.add(getComputedStyle(node.parentElement).fontFamily.split(',')[0].trim().replace(/["']/g, ''));
    }
    return ['Fredoka', 'Nunito'].filter((family) => used.has(family) && !loaded.has(family));
  });
  if (missing.length) throw new Error(`${source}: ${missing.join(' and ')} did not load`);
  return page;
}

async function main() {
  const browser = await launch();
  for (const [source, width, height, output] of jobs) {
    const page = await openSource(browser, source, width, height);
    mkdirSync(dirname(join(root, output)), { recursive: true });
    await page.screenshot({ path: join(root, output), clip: { x: 0, y: 0, width, height } });
    await page.close();
    console.log(`${width}×${height}  ${output}`);
  }
  await browser.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
