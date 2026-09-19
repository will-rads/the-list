// Run against the dev server or built preview: BASE_URL=http://127.0.0.1:5173 node check-mobile.mjs
// Explicit demo data only. This does not validate authenticated Supabase journeys or native iOS.
import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:5173";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
});
const warnings = new Set();

async function fit(page, label) {
  const size = await page.evaluate(() => ({
    width: innerWidth, height: innerHeight, x: scrollX, y: scrollY,
    rootWidth: document.documentElement.scrollWidth, rootHeight: document.documentElement.scrollHeight,
    bodyWidth: document.body.scrollWidth, bodyHeight: document.body.scrollHeight,
  }));
  assert(size.rootWidth <= size.width + 1 && size.bodyWidth <= size.width + 1, `${label}: horizontal page overflow ${JSON.stringify(size)}`);
  assert(size.rootHeight <= size.height + 1 && size.bodyHeight <= size.height + 1, `${label}: vertical page overflow ${JSON.stringify(size)}`);
  assert.equal(size.x, 0, `${label}: document scrolled horizontally`);
  assert.equal(size.y, 0, `${label}: document scrolled vertically`);
}

async function dock(page, name, label) {
  const navigation = page.getByRole("navigation", { name, exact: true });
  await navigation.waitFor({ state: "visible" });
  assert.notEqual(await navigation.evaluate(element => getComputedStyle(element).backdropFilter), "none", `${label}: glass blur was lost in the production build`);
  const before = await navigation.boundingBox();
  const { height } = page.viewportSize();
  assert(before && before.y > height / 2 && before.y + before.height <= height + 1, `${label}: bottom navigation outside screen`);
  // Scroll the largest visible content pane, as a swipe would, without scrolling the document.
  await page.evaluate(() => {
    const panes = [...document.querySelectorAll("body *")].filter(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return /auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight
        && rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0;
    }).sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight);
    if (panes[0]) panes[0].scrollTop = panes[0].scrollHeight;
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const after = await navigation.boundingBox();
  assert(after && Math.abs(after.y - before.y) < 1, `${label}: bottom navigation moved with content`);
  await fit(page, label);
}

async function tabs(page, navigationName, labels) {
  for (const label of labels) {
    const button = page.getByRole("navigation", { name: navigationName, exact: true }).getByRole("button", { name: label, exact: true });
    await button.click();
    assert.equal(await button.getAttribute("aria-current"), "page", `${label}: tab did not activate`);
    await dock(page, navigationName, label);
  }
}

