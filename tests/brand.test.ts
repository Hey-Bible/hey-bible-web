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

/** Whether a stylesheet moves the class: a rule for it, or keyframes with its name. */
function definesMotion(css: string, name: string): boolean {
  return new RegExp(`(\\.|@keyframes\\s+)${name}(?![\\w-])[^{}]*\\{`).test(css);
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
    expect(sizes["app-store-header-3840x1646.png"]).toBe("3840x1646");
    expect(sizes["app-store-search-3840x2560.png"]).toBe("3840x2560");
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

  it("puts the shepherd in the meadow with the sheep", () => {
    const art = readFileSync(join(root, "brand/art.js"), "utf-8");
    const meadow = art.slice(art.indexOf("  meadow: () =>"), art.indexOf("  'meadow-night': () =>"));
    expect(meadow).toContain("person('shepherd')");
    expect(meadow).toContain("m-sheep");
    expect(meadow).toContain("m-lamb");
  });

  it("draws the same hill by night, with the shepherd leading the flock by lamplight", () => {
    const art = readFileSync(join(root, "brand/art.js"), "utf-8");
    const night = art.slice(art.indexOf("  'meadow-night': () =>"), art.indexOf("  moon: () =>"));
    const day = art.slice(art.indexOf("  meadow: () =>"), art.indexOf("  'meadow-night': () =>"));
    // The same dome and hill as the day scene
    for (const shape of ["M26 150 C4 88 40 28 110 26 C182 24 216 84 196 150 z", "M12 152 C60 100 152 98 208 152 C200 184 28 186 12 152z"]) {
      expect(day, "day scene").toContain(shape);
      expect(night, "night scene").toContain(shape);
    }
    // He carries the lamp, and stands further along the hill than both sheep
    expect(night).toContain("person('shepherd', true)");
    const x = (part: string) => Number(night.match(new RegExp(`translate\\((\\d+(?:\\.\\d+)?) [^)]*\\)[^<]*<g class="${part}"`))?.[1]);
    expect(x("m-shepherd")).toBeGreaterThan(x("m-sheep"));
    expect(x("m-shepherd")).toBeGreaterThan(x("m-lamb"));
    // The path is drawn dim, then bright inside the reach of the lamp
    expect(night).toMatch(/<path d="\$\{path\}" fill="#8C9578"\/>/);
    expect(night).toMatch(/clip-path="url\(#\$\{id\}-lit\)"><path d="\$\{path\}" fill="#F0DC9C"\/>/);
    // The light never spills past the sticker's outline, where it would grow an edge
    expect(night).toMatch(/<g clip-path="url\(#\$\{id\}-scene\)">\s*<circle/);
    // No day sky, sun or cloud
    expect(night).not.toContain("#CFE3EC");
    expect(night).not.toContain("m-sun");
    // The day shepherd is unchanged: no lamp unless asked
    expect(day).toContain("person('shepherd')");
    expect(art).toContain("const person = (who, lamp = false) =>");
  });

  it("has a night post of the lamp scene with Psalm 119:105, and a night hero for the new-look post", () => {
    const all = jobs as [string, number, number, string][];
    const lamp = all.find(([, , , output]) => output.endsWith("post-portrait-lamp.png"));
    expect(lamp, "no lamp post job").toBeDefined();
    const query = new URLSearchParams(lamp![0].split("?")[1]);
    expect(query.has("night")).toBe(true);
    expect(query.get("art")).toBe("meadow-night");
    expect(query.get("ref")).toBe("Psalm 119:105 · WEB");
    expect(query.get("text")).toBe("Your word is a lamp to my feet, and a light for my path.");
    expect([lamp![1], lamp![2]]).toEqual([1080, 1350]);

    const hero = all.find(([, , , output]) => output === "public/img/blog/a-new-look-hero-dark.png");
    expect(hero?.[0]).toBe("brand/blog-sticker-look-hero.html?night");
    const day = all.find(([, , , output]) => output === "public/img/blog/a-new-look-hero.png")!;
    expect([hero![1], hero![2]]).toEqual([day[1], day[2]]);
    const page = readFileSync(join(root, "brand/blog-sticker-look-hero.html"), "utf-8");
    expect(page).toMatch(/has\('night'\)[\s\S]*classList\.add\('night'\)[\s\S]*dataset\.art = 'meadow-night'/);
    // The switch has to run before art.js fills in the drawings
    expect(page.indexOf("dataset.art = 'meadow-night'")).toBeLessThan(page.indexOf('<script src="art.js">'));
  });

  it("shows a post's night hero only in dark mode, and keeps the day one for link previews", () => {
    const post = readFileSync(join(root, "src/content/blog/a-new-look.mdx"), "utf-8");
    expect(post).toMatch(/^heroImage: "\/img\/blog\/a-new-look-hero\.png"$/m);
    expect(post).toMatch(/^heroImageDark: "\/img\/blog\/a-new-look-hero-dark\.png"$/m);
    expect(readFileSync(join(root, "src/content.config.ts"), "utf-8")).toMatch(/heroImageDark: z\.string\(\)\.optional\(\)/);

    for (const file of ["src/layouts/BlogPost.astro", "src/components/BlogCard.astro"]) {
      const source = readFileSync(join(root, file), "utf-8");
      expect(source, file).toMatch(/src=\{heroImage\}[\s\S]*?heroImageDark && "only-light"/);
      expect(source, file).toMatch(/src=\{heroImageDark\}[\s\S]*?class="[^"]*only-dark"/);
    }
    // Every page that lists or shows a post passes the night picture on
    for (const file of ["src/pages/blog/[...slug].astro", "src/pages/blog/index.astro", "src/pages/blog/tag/[tag].astro"]) {
      expect(readFileSync(join(root, file), "utf-8"), file).toContain("heroImageDark={post.data.heroImageDark}");
    }
    // The share image is the day picture whatever the reader's colour mode
    expect(readFileSync(join(root, "src/layouts/BlogPost.astro"), "utf-8")).toContain("image={heroImage}>");

    const css = readFileSync(join(root, "src/styles/global.css"), "utf-8");
    expect(css).toMatch(/\.only-dark,\s*html\[data-theme="dark"\] \.only-light \{\s*display: none;/);
    expect(css).toMatch(/html\[data-theme="dark"\] \.only-dark \{\s*display: block;/);
  });

  it("shows a real daily verse video in its blog post, from files the site serves", () => {
    const post = readFileSync(join(root, "src/content/blog/daily-verse-videos.mdx"), "utf-8");
    const video = post.match(/<video [^>]*>/)?.[0] ?? "";
    expect(video).toContain('src="/video/daily-verse-psalm-118-24.mp4"');
    expect(video).toContain('poster="/img/blog/daily-verse-videos-card.jpg"');
    // Browsers only start a video by themselves when it is silent; the
    // controls let a reader turn the music on
    for (const attribute of ["autoplay", "loop", "muted", "playsinline", "controls"]) {
      expect(video, attribute).toMatch(new RegExp(`\\s${attribute}(\\s|>)`));
    }
    expect(video).toMatch(/aria-label="[^"]{20,}"/);
    // Every picture and video the post points to on this site exists
    const local = [...post.matchAll(/(?:src|poster)="(\/[^"]+)"|\]\((\/img\/[^)]+)\)|heroImage: "(\/[^"]+)"/g)].map((m) => m[1] ?? m[2] ?? m[3]);
    expect(local.length).toBeGreaterThanOrEqual(4);
    for (const path of local) expect(existsSync(join(root, "public", path)), path).toBe(true);
    // The example clips the first draft linked to are gone
    expect(post).not.toContain("files.wdh.sh");

    // The clip: an MP4 with its index at the front, small enough for a blog
    // page, served from /video/ where the Worker answers Range requests
    const bytes = readFileSync(join(root, "public/video/daily-verse-psalm-118-24.mp4"));
    expect(bytes.subarray(4, 8).toString("ascii")).toBe("ftyp");
    expect(bytes.indexOf("moov")).toBeLessThan(bytes.indexOf("mdat"));
    expect(bytes.length).toBeLessThan(5_000_000);
    const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf-8");
    expect(wrangler).toMatch(/"run_worker_first":\s*\["\/video\/\*"\]/);
    // The before and after pictures are frames of that clip, as JPEGs
    for (const name of ["daily-verse-videos-before.jpg", "daily-verse-videos-card.jpg"]) {
      const picture = readFileSync(join(root, "public/img/blog", name));
      expect(picture.readUInt16BE(0), name).toBe(0xffd8);
      expect(picture.length, name).toBeLessThan(400_000);
    }

    const css = readFileSync(join(root, "src/styles/global.css"), "utf-8");
    expect(css).toMatch(/\.blog-prose img,\s*\.blog-prose video \{[^}]*max-width: 100%;/);
  });

  it("keeps the site's meadow sticker the same scene as the brand art", () => {
    const art = readFileSync(join(root, "brand/art.js"), "utf-8");
    const site = readFileSync(join(root, "src/components/Sticker.astro"), "utf-8");
    const siteMeadow = site.slice(site.indexOf("name === 'meadow'"));
    expect(siteMeadow).toContain('clipPath id="shepherd-robe"');
    // The sun, the cloud and where each figure stands are written the same in both
    for (const part of ['cx="150" cy="56" r="17"', "M52 72 a11 11", "translate(134 68.4) scale(0.85)", "translate(48 84)", "translate(14 108) scale(0.62)"]) {
      expect(art, `brand/art.js: ${part}`).toContain(part);
      expect(siteMeadow, `Sticker.astro: ${part}`).toContain(part);
    }
  });

  it("has motion for every moving part the art and pages name", () => {
    const css = readFileSync(join(root, "brand/motion.css"), "utf-8");
    const files = ["brand/art.js", "brand/og-image.html", "brand/store/hero.html"];
    const named = new Set<string>();
    for (const file of files) {
      const text = readFileSync(join(root, file), "utf-8");
      for (const [, classes] of text.matchAll(/class="([^"]*)"/g)) {
        for (const name of classes.split(/\s+/)) if (name.startsWith("m-")) named.add(name);
      }
    }
    expect(named.has("m-shepherd")).toBe(true);
    // A page may also keep motion of its own beside the shared stylesheet
    const styles = css + files.map((file) => readFileSync(join(root, file), "utf-8")).join("\n");
    for (const name of named) {
      expect(definesMotion(styles, name), `no motion is defined for .${name}`).toBe(true);
    }
  });

  it("fills the search asset's open ground with soft sprigs and stars that show in the still", () => {
    const page = readFileSync(join(root, "brand/store/hero.html"), "utf-8");
    const css = readFileSync(join(root, "brand/motion.css"), "utf-8");
    expect(page.match(/class="loose soft search-only" data-art="sprig-/g)?.length ?? 0).toBeGreaterThanOrEqual(6);
    expect(page.match(/class="loose m-glint[^"]* search-only" data-art="star"/g)?.length ?? 0).toBeGreaterThanOrEqual(8);
    // Unlike .m-twinkle, these stars are not hidden at rest, so the poster has them too
    const rule = css.match(/\.m-glint \{([^}]*)\}/)?.[1] ?? "";
    expect(rule).not.toMatch(/opacity:\s*0\s*;/);
    expect(css).toMatch(/@keyframes m-glint-a\s*\{\s*0%, 100% \{[^}]*opacity: 1/);
  });

  it("gives the header its own thin scatter, hidden in the search asset", () => {
    const page = readFileSync(join(root, "brand/store/hero.html"), "utf-8");
    expect(page.match(/class="loose soft header-only" data-art="sprig-/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(page.match(/class="loose m-glint[^"]* header-only" data-art="star"/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
    expect(page).toMatch(/\.search \.header-only \{ display: none; \}/);
  });

  it("scatters a few soft sprigs and stars over every other picture in the kit", () => {
    const css = readFileSync(join(root, "brand/brand.css"), "utf-8");
    expect(css).toMatch(/\.bit \{[^}]*position: absolute/);
    const pages = [
      "brand/og-image.html",
      "brand/og-features.html",
      "brand/blog-sticker-look-hero.html",
      "brand/social/x-header.html",
      "brand/social/facebook-cover.html",
      "brand/social/post.html",
    ];
    for (const file of pages) {
      const page = readFileSync(join(root, file), "utf-8");
      const sprigs = page.match(/class="bit[^"]*" data-art="sprig-/g)?.length ?? 0;
      const stars = page.match(/class="bit[^"]*" data-art="star"/g)?.length ?? 0;
      expect(sprigs, `${file}: sprigs`).toBeGreaterThanOrEqual(1);
      expect(stars, `${file}: stars`).toBeGreaterThanOrEqual(4);
      // Thin: a pattern, not a crowd
      expect(sprigs + stars, `${file}: sprigs and stars`).toBeLessThanOrEqual(12);
    }
  });

  it("keeps the scatter clear of a square post's plate", () => {
    const page = readFileSync(join(root, "brand/social/post.html"), "utf-8");
    expect(page).toContain(".canvas:not(.roomy) .roomy { display: none; }");
    expect(page).toMatch(/classList\.toggle\('roomy', innerHeight \/ innerWidth > 1\.2\)/);
  });

  it("labels every verse as World English Bible, which is free to set in a picture", () => {
    const sources = ["brand/store/hero.html", "brand/social/post.html", "scripts/brand/render.mjs"];
    let labels = 0;
    for (const file of sources) {
      const text = readFileSync(join(root, file), "utf-8");
      for (const [label, translation] of text.matchAll(/[A-Z1-3][A-Za-z ]* \d+:\d+ · ([A-Z]+)/g)) {
        expect(translation, `${file}: "${label}"`).toBe("WEB");
        labels++;
      }
    }
    expect(labels, "expected to find verse labels in the brand sources").toBeGreaterThan(6);
  });

  describe("share videos", () => {
    const all = videos as [string, number, number, number, string, number][];

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
        // Apple caps a link preview's picture and video at 10 MB together; the
        // videos the site serves stay far under
        if (output.startsWith("public/")) expect(bytes.length, output).toBeLessThan(1_000_000);

        // The track header holds the picture size, the media header the length
        const tkhd = bytes.indexOf("tkhd");
        expect([bytes.readUInt32BE(tkhd + 80) >> 16, bytes.readUInt32BE(tkhd + 84) >> 16], output).toEqual([width, height]);
        const mvhd = bytes.indexOf("mvhd");
        const [timescale, duration] = [bytes.readUInt32BE(mvhd + 16), bytes.readUInt32BE(mvhd + 20)];
        expect(duration / timescale, output).toBeCloseTo(seconds, 1);
        expect(FPS).toBe(30);
      }
    });

    it("keeps the App Store loops within Apple's 5 to 30 seconds, and none of them in the published site", () => {
      const store = all.filter(([, , , , output]) => output.includes("app-store"));
      expect(store.map(([, w, h]) => `${w}x${h}`)).toEqual(["3840x1646", "3840x2560"]);
      for (const [, , , seconds, output] of store) {
        expect(seconds).toBeGreaterThanOrEqual(5);
        expect(seconds).toBeLessThanOrEqual(30);
        expect(output.startsWith("brand/store/")).toBe(true);
      }
    });

    it("keeps the logo, line and meadow of the App Store assets inside Apple's safe area", () => {
      const page = readFileSync(join(root, "brand/store/hero.html"), "utf-8");
      // Header safe area 1646×661, search 2168×1030, both centred
      expect(page).toMatch(/\.safe \{[^}]*width: calc\(var\(--u\) \* 1646\);\s*height: calc\(var\(--u\) \* 661\)/);
      expect(page).toMatch(/\.search \.safe \{ width: calc\(var\(--u\) \* 2168\); height: calc\(var\(--u\) \* 1030\)/);
      const safe = page.slice(page.indexOf('<div class="safe">'));
      expect(safe).toContain('class="lockup"');
      expect(safe).toContain('class="tagline"');
      expect(safe).toContain('data-art="meadow"');
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
