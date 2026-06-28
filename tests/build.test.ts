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
      "blog/tag/update/index.html",
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
      // one copy button per connection method (5)
      expect((html.match(/class="copy-btn/g) || []).length).toBe(5);
      expect(html).toContain('aria-label="Copy command"');
    });

    it("marks off-site links with an external-link icon (not on internal links)", () => {
      const agents = readPage("agents/index.html");
      // 2 hero buttons + 5 method CTAs + 1 bottom CTA all go off-site
      expect((agents.match(/external-link-icon/g) || []).length).toBe(8);
      // in-site nav uses a plain arrow, not the external icon
      const home = readPage("index.html");
      expect(home).not.toContain("external-link-icon");
    });

    it("publishes the launch blog post", () => {
      const html = readPage("blog/the-bible-for-ai-agents/index.html");
      expect(html).toContain("The Bible, for AI Agents");
      expect(html).toContain("Moses");
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
