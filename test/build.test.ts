// Checks the built site in dist/. Run `npm run check`, which builds first.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const page = (path: string) =>
  readFileSync(new URL(`../dist${path}index.html`, import.meta.url), "utf8");

test("home keeps its masthead, Gigi stage and links", () => {
  const html = page("/");
  assert.match(html, /<title>McWestling<\/title>/);
  assert.match(html, /class="masthead"/);
  assert.match(html, /class="gigi-stage"/);
  assert.match(html, /src="assets\/mcwestling-logo-window-cutouts\.png"/);
  assert.match(html, /href="https:\/\/github\.com\/mcwestling"/);
  assert.doesNotMatch(html, /class="page-header"/);
});

test("About and Privacy sit on the sheet under the shared header", () => {
  const about = page("/about/");
  assert.match(about, /<title>About · McWestling<\/title>/);
  assert.match(about, /<a href="\/about\/" aria-current="page">About<\/a>/);
  assert.match(about, /<article class="page-content">\s*<h1[^>]*>About McWestling<\/h1>/);
  assert.match(about, /currently in use by the <a href="https:\/\/bso\.nyc">Brooklyn Symphony Orchestra<\/a>\./);

  const privacy = page("/privacy/");
  assert.match(privacy, /<title>Privacy · McWestling<\/title>/);
  assert.match(privacy, /<a href="\/privacy\/" aria-current="page">Privacy<\/a>/);
  assert.match(privacy, /This site uses PostHog to collect anonymous usage analytics/);
});

test("wrangler serves the build output at mcwestling.com", () => {
  const config = JSON.parse(
    readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
  );
  assert.equal(config.assets.directory, "./dist");
  assert.deepEqual(config.routes, [
    { pattern: "mcwestling.com", custom_domain: true },
  ]);
  assert.ok(existsSync(new URL("../dist/styles.css", import.meta.url)));
  assert.ok(existsSync(new URL("../dist/app.js", import.meta.url)));
});

test("the nav reads About, Products, Contact on content pages", () => {
  for (const path of ["/about/", "/privacy/", "/products/", "/products/factory/"]) {
    const nav = page(path).match(/<header class="page-header">[\s\S]*?(<nav[\s\S]*?<\/nav>)/)?.[1] ?? "";
    const links = [...nav.matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
    assert.deepEqual(links, ["About", "Products", "Contact"], path);
  }
});

test("/products/ lists Factory with its pitch, linking to its page", () => {
  const html = page("/products/");
  assert.match(html, /<title>Products · McWestling<\/title>/);
  assert.match(html, /<a href="\/products\/factory\/">Factory<\/a>/);
  assert.match(html, /Factory turns ideas into finished software changes/);
});

test("/products/factory/ renders Factory's public page on the sheet", () => {
  const html = page("/products/factory/");
  assert.match(html, /<title>Factory · McWestling<\/title>/);
  assert.match(html, /<article class="page-content">\s*<h1[^>]*>Factory<\/h1>/);
  assert.match(html, /<a href="https:\/\/github\.com\/mcwestling\/factory">/);
  assert.match(html, /<h2[^>]*>Why we built it<\/h2>/);
  assert.match(html, /<time datetime="2026-11-26">Nov 26, 2026<\/time> · updated <time datetime="\d{4}-\d{2}-\d{2}">/);
  // Links that leave the site get a new tab from the layout's script; the link home doesn't match its selector.
  assert.match(html, /a\.target = "_blank"/);
  assert.match(html, /<a href="https:\/\/linear\.app">Linear<\/a>/);
  assert.match(html, /<script defer src="\/live-strip\.js"><\/script>/);
  assert.ok(existsSync(new URL("../dist/live-strip.js", import.meta.url)));
  // Every drawing the page shows is published beside it, and the strip has its live version.
  const drawings = [...html.matchAll(/\bsrc(?:set)?="(images\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(drawings.length > 10);
  for (const path of [...drawings, "images/journey-wide-live.svg", "images/journey-tall-live.svg"]) {
    assert.ok(existsSync(new URL(`../dist/products/factory/${path}`, import.meta.url)), path);
  }
  assert.match(html, /class="site-footer"/);
  assert.match(html, /src="\/app\.js"/);
});

test("About links Factory to its product page", () => {
  assert.match(page("/about/"), /<a href="\/products\/factory\/">Factory<\/a>/);
});
