const nav = document.querySelector("#site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const ytSoundToggle = document.querySelector("#yt-sound-toggle");
const orderToggle = document.querySelector("#order-toggle");
const orderClose = document.querySelector("#order-close");
const orderWrap = document.querySelector("#order-form");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });
}

// YouTube background audio toggle (requires user click).
let ytPlayer = null;
let ytReady = false;
let ytMuted = true;

function setSoundButton() {
  if (!ytSoundToggle) return;
  ytSoundToggle.setAttribute("aria-pressed", String(!ytMuted));
  ytSoundToggle.textContent = ytMuted ? "Sound On" : "Sound Off";
}

setSoundButton();

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  const el = document.querySelector("#hero-yt");
  if (!el || !window.YT || !window.YT.Player) return;

  ytPlayer = new window.YT.Player("hero-yt", {
    events: {
      onReady: () => {
        ytReady = true;
        try {
          ytPlayer.mute();
        } catch {}
      }
    }
  });
};

// Inject API script once.
if (!document.querySelector('script[data-yt-api="1"]')) {
  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  s.async = true;
  s.setAttribute("data-yt-api", "1");
  document.head.appendChild(s);
}

if (ytSoundToggle) {
  ytSoundToggle.addEventListener("click", () => {
    if (!ytReady || !ytPlayer) return;
    ytMuted = !ytMuted;
    setSoundButton();
    try {
      if (ytMuted) ytPlayer.mute();
      else {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
      }
    } catch {}
  });
}

function setOrderOpen(open) {
  if (!orderToggle || !orderWrap) return;
  orderToggle.setAttribute("aria-expanded", String(open));
  orderWrap.classList.toggle("is-hidden", !open);
  orderWrap.setAttribute("aria-hidden", String(!open));
  if (open) {
    orderWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

if (orderToggle && orderWrap) {
  setOrderOpen(false);
  orderToggle.addEventListener("click", () => {
    const open = orderToggle.getAttribute("aria-expanded") === "true";
    setOrderOpen(!open);
  });
}

if (orderClose && orderWrap) {
  orderClose.addEventListener("click", () => setOrderOpen(false));
}
