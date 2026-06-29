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

    // Resend wraps the event in { type, data: {...} }
    const event = payload.data || payload;
    const emailId = event.email_id;

    // Webhook only carries metadata — the body must be fetched separately.
    let from    = event.from    || "unknown sender";
    let subject = event.subject || "(no subject)";
    let to      = Array.isArray(event.to) ? event.to[0] : (event.to || "team@bamfieldmediahouse.ca");
    let text    = "";
    let html    = "";

    // Fetch the full inbound email. NOTE: inbound emails live at
    // /emails/receiving/{id}, NOT /emails/{id} (that's outbound only).
    if (emailId) {
      const full = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
      });
      if (full.ok) {
        const email = await full.json();
        text    = email.text    || text;
        html    = email.html    || html;
        from    = email.from    || from;
        subject = email.subject || subject;
        if (Array.isArray(email.to) && email.to.length) to = email.to[0];
      } else {
        const err = await full.text();
        console.error("Receiving fetch error:", full.status, err);
      }
    }

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
        text: forwardHeaderText + (text || "(no plain-text body)"),
        html: forwardHeaderHtml + (html || `<pre>${escapeHtml(text || "(no body)")}</pre>`),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend send error:", res.status, err);
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
