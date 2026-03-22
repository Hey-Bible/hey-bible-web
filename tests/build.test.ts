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
      "blog/index.html",
      "blog/welcome/index.html",
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
      expect(html).toContain("carousel-3.jpg");
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
