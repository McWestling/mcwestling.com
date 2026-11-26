// Checks the PUBLIC.md check that scripts/fetch-products.ts runs on each file.
import assert from "node:assert/strict";
import { test } from "node:test";
import { checkPublic } from "../scripts/fetch-products.ts";

const product = { slug: "factory", repo: "mcwestling/factory" };

test("a PUBLIC.md with name and pitch passes", () => {
  checkPublic(product, "---\nname: Factory\npitch: Builds software.\n---\n\n## What it does\n");
});

test("a PUBLIC.md missing name or pitch fails, naming the product", () => {
  for (const text of [
    "---\npitch: Builds software.\n---\n",
    "---\nname: Factory\n---\n",
    "---\nname: Factory\npitch:\n---\n",
    "## No frontmatter\n\nname: Factory\npitch: Builds software.\n",
  ]) {
    assert.throws(() => checkPublic(product, text), /factory \(mcwestling\/factory\)/);
  }
});
