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