try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const errors = [];
    const writes = [];
    // Safety guard: abort unexpected backend writes and fail, never fabricate live responses.
    await context.route("**/*.supabase.co/**", async route => {
      if (!["GET", "HEAD", "OPTIONS"].includes(route.request().method())) {
        writes.push(`${route.request().method()} ${route.request().url()}`);
        await route.abort();
      } else await route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", error => errors.push(`${page.url()}: ${error.message}`));
    page.on("console", message => {
      if (["warning", "error"].includes(message.type())) warnings.add(message.text());
    });
    const open = async path => { await page.goto(new URL(path, base).href, { waitUntil: "domcontentloaded" }); };
    try {
      await open("/?demo=1");
      await tabs(page, "Main navigation", ["Home", "Explore", "Invites", "Profile"]);
      await page.getByRole("button", { name: "Settings", exact: true }).click();
      const theme = page.getByText("Light theme", { exact: true }).locator("..").getByRole("switch");
      assert.equal(await theme.getAttribute("aria-checked"), "false");
      await theme.click();
      assert.equal(await theme.getAttribute("aria-checked"), "true");
      await fit(page, "Member light-theme settings");
      await theme.click();
      assert.equal(await theme.getAttribute("aria-checked"), "false");
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await page.getByRole("navigation", { name: "Main navigation" }).getByRole("button", { name: "Home", exact: true }).click();
      await page.getByRole("button", { name: /Sunset Sessions/ }).click();
      await page.getByRole("button", { name: "Save event", exact: true }).click();
      await page.getByRole("button", { name: "Saved · tap to remove", exact: true }).waitFor({ state: "visible" });
      await page.getByRole("button", { name: "Saved · tap to remove", exact: true }).click();
      await page.getByRole("button", { name: "Apply · free", exact: true }).click();
      await page.getByRole("button", { name: /Cancel application/ }).waitFor({ state: "visible" });
      await fit(page, "Demo event application");
      await page.getByRole("button", { name: "Confirm your seat", exact: true }).click({ timeout: 15000 });
      await fit(page, "Picked invitation");
      await page.getByRole("button", { name: "Confirm my seat", exact: true }).click();
      await page.getByRole("button", { name: "View pass for Sunset Sessions", exact: true }).click();
      await page.getByText("Show this at the door", { exact: true }).waitFor({ state: "visible" });
      await fit(page, "Newly confirmed pass");
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await dock(page, "Main navigation", "Member return from detail");

      await open("/venue?demo=1");
      await tabs(page, "Venue navigation", ["Tonight", "Events", "Door", "Venue"]);
      await page.getByRole("button", { name: "Appearance · Dark", exact: true }).click();
      await page.getByRole("button", { name: "Appearance · Light", exact: true }).click();
      await page.getByRole("navigation", { name: "Venue navigation" }).getByRole("button", { name: "Events", exact: true }).click();
      await page.getByRole("button", { name: "Post an event", exact: true }).click();
      assert(await page.getByRole("button", { name: "Next", exact: true }).isDisabled(), "Empty wizard advanced");
      await page.getByPlaceholder("e.g. Pool Day", { exact: true }).fill("Mobile smoke preview");
      await page.getByPlaceholder("Sun · 25 May", { exact: true }).fill("Sun · 25 May");
      await page.getByPlaceholder("22:00", { exact: true }).fill("22:00");
      await page.getByRole("button", { name: "Next", exact: true }).click();
      await page.getByText("Who fills the room", { exact: true }).waitFor({ state: "visible" });
      await fit(page, "Venue wizard seats");
      await page.getByRole("button", { name: "Back", exact: true }).click();
      assert.equal(await page.getByPlaceholder("e.g. Pool Day", { exact: true }).inputValue(), "Mobile smoke preview", "Wizard back lost title");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await dock(page, "Venue navigation", "Venue wizard cancelled");

      await open("/");
      await page.getByRole("button", { name: "Apply for access", exact: true }).click();
      assert(await page.getByRole("button", { name: "Apply for access", exact: true }).isDisabled(), "Empty member form can submit");
      await page.getByRole("textbox", { name: "Email", exact: true }).fill("invalid-email");
      await page.getByRole("textbox", { name: "Full name", exact: true }).fill("Smoke Preview");
      await page.getByRole("textbox", { name: "Instagram handle", exact: true }).fill("smoke_preview");
      assert(await page.getByRole("button", { name: "Apply for access", exact: true }).isDisabled(), "Invalid member email can submit");
      await fit(page, "Member sign-in form");
      await page.setViewportSize({ width: viewport.width, height: 400 });
      await page.getByRole("textbox", { name: "Instagram handle", exact: true }).click();
      await page.getByRole("button", { name: "Apply for access", exact: true }).scrollIntoViewIfNeeded();
      await fit(page, "Member form with reduced available height");
      await page.setViewportSize(viewport);
      await open("/venue");
      await page.getByRole("button", { name: "Business login", exact: true }).click();
      assert(await page.getByRole("button", { name: /Email me a code/ }).isDisabled(), "Empty venue form can submit");
      await page.getByRole("textbox", { name: "Work email", exact: true }).fill("invalid-email");
      assert(await page.getByRole("button", { name: /Email me a code/ }).isDisabled(), "Invalid venue email can submit");
      await fit(page, "Venue sign-in form");

      await open("/e");
      await page.getByRole("link", { name: "Apply for access", exact: true }).waitFor({ state: "visible" });
      await fit(page, "Anonymous teaser");
      await open("/admin.html");
      await page.getByRole("button", { name: "Sign in", exact: true }).waitFor({ state: "visible" });
      assert(await page.getByLabel("Email", { exact: true }).isVisible(), "Founder sign-in missing");
      await fit(page, "Founder signed out");
      assert.deepEqual(errors, [], "Uncaught page errors");
      assert.deepEqual(writes, [], "Unexpected backend writes");
      console.log(`PASS ${viewport.width}x${viewport.height}: member, venue, forms, teaser, admin; no outer scroll or page errors`);
    } finally {
      await context.close();
    }
  }
  if (warnings.size) console.warn(`Browser console warnings/errors (${warnings.size} distinct):\n${[...warnings].join("\n")}`);
} finally {
  await browser.close();
}
