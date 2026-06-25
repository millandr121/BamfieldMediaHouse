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
  }

  function runPreloader() {
    // Count real image loads for a meaningful progress bar, with a hard fallback.
    const imgs = Array.from(document.images);
    let loaded = 0;
    const total = Math.max(imgs.length, 1);
    const bump = () => { loaded++; setProgress((loaded / total) * 100); };
    imgs.forEach((img) => {
      if (img.complete) bump();
      else { img.addEventListener("load", bump); img.addEventListener("error", bump); }
    });

    let pct = 0;
    const tick = setInterval(() => { // always creep forward so it never feels stuck
      pct = Math.min(pct + 4, ((loaded / total) * 100) || 0, 100);
      setProgress(Math.max(pct, (loaded / total) * 100));
    }, 60);

    const finish = () => { clearInterval(tick); setProgress(100); setTimeout(startSite, 450); };
    if (loaded >= total) finish();
    else {
      const done = () => finish();
      window.addEventListener("load", done, { once: true });
      setTimeout(done, 4000); // never hang longer than 4s
    }
  }

  if (prefersReduced) { setProgress(100); startSite(); }
  else runPreloader();

  /* ---------------- Scroll reveals ---------------- */
  function initReveals() {
    const items = document.querySelectorAll(".reveal");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ---------------- Header background on scroll + progress bar ---------------- */
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

  /* ---------------- Auto play/pause video clips in view ---------------- */
  const clips = Array.from(document.querySelectorAll("video.clip"));
  if (clips.length && "IntersectionObserver" in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (!v.querySelector("source")) return; // no source yet → just shows poster
        if (e.isIntersecting) { v.play().catch(() => {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.4 });
    clips.forEach((v) => vio.observe(v));
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
