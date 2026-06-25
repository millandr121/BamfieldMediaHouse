## thebamfieldartscouncil.org → New clean website (static)

I created a **fresh, modern, professional static site** in:

- `thebamfieldartscouncil/site/`

It’s designed for **Cloudflare Pages** (no build step), includes clean animations, and keeps all copy in one place via `thebamfieldartscouncil/site/content.json`.

Right now `thebamfieldartscouncil.org` is showing an **Elementor “This site is private”** gate (code-required). Because of that, I cannot pull the old live site’s text automatically from the public web. To “keep all the info”, paste your existing text into `content.json` (sections: About, Programs, Events, Support, Contact).

Also, **do not share passwords or access codes in chat**. If you control the site, use one of the options below to generate a static version safely.

### Option A (best): Export a static site from WordPress/Elementor
If this site is WordPress + Elementor, the most reliable approach is a *WordPress static export plugin* so you get correct asset URLs, menus, and internal links.

- **Plugin choices** (common):
  - Simply Static
  - WP2Static (and related add-ons)

**Goal:** export into a folder (or ZIP) that contains at least:
- `index.html`
- `/wp-content/` (or equivalent assets)
- any additional `.html` pages

Then copy the exported files into this folder:
- `thebamfieldartscouncil/site/`

### Option B: Temporarily disable “private mode”, then mirror-download
If you can temporarily switch the site from “private” to public, you can mirror it into static files.

In this folder there’s a script at `thebamfieldartscouncil/mirror.ps1` that mirrors a *public* site into `thebamfieldartscouncil/site/`.

1. Make the site public (temporarily).
2. Open PowerShell in the project root.
3. Run:

```powershell
.\thebamfieldartscouncil\mirror.ps1
```

If the site goes back to private afterward, Cloudflare will still serve your mirrored static copy.

### Deploy to Cloudflare Pages
Once `thebamfieldartscouncil/site/` is populated:

- Upload the contents of `thebamfieldartscouncil/site/` to your Cloudflare Pages project (or create a Pages project from this repo/folder).
- **Build command:** none
- **Output directory:** `thebamfieldartscouncil/site`

### Notes / limitations
- “Copy exactly” is only possible if you have access to the real HTML/assets. If the site is gated, we can’t mirror it without making it public or exporting from the source.
- Some dynamic features (forms, search, member areas) won’t work in pure static HTML unless they use external services (e.g., Formspree) or Cloudflare Workers.

