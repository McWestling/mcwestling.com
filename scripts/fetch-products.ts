// Copies each published product's public page from its repo's `docs/public-page/` folder:
// README.md into src/content/products/<slug>.md, and images/ into public/products/<slug>/images/,
// giving each SVG drawing this site's colours on the way.
// Run it with `node scripts/fetch-products.ts`; it reads repos with your logged-in `gh`.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type Product = { slug: string; repo: string };

const source = "docs/public-page";

const label = ({ slug, repo }: Product) => `${slug} (${repo})`;

// Throws unless the text opens with frontmatter holding a non-empty name and pitch, and created and updated dates.
export function checkPublic(product: Product, text: string) {
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  for (const key of ["name", "pitch"]) {
    if (!new RegExp(`^${key}:[ \\t]*\\S`, "m").test(frontmatter)) {
      throw new Error(`${label(product)}: the public page's frontmatter has no \`${key}\``);
    }
  }
  for (const key of ["created", "updated"]) {
    if (!new RegExp(`^${key}:[ \\t]*\\d{4}-\\d{2}-\\d{2}[ \\t]*$`, "m").test(frontmatter)) {
      throw new Error(`${label(product)}: the public page's frontmatter needs \`${key}\` as a YYYY-MM-DD date`);
    }
  }
}

// Throws if the text shows an image that isn't in the product's `images/` folder.
export function checkDrawings(product: Product, text: string, drawings: string[]) {
  for (const [, name] of text.matchAll(/\bsrc(?:set)?="images\/([^"]+)"/g)) {
    if (!drawings.includes(name)) {
      throw new Error(`${label(product)}: the public page shows images/${name}, which isn't in the repo`);
    }
  }
}

// The contract's black, white and grays (docs/public-page-contract.md in Factory), swapped for this site's colours.
const palette: Record<string, string> = {
  "--ink:#000": "--ink:#17130f",
  "--ink:#fff": "--ink:#eee6d6",
  "--tone:#888": "--tone:#8f8372",
  "--tone:#999": "--tone:#a99f8e",
  "--on:#000": "--on:#17130f",
  "--mark:#444": "--mark:#e0632a",
  "--mark:#bbb": "--mark:#e0632a",
};

// Gives an SVG drawing this site's colours. A colour the contract doesn't name is left as it is.
export const tint = (svg: string) => svg.replace(/--(?:ink|tone|on|mark):#[0-9a-f]{3,6}\b/g, (set) => palette[set] ?? set);

// Reads one path from the repo's default branch, as bytes: a file as it is, or a folder as a JSON listing.
function read(product: Product, path: string) {
  try {
    return execFileSync(
      "gh",
      ["api", `repos/${product.repo}/contents/${path}`, "-H", "Accept: application/vnd.github.raw"],
      { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 },
    );
  } catch (error) {
    try {
      execFileSync("gh", ["auth", "status"], { stdio: "ignore" });
    } catch {
      throw new Error(`${label(product)}: gh isn't logged in. Run \`gh auth login\`, then rerun.`);
    }
    const reason = String((error as { stderr?: string }).stderr ?? error).trim();
    throw new Error(`${label(product)}: couldn't read ${path} from the default branch: ${reason}`);
  }
}

// The names of the images beside the page. A product with no `images/` folder has none.
function listDrawings(product: Product): string[] {
  try {
    return JSON.parse(read(product, `${source}/images`).toString()).map((file: { name: string }) => file.name);
  } catch (error) {
    if (/404/.test((error as Error).message)) return [];
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL("../", import.meta.url);
  const products: Product[] = JSON.parse(readFileSync(new URL("products.json", root), "utf8"));
  try {
    for (const product of products) {
      const text = read(product, `${source}/README.md`).toString();
      checkPublic(product, text);
      const drawings = listDrawings(product);
      checkDrawings(product, text, drawings);
      // Start from an empty folder, so an image deleted from the repo is deleted here too.
      const folder = new URL(`public/products/${product.slug}/images/`, root);
      rmSync(folder, { recursive: true, force: true });
      if (drawings.length) mkdirSync(folder, { recursive: true });
      for (const name of drawings) {
        const bytes = read(product, `${source}/images/${name}`);
        writeFileSync(new URL(name, folder), name.endsWith(".svg") ? tint(bytes.toString()) : bytes);
      }
      writeFileSync(new URL(`src/content/products/${product.slug}.md`, root), text);
      console.log(`Wrote src/content/products/${product.slug}.md and ${drawings.length} images`);
    }
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
