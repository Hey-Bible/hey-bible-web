// Renders the brand image sources in brand/ to PNG files (or WebP, where the
// output's name ends in .webp).
//
//   npm run brand
//   node scripts/brand/render.mjs store    only the files with "store" in their path
//
// Needs a browser for Playwright: either `npx playwright install chromium`, or
// Google Chrome installed on this machine. The fonts come from Google Fonts,
// so it also needs a network connection.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const social = 'brand/social/png';
const post = 'brand/social/post.html';
const wide = `${post}?ref=${encodeURIComponent('John 10:27 · WEB')}&text=${encodeURIComponent(
  'My sheep hear my voice, and I know them, and they follow me.',
)}&art=sheep`;
const night = `${post}?night&ref=${encodeURIComponent('Psalm 4:8 · WEB')}&text=${encodeURIComponent(
  'In peace I will both lay myself down and sleep, for you, Yahweh alone, make me live in safety.',
)}`;
const lamp = `${post}?night&art=meadow-night&ref=${encodeURIComponent('Psalm 119:105 · WEB')}&text=${encodeURIComponent(
  'Your word is a lamp to my feet, and a light for my path.',
)}`;

/**
 * The store screenshots: a line of words over a picture of the app. The
 * pictures of the app are in brand/store/captures/ (`npm run brand:capture`).
 * [name, capture, title, sub, art, tint, extra]
 */
export const storeFrames = [
  ['search', 'search', 'Find any verse', 'Seven translations in one search', 'sheep', 'sage'],
  ['art', 'verse', 'Turn verses into art', 'Make a picture of any verse', 'sun', 'wheat'],
  ['chat', 'chat', 'Ask about any verse', 'Chat about what you are reading', 'dove', 'sky'],
  ['favorites', 'favorites', 'Keep the verses you love', 'Save favorites and sort them with tags', 'heart', 'rose', 'w=200'],
  ['styles', 'gallery', 'Pick your style', 'Stickers, watercolor, stained glass and more', 'cloud', 'wheat'],
  ['library', 'library', 'Everything in one place', 'Your notes, chats and images', 'bible', 'sage'],
  ['feed', 'feed', 'Share with friends', 'Post a verse and say amen', 'fish', 'sky'],
  ['night', 'search-night', 'Easy on the eyes', 'Dark mode follows your phone', 'moon', 'sky', 'night&w=230'],
];

/** The sizes the stores ask for: [folder, the captures to use, width, height] */
export const storeSizes = [
  ['iphone-6.9', 'phone', 1320, 2868],
  ['ipad-13', 'tablet', 2064, 2752],
  ['play-phone', 'android', 1080, 1920],
];

const storeJobs = storeSizes.flatMap(([folder, device, width, height]) =>
  storeFrames.map(([name, capture, title, sub, art, tint, extra], i) => [
    `brand/store/screenshot.html?shot=${device}/${capture}&title=${encodeURIComponent(title)}&sub=${encodeURIComponent(
      sub,
    )}&art=${art}&tint=${tint}${extra ? `&${extra}` : ''}`,
    width,
    height,
    `brand/store/screenshots/${folder}/${i + 1}-${name}.png`,
  ]),
);

const phones = 'brand/store/phones.html';

/**
 * The app screens on the site's Features page: one screen each, half the size
 * of a phone capture, saved as public/img/screenshots/<name>.webp.
 * [name, what brand/store/screen.html shows]
 */
export const featureScreens = [
  ['search', 'shot=phone/search'],
  ['notes', 'shot=phone/notes'],
  ['chat', 'shot=phone/chat'],
  ['verse-art', 'shot=phone/verse'],
  ['sharing', 'shot=phone/feed'],
  ['translations', 'shot=phone/translations'],
  // The widget is not a screen of the app: `npm run brand:widget` draws it
  ['widget', 'widget'],
];

const featureJobs = featureScreens.map(([name, show]) => [
  `brand/store/screen.html?${show}`,
  660,
  1434,
  `public/img/screenshots/${name}.webp`,
]);

/** [source, width, height, output] */
export const jobs = [
  ['brand/og-image.html', 1200, 630, 'public/img/og-image.png'],
  ['brand/og-features.html', 1200, 630, 'public/img/og-features.png'],
  // App Store creative assets: the first frame of each loop, for the poster
  ['brand/store/hero.html', 3840, 1646, 'brand/store/app-store-header-3840x1646.png'],
  ['brand/store/hero.html', 3840, 2560, 'brand/store/app-store-search-3840x2560.png'],
  ['brand/blog-sticker-look-hero.html', 1600, 900, 'public/img/blog/a-new-look-hero.png'],
  // The same hero for the post in dark mode
  ['brand/blog-sticker-look-hero.html?night', 1600, 900, 'public/img/blog/a-new-look-hero-dark.png'],
  [wide, 1080, 1080, 'public/img/blog/a-new-look-verse.png'],
  // The app itself, for the same post
  [`${phones}?shots=before/search.webp,phone/search&labels=Before,After`, 1600, 1000, 'public/img/blog/a-new-look-before-after.png'],
  [`${phones}?shots=phone/favorites,phone/verse,phone/library`, 1600, 1000, 'public/img/blog/a-new-look-app.png'],
  [`${phones}?night&shots=phone/search-night,phone/verse-night`, 1600, 1000, 'public/img/blog/a-new-look-night.png'],
  ...storeJobs,
  ...featureJobs,
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
  [lamp, 1080, 1350, `${social}/post-portrait-lamp.png`],
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

/**
 * The browser takes its pictures as PNG. For an output that ends in .webp, the
 * page re-encodes the picture, so there is nothing more to install.
 */
async function toWebp(page, png) {
  const webp = await page.evaluate(async (base64) => {
    const picture = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
    const canvas = Object.assign(document.createElement('canvas'), { width: picture.width, height: picture.height });
    canvas.getContext('2d').drawImage(picture, 0, 0);
    return canvas.toDataURL('image/webp', 0.9).split(',')[1];
  }, png.toString('base64'));
  return Buffer.from(webp, 'base64');
}

async function main() {
  // `node scripts/brand/render.mjs store` renders only the files with "store" in their path
  const filter = process.argv[2];
  const browser = await launch();
  for (const [source, width, height, output] of jobs) {
    if (filter && !output.includes(filter)) continue;
    const page = await openSource(browser, source, width, height);
    mkdirSync(dirname(join(root, output)), { recursive: true });
    const png = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
    writeFileSync(join(root, output), output.endsWith('.webp') ? await toWebp(page, png) : png);
    await page.close();
    console.log(`${width}×${height}  ${output}`);
  }
  await browser.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
