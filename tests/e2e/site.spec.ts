import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Hey Bible/);
    await expect(page.locator("main h1")).toContainText("Bible Companion");
  });

  test("all pages load", async ({ page }) => {
    const pages = ["/about", "/account", "/privacy", "/terms", "/features", "/blog"];
    for (const path of pages) {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(200);
    }
  });

  test("nav links work", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/features"]');
    await expect(page).toHaveURL(/features/);
    await page.click('a[href="/blog"]');
    await expect(page).toHaveURL(/blog/);
  });

  test("login button links to heybible.app", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator('a.login-button');
    await expect(loginLink).toHaveAttribute("href", "https://heybible.app");
  });
});

test.describe("Carousel", () => {
  test("renders slides and navigation", async ({ page }) => {
    await page.goto("/");
    const slides = page.locator(".carousel-slide");
    await expect(slides).toHaveCount(5);
    const arrows = page.locator(".carousel-arrow");
    await expect(arrows).toHaveCount(2);
    const dots = page.locator(".dot");
    await expect(dots).toHaveCount(5);
  });

  test("arrows navigate slides", async ({ page }) => {
    await page.goto("/");
    const firstSlide = page.locator(".carousel-slide").first();
    await expect(firstSlide).toHaveClass(/active/);
    await page.click(".carousel-arrow-right");
    const secondSlide = page.locator(".carousel-slide").nth(1);
    await expect(secondSlide).toHaveClass(/active/);
  });
});

test.describe("Lightbox", () => {
  test("opens on click and closes on Escape", async ({ page }) => {
    await page.goto("/");
    const lightbox = page.locator("#lightbox");
    await expect(lightbox).not.toHaveClass(/active/);
    await page.locator(".carousel-slide.active").click();
    await expect(lightbox).toHaveClass(/active/);
    await page.keyboard.press("Escape");
    await expect(lightbox).not.toHaveClass(/active/);
  });
});

test.describe("Theme toggle", () => {
  test("cycles through themes", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator("#theme-toggle");
    await toggle.click();
    const theme1 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(["light", "dark"]).toContain(theme1);
    await toggle.click();
    const theme2 = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme2).not.toBe(theme1);
  });
});

test.describe("Footer mobile (Issue #12)", () => {
  test("footer is NOT fixed on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const footer = page.locator("footer");
    const position = await footer.evaluate((el) => window.getComputedStyle(el).position);
    expect(position).not.toBe("fixed");
  });
});

test.describe("Features page (Issue #11)", () => {
  test("all 6 cards render", async ({ page }) => {
    await page.goto("/features");
    const cards = page.locator(".feature-card");
    await expect(cards).toHaveCount(6);
  });

  test("CTA present with app store buttons", async ({ page }) => {
    await page.goto("/features");
    await expect(page.locator("text=Ready to get started?")).toBeVisible();
    await expect(page.locator('img[alt="Download on the App Store"]')).toBeVisible();
  });
});

test.describe("Blog (Issue #13)", () => {
  test("index loads with seed post", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("text=Welcome to the Hey Bible Blog")).toBeVisible();
  });

  test("seed post page renders", async ({ page }) => {
    await page.goto("/blog/welcome");
    await expect(page.locator("article h1")).toContainText("Welcome to the Hey Bible Blog");
    await expect(page.getByText("Hey Bible Team")).toBeVisible();
  });

  test("tag filter works", async ({ page }) => {
    await page.goto("/blog/tag/update");
    await expect(page.locator("main h1")).toContainText("Update");
    await expect(page.locator("main").getByText("Welcome to the Hey Bible Blog")).toBeVisible();
  });
});
