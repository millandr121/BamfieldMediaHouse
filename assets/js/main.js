/* =========================================================
   Bamfield Media House — interactions
   ========================================================= */
(function () {
  "use strict";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Preloader (film leader countdown) ---------------- */
  const preloader = document.getElementById("preloader");
  const countEl = document.getElementById("leader-count");
  const ring = document.querySelector(".leader-progress");
  const RING_LEN = 339.292;

  function setProgress(pct) {
    pct = Math.max(0, Math.min(100, pct));
    if (countEl) countEl.textContent = String(Math.round(pct));
    if (ring) ring.style.strokeDashoffset = String(RING_LEN * (1 - pct / 100));
  }

  function startSite() {
    document.body.classList.add("ready");
    if (preloader) preloader.classList.add("done");
    initReveals();
    loadMedia(); // fetch drive manifest after site is ready
  }

  function runPreloader() {
    const imgs = Array.from(document.images);
    let loaded = 0;
    const total = Math.max(imgs.length, 1);
    const bump = () => { loaded++; setProgress((loaded / total) * 100); };
    imgs.forEach((img) => {
      if (img.complete) bump();
      else { img.addEventListener("load", bump); img.addEventListener("error", bump); }
    });

    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(pct + 4, ((loaded / total) * 100) || 0, 100);
      setProgress(Math.max(pct, (loaded / total) * 100));
    }, 60);

    const finish = () => { clearInterval(tick); setProgress(100); setTimeout(startSite, 450); };
    if (loaded >= total) finish();
    else {
      window.addEventListener("load", finish, { once: true });
      setTimeout(finish, 4000);
    }
  }

  if (prefersReduced) { setProgress(100); startSite(); }
  else runPreloader();

  /* ---------------- Scroll reveals ---------------- */
  let revealObserver = null;

  function observeReveal(el) {
    if (prefersReduced || !revealObserver) { el.classList.add("in"); return; }
    revealObserver.observe(el);
  }

  function initReveals() {
    const items = document.querySelectorAll(".reveal");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- Manifest-driven media (drive.bamfieldmediahouse.ca) ---------------- */
  const MANIFEST_URL = "https://drive.bamfieldmediahouse.ca/api/public/shares/EtSUasCjTAGRIR3zlnYb24k1/manifest";
  const WEB_SAFE = ["image/jpeg", "image/png", "video/mp4"];

  const WORKSHOP_CAPTIONS = [
    "16mm production workshop",
    "Learning the Bolex",
    "Film, light, and patience",
    "Editing workshop",
    "On location, Vancouver Island",
    "Community filmmaking"
  ];

  async function loadMedia() {
    try {
      const res = await fetch(MANIFEST_URL);
      if (!res.ok) return;
      const { files = [] } = await res.json();

      const safe = files.filter((f) => WEB_SAFE.includes(f.contentType));
      const arcPhotos = safe.filter((f) => /^ARC_/i.test(f.name) && f.contentType.startsWith("image/"));
      const mp4s = safe.filter((f) => f.contentType === "video/mp4");

      populateWorkshopReel(arcPhotos);
      populateStoryClip(mp4s);
    } catch (e) {
      // fail silently — static fallbacks remain visible
    }
  }

  function populateWorkshopReel(photos) {
    const container = document.getElementById("workshop-reel");
    if (!container || !photos.length) return;

    container.innerHTML = "";
    const show = photos.slice(0, 6);
    show.forEach((f, i) => {
      const dir = i % 3 === 0 ? " from-left" : i % 3 === 2 ? " from-right" : "";
      const fig = document.createElement("figure");
      fig.className = "frame reveal" + dir;
      const img = document.createElement("img");
      img.src = f.url;
      img.alt = "16mm workshop, Bamfield BC";
      img.loading = "lazy";
      const cap = document.createElement("figcaption");
      cap.textContent = WORKSHOP_CAPTIONS[i] || "Workshop session";
      fig.appendChild(img);
      fig.appendChild(cap);
      container.appendChild(fig);
      observeReveal(fig);
    });

    // If we have more than 6, add a second row
    if (photos.length > 6) {
      const row2 = document.createElement("div");
      row2.className = "reel-track";
      row2.style.marginTop = "1.2rem";
      photos.slice(6).forEach((f, i) => {
        const dir = i % 3 === 0 ? " from-left" : i % 3 === 2 ? " from-right" : "";
        const fig = document.createElement("figure");
        fig.className = "frame reveal" + dir;
        const img = document.createElement("img");
        img.src = f.url;
        img.alt = "16mm workshop, Bamfield BC";
        img.loading = "lazy";
        const cap = document.createElement("figcaption");
        cap.textContent = "Workshop session";
        fig.appendChild(img);
        fig.appendChild(cap);
        row2.appendChild(fig);
        observeReveal(fig);
      });
      container.parentElement.appendChild(row2);
    }
  }

  function populateStoryClip(mp4s) {
    const video = document.getElementById("story-clip");
    if (!video || !mp4s.length) return;
    // prefer "social export bamfield 1" or the first mp4
    const pick = mp4s.find((f) => /social.*bamfield.*1/i.test(f.name)) || mp4s[0];
    const src = document.createElement("source");
    src.src = pick.url;
    src.type = "video/mp4";
    video.appendChild(src);
    // register for auto play/pause now that it has a source
    if (videoObserver) videoObserver.observe(video);
  }

  /* ---------------- Auto play/pause video clips in view ---------------- */
  let videoObserver = null;
  const clips = Array.from(document.querySelectorAll("video.clip"));
  if ("IntersectionObserver" in window) {
    videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (!v.querySelector("source")) return;
        if (e.isIntersecting) { v.play().catch(() => {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.4 });
    clips.forEach((v) => videoObserver.observe(v));
  }

  /* ---------------- Header + scroll progress bar ---------------- */
  const header = document.getElementById("site-header");
  const scrollBar = document.getElementById("scroll-bar");
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (scrollBar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    parallax();
  }

  /* ---------------- Parallax background(s) ---------------- */
  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
  function parallax() {
    if (prefersReduced) return;
    parallaxEls.forEach((el) => {
      const rect = el.parentElement.getBoundingClientRect();
      const offset = (rect.top / window.innerHeight) * -60;
      el.style.transform = "translateY(" + offset + "px)";
    });
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { window.requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------------- Active section (nav + dots) ---------------- */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const dotLinks = Array.from(document.querySelectorAll(".dot-nav a"));
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
        dotLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
      });
    }, { threshold: 0.5 });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------------- Mobile menu ---------------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------------- Hero YouTube sound toggle ---------------- */
  const ytSoundToggle = document.getElementById("yt-sound-toggle");
  let ytPlayer = null, ytReady = false, ytMuted = true;
  function setSoundButton() {
    if (!ytSoundToggle) return;
    ytSoundToggle.setAttribute("aria-pressed", String(!ytMuted));
    ytSoundToggle.textContent = ytMuted ? "Sound On" : "Sound Off";
  }
  setSoundButton();

  window.onYouTubeIframeAPIReady = function () {
    const el = document.getElementById("hero-yt");
    if (!el || !window.YT || !window.YT.Player) return;
    ytPlayer = new window.YT.Player("hero-yt", {
      events: { onReady: () => { ytReady = true; try { ytPlayer.mute(); } catch (e) {} } }
    });
  };
  if (!document.querySelector('script[data-yt-api="1"]')) {
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true; s.setAttribute("data-yt-api", "1");
    document.head.appendChild(s);
  }
  if (ytSoundToggle) {
    ytSoundToggle.addEventListener("click", () => {
      if (!ytReady || !ytPlayer) return;
      ytMuted = !ytMuted; setSoundButton();
      try { if (ytMuted) ytPlayer.mute(); else { ytPlayer.unMute(); ytPlayer.setVolume(100); } } catch (e) {}
    });
  }

  /* ---------------- Print order form toggle ---------------- */
  const orderToggle = document.getElementById("order-toggle");
  const orderClose = document.getElementById("order-close");
  const orderWrap = document.getElementById("order-form");
  function setOrderOpen(open) {
    if (!orderToggle || !orderWrap) return;
    orderToggle.setAttribute("aria-expanded", String(open));
    orderWrap.classList.toggle("is-hidden", !open);
    orderWrap.setAttribute("aria-hidden", String(!open));
    if (open) orderWrap.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  }
  if (orderToggle && orderWrap) {
    setOrderOpen(false);
    orderToggle.addEventListener("click", () => setOrderOpen(orderToggle.getAttribute("aria-expanded") !== "true"));
  }
  if (orderClose) orderClose.addEventListener("click", () => setOrderOpen(false));

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
