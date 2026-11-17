// Renders the animated share videos from the brand image sources.
//
//   npm run brand:video
//
// Each source page moves with CSS animations (brand/motion.css). This script
// does not record them playing: it sets every animation to the time of each
// frame in turn and takes a picture, so the video is the same on every run and
// its first frame is exactly the still image.
//
// Needs what `npm run brand` needs, plus ffmpeg.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, openSource, root } from './render.mjs';

export const FPS = 30;

/**
 * [source, width, height, seconds, output, quality]. `seconds` must match
 * --loop in brand/motion.css. `quality` is x264's CRF: lower is better and
 * bigger. The site's video is kept small; the App Store ones are kept sharp.
 */
export const videos = [
  ['brand/og-image.html', 1200, 630, 8, 'public/video/og.mp4', 20],
  ['brand/store/hero.html', 3840, 1646, 8, 'brand/store/app-store-header-3840x1646.mp4', 15],
  ['brand/store/hero.html', 3840, 2560, 8, 'brand/store/app-store-search-3840x2560.mp4', 15],
];

/** H.264 that every link previewer plays: 4:2:0, the index at the front, no sound. */
function encoder(output, quality) {
  const ffmpeg = spawn(
    'ffmpeg',
    [
      '-v', 'error', '-y',
      '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
      '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryslow', '-crf', String(quality),
      '-an', '-movflags', '+faststart',
      output,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  const done = new Promise((resolve, reject) => {
    ffmpeg.on('error', (error) => reject(new Error(`could not run ffmpeg: ${error.message}`)));
    ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });
  return { ffmpeg, done };
}

async function main() {
  const browser = await launch();
  const only = process.argv[2];
  for (const [source, width, height, seconds, output, quality] of videos) {
    // `npm run brand:video -- header` renders only the outputs with that word in the name
    if (only && !output.includes(only)) continue;
    const page = await openSource(browser, source, width, height);
    const animations = await page.evaluate(() => document.getAnimations().length);
    if (!animations) throw new Error(`${source}: nothing on the page is animated`);

    mkdirSync(dirname(join(root, output)), { recursive: true });
    const { ffmpeg, done } = encoder(join(root, output), quality);
    const frames = seconds * FPS;
    for (let frame = 0; frame < frames; frame++) {
      await page.evaluate((time) => {
        for (const animation of document.getAnimations()) {
          animation.pause();
          animation.currentTime = time;
        }
      }, (frame * 1000) / FPS);
      const png = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
      if (!ffmpeg.stdin.write(png)) await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }
    ffmpeg.stdin.end();
    await done;
    await page.close();
    console.log(`${width}×${height}  ${seconds}s  ${output}`);
  }
  await browser.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
