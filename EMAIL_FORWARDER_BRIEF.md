# Email Forwarder Worker — Handoff Brief

## What this is and why we're doing it

Bamfield Media House (bamfieldmediahouse.ca) needs to receive emails sent to
`team@bamfieldmediahouse.ca` and forward them to `andrewglennmiller@gmail.com`.

We are using **Resend** (resend.com) for all email on this domain. The domain is
fully verified in Resend — DKIM, SPF, and inbound MX are all green. Resend's
inbound MX (`inbound-smtp.us-east-1.amazonaws.com`) is already in Cloudflare DNS
and catches all incoming mail.

**Why not simple forwarding?**
Cloudflare Email Routing was previously used but Gmail was blocking those
forwarded emails because they failed SPF/DMARC. Resend inbound is webhook-based —
it catches the email and POSTs a JSON payload to a URL we control. We re-send the
email FROM `team@bamfieldmediahouse.ca` via Resend's API, which passes all SPF,
DKIM, and DMARC checks. Gmail accepts it cleanly.

**Why in this (drive) project?**
This project already has a Cloudflare Workers setup and `wrangler` configured.
Rather than asking the user to set up a whole new project from scratch, we're
adding a small, self-contained new Worker alongside what already exists.

---

## IMPORTANT — do not overwrite anything

- **Do NOT modify or touch any existing Worker files** in this project.
- **Do NOT modify the existing `wrangler.toml`** if one exists — create a new
  separate one for this Worker (see below).
- This is a brand-new, standalone Worker named `bmh-email-forwarder`. It lives in
  its own subdirectory so there is zero risk of colliding with the drive project.
- If there is already a file or folder called `bmh-email-forwarder/` — stop and
  ask the user before proceeding.

---

## What to build

Create a new subdirectory `bmh-email-forwarder/` with two files:

### `bmh-email-forwarder/wrangler.toml`

```toml
name = "bmh-email-forwarder"
main = "index.js"
compatibility_date = "2024-01-01"

# RESEND_API_KEY is stored as a secret — never hard-code it here.
# After deploying, run:
#   wrangler secret put RESEND_API_KEY --config bmh-email-forwarder/wrangler.toml
# and paste the Resend API key when prompted.
```

### `bmh-email-forwarder/index.js`

```javascript
export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response("Bad request — expected JSON body", { status: 400 });
    }

    const from    = payload.from    || "unknown sender";
    const subject = payload.subject || "(no subject)";
    const text    = payload.text    || "";
    const html    = payload.html    || "";
    const to      = Array.isArray(payload.to) ? payload.to[0] : (payload.to || "team@bamfieldmediahouse.ca");

    const forwardHeaderText =
      `---------- Forwarded message ----------\n` +
      `From: ${from}\n` +
      `To: ${to}\n` +
      `Subject: ${subject}\n\n`;

    const forwardHeaderHtml =
      `<div style="border-left:3px solid #ccc;padding-left:12px;margin:16px 0;` +
      `color:#555;font-size:13px;font-family:sans-serif;">` +
      `<p style="margin:0 0 6px 0"><strong>---------- Forwarded message ----------</strong></p>` +
      `<p style="margin:0">From: ${escapeHtml(from)}</p>` +
      `<p style="margin:0">To: ${escapeHtml(to)}</p>` +
      `<p style="margin:0">Subject: ${escapeHtml(subject)}</p>` +
      `</div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Bamfield Media House <team@bamfieldmediahouse.ca>",
        to: ["andrewglennmiller@gmail.com"],
        reply_to: [from],
        subject: subject,
        text: forwardHeaderText + text,
        html: forwardHeaderHtml + (html || `<p>${escapeHtml(text)}</p>`),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend API error:", res.status, err);
      return new Response("Forward failed", { status: 502 });
    }

    return new Response("OK", { status: 200 });
  },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

---

## Deploy steps (run from the project root)

```bash
# 1. Deploy the Worker
wrangler deploy --config bmh-email-forwarder/wrangler.toml

# 2. Store the Resend API key as a secret (never in code)
wrangler secret put RESEND_API_KEY --config bmh-email-forwarder/wrangler.toml
# When prompted, paste the Resend API key and hit Enter.
```

After deploying, Cloudflare will give you a URL like:
`https://bmh-email-forwarder.<account>.workers.dev`

Report that URL back to the user — they need to paste it into Resend as the
inbound webhook endpoint.

---

## What the user does after (in Resend dashboard)

1. Go to resend.com → **Domains** → `bamfieldmediahouse.ca` → **Configuration** tab
2. Find **Inbound** webhook URL field
3. Paste the Worker URL: `https://bmh-email-forwarder.<account>.workers.dev`
4. Save.

That's it — inbound email to `team@bamfieldmediahouse.ca` will now be forwarded
to `andrewglennmiller@gmail.com` and Gmail will accept it.

---

## Summary of what exists in Resend (already done, do not change)

| Record | Status |
|--------|--------|
| DKIM TXT `resend._domainkey` | Verified |
| SPF MX `send` → feedback-smtp...amazonses.com | Verified |
| SPF TXT `send` → v=spf1 include...nses.com ~all | Verified |
| Inbound MX `@` → inbound-smtp.us-east-1.amazonaws.com (priority 10) | Verified |

The domain is fully verified for both sending and receiving. No DNS changes needed.
