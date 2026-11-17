// Takes the pictures of the app that the store screenshots and the blog use,
// and saves them in brand/store/captures/.
//
//   HB_CAPTURE_EMAIL=… HB_CAPTURE_PASSWORD=… npm run brand:capture [-- filter]
//
// It needs the app running on this machine (`npm start` in hey-bible-app, which
// serves http://localhost:4200), and an account that already holds what the
// pictures show: a few searches, favorites with tags, notes, a chat, some verse
// images and a feed. Use verses from a public-domain translation (WEB or KJV).
// Nothing here creates that account or its contents.
//
// Each device is a real phone or tablet shape, with that device's user agent so
// the app picks its iOS or Android look, and with the room a real device leaves
// for the status bar.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, root } from './render.mjs';

const APP = process.env.HB_CAPTURE_URL ?? 'http://localhost:4200';
const out = 'brand/store/captures';

const iosAgent = (device) =>
  `Mozilla/5.0 (${device}; CPU ${device === 'iPad' ? 'OS' : 'iPhone OS'} 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1`;

/** name → the window, its sharpness, and the room at the top and bottom of the screen */
export const devices = {
  phone: { width: 440, height: 956, scale: 3, top: 62, bottom: 20, userAgent: iosAgent('iPhone') },
  tablet: { width: 1032, height: 1376, scale: 2, top: 28, bottom: 16, userAgent: iosAgent('iPad') },
  android: {
    width: 412,
    height: 892,
    scale: 3,
    top: 44,
    bottom: 12,
    userAgent:
      'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  },
};

const page$ = '.ion-page:not(.ion-page-hidden) ';

/** Clicks something on the page that is showing and waits for what it opens. */
const click = (selector, text) => async (page) => {
  const target = page.locator(page$ + selector);
  await (text ? target.filter({ hasText: text }) : target).first().click();
  await page.waitForTimeout(2500);
};

const verse = click('app-verse-card ion-card-title', 'Psalms 119:105');

/** [name, path in the app, { dark, before(page) }] */
export const shots = [
  ['search', '/search'],
  ['favorites', '/favorites'],
  ['verse', '/favorites', { before: verse }],
  ['chat', '/library?segment=chats', { before: click('.continue-hint') }],
  // The images open as a list; the button in the corner turns them into a grid
  ['gallery', '/library?segment=images', { before: click('ion-header ion-buttons[slot=end] ion-button') }],
  ['library', '/library?segment=all'],
  ['feed', '/feed'],
  ['search-night', '/search', { dark: true }],
  ['verse-night', '/favorites', { dark: true, before: verse }],
];

async function signIn(context) {
  const email = process.env.HB_CAPTURE_EMAIL;
  const password = process.env.HB_CAPTURE_PASSWORD;
  if (!email || !password) throw new Error('Set HB_CAPTURE_EMAIL and HB_CAPTURE_PASSWORD');
  const page = await context.newPage();
  await page.goto(`${APP}/login/email`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[type=email]').first().fill(email);
  await page.locator('input[type=password]').first().fill(password);
  await page.keyboard.press('Enter');
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20000 });
  // A new browser is shown the copyright notice once; read it and move on
  const ok = page.locator('ion-alert button', { hasText: /^\s*OK\s*$/ });
  await ok
    .first()
    .click({ timeout: 8000 })
    .catch(() => {});
  await page.waitForTimeout(800);
  await page.close();
}

async function settle(page) {
  // Pictures in the app come from storage; wait until the ones on screen have arrived
  await page.waitForTimeout(2500);
  await page
    .waitForFunction(() => [...document.images].filter((img) => img.offsetParent).every((img) => img.complete), null, {
      timeout: 15000,
    })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
}

async function main() {
  const filter = process.argv[2];
  const browser = await launch();
  for (const [name, device] of Object.entries(devices)) {
    for (const dark of [false, true]) {
      const wanted = shots.filter(
        ([shot, , options = {}]) => !!options.dark === dark && (!filter || `${name}/${shot}`.includes(filter)),
      );
      if (!wanted.length) continue;
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        deviceScaleFactor: device.scale,
        userAgent: device.userAgent,
        isMobile: true,
        hasTouch: true,
        colorScheme: dark ? 'dark' : 'light',
      });
      // A browser window has no status bar, so give the app the room a device would
      await context.addInitScript(
        ({ top, bottom }) => {
          const style = document.createElement('style');
          style.textContent = `:root { --ion-safe-area-top: ${top}px !important; --ion-safe-area-bottom: ${bottom}px !important; }`;
          document.addEventListener('DOMContentLoaded', () => document.head.append(style));
        },
        { top: device.top, bottom: device.bottom },
      );
      await signIn(context);
      for (const [shot, path, options = {}] of wanted) {
        const page = await context.newPage();
        await page.goto(APP + path, { waitUntil: 'domcontentloaded' });
        await settle(page);
        if (options.before) {
          await options.before(page);
          await settle(page);
        }
        const file = join(root, out, name, `${shot}.png`);
        mkdirSync(join(root, out, name), { recursive: true });
        await page.screenshot({ path: file });
        await page.close();
        console.log(`${device.width * device.scale}×${device.height * device.scale}  ${out}/${name}/${shot}.png`);
      }
      await context.close();
    }
  }
  await browser.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
