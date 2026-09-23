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

// Drag with the mouse: pointer events drive the venue swipe deck.
async function drag(page, locator, dx, dy) {
  const box = await locator.boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 3;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + dx * i / 8, y + dy * i / 8);
  await page.mouse.up();
  await page.waitForTimeout(400);
}

// SHOTS_DIR=... saves a screenshot of each venue screen for review.
async function shot(page, viewport, name) {
  if (process.env.SHOTS_DIR) await page.screenshot({ path: `${process.env.SHOTS_DIR}/${viewport.width}x${viewport.height}-${name}.png` });
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
      const venueNav = page.getByRole("navigation", { name: "Venue navigation" });
      await tabs(page, "Venue navigation", ["Home", "Events", "Venue"]);
      const dark = page.getByRole("switch", { name: "Dark mode", exact: true });
      assert.equal(await dark.getAttribute("aria-checked"), "true");
      await dark.click();
      assert.equal(await dark.getAttribute("aria-checked"), "false");
      await dark.click();
      await venueNav.getByRole("button", { name: "Home", exact: true }).click();
      await shot(page, viewport, "home");

      // Picking: a real swipe, buttons as backup, and undo only after a pass.
      await page.getByRole("button", { name: "Start picking, Late Lounge", exact: true }).click();
      const card = page.getByRole("group", { name: /drag right to pick/ });
      const who = async () => (await card.getAttribute("aria-label")).split(",")[0];
      const first = await who();
      await drag(page, card, 200, 4);
      await page.getByText(/^Picked 1 of 20/).waitFor();
      assert.equal(await page.getByRole("button", { name: /^Undo pass/ }).count(), 0, "Undo offered after a pick");
      const second = await who();
      assert.notEqual(second, first, "Swipe right did not pick");
      await drag(page, card, -200, 4);
      await page.getByRole("button", { name: "Undo pass on " + second, exact: true }).click();
      assert.equal(await who(), second, "Undo pass did not bring the card back");
      await drag(page, card, 20, 160);
      assert.equal(await who(), second, "A vertical drag decided");
      await drag(page, card, 50, 0);
      assert.equal(await who(), second, "A short drag decided");
      await page.getByRole("button", { name: "View " + second, exact: true }).click();
      await page.getByRole("dialog", { name: second + " profile" }).waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Pass on " + second, exact: true }).click();
      await page.getByRole("button", { name: /^Undo pass/ }).waitFor();
      await fit(page, "Venue picking deck");
      await shot(page, viewport, "deck");
      await page.getByRole("button", { name: "Back", exact: true }).click();

      // Door list: one tap from Home, check-in, and the exact no-show count before closing.
      await page.getByRole("button", { name: "Open door list, Pool Day", exact: true }).click();
      await page.getByRole("heading", { name: "Door list", exact: true }).waitFor();
      await page.getByRole("searchbox", { name: "Search guests" }).fill("sara");
      await page.getByRole("button", { name: "Here, check in Sara Capriotti", exact: true }).click();
      await page.getByText("1 of 18 inside", { exact: true }).waitFor();
      await page.getByRole("searchbox", { name: "Search guests" }).fill("");
      await fit(page, "Venue door list");
      await shot(page, viewport, "door");
      await page.getByRole("button", { name: "Close the event", exact: true }).click();
      const closing = page.getByRole("dialog", { name: "Close the event?" });
      await closing.getByText(/17 confirmed guests haven't checked in/).waitFor();
      await shot(page, viewport, "close-confirm");
      await closing.getByRole("button", { name: "Close the event", exact: true }).click();

      // Summary: attendance, Stories and the bill together; ratings are optional.
      await page.getByText("Rate guests (optional)", { exact: true }).waitFor();
      await page.getByText("A follower count, not measured reach.", { exact: true }).waitFor();
      const great = page.getByRole("button", { name: "Great for Sara Capriotti", exact: true });
      await great.click();
      assert.equal(await great.getAttribute("aria-pressed"), "true", "Rating did not stick");
      await fit(page, "Venue summary");
      await shot(page, viewport, "summary");
      await page.getByRole("button", { name: "Back", exact: true }).click();

      // Events: one list, and an event page with three separate counts.
      await venueNav.getByRole("button", { name: "Events", exact: true }).click();
      await shot(page, viewport, "events");
      await page.getByRole("button", { name: /^Late Lounge, Taking requests/ }).click();
      for (const label of ["Picked", "Awaiting confirmation", "Confirmed"]) await page.getByText(label, { exact: true }).first().waitFor();
      await fit(page, "Venue event page");
      await shot(page, viewport, "event");
      await page.getByRole("button", { name: "Back", exact: true }).click();

      // Posting: one screen, with price, deadlines and arrival shown before posting.
      await page.getByRole("button", { name: "New event", exact: true }).click();
      const post = page.getByRole("button", { name: "Post event", exact: true });
      assert(await post.isDisabled(), "An empty event can be posted");
      await page.getByLabel("Event name", { exact: true }).fill("Mobile smoke preview");
      await page.getByLabel("Date", { exact: true }).fill("Sat · 31 May");
      await page.getByLabel("Start time", { exact: true }).fill("22:00");
      await page.getByRole("button", { name: "40 for $1,200", exact: true }).click();
      await page.getByText(/^Requests close .+ 22:00\.$/).waitFor();
      await page.getByText("$1,200 for 40 people. Paid after the event by Whish, OMT or cash.", { exact: true }).waitFor();
      await fit(page, "Venue new event");
      await shot(page, viewport, "post");
      await post.click();
      await page.getByRole("button", { name: /^Mobile smoke preview, Taking requests/ }).waitFor();
      await dock(page, "Venue navigation", "Venue event posted");

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
