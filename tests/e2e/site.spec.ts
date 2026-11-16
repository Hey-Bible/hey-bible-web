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
    const loginLink = page.locator('a.login-button').first();
    await expect(loginLink).toHaveAttribute("href", "https://heybible.app");
  });
});

test.describe("Image scroller", () => {
  test("renders all slides", async ({ page }) => {
    await page.goto("/");
    const slides = page.locator(".carousel-slide");
    await expect(slides).toHaveCount(6);
  });
});

test.describe("Lightbox", () => {
  test("opens on click and closes on Escape", async ({ page }) => {
    await page.goto("/");
    const lightbox = page.locator("#lightbox");
    await expect(lightbox).not.toHaveClass(/active/);
    await page.evaluate(() => {
      const slide = document.querySelector('.carousel-slide') as HTMLElement;
      slide?.click();
    });
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
  test("all feature cards render", async ({ page }) => {
    await page.goto("/features");
    const cards = page.locator(".feature-card");
    // 7 app features and 4 developer features
    await expect(cards).toHaveCount(11);
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

test.describe("Storybook Sticker theme", () => {
  const background = (page: import("@playwright/test").Page) =>
    page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  test("the page is cream by day and night-sky blue in dark mode", async ({ page }) => {
    // With no stored choice the site follows the system setting.
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    expect(await background(page)).toBe("rgb(243, 232, 214)");

    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    expect(await background(page)).toBe("rgb(35, 43, 61)");
  });

  test("headings are set in Fredoka", async ({ page }) => {
    await page.goto("/");
    const family = await page.locator("main h1").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family).toMatch(/^"?Fredoka/);
  });

  test("the giving note keeps ink text on its pastel pill in dark mode", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const pill = page.locator("header .charity-pill").first();
    await expect(pill).toBeVisible();
    const colour = await pill.locator("span").last().evaluate((el) => getComputedStyle(el).color);
    expect(colour).toBe("rgb(67, 48, 42)");
  });

  test("the giving note does not overlap the navigation", async ({ page }) => {
    for (const width of [1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const pill = await page.locator("header .charity-pill").first().boundingBox();
      const home = await page.locator('header nav a[href="/"]').nth(1).boundingBox();
      const logo = await page.locator('header nav a[href="/"]').first().boundingBox();
      expect(pill!.x + pill!.width, `pill clears the nav at ${width}px`).toBeLessThanOrEqual(home!.x);
      expect(pill!.x, `pill clears the logo at ${width}px`).toBeGreaterThanOrEqual(logo!.x + logo!.width);
    }
  });

  test("the hero sheep is hidden on a phone and shown on a desktop", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".hero-sticker")).toBeHidden();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator(".hero-sticker")).toBeVisible();
  });
});
