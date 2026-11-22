import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Hey Bible/);
    await expect(page.locator("main h1")).toHaveText("Your AI-powered Bible companion");
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

test.describe("Scroller shadows (Issue #32)", () => {
  // The scrollers clip at their box, so the strip must leave room below each
  // card for the sticker shadow (offset + blur) or it ends at a hard edge.
  for (const [path, item] of [["/", ".carousel-slide"], ["/features", ".overflow-x-scroll .feature-card"]]) {
    test(`${path} leaves room for the shadow below ${item}`, async ({ page }) => {
      await page.goto(path);
      const { room, shadow } = await page.locator(item).first().evaluate((el) => {
        const scroller = el.closest(".overflow-x-scroll") as HTMLElement;
        // Computed form: "rgba(...) 0px 10px 22px 0px" (x, y, blur, spread)
        const [, y, blur] = (getComputedStyle(el).boxShadow.match(/-?[\d.]+(?=px)/g) ?? []).map(Number);
        return {
          room: scroller.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom,
          shadow: y + blur,
        };
      });
      expect(shadow).toBeGreaterThan(0);
      expect(room).toBeGreaterThanOrEqual(shadow);
    });
  }
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

  test("a screenshot fills its card, and most of the window when it is opened", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/features");
    const card = page.locator(".overflow-x-scroll .feature-card").first();
    const inCard = (await card.locator("img").boundingBox())!;
    expect(inCard.width / (await card.boundingBox())!.width).toBeGreaterThan(0.8);

    await card.click();
    const opened = page.locator("#feature-lightbox-img");
    await expect(opened).toBeVisible();
    const picture = (await opened.boundingBox())!;
    expect(picture.height).toBeGreaterThan(900 * 0.7);
    // Larger, but not stretched, and the whole card is still inside the window
    expect(picture.width / picture.height).toBeCloseTo(990 / 2151, 2);
    const frame = (await page.locator("#feature-lightbox-card").boundingBox())!;
    expect(frame.y).toBeGreaterThanOrEqual(0);
    expect(frame.y + frame.height).toBeLessThanOrEqual(900);
  });

  test("an opened screenshot is never taller than the phone it was taken on", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1400 });
    await page.goto("/features");
    await page.locator(".overflow-x-scroll .feature-card").first().click();
    const picture = (await page.locator("#feature-lightbox-img").boundingBox())!;
    expect(Math.round(picture.height)).toBe(956);
  });

  test("a card with words only still opens at a readable width", async ({ page }) => {
    await page.goto("/features");
    await page.locator(".feature-card").last().click();
    await expect(page.locator("#feature-lightbox-img")).toBeHidden();
    expect((await page.locator("#feature-lightbox-card").boundingBox())!.width).toBeGreaterThanOrEqual(300);
  });

  for (const [path, item, box] of [
    ["/features", ".overflow-x-scroll .feature-card", "#feature-lightbox"],
    ["/", ".carousel-slide", "#lightbox"],
  ]) {
    test(`arrow keys step through the opened pictures without scrolling the row behind (${path})`, async ({ page }) => {
      // Narrow enough that the row has somewhere to scroll
      await page.setViewportSize({ width: 1000, height: 800 });
      await page.goto(path);
      const row = page.locator(".overflow-x-scroll");
      const scrolled = () => row.evaluate((el) => el.scrollLeft);
      const showing = () => page.locator(`${box} .lightbox-content img`).getAttribute("src");
      await page.locator(item).first().click();
      await expect(page.locator(box)).toHaveClass(/active/);
      const first = await showing();

      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(400);
      expect(await showing()).not.toBe(first);
      expect(await scrolled()).toBe(0);

      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(400);
      expect(await showing()).toBe(first);
      expect(await scrolled()).toBe(0);

      // With the pictures closed, the arrow keys scroll the row again
      await page.keyboard.press("Escape");
      await expect(page.locator(box)).not.toHaveClass(/active/);
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(400);
      expect(await scrolled()).toBeGreaterThan(0);
    });
  }

  for (const [path, item, box] of [
    ["/features", ".overflow-x-scroll .feature-card", "#feature-lightbox"],
    ["/", ".carousel-slide", "#lightbox"],
  ]) {
    for (const [width, height, edge] of [
      [1440, 900, 20],
      [390, 844, 10],
    ]) {
      test(`the close button of an opened picture is in the top left corner (${path}, ${width} wide)`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(path);
        await page.locator(item).first().click();
        const close = page.locator(`${box} .lightbox-close`);
        await expect(close).toBeVisible();
        const button = (await close.boundingBox())!;
        expect(Math.round(button.x)).toBe(edge);
        expect(Math.round(button.y)).toBe(edge);
        // It still closes the picture
        await close.click();
        await expect(page.locator(box)).not.toHaveClass(/active/);
      });
    }
  }

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

  test("the giving note sits in the middle of the page on a wide screen", async ({ page }) => {
    for (const width of [1440, 1728]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const pill = await page.locator("header .charity-pill").first().boundingBox();
      const pageWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const centre = pill!.x + pill!.width / 2;
      expect(Math.abs(centre - pageWidth / 2), `centred at ${width}px`).toBeLessThanOrEqual(1);
    }
  });

  test("the giving note has a row of its own on a tablet", async ({ page }) => {
    for (const width of [640, 768, 1000]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const pill = page.locator("header nav .charity-pill");
      await expect(pill, `shown at ${width}px`).toBeVisible();
      const box = (await pill.boundingBox())!;
      const login = (await page.locator("header nav .login-button").boundingBox())!;
      expect(box.y, `below the links at ${width}px`).toBeGreaterThanOrEqual(login.y + login.height);
      const pageWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(Math.abs(box.x + box.width / 2 - pageWidth / 2), `centred at ${width}px`).toBeLessThanOrEqual(1);
    }
  });

  test("the giving note wraps in the open menu on a small phone", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    await page.locator("#hamburger-btn").click();
    await expect(page.locator("#mobile-menu .charity-pill")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("the navigation links stay on one line beside the giving note", async ({ page }) => {
    for (const width of [1024, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const link = page.locator('header nav a[href="/agents"]');
      const box = await link.boundingBox();
      const lineHeight = await link.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
      expect(box!.height, `"For Agents" is one line at ${width}px`).toBeLessThan(lineHeight * 1.5);
    }
  });

  test("the header does not make the page scroll sideways", async ({ page }) => {
    for (const width of [390, 640, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `no sideways scroll at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test("the hero sheep is hidden on a phone and shown on a desktop", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".hero-sticker")).toBeHidden();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator(".hero-sticker")).toBeVisible();
  });

  test("the day sprigs stay off the page until there is a gutter for them", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    const image = () => page.evaluate(() => getComputedStyle(document.body).backgroundImage);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    expect(await image()).toBe("none");
    await page.setViewportSize({ width: 1280, height: 800 });
    expect(await image()).toContain("data:image/svg+xml");
  });

  test("the browser bar follows the chosen theme, not just the system one", async ({ page }) => {
    const colours = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.getAttribute("content")),
      );
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => {
      if (!localStorage.getItem("theme")) localStorage.setItem("theme", "dark");
    });
    await page.goto("/");
    expect(await colours()).toEqual(["#232B3D", "#232B3D"]);

    // dark -> system, which follows the light OS setting here
    await page.click("#theme-toggle");
    expect(await colours()).toEqual(["#F3E8D6", "#F3E8D6"]);
  });
});
