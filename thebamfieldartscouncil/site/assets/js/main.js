const state = {
  content: null
};

function $(sel, root = document) {
  return root.querySelector(sel);
}

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) n.setAttribute(k, String(v));
  }
  for (const c of children) n.append(c);
  return n;
}

function formatEventDate(iso) {
  // ISO: YYYY-MM-DD
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return { day: "—", mon: "" };
  const day = String(d.getDate());
  const mon = d.toLocaleString(undefined, { month: "short" }).toUpperCase();
  return { day, mon };
}

function setMeta(content) {
  const { meta } = content;
  document.title = meta?.siteName ? `${meta.siteName}` : document.title;
  const desc = meta?.description || "";
  const themeColor = meta?.themeColor || "#0B6B63";

  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", desc);
  const tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute("content", themeColor);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", meta?.siteName || "");
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", desc);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl && meta?.domain) ogUrl.setAttribute("content", `https://${meta.domain}/`);
}

function renderNav(content) {
  const nav = $("#site-nav");
  if (!nav) return;
  nav.innerHTML = "";

  (content.nav || []).forEach((item) => {
    nav.append(el("a", { href: item.href, text: item.label }));
  });

  nav.append(el("a", { href: "#support", class: "btn btn-primary", style: "margin-top:.35rem", text: "Support" }));
}

function renderHero(content) {
  $("#hero-kicker")?.replaceChildren(
    el("span", { class: "dot", "aria-hidden": "true" }),
    document.createTextNode(content.hero?.kicker || "")
  );
  $("#hero-title") && ($("#hero-title").textContent = content.hero?.headline || "");
  $("#hero-subhead") && ($("#hero-subhead").textContent = content.hero?.subhead || "");

  const p = content.hero?.primaryCta || { label: "Get involved", href: "#support" };
  const s = content.hero?.secondaryCta || { label: "Contact", href: "#contact" };
  const primary = $("#hero-primary");
  const secondary = $("#hero-secondary");
  if (primary) {
    primary.textContent = p.label;
    primary.setAttribute("href", p.href);
  }
  if (secondary) {
    secondary.textContent = s.label;
    secondary.setAttribute("href", s.href);
  }

  const hl = $("#hero-highlights");
  if (hl) {
    hl.innerHTML = "";
    (content.hero?.highlights || []).forEach((h) => {
      hl.append(
        el("div", { class: "pill" }, [
          el("strong", { text: h.title || "" }),
          el("span", { text: h.text || "" })
        ])
      );
    });
  }
}

function renderAbout(content) {
  $("#about-title") && ($("#about-title").textContent = content.about?.title || "About");
  $("#about-lede") && ($("#about-lede").textContent = content.about?.lede || "");

  const body = $("#about-body");
  if (body) {
    body.innerHTML = "";
    (content.about?.body || []).forEach((p) => body.append(el("p", { text: p })));
  }

  const stats = $("#about-stats");
  if (stats) {
    stats.innerHTML = "";
    (content.about?.stats || []).forEach((s) => {
      stats.append(
        el("li", { class: "stat" }, [
          el("small", { text: s.label || "" }),
          el("b", { text: s.value || "" })
        ])
      );
    });
  }
}

function renderPrograms(content) {
  $("#programs-title") && ($("#programs-title").textContent = content.programs?.title || "Programs");
  const list = $("#programs-list");
  if (list) {
    list.innerHTML = "";
    (content.programs?.items || []).forEach((it) => {
      list.append(
        el("article", { class: "card reveal" }, [
          el("h3", { text: it.title || "" }),
          el("p", { text: it.text || "" })
        ])
      );
    });
  }
  $("#programs-note") && ($("#programs-note").textContent = content.programs?.note || "");
}

function renderEvents(content) {
  $("#events-title") && ($("#events-title").textContent = content.events?.title || "Events");
  $("#events-intro") && ($("#events-intro").textContent = content.events?.intro || "");
  const list = $("#events-list");
  if (!list) return;
  list.innerHTML = "";

  const items = content.events?.items || [];
  if (!items.length) {
    list.append(
      el("article", { class: "card reveal", style: "grid-column: span 12" }, [
        el("h3", { text: "No events listed yet" }),
        el("p", { text: "Check back soon, or follow our social channels for the latest updates." })
      ])
    );
    return;
  }
  items.forEach((ev) => {
    const { day, mon } = formatEventDate(ev.date || "");
    list.append(
      el("article", { class: "event reveal" }, [
        el("div", { class: "date", "aria-hidden": "true" }, [
          el("strong", { text: day }),
          el("span", { text: mon })
        ]),
        el("div", {}, [
          el("h3", { text: ev.title || "" }),
          el("p", { class: "meta", text: ev.location ? `Location: ${ev.location}` : "" }),
          el("p", { class: "desc", text: ev.details || "" })
        ])
      ])
    );
  });
}

