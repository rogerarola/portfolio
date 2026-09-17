/* ==========================================================================
   Roger Arola - portfolio
   Vanilla JS, no dependencies. Edit PROJECTS and COPY to change the content.
   ========================================================================== */

const EMAIL = "contact@rogerarola.com";
const SHOTS_PER_PROJECT = 3; // assets/shots/<id>-1.jpg ... <id>-3.jpg (run `npm run shots`)

const PROJECTS = [
  {
    id: "arla",
    name: ["ARLA"],
    url: "https://arlamusic.com",
    domain: "arlamusic.com",
    // used only while assets/shots/arla-*.jpg do not exist
    cover: "https://arlamusic.com/assets/og-image.jpg",
    cardBg: "#07070b",
    cardInk: "#f4f4f6",
    en: {
      desc: "My melodic techno project from Barcelona. Originals, remixes and edits, supported by GORDO, SCRIPT and braev.",
      role: "DJ and music producer",
    },
    es: {
      desc: "Mi proyecto de melodic techno desde Barcelona. Originales, remixes y edits, con soporte de GORDO, SCRIPT y braev.",
      role: "DJ y productor musical",
    },
  },
  {
    id: "pulso",
    name: ["Pulso", "Studios"],
    url: "https://pulso-studios.com",
    domain: "pulso-studios.com",
    cover: "https://pulso-studios.com/og-image.jpg",
    cardBg: "#0a0a0a",
    cardInk: "#ffffff",
    en: {
      desc: "My mixing, mastering and music production studio for EDM artists and labels. Raw ideas turned into release-ready records.",
      role: "Mixing and mastering engineer, producer",
    },
    es: {
      desc: "Mi estudio de mezcla, mastering y producción musical para artistas y sellos de EDM. De la idea en bruto al disco listo para publicar.",
      role: "Ingeniero de mezcla y mastering, productor",
    },
  },
  {
    id: "far",
    name: ["Far", "Coaching"],
    url: "https://farcoaching.com",
    domain: "farcoaching.com",
    cover: "",
    cardBg: "#ffffff",
    cardInk: "#0b0b0d",
    en: {
      desc: "Team coaching and leadership training company. I take care of their websites, content, marketing, AI and tech.",
      role: "Web, content, marketing and AI",
    },
    es: {
      desc: "Empresa de coaching de equipos y formación en liderazgo. Me encargo de sus webs, contenido, marketing, IA y tecnología.",
      role: "Web, contenido, marketing e IA",
    },
  },
];

const COPY = {
  en: {
    skip: "Skip to content",
    about: "About",
    contact: "Contact",
    close: "Close",
    copy: "Copy email",
    copied: "Copied",
    visit: "Visit",
    bio: "Audiovisual engineer, music producer and creative.",
    aboutLead:
      "I am an audiovisual systems engineer, music producer and creative. I split my time between my own music, a studio and a coaching company.",
    carousel: "Projects",
  },
  es: {
    skip: "Saltar al contenido",
    about: "Sobre mí",
    contact: "Contacto",
    close: "Cerrar",
    copy: "Copiar email",
    copied: "Copiado",
    visit: "Visitar",
    bio: "Ingeniero audiovisual, productor musical y creativo.",
    aboutLead:
      "Soy ingeniero de sistemas audiovisuales, productor musical y creativo. Reparto mi tiempo entre mi propia música, un estudio y una empresa de coaching.",
    carousel: "Proyectos",
  },
};

/* ------------------------------------------------------------------ setup */

const $ = (s, el = document) => el.querySelector(s);
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const wheel = $("#wheel");
const nameWrap = $("#nameWrap");
const info = $("#info");
const indexNav = $("#index");
const about = $("#about");

let lang = "en";
try {
  const saved = localStorage.getItem("lang");
  if (saved === "en" || saved === "es") lang = saved;
  else if (/^(es|ca|gl|eu)/i.test(navigator.language || "")) lang = "es";
} catch (_) { /* storage can be blocked, default stays */ }

/* Cards are interleaved (arla, pulso, far, arla, ...) so every step of the
   wheel lands on a different project and the stack always looks full. */
const cards = [];
for (let s = 1; s <= SHOTS_PER_PROJECT; s++) {
  PROJECTS.forEach((project, p) => cards.push({ project, p, shot: s }));
}
const COUNT = cards.length;

/* ------------------------------------------------------------------ build */

