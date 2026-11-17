import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const dist = join(import.meta.dirname, "..", "dist");

function readPage(path: string): string {
  const file = join(dist, path);
  return readFileSync(file, "utf-8");
}

describe("Static build output", () => {
  it("generates all expected pages", () => {
    const pages = [
      "index.html",
      "about/index.html",
      "account/index.html",
      "privacy/index.html",
      "terms/index.html",
      "features/index.html",
      "agents/index.html",
      "blog/index.html",
      "blog/welcome/index.html",
      "blog/the-bible-for-ai-agents/index.html",
      "blog/give-your-agent-a-bible/index.html",
      "blog/creative-use-cases-hey-bible-skill-cli/index.html",
      "blog/behind-the-scenes-season-2/index.html",
      "blog/tag/podcast/index.html",
      "blog/tag/update/index.html",
      "blog/tag/tutorial/index.html",
      "blog/tag/agents/index.html",
      "blog/tag/developers/index.html",
    ];

    for (const page of pages) {
      expect(existsSync(join(dist, page)), `${page} should exist`).toBe(true);
    }
  });

  describe("CharityBanner", () => {
    it("renders expected text on homepage", () => {
      const html = readPage("index.html");
      expect(html).toContain("All proceeds support local churches and food banks");
    });
  });

  describe("Header", () => {
    it("includes nav links and login button", () => {
      const html = readPage("index.html");
      expect(html).toContain("Features");
      expect(html).toContain("Blog");
      expect(html).toContain("Login");
      expect(html).toContain("heybible.app");
    });
  });

  describe("Footer", () => {
    it("renders all links", () => {
      const html = readPage("index.html");
      expect(html).toContain("About");
      expect(html).toContain("Privacy");
      expect(html).toContain("Support");
      expect(html).toContain("Terms");
      expect(html).toContain("Working Dev");
    });

    it("has no fixed positioning", () => {
      const html = readPage("index.html");
      expect(html).not.toContain("position: fixed");
      expect(html).not.toContain("position:fixed");
    });
  });

  describe("FeatureCard (Features page)", () => {
    it("renders all 6 features", () => {
      const html = readPage("features/index.html");
      const featureTitles = [
        "Search &amp; Favorites",
        "Personal Notes",
        "AI Chat",
        "iOS Widget",
        "Verse Art",
        "Sharing",
      ];
      for (const title of featureTitles) {
        expect(html, `should contain "${title}"`).toContain(title);
      }
    });

    it("has CTA with app store buttons", () => {
      const html = readPage("features/index.html");
      expect(html).toContain("Ready to get started?");
      expect(html).toContain("app-store.svg");
      expect(html).toContain("play-store.svg");
    });

    it("uses a features-specific Open Graph image", () => {
      const html = readPage("features/index.html");
      expect(html).toContain('property="og:image" content="https://heybible.org/img/og-features.png"');
      expect(html).toContain('name="twitter:image" content="https://heybible.org/img/og-features.png"');
      // Asset must ship with the build
      expect(existsSync(join(dist, "img/og-features.png"))).toBe(true);
    });

    it("describes the features share image as 1200 by 630", () => {
      const html = readPage("features/index.html");
      expect(html).toContain('property="og:image:width" content="1200"');
      expect(html).toContain('property="og:image:height" content="630"');
    });
  });

  describe("Blog", () => {
    it("blog index lists seed post", () => {
      const html = readPage("blog/index.html");
      expect(html).toContain("Welcome to the Hey Bible Blog");
    });

    it("seed post page renders", () => {
      const html = readPage("blog/welcome/index.html");
      expect(html).toContain("Welcome to the Hey Bible Blog");
      expect(html).toContain("Hey Bible Team");
    });

    it("tag page renders for Update tag", () => {
      const html = readPage("blog/tag/update/index.html");
      expect(html).toContain("Update");
    });
  });

  describe("Content collection schema", () => {
    it("seed post has correct frontmatter reflected in output", () => {
      const html = readPage("blog/welcome/index.html");
      expect(html).toContain("Welcome to the Hey Bible Blog");
      expect(html).toContain("Hey Bible Team");
      expect(html).toContain("Update");
    });
  });

  describe("Homepage", () => {
    it("contains carousel slides", () => {
      const html = readPage("index.html");
      expect(html).toContain("carousel-slide");
      expect(html).toContain("carousel-3.webp");
    });

    it("contains lightbox", () => {
      const html = readPage("index.html");
      expect(html).toContain("lightbox");
      expect(html).toContain("lightbox-close");
    });

    it("contains JSON-LD structured data", () => {
      const html = readPage("index.html");
      expect(html).toContain("SoftwareApplication");
      expect(html).toContain("schema.org");
    });
  });

  describe("AI agent gateway", () => {
    it("homepage links to the agents page with an 'AI Agents' CTA badge", () => {
      const html = readPage("index.html");
      expect(html).toContain('href="/agents"');
      expect(html).toContain("Build with");
      expect(html).toContain("AI Agents");
    });

    it("header nav includes a For Agents link", () => {
      const html = readPage("index.html");
      expect(html).toContain("For Agents");
    });

    it("features page surfaces the developer/agent section", () => {
      const html = readPage("features/index.html");
      expect(html).toContain("For Developers &amp; AI Agents");
      expect(html).toContain("MCP Server");
      expect(html).toContain("Agent Skill");
      expect(html).toContain("CLI");
    });

    it("agents page describes every connection method", () => {
      const html = readPage("agents/index.html");
      expect(html).toContain("gateway for giving AI agents access to the Bible");
      expect(html).toContain("@hey-bible/cli");
      expect(html).toContain("@hey-bible/mcp");
      expect(html).toContain("@hey-bible/client");
      expect(html).toContain("ClawHub");
      expect(html).toContain("api.heybible.app");
    });

    it("agents page has a developer-focused SEO title", () => {
      const html = readPage("agents/index.html");
      expect(html).toContain("<title>Hey Bible for AI Agents");
    });

    it("agents page has a copy button on each command block", () => {
      const html = readPage("agents/index.html");
      // one copy button per connection method (4)
      expect((html.match(/class="copy-btn/g) || []).length).toBe(4);
      expect(html).toContain('aria-label="Copy command"');
    });

    it("offers four ways to connect", () => {
      const html = readPage("agents/index.html");
      expect(html).toContain("Four ways to connect");
      expect(html).toContain("REST API &amp; SDK");
    });

    it("marks off-site links with an external-link icon (not on internal links)", () => {
      const agents = readPage("agents/index.html");
      // external-link icon on the 2 hero buttons + 1 bottom CTA; the method
      // cards intentionally use a plain arrow (reads better in the cards)
      expect((agents.match(/external-link-icon/g) || []).length).toBe(3);
      // in-site nav uses a plain arrow, not the external icon
      const home = readPage("index.html");
      expect(home).not.toContain("external-link-icon");
    });

    it("publishes the launch blog post", () => {
      const html = readPage("blog/the-bible-for-ai-agents/index.html");
      expect(html).toContain("The Bible, for AI Agents");
      expect(html).toContain("Moses");
    });

    it("publishes the agent quickstart tutorial", () => {
      const html = readPage("blog/give-your-agent-a-bible/index.html");
      expect(html).toContain("Give Your AI Agent a Bible");
      expect(html).toContain("@hey-bible/cli");
      expect(html).toContain("HEY_BIBLE_API_KEY");
      expect(html).toContain("read-centric");
      expect(html).toContain("Tutorial");
      // the ClawHub steer prompt renders as a normal Shiki code block...
      expect(html).toContain("inspect the ClawHub skill metadata");
      expect(html).toContain("do not invent missing requirements");
      // ...not the bespoke <pre> the draft hand-rolled (which blended into the
      // page background in dark mode)
      expect(html).not.toContain("text-xs rounded-xl p-3 pr-12");
      // every code block gets a copy button injected client-side
      expect(html).toContain("copy-btn");
    });

    it("publishes the creative use cases post", () => {
      const html = readPage(
        "blog/creative-use-cases-hey-bible-skill-cli/index.html",
      );
      expect(html).toContain("Creative Use Cases for the Hey Bible Skill");
      expect(html).toContain("Moses");
      expect(html).toContain("Personalized Devotional Companions");
      expect(html).toContain("read-oriented");
      // categorized under the new Agents/Developers tags
      expect(html).toContain("Agents");
      expect(html).toContain("Developers");
    });
  });

  describe("Storybook Sticker theme", () => {
    const stylesheet = () => {
      const href = readPage("index.html").match(/href="(\/_astro\/[^"]+\.css)"/)?.[1];
      expect(href, "homepage should link a stylesheet").toBeTruthy();
      return readFileSync(join(dist, href!), "utf-8");
    };

    it("loads Fredoka for headings alongside Nunito", () => {
      const html = readPage("index.html");
      expect(html).toContain("family=Fredoka");
      expect(html).toContain("family=Nunito");
      expect(stylesheet()).toMatch(/--font-heading:\s*["']?Fredoka/);
    });

    it("uses the cream page by day and the night sky in dark mode", () => {
      const css = stylesheet().toLowerCase();
      expect(css).toContain("--color-retro-bg:#f3e8d6");
      expect(css).toMatch(/html\[data-theme="?dark"?\]\{[^}]*--color-retro-bg:#232b3d/);
      // the old sky-blue theme is gone
      expect(css).not.toContain("#7fcdeb");
    });

    it("gives lists in blog posts their bullets and numbers back", () => {
      const css = stylesheet();
      expect(css).toMatch(/\.blog-prose ul\{list-style-type:disc\}/);
      expect(css).toMatch(/\.blog-prose ol\{list-style-type:decimal\}/);
    });

    it("draws the logo as the book-and-cross mark beside the wordmark", () => {
      const html = readPage("index.html");
      expect(html).toMatch(/<svg[^>]*class="logo-mark"/);
      expect(html).toMatch(/class="logo-wordmark[^"]*"[^>]*>Hey Bible</);
      expect(html).not.toContain("logo-small.png");
    });

    it("gives each logo mark on a page its own mask", () => {
      const html = readPage("about/index.html");
      const ids = [...html.matchAll(/<mask id="(logo-mark-[^"]+)"/g)].map((m) => m[1]);
      expect(ids.length).toBe(2); // header and the About badge
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(html).toContain(`mask="url(#${id})"`);
    });

    it("numbers the logo masks per page, so every build writes the same ids", () => {
      const ids = [...readPage("about/index.html").matchAll(/<mask id="(logo-mark-[^"]+)"/g)].map((m) => m[1]);
      expect(ids).toEqual(["logo-mark-1", "logo-mark-2"]);
    });

    it("sets quiet copy in the soft text colour rather than faded ink", () => {
      expect(readPage("blog/welcome/index.html")).toMatch(/<p class="text-sm text-soft">\s*By /);
      expect(readPage("blog/index.html")).toMatch(/class="text-xs text-soft mb-2"/);
      expect(stylesheet()).toMatch(/\.text-soft,\.text-soft \*\{color:var\(--color-retro-text-soft\)\}/);
    });

    it("labels a logo that stands alone and hides the one beside the wordmark", () => {
      const html = readPage("about/index.html");
      expect(html).toMatch(/<svg[^>]*class="logo-mark"[^>]*aria-label="Hey Bible app logo"/);
      expect(html).toMatch(/<svg[^>]*class="logo-mark"[^>]*aria-hidden="true"/);
    });

    it("puts a sheep sticker on the homepage, hidden from screen readers", () => {
      const html = readPage("index.html");
      expect(html).toMatch(/<span[^>]*class="sticker-art[^"]*"[^>]*aria-hidden="true"[^>]*data-sticker="sheep"/);
    });

    it("cuts cards out as stickers", () => {
      expect(readPage("features/index.html")).toMatch(/class="feature-card sticker-card/);
      expect((readPage("agents/index.html").match(/class="sticker-card/g) || []).length).toBe(4);
      expect(readPage("blog/index.html")).toMatch(/<article[^>]*class="sticker-card/);
      expect(readPage("blog/welcome/index.html")).toContain('class="sticker-card');
    });

    it("sets tags as ink-on-pastel pills, not white on the accent colour", () => {
      const html = readPage("blog/welcome/index.html");
      expect(html).toMatch(/class="sticker-pill[^"]*"[^>]*>\s*Update/);
      expect(html).not.toContain("color: #ffffff");
      expect(readPage("blog/index.html")).not.toContain("color: #ffffff");
    });

    it("shows the giving note as a pill in the header and the mobile menu", () => {
      const html = readPage("index.html");
      expect((html.match(/class="charity-pill sticker-pill/g) || []).length).toBe(2);
    });

    it("describes the default share image as 1200 by 630", () => {
      const html = readPage("index.html");
      expect(html).toContain('property="og:image" content="https://heybible.org/img/og-image.png"');
      expect(html).toContain('property="og:image:width" content="1200"');
      expect(html).toContain('property="og:image:height" content="630"');
    });

    it("offers the moving share image wherever the default picture is used", () => {
      const html = readPage("index.html");
      const video = "https://heybible.org/video/og.mp4";
      expect(html).toContain(`property="og:video" content="${video}"`);
      expect(html).toContain(`property="og:video:secure_url" content="${video}"`);
      expect(html).toContain('property="og:video:type" content="video/mp4"');
      expect(html).toContain('property="og:video:width" content="1200"');
      expect(html).toContain('property="og:video:height" content="630"');
      expect(existsSync(join(dist, "video/og.mp4"))).toBe(true);
    });

    it("leaves the video off a page with its own share image", () => {
      expect(readPage("features/index.html")).not.toContain("og:video");
      expect(readPage("blog/welcome/index.html")).not.toContain("og:video");
    });

    it("leaves the size off when a post brings its own share image", () => {
      const html = readPage("blog/welcome/index.html");
      expect(html).toContain("welcome-hero.png");
      expect(html).not.toContain("og:image:width");
    });

    it("sets the browser colour for day and night", () => {
      const html = readPage("index.html");
      expect(html).toContain('name="theme-color" content="#F3E8D6" media="(prefers-color-scheme: light)"');
      expect(html).toContain('name="theme-color" content="#232B3D" media="(prefers-color-scheme: dark)"');
    });

    it("ships cream manifest colours and the icon files", () => {
      const manifest = JSON.parse(readPage("site.webmanifest"));
      expect(manifest.theme_color).toBe("#F3E8D6");
      expect(manifest.background_color).toBe("#F3E8D6");
      for (const icon of manifest.icons) {
        expect(existsSync(join(dist, icon.src)), `${icon.src} should exist`).toBe(true);
      }
      expect(existsSync(join(dist, "img/og-image.png"))).toBe(true);
      expect(existsSync(join(dist, "favicon.ico"))).toBe(true);
    });
  });

  describe("New-look post", () => {
    it("publishes the post about the new look, on the blog and under its tags", () => {
      const post = readPage("blog/a-new-look/index.html");
      expect(post).toContain("A New Look for Hey Bible");
      expect(readPage("blog/index.html")).toContain("A New Look for Hey Bible");
      expect(readPage("blog/tag/update/index.html")).toContain("A New Look for Hey Bible");
    });

    it("shows the app in it, with every picture the post names in the build", () => {
      const post = readPage("blog/a-new-look/index.html");
      for (const name of ["before-after", "app", "night", "verse"]) {
        expect(post, `a-new-look-${name}.png`).toContain(`/img/blog/a-new-look-${name}.png`);
        expect(existsSync(join(dist, `img/blog/a-new-look-${name}.png`))).toBe(true);
      }
      expect(existsSync(join(dist, "img/blog/a-new-look-hero.png"))).toBe(true);
      expect(existsSync(join(dist, "img/blog/a-new-look-hero-dark.png"))).toBe(true);
    });

    it("says where the look is live today without promising a store date", () => {
      const post = readPage("blog/a-new-look/index.html");
      expect(post).toContain("https://heybible.app");
      expect(post).toContain("with the next update");
    });
  });

  describe("Podcast posts", () => {
    it("publishes the Season 2 behind-the-scenes post under the Podcast tag", () => {
      const post = readPage("blog/behind-the-scenes-season-2/index.html");
      expect(post).toContain("Behind the Scenes: Building Hey Bible Podcast Season 2");
      expect(post).toContain('href="/blog/tag/podcast"');

      const tagPage = readPage("blog/tag/podcast/index.html");
      expect(tagPage).toContain("Behind the Scenes: Building Hey Bible Podcast Season 2");
    });
  });

  describe("Noindex pages", () => {
    it("account has noindex", () => {
      const html = readPage("account/index.html");
      expect(html).toContain('name="robots" content="noindex"');
    });

    it("privacy has noindex", () => {
      const html = readPage("privacy/index.html");
      expect(html).toContain('name="robots" content="noindex"');
    });

    it("terms has noindex", () => {
      const html = readPage("terms/index.html");
      expect(html).toContain('name="robots" content="noindex"');
    });
  });
});
