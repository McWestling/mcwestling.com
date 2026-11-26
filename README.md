# mcwestling.com

🏰 Landing page for McWestling, our family holding company

## What it does

Not much, on purpose. [mcwestling.com](https://mcwestling.com) is a small multi-page site, built with Astro and hosted on Cloudflare. It has a homepage with a logo, an email address and a GitHub link, plus About and Privacy pages. Occasionally something else shows up.

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

## Links

- [Agent instructions](AGENTS.md)