function buildCards() {
  cards.forEach((c, i) => {
    const a = document.createElement("a");
    a.className = "card";
    a.href = c.project.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.draggable = false;
    a.style.setProperty("--card-bg", c.project.cardBg);
    a.style.setProperty("--card-ink", c.project.cardInk);
    a.dataset.i = i;

    const fb = document.createElement("span");
    fb.className = "card-fallback";
    fb.innerHTML = c.project.name.join("<br>");
    a.appendChild(fb);

    const img = new Image();
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    img.addEventListener("load", () => img.classList.add("is-loaded"));
    img.addEventListener("error", function onErr() {
      // 1st failure: local screenshot missing -> try the remote cover. 2nd: keep the typographic card.
      if (!img.dataset.fallback && c.project.cover) {
        img.dataset.fallback = "1";
        img.src = c.project.cover;
      } else {
        img.removeEventListener("error", onErr);
        img.remove();
      }
    });
    img.src = `assets/shots/${c.project.id}-${c.shot}.jpg`;
    a.appendChild(img);

    c.el = a;
    wheel.appendChild(a);
  });
}

function buildIndex() {
  PROJECTS.forEach((project, p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = project.name.join(" ");
    b.addEventListener("click", () => goToProject(p));
    indexNav.appendChild(b);
  });
}

function buildAboutList() {
  const ul = $("#aboutList");
  ul.innerHTML = "";
  PROJECTS.forEach((project) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${project.name.join(" ")}</strong><span>${project[lang].role}</span>
      <a href="${project.url}" target="_blank" rel="noopener">${project.domain} <span aria-hidden="true">&#8599;</span></a>`;
    ul.appendChild(li);
  });
}

/* ------------------------------------------------------------------ wheel */

let progress = 0;      // current position, in cards (float, unbounded)
let target = 0;        // where we are heading
let introT = reduceMotion.matches ? 1 : 0; // 0 -> cards below the screen, 1 -> in place
let raf = 0;
let cardH = 0;
let isMobile = false;
let activeProject = -1;
let snapTimer = 0;

const mod = (n, m) => ((n % m) + m) % m;

function measure() {
  cardH = cards[0].el.offsetHeight;
  isMobile = window.matchMedia("(max-width: 900px)").matches;
}

function render() {
  const peek = isMobile ? 20 : 34;
  const ratio = 0.8;
  const vh = window.innerHeight;

  for (let i = 0; i < COUNT; i++) {
    // signed distance from the active slot, wrapped so the wheel is endless
    let d = mod(i - progress + COUNT / 2, COUNT) - COUNT / 2;
    const a = Math.abs(d);
    const sign = d < 0 ? -1 : 1;

    const scale = Math.pow(0.85, a);
    const cumulativePeek = (peek * (1 - Math.pow(ratio, a))) / (1 - ratio);
    let y = sign * ((cardH / 2) * (1 - scale) + cumulativePeek);

    // intro: every card travels up from below the viewport, the front one first
    if (introT < 1) {
      const local = Math.min(1, Math.max(0, introT * 1.6 - a * 0.12));
      const eased = 1 - Math.pow(1 - local, 4);
      y += (1 - eased) * vh;
    }

    const opacity = a <= 3.2 ? 1 : Math.max(0, 1 - (a - 3.2) / 0.9);
    const el = cards[i].el;
    el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    el.style.opacity = opacity.toFixed(3);
    el.style.zIndex = String(1000 - Math.round(a * 100));
    el.style.setProperty("--veil", Math.min(0.5, a * 0.1).toFixed(3));
    el.style.visibility = opacity === 0 ? "hidden" : "visible";
  }
}

function tick() {
  raf = 0;
  const diff = target - progress;
  if (reduceMotion.matches || Math.abs(diff) < 0.0005) progress = target;
  else progress += diff * 0.11;

  render();
  syncActive();

  if (progress !== target) raf = requestAnimationFrame(tick);
}

function kick() {
  if (!raf) raf = requestAnimationFrame(tick);
}

function snap() {
  target = Math.round(target);
  kick();
}

function step(n) {
  target = Math.round(target) + n;
  kick();
}

function goToProject(p) {
  // shortest way to a card of that project
  const base = Math.round(target);
  let best = null;
  for (let k = -COUNT; k <= COUNT; k++) {
    if (cards[mod(base + k, COUNT)].p === p && (best === null || Math.abs(k) < Math.abs(best))) best = k;
  }
  if (best) step(best);
}

function syncActive() {
  const idx = mod(Math.round(progress), COUNT);
  cards.forEach((c, i) => {
    const on = i === idx;
    c.el.classList.toggle("is-active", on);
    c.el.tabIndex = on ? 0 : -1;
    c.el.setAttribute("aria-hidden", on ? "false" : "true");
  });
  const p = cards[idx].p;
  if (p !== activeProject) {
    const dir = target >= progress ? 1 : -1;
    const first = activeProject === -1;
    activeProject = p;
    showProject(p, dir, first);
  }
}