function renderGallery(content) {
  $("#gallery-title") && ($("#gallery-title").textContent = content.gallery?.title || "Gallery");
  $("#gallery-intro") && ($("#gallery-intro").textContent = content.gallery?.intro || "");
  const grid = $("#gallery-grid");
  if (!grid) return;
  grid.innerHTML = "";
  (content.gallery?.images || []).forEach((img) => {
    grid.append(
      el("figure", { class: "shot reveal" }, [
        el("img", { src: img.src, alt: img.alt || "", loading: "lazy" })
      ])
    );
  });
}

function renderSupport(content) {
  $("#support-title") && ($("#support-title").textContent = content.support?.title || "Support");
  const grid = $("#support-grid");
  if (grid) {
    grid.innerHTML = "";
    (content.support?.cards || []).forEach((c) => {
      grid.append(
        el("article", { class: "card reveal" }, [
          el("h3", { text: c.title || "" }),
          el("p", { text: c.text || "" }),
          el("div", { style: "margin-top:.85rem" }, [
            el("a", { class: "btn btn-ghost", href: c.cta?.href || "#contact" }, [
              document.createTextNode(c.cta?.label || "Learn more"),
              el("span", { class: "arrow", "aria-hidden": "true", text: "→" })
            ])
          ])
        ])
      );
    });
  }
  $("#support-fineprint") && ($("#support-fineprint").textContent = content.support?.finePrint || "");
}

function renderContact(content) {
  $("#contact-title") && ($("#contact-title").textContent = content.contact?.title || "Contact");
  const emailEl = $("#contact-email");
  if (emailEl) {
    const email = content.contact?.email || "";
    if (email) {
      emailEl.textContent = email;
      emailEl.setAttribute("href", `mailto:${email}`);
      emailEl.closest("p")?.classList.remove("is-hidden");
    } else {
      emailEl.textContent = "";
      emailEl.setAttribute("href", "#");
      emailEl.closest("p")?.classList.add("is-hidden");
    }
  }

  const addr = $("#contact-address");
  if (addr) {
    addr.innerHTML = "";
    (content.contact?.addressLines || []).forEach((line) => addr.append(el("p", { text: line })));
  }

  const social = $("#contact-social");
  if (social) {
    social.innerHTML = "";
    (content.contact?.social || []).forEach((s) => {
      social.append(el("a", { class: "chip", href: s.href || "#", target: "_blank", rel: "noreferrer", text: s.label || "Social" }));
    });
  }

  const form = $("#contact-form");
  const note = $("#contact-form-note");
  const action = content.contact?.form?.action || "";
  if (form) {
    if (action) {
      form.setAttribute("action", action);
      form.classList.remove("is-disabled");
      if (note) note.textContent = "";
    } else {
      form.removeAttribute("action");
      if (note) note.textContent = content.contact?.form?.note || "Add a form action to enable submissions.";
    }
  }
}

function renderFooter(content) {
  const year = new Date().getFullYear();
  const name = content.footer?.copyrightName || content.meta?.siteName || "Arts Council";
  $("#footer-copy") && ($("#footer-copy").textContent = `© ${year} ${name}. All rights reserved.`);
}

function setupMenu() {
  const btn = $("#menu-btn");
  const nav = $("#site-nav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });

  nav.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.tagName !== "A") return;
    nav.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    nav.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });
}

function setupReveals() {
  const nodes = Array.from(document.querySelectorAll(".reveal"));
  if (!nodes.length) return;

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduce) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
  );
  nodes.forEach((n) => io.observe(n));
}

async function boot() {
  setupMenu();

  const res = await fetch("./content.json", { cache: "no-store" });
  const content = await res.json();
  state.content = content;

  setMeta(content);
  renderNav(content);
  renderHero(content);
  renderAbout(content);
  renderPrograms(content);
  renderEvents(content);
  renderGallery(content);
  renderSupport(content);
  renderContact(content);
  renderFooter(content);

  // Reveal animations after dynamic nodes are in DOM.
  setupReveals();
}

boot().catch((err) => {
  console.error("Failed to load site content.", err);
});

