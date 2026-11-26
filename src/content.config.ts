import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Each file is a product's PUBLIC.md, copied in by scripts/fetch-products.ts.
const products = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/products" }),
  schema: z.object({ name: z.string(), pitch: z.string(), url: z.url().optional() }),
});

export const collections = { products };
