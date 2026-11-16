import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
// @ts-expect-error plain JavaScript module without type declarations
import { jobs } from "../scripts/brand/render.mjs";

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

  it("keeps the favicons at their named sizes", () => {
    const favicons = join(root, "public/img/favicons");
    expect(pngSize(join(favicons, "favicon-16x16.png"))).toEqual([16, 16]);
    expect(pngSize(join(favicons, "favicon-32x32.png"))).toEqual([32, 32]);
    expect(pngSize(join(favicons, "apple-touch-icon.png"))).toEqual([180, 180]);
    expect(pngSize(join(favicons, "android-chrome-192x192.png"))).toEqual([192, 192]);
    expect(pngSize(join(favicons, "android-chrome-512x512.png"))).toEqual([512, 512]);
  });
});
