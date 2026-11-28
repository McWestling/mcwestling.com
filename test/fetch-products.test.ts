// Checks the public page checks that scripts/fetch-products.ts runs on each file.
import assert from "node:assert/strict";
import { test } from "node:test";
import { checkDrawings, checkPublic } from "../scripts/fetch-products.ts";

const product = { slug: "factory", repo: "mcwestling/factory" };

test("a public page with name, pitch and both dates passes", () => {
  checkPublic(product, "---\nname: Factory\npitch: Builds software.\ncreated: 2026-01-15\nupdated: 2026-03-02\n---\n\n## What it does\n");
});

test("a public page missing name, pitch or a date fails, naming the product", () => {
  for (const text of [
    "---\npitch: Builds software.\ncreated: 2026-01-15\nupdated: 2026-03-02\n---\n",
    "---\nname: Factory\ncreated: 2026-01-15\nupdated: 2026-03-02\n---\n",
    "---\nname: Factory\npitch: Builds software.\ncreated: 2026-01-15\n---\n",
    "---\nname: Factory\npitch: Builds software.\ncreated: 2026-01-15\nupdated: March 2\n---\n",
    "---\nname: Factory\npitch:\ncreated: 2026-01-15\nupdated: 2026-03-02\n---\n",
    "## No frontmatter\n\nname: Factory\npitch: Builds software.\n",
  ]) {
    assert.throws(() => checkPublic(product, text), /factory \(mcwestling\/factory\)/);
  }
});

test("a public page may only show images that are in its images folder", () => {
  const text = '<source srcset="images/a-tall.svg">\n<img src="images/a-wide.svg" alt="A">\n';
  checkDrawings(product, text, ["a-tall.svg", "a-wide.svg", "unused.svg"]);
  assert.throws(() => checkDrawings(product, text, ["a-wide.svg"]), /factory \(mcwestling\/factory\).*a-tall\.svg/);
});
