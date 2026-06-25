# Bamfield Media House — Website

The official website for **Bamfield Media House**, a community film & photography
collective on Vancouver Island, BC. Local storytellers: analog filmmaking and
photography workshops, documentary story pieces, and a fine art print shop —
with a community darkroom trailer on the way.

Live site: <https://bamfieldmediahouse.ca>

## What this is

A fast, single-page static website (plain HTML / CSS / JavaScript — no build step,
no framework). It's an immersive, scroll-driven "motion graphic" experience:

- A film-leader **preloader** that loads everything before the experience starts
- A full-screen **hero** with a looping background video and animated headline
- **Who We Are**, **Workshops** (incl. the future darkroom trailer), **Print Shop**
  (with an online order form), and **Contact** — all on one page
- Scroll-reveal animations, parallax, film grain, and video clip slots that play
  as they scroll into view
- Quick-link navigation (top menu + side dots) to jump between sections

## Project structure

```
index.html              Whole site (markup + SEO + structured data)
assets/css/styles.css   Cinematic theme, layout, animations
assets/js/main.js       Preloader, scroll reveals, parallax, nav, forms
assets/media/           Photos used across the site
robots.txt              Search engine rules
sitemap.xml             Page list for Google
DEPLOY.md               How to deploy, add Analytics, and submit to Google
```

## Editing the site

Everything is plain text — open the files in any editor.
- **Text & sections:** edit `index.html`
- **Colours, spacing, fonts:** edit `assets/css/styles.css` (see the `:root` variables at the top)
- **Behaviour:** edit `assets/js/main.js`

To preview locally, just open `index.html` in a browser.

## Adding workshop / b-roll video clips

Video files are intentionally **not** stored in this repo (they're large).
The "story" and "past workshops" frames are `<video>` elements that currently
show a poster photo. To make one play a clip, add a `<source>` inside it:

```html
<video class="clip" muted loop playsinline preload="none" poster="assets/media/your-poster.jpg">
  <source src="https://your-video-host/clip.mp4" type="video/mp4">
</video>
```

Recommended hosting for clips: **Cloudflare Stream**, YouTube/Vimeo (embed), or
small optimized `.mp4` files (keep each under ~20 MB if placed in `assets/`).
See `DEPLOY.md` for details.

## Forms

The print order and contact forms submit through **Formspree** (static-friendly):
- Print order: `https://formspree.io/f/maqlvzbo`
- Contact: `https://formspree.io/f/xwvwyjqg`

## Deployment & SEO

This repo is set up to auto-deploy to **Cloudflare Pages** and is search-engine
ready. Full step-by-step instructions (auto-deploy, Google Analytics, Google
Search Console, sitemap, the www redirect) are in **[DEPLOY.md](DEPLOY.md)**.
