# Bamfield Media House Static Site

This folder contains a redesigned, mobile-friendly static HTML version of `bamfieldmediahouse.ca` for Cloudflare Pages (or direct static hosting).

## Files

- `index.html` - main site
- `assets/css/styles.css` - styles and responsive layout
- `assets/js/main.js` - menu toggle, YouTube sound toggle
- `media-manifest.json` - media URLs from the old live site (reference only)
- `prepare-media.ps1` - (optional) legacy downloader (not required now that videos are removed)

## Before Uploading

1. Open PowerShell in this folder.
2. Run:

```powershell
.\prepare-media.ps1
```

3. (Optional) If you have ImageMagick installed (`magick` command), the script will also generate optimized `.webp` versions.

## Landing video

The hero background is a YouTube embed (muted autoplay). The "Play with sound" button opens YouTube in a new tab.

## Print Shop order form submissions

The order form is included in `index.html`, but **static HTML cannot receive form submissions by itself**.

This site uses Formspree:

- Print order form: `https://formspree.io/f/maqlvzbo`
- Contact form: `https://formspree.io/f/xwvwyjqg`

## Upload

Upload the full folder contents to your Cloudflare static site target.

## Notes

- The site includes local media paths first.
- Videos were intentionally removed from the upload to stay under a 25MB limit.
