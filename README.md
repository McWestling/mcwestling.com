# mcwestling.com

🏰 Landing page for McWestling, our family holding company

## What it does

Not much, on purpose. [mcwestling.com](https://mcwestling.com) is a small multi-page site, built with Astro and hosted on Cloudflare. It has a homepage with a logo, an email address and a GitHub link, plus About and Privacy pages. Occasionally something else shows up.

Each published McWestling product has its own page at [mcwestling.com/products/](https://mcwestling.com/products/), drawn from the `docs/public-page/` folder in the product's own repo.

## Who it's for

Anyone who comes across the McWestling name and wants to know who we are or how to reach us.

## Running it

Needs Node 22.23.4 or later.

- `npm install` once.
- `npm run dev` runs the site locally with live reload.
- `npm run build` writes the site to `dist/`.
- `npm run preview` serves the built `dist/` locally.
- `npm run check` builds the site and tests the output.

Pages are in `src/pages/`: a new markdown file there becomes a page in the shared layout, `src/layouts/Layout.astro`. `public/` holds `styles.css`, `app.js` and the images, which ship as they are.

Cloudflare builds and deploys every push to `main` as a Worker with static assets, set up in `wrangler.jsonc`. Pushes to other branches get a preview deploy, and Cloudflare comments its URL on the pull request. Preview URLs are public.

## Product pages

`products.json` lists the published products, each with a `slug` and a `repo` (`owner/name`). `node scripts/fetch-products.ts` copies each product's public page from its repo's default branch, `docs/public-page/README.md` into `src/content/products/<slug>.md` and `docs/public-page/images/` into `public/products/<slug>/images/`, using your logged-in `gh`, so private repos need no stored token. Commit the copied files; Astro renders it at `/products/<slug>/`. Factory's `docs/public-page-contract.md` describes the folder. Each page shows the `created` and `updated` dates from its frontmatter, and the script refuses a page without them.

- **Add a product:** add its entry to `products.json`, run the script, and open a pull request with both. That pull request is the approval to publish it.
- **Update a page:** rerun the script and open a pull request with the change. A public page change in a product repo publishes nothing until then.

## Links

- [Agent instructions](AGENTS.md)
