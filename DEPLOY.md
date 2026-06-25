# Deploying & SEO — step by step

This site is plain static files, so hosting is simple. You're already on
**Cloudflare**, so the easiest path is **Cloudflare Pages with Git auto-deploy**:
every time you (or Claude) push to GitHub, the site updates automatically — no
more manual uploads.

---

## 1. Auto-deploy from GitHub → Cloudflare Pages (recommended)

This connects this GitHub repo to Cloudflare. After this, pushing to `main`
publishes the site automatically, and every pull request gets its own preview URL.

1. Go to the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages**
   → **Connect to Git**.
2. Authorize GitHub and pick the **`millandr121/bamfieldmediahouse`** repository.
3. Build settings:
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/`  (the root — the site has no build step)
4. Click **Save and Deploy**. Cloudflare gives you a `*.pages.dev` URL.
5. Connect your domain: in the new Pages project → **Custom domains** →
   add `bamfieldmediahouse.ca` **and** `www.bamfieldmediahouse.ca`.

> **Previewing pull requests:** once connected, every PR (including the redesign
> branch) gets an automatic preview link posted on the PR. That's how you can see
> changes before they go live.

### www vs non-www
This site treats `https://bamfieldmediahouse.ca/` (no `www`) as the primary
address. Make sure the other one redirects to it so Google sees a single site:
- Cloudflare → your domain → **Rules** → **Redirect Rules** → create a rule:
  redirect `www.bamfieldmediahouse.ca/*` → `https://bamfieldmediahouse.ca/$1` (301).

---

## 2. Google Analytics (already on)

GA4 is live through **Cloudflare Zaraz** (Measurement ID `G-3F9N4N9SV6`) — nothing
to do in the code. To confirm it's working:
1. Open the live site in a browser.
2. In Google Analytics → **Reports → Realtime**, you should appear within ~30s.

> If you ever move off Cloudflare, open `index.html` and un-comment the Google tag
> block in the `<head>` so analytics keeps working. (Don't enable both Zaraz *and*
> the inline tag at once — that double-counts visits.)

---

## 3. Google Search Console (get found in Google)

This is what gets the site into Google search results.

1. Go to <https://search.google.com/search-console> and **Add property**.
2. Choose the **URL prefix** option and enter `https://bamfieldmediahouse.ca`.
3. Verify ownership with the **DNS** method (easiest on Cloudflare): Search Console
   gives you a `TXT` record — add it in Cloudflare → your domain → **DNS** →
   **Add record** (Type `TXT`), then click **Verify**.
4. After verifying, go to **Sitemaps**, enter `sitemap.xml`, and **Submit**.
5. (Optional) Use **URL Inspection** → **Request indexing** for the homepage to
   nudge Google to crawl it sooner.

---

## 4. Google Business Profile (local SEO — strongly recommended)

The single biggest thing for "Google knows where the company is" is a free
**Google Business Profile** (the panel that shows on Google Maps / the right side
of search). Create/claim it at <https://business.google.com>:
- Business name: **Bamfield Media House**
- Area / location: Bamfield, BC (you can list a service area instead of a public
  address if you work from home)
- Add the phone `(250) 206-5399`, the website, hours, and photos.

The site already includes matching **LocalBusiness structured data** (in
`index.html`) so Google can connect the dots.

---

## 5. Adding video clips later

Keep large video files **out of the Git repo** (Cloudflare Pages limits files to
25 MB and a bloated repo slows everything down). Best options:

- **Cloudflare Stream** — upload clips, get an embed/`.m3u8` URL, drop it into the
  `<video>`/`<iframe>` slots. Integrates cleanly since you're already on Cloudflare.
- **YouTube / Vimeo** — unlisted uploads you embed (like the current hero video).
- **Small optimized `.mp4`s** — if a clip is under ~20 MB, you can place it in
  `assets/video/` and reference it directly.

See "Adding workshop / b-roll video clips" in `README.md` for the exact markup.
