// Copies each published product's PUBLIC.md into src/content/products/<slug>.md.
// Run it with `node scripts/fetch-products.ts`; it reads repos with your logged-in `gh`.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type Product = { slug: string; repo: string };

const label = ({ slug, repo }: Product) => `${slug} (${repo})`;

// Throws unless the text opens with frontmatter holding a non-empty name and pitch.
export function checkPublic(product: Product, text: string) {
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  for (const key of ["name", "pitch"]) {
    if (!new RegExp(`^${key}:[ \\t]*\\S`, "m").test(frontmatter)) {
      throw new Error(`${label(product)}: PUBLIC.md frontmatter has no \`${key}\``);
    }
  }
}

function fetchPublic(product: Product) {
  try {
    // The contents API reads the default branch; the raw media type returns the file as it is.
    return execFileSync(
      "gh",
      ["api", `repos/${product.repo}/contents/PUBLIC.md`, "-H", "Accept: application/vnd.github.raw"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    try {
      execFileSync("gh", ["auth", "status"], { stdio: "ignore" });
    } catch {
      throw new Error(`${label(product)}: gh isn't logged in. Run \`gh auth login\`, then rerun.`);
    }
    const reason = String((error as { stderr?: string }).stderr ?? error).trim();
    throw new Error(`${label(product)}: couldn't read PUBLIC.md from the default branch: ${reason}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL("../", import.meta.url);
  const products: Product[] = JSON.parse(readFileSync(new URL("products.json", root), "utf8"));
  try {
    for (const product of products) {
      const text = fetchPublic(product);
      checkPublic(product, text);
      writeFileSync(new URL(`src/content/products/${product.slug}.md`, root), text);
      console.log(`Wrote src/content/products/${product.slug}.md`);
    }
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
