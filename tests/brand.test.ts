import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
// @ts-expect-error plain JavaScript module without type declarations
import { jobs } from "../scripts/brand/render.mjs";
// @ts-expect-error plain JavaScript module without type declarations
import { FPS, videos } from "../scripts/brand/render-video.mjs";

const root = join(import.meta.dirname, "..");

/** Width and height from a PNG file's header. */
function pngSize(path: string): [number, number] {
  const bytes = readFileSync(path);
  expect(bytes.subarray(1, 4).toString("ascii"), `${path} should be a PNG`).toBe("PNG");
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe("Brand images", () => {
  it("has a source page for every image", () => {
    for (const [source] of jobs as [string, number, number, string][]) {
      const file = source.split("?")[0];
      expect(existsSync(join(root, file)), `${file} should exist`).toBe(true);
    }
  });

  it("keeps each rendered image at the size its job asks for", () => {
    for (const [, width, height, output] of jobs as [string, number, number, string][]) {
      const path = join(root, output);
      expect(existsSync(path), `${output} should exist; run npm run brand`).toBe(true);
      expect(pngSize(path), output).toEqual([width, height]);
    }
  });

  it("renders the sizes each social site expects", () => {
    const sizes = Object.fromEntries(
      (jobs as [string, number, number, string][]).map(([, w, h, out]) => [out.split("/").pop(), `${w}x${h}`]),
    );
    expect(sizes["og-image.png"]).toBe("1200x630");
    expect(sizes["og-features.png"]).toBe("1200x630");
    expect(sizes["avatar.png"]).toBe("1024x1024");
    expect(sizes["x-header.png"]).toBe("1500x500");
    expect(sizes["facebook-cover.png"]).toBe("1640x624");
    expect(sizes["post-square.png"]).toBe("1080x1080");
    expect(sizes["post-portrait.png"]).toBe("1080x1350");
    expect(sizes["post-story.png"]).toBe("1080x1920");
  });

  it("draws every piece of art a source page asks for", () => {
    const art = readFileSync(join(root, "brand/art.js"), "utf-8");
    const sources = new Set((jobs as [string, number, number, string][]).map(([source]) => source.split("?")[0]));
    for (const file of sources) {
      const page = readFileSync(join(root, file), "utf-8");
      for (const [, name] of page.matchAll(/data-art="([^"]+)"/g)) {
        const drawn = art.includes(`'${name}':`) || new RegExp(`^  ${name}:`, "m").test(art);
        expect(drawn, `${file} asks for "${name}", which brand/art.js does not draw`).toBe(true);
      }
    }
  });

  describe("share videos", () => {
    const all = videos as [string, number, number, number, string][];

    /** The top-level boxes of an MP4 file, in order: [type, offset, size]. */
    function boxes(bytes: Buffer): [string, number, number][] {
      const found: [string, number, number][] = [];
      for (let at = 0; at + 8 <= bytes.length; ) {
        const size = bytes.readUInt32BE(at);
        found.push([bytes.subarray(at + 4, at + 8).toString("ascii"), at, size]);
        if (size < 8) break;
        at += size;
      }
      return found;
    }

    it("has a source page for every video", () => {
      for (const [source] of all) expect(existsSync(join(root, source)), source).toBe(true);
    });

    it("moves a picture that is also rendered as a still, so the two match", () => {
      const stills = (jobs as [string, number, number, string][]).map(([source, w, h]) => `${source} ${w}x${h}`);
      for (const [source, width, height] of all) expect(stills).toContain(`${source} ${width}x${height}`);
    });

    it("runs each video for the length of the loop in motion.css", () => {
      const loop = readFileSync(join(root, "brand/motion.css"), "utf-8").match(/--loop:\s*(\d+)s/)?.[1];
      for (const [source, , , seconds] of all) expect(String(seconds), source).toBe(loop);
    });

    it("keeps every animation paused at rest unless the page is asked to play", () => {
      const css = readFileSync(join(root, "brand/motion.css"), "utf-8");
      expect(css).toMatch(/\[class\^='m-'\],\s*\[class\*=' m-'\]\s*\{[^}]*animation-play-state:\s*paused/);
    });

    it("renders each video as a small MP4 that can start playing before it has all arrived", () => {
      for (const [, width, height, seconds, output] of all) {
        const path = join(root, output);
        expect(existsSync(path), `${output} should exist; run npm run brand:video`).toBe(true);
        const bytes = readFileSync(path);
        const order = boxes(bytes).map(([type]) => type);
        expect(order[0], output).toBe("ftyp");
        // The index (moov) has to come before the pictures (mdat)
        expect(order.indexOf("moov"), output).toBeLessThan(order.indexOf("mdat"));
        // Apple caps a preview's picture and video at 10 MB together; stay far under
        expect(bytes.length, output).toBeLessThan(1_000_000);

        // The track header holds the picture size, the media header the length
        const tkhd = bytes.indexOf("tkhd");
        expect([bytes.readUInt32BE(tkhd + 80) >> 16, bytes.readUInt32BE(tkhd + 84) >> 16], output).toEqual([width, height]);
        const mvhd = bytes.indexOf("mvhd");
        const [timescale, duration] = [bytes.readUInt32BE(mvhd + 16), bytes.readUInt32BE(mvhd + 20)];
        expect(duration / timescale, output).toBeCloseTo(seconds, 1);
        expect(FPS).toBe(30);
      }
    });

    it("has no sound track", () => {
      for (const [, , , , output] of all) {
        expect(readFileSync(join(root, output)).includes("soun"), output).toBe(false);
      }
    });
  });

  it("keeps the favicons at their named sizes", () => {
    const favicons = join(root, "public/img/favicons");
    expect(pngSize(join(favicons, "favicon-16x16.png"))).toEqual([16, 16]);
    expect(pngSize(join(favicons, "favicon-32x32.png"))).toEqual([32, 32]);
    expect(pngSize(join(favicons, "apple-touch-icon.png"))).toEqual([180, 180]);
    expect(pngSize(join(favicons, "android-chrome-192x192.png"))).toEqual([192, 192]);
    expect(pngSize(join(favicons, "android-chrome-512x512.png"))).toEqual([512, 512]);
  });
});