/* ------------------------------------------------------------ side content */

function fitName(layer) {
  // scale the type so the longest line fills the column (bold, poster-like)
  const box = nameWrap.getBoundingClientRect();
  layer.style.fontSize = "100px";
  let widest = 1;
  layer.querySelectorAll(".name-line > span").forEach((s) => {
    widest = Math.max(widest, s.getBoundingClientRect().width);
  });
  const lines = layer.querySelectorAll(".name-line").length;
  const byWidth = ((box.width - 4) / widest) * 100;
  const byHeight = box.height / (lines * 1.02);
  const cap = isMobile ? 96 : window.innerWidth * 0.12;
  layer.style.fontSize = Math.floor(Math.min(byWidth, byHeight, cap)) + "px";
}

function showProject(p, dir, first) {
  const project = PROJECTS[p];
  const animate = !reduceMotion.matches;

  // --- name (mask reveal, line by line)
  const old = nameWrap.querySelectorAll(".name-layer");
  old.forEach((layer) => {
    if (!animate) return layer.remove();
    const spans = layer.querySelectorAll(".name-line > span");
    spans.forEach((s, i) => {
      s.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-110 * dir}%)` }], {
        duration: 320, delay: i * 30, easing: "cubic-bezier(0.7, 0, 0.84, 0)", fill: "forwards",
      });
    });
    setTimeout(() => layer.remove(), 320 + spans.length * 30 + 40);
  });

  const layer = document.createElement("p");
  layer.className = "name-layer";
  project.name.forEach((line) => {
    const mask = document.createElement("span");
    mask.className = "name-line";
    const inner = document.createElement("span");
    inner.textContent = line;
    mask.appendChild(inner);
    layer.appendChild(mask);
  });
  nameWrap.appendChild(layer);
  fitName(layer);
  if (animate) {
    layer.querySelectorAll(".name-line > span").forEach((s, i) => {
      s.animate([{ transform: `translateY(${110 * dir}%)` }, { transform: "translateY(0)" }], {
        duration: 900, delay: (first ? 0 : 260) + i * 70, easing: EASE, fill: "backwards",
      });
    });
  }

  // --- description
  const apply = () => {
    $("#infoTitle").textContent = project.name.join(" ");
    $("#infoDesc").textContent = project[lang].desc;
    $("#infoRole").textContent = project[lang].role;
    $("#visit").href = project.url;
    $("#visitLabel").textContent = `${COPY[lang].visit} ${project.domain}`;
  };
  if (!animate || first) {
    apply();
  } else {
    info.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: `translateY(${-10 * dir}px)` }], {
      duration: 160, easing: "ease-in", fill: "forwards",
    }).finished.then(() => {
      apply();
      info.animate([{ opacity: 0, transform: `translateY(${16 * dir}px)` }, { opacity: 1, transform: "translateY(0)" }], {
        duration: 700, easing: EASE, fill: "forwards",
      });
    });
  }

  // --- index
  [...indexNav.children].forEach((b, i) => b.setAttribute("aria-current", i === p ? "true" : "false"));
}

/* ------------------------------------------------------------------ input */

function bindInput() {
  // wheel / trackpad
  window.addEventListener(
    "wheel",
    (e) => {
      if (about.open) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
      target += Math.max(-1.2, Math.min(1.2, delta * 0.0032));
      kick();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snap, 130);
    },
    { passive: false }
  );

  // keyboard
  window.addEventListener("keydown", (e) => {
    if (about.open || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (["ArrowDown", "ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); step(1); }
    else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); step(-1); }
    else if (e.key === " " && tag !== "BUTTON" && tag !== "A") { e.preventDefault(); step(e.shiftKey ? -1 : 1); }
  });

  // drag / swipe (pointer events cover mouse, touch and pen)
  let dragging = false, moved = false, startY = 0, startTarget = 0, lastY = 0, lastT = 0, velocity = 0;

  const stage = $(".stage");
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest(".side-info a, .side-info button")) return;
    dragging = true; moved = false;
    startY = lastY = e.clientY; startTarget = target; lastT = performance.now(); velocity = 0;
    clearTimeout(snapTimer);
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - startY;
    if (!moved && Math.abs(dy) > 6) { moved = true; wheel.classList.add("dragging"); }
    if (!moved) return;
    const now = performance.now();
    velocity = (e.clientY - lastY) / Math.max(1, now - lastT);
    lastY = e.clientY; lastT = now;
    target = startTarget - dy / (cardH * 0.55);
    kick();
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    wheel.classList.remove("dragging");
    if (moved) {
      const fling = Math.max(-1, Math.min(1, -velocity * 0.9));
      target = Math.round(target + fling);
      kick();
    }
  };
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);

  // click: the active card opens the site, the others bring themselves to the front
  wheel.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    if (moved) { e.preventDefault(); moved = false; return; }
    const i = Number(card.dataset.i);
    const d = mod(i - Math.round(target) + COUNT / 2, COUNT) - COUNT / 2;
    if (d !== 0) { e.preventDefault(); step(d); }
  });
  wheel.addEventListener("dragstart", (e) => e.preventDefault());

  // stop horizontal/vertical page gestures on touch devices from bouncing the page
  stage.style.touchAction = "none";

  let resizeRaf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      measure();
      render();
      const layer = nameWrap.querySelector(".name-layer:last-child");
      if (layer) fitName(layer);
    });
  });
}

/* ------------------------------------------------------------------- i18n */

function setLang(next, persist) {
  lang = next;
  root.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (COPY[lang][key]) el.textContent = COPY[lang][key];
  });
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  wheel.setAttribute("aria-label", COPY[lang].carousel);
  indexNav.setAttribute("aria-label", COPY[lang].carousel);
  buildAboutList();
  if (activeProject > -1) {
    const project = PROJECTS[activeProject];
    $("#infoDesc").textContent = project[lang].desc;
    $("#infoRole").textContent = project[lang].role;
    $("#visitLabel").textContent = `${COPY[lang].visit} ${project.domain}`;
  }
  if (persist) { try { localStorage.setItem("lang", lang); } catch (_) { /* ignore */ } }
}

/* ------------------------------------------------------------------ about */

function bindAbout() {
  const open = $("#aboutOpen");
  const close = $("#aboutClose");
  const copy = $("#copyMail");

  const shut = () => {
    if (!about.open) return;
    if (reduceMotion.matches) return about.close();
    about.classList.add("is-closing");
    setTimeout(() => { about.classList.remove("is-closing"); about.close(); }, 330);
  };

  open.addEventListener("click", () => about.showModal());
  close.addEventListener("click", shut);
  about.addEventListener("cancel", (e) => { e.preventDefault(); shut(); });

  let copyTimer = 0;
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      copy.textContent = COPY[lang].copied;
    } catch (_) {
      // clipboard blocked: select the address so the visitor can copy it manually
      const range = document.createRange();
      range.selectNodeContents($(".about-mail"));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copy.textContent = COPY[lang].copy; }, 2000);
  });
}

/* ------------------------------------------------------------------ intro */

function playIntro() {
  const intro = $("#intro");
  if (reduceMotion.matches) {
    intro.classList.add("is-done");
    root.classList.add("is-ready");
    return;
  }

  const text = "Roger Arola";
  const mask = document.createElement("span");
  mask.className = "intro-mask";
  [...text].forEach((ch) => {
    const s = document.createElement("span");
    s.innerHTML = ch === " " ? "&nbsp;" : ch;
    mask.appendChild(s);
  });
  intro.appendChild(mask);
  const chars = [...mask.children];

  const IN = 700, HOLD = 380, OUT = 520, STAGGER = 28;
  chars.forEach((s, i) => {
    s.animate(
      [{ transform: "translateY(110%)" }, { transform: "translateY(0)" }],
      { duration: IN, delay: i * STAGGER, easing: EASE, fill: "forwards" }
    );
  });

  const outAt = IN + chars.length * STAGGER + HOLD;
  setTimeout(() => {
    chars.forEach((s, i) => {
      s.animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(-110%)" }],
        { duration: OUT, delay: i * (STAGGER * 0.6), easing: "cubic-bezier(0.7, 0, 0.84, 0)", fill: "forwards" }
      );
    });

    // the cards rise into the stack while the name leaves
    const start = performance.now();
    const DURATION = 1500;
    const rise = (now) => {
      introT = Math.min(1, (now - start) / DURATION);
      render();
      if (introT < 1) requestAnimationFrame(rise);
    };
    setTimeout(() => requestAnimationFrame(rise), 220);
    setTimeout(() => root.classList.add("is-ready"), 650);
    setTimeout(() => intro.classList.add("is-done"), OUT + chars.length * STAGGER + 100);
  }, outAt);
}

/* ------------------------------------------------------------------- init */

function init() {
  buildCards();
  buildIndex();
  setLang(lang, false);
  measure();
  render();
  syncActive();
  bindInput();
  bindAbout();

  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang, true)));

  // type metrics change once the webfont arrives
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      const layer = nameWrap.querySelector(".name-layer:last-child");
      if (layer) fitName(layer);
    });
  }

  playIntro();
}

init();
