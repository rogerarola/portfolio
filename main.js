/* ==========================================================================
   Roger Arola - portfolio
   Vanilla JS, no dependencies. Edit PROJECTS and COPY to change the content.
   ========================================================================== */

const EMAIL = "contact@rogerarola.com";
const REPEATS = 3; // the project list is repeated so the wheel is endless and always full

const PROJECTS = [
  {
    id: "arla",
    name: "ARLA",
    url: "https://arlamusic.com",
    domain: "arlamusic.com",
    en: {
      desc: "My music artist project. Melodic techno originals, remixes and edits, supported by GORDO, SCRIPT and braev.",
      role: "DJ and music producer",
      tags: ["DJ", "Music production", "Remixes"],
    },
    es: {
      desc: "Mi proyecto como artista musical. Originales, remixes y edits de melodic techno, con soporte de GORDO, SCRIPT y braev.",
      role: "DJ y productor musical",
      tags: ["DJ", "Producción musical", "Remixes"],
    },
  },
  {
    id: "pulso",
    name: "Pulso Studios",
    url: "https://pulso-studios.com",
    domain: "pulso-studios.com",
    en: {
      desc: "My mixing, mastering and music production studio for EDM artists and labels. Raw ideas turned into release-ready records.",
      role: "Mixing and mastering engineer, producer",
      tags: ["Mixing", "Mastering", "Music production"],
    },
    es: {
      desc: "Mi estudio de mezcla, mastering y producción musical para artistas y sellos de EDM. De la idea en bruto al disco listo para publicar.",
      role: "Ingeniero de mezcla y mastering, productor",
      tags: ["Mezcla", "Mastering", "Producción musical"],
    },
  },
  {
    id: "far",
    name: "Far Coaching",
    url: "https://farcoaching.com",
    domain: "farcoaching.com",
    en: {
      desc: "Team coaching and leadership training company. I take care of their websites, content, marketing, AI and tech.",
      role: "Web, content, marketing and AI",
      tags: ["Web", "Content", "Marketing", "AI"],
    },
    es: {
      desc: "Empresa de coaching de equipos y formación en liderazgo. Me encargo de sus webs, contenido, marketing, IA y tecnología.",
      role: "Web, contenido, marketing e IA",
      tags: ["Web", "Contenido", "Marketing", "IA"],
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
const ARROW = '<svg class="item-arrow" viewBox="0 0 256 256" aria-hidden="true"><use href="#i-arrow"/></svg>';

const wheel = $("#wheel");
const info = $("#info");
const indexNav = $("#index");
const about = $("#about");

let lang = "en";
try {
  const saved = localStorage.getItem("lang");
  if (saved === "en" || saved === "es") lang = saved;
  else if (/^(es|ca|gl|eu)/i.test(navigator.language || "")) lang = "es";
} catch (_) { /* storage can be blocked, default stays */ }

const items = [];
for (let r = 0; r < REPEATS; r++) PROJECTS.forEach((project, p) => items.push({ project, p }));
const COUNT = items.length;

/* ------------------------------------------------------------------ build */

function buildItems() {
  items.forEach((it, i) => {
    const a = document.createElement("a");
    a.className = "item";
    a.href = it.project.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.draggable = false;
    a.dataset.i = i;
    a.innerHTML =
      `<span class="item-stroke" aria-hidden="true">${it.project.name}</span>` +
      `<span class="item-fill"><span>${it.project.name}</span>${ARROW}</span>`;
    it.el = a;
    it.fill = a.querySelector(".item-fill");
    wheel.appendChild(a);
  });
}

function buildIndex() {
  PROJECTS.forEach((project, p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = project.name;
    b.addEventListener("click", () => goToProject(p));
    indexNav.appendChild(b);
  });
}

function buildAboutList() {
  const ul = $("#aboutList");
  ul.innerHTML = "";
  PROJECTS.forEach((project) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${project.name}</strong><span>${project[lang].role}</span>
      <a href="${project.url}" target="_blank" rel="noopener">${project.domain}</a>`;
    ul.appendChild(li);
  });
}

/* ------------------------------------------------------------------ wheel */

let progress = 0;      // current position, in items (float, unbounded)
let target = 0;        // where we are heading
let introT = reduceMotion.matches ? 1 : 0; // 0 -> names below the screen, 1 -> in place
let raf = 0;
let fs = 100;          // wheel font size in px
let pitch = 100;       // vertical distance between two names
let activeProject = -1;
let snapTimer = 0;

const mod = (n, m) => ((n % m) + m) % m;
const clamp01 = (n) => Math.min(1, Math.max(0, n));

/* Type as large as the column allows: the longest name (plus its arrow) must fit. */
function measure() {
  wheel.style.setProperty("--fs", "100px");
  let widest = 1;
  items.slice(0, PROJECTS.length).forEach((it) => {
    widest = Math.max(widest, it.el.querySelector(".item-stroke").offsetWidth);
  });
  const avail = wheel.clientWidth;
  const small = window.matchMedia("(max-width: 820px)").matches;
  const byWidth = (avail / (widest + (small ? 4 : 86))) * 100; // 86 = arrow + gap at 100px (no arrow on small screens)
  const byHeight = wheel.clientHeight / 3.1;           // always room for the neighbours
  fs = Math.floor(Math.min(byWidth, byHeight, window.innerWidth * 0.1));
  pitch = fs * (small ? 1.24 : 1.04);
  wheel.style.setProperty("--fs", fs + "px");
}

function render() {
  const vh = window.innerHeight;
  for (let i = 0; i < COUNT; i++) {
    // signed distance from the active slot, wrapped so the wheel is endless
    const d = mod(i - progress + COUNT / 2, COUNT) - COUNT / 2;
    const a = Math.abs(d);

    let y = d * pitch;
    const x = a * a * fs * 0.09;                        // slight drum curve
    const scale = 1 - Math.min(a, 3) * 0.035;

    // intro: every name travels up from below the viewport, the active one first
    if (introT < 1) {
      const local = clamp01(introT * 1.6 - a * 0.14);
      y += (1 - (1 - Math.pow(1 - local, 4))) * vh;
    }

    const it = items[i];
    const visible = a < 3.4;
    it.el.style.visibility = visible ? "visible" : "hidden";
    if (!visible) continue;
    it.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    it.el.style.opacity = (a <= 1 ? 1 : clamp01(1 - (a - 1) / 2)).toFixed(3);
    it.fill.style.opacity = clamp01(1 - a * 1.7).toFixed(3);
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
  // shortest way to an item of that project
  const base = Math.round(target);
  let best = null;
  for (let k = -COUNT; k <= COUNT; k++) {
    if (items[mod(base + k, COUNT)].p === p && (best === null || Math.abs(k) < Math.abs(best))) best = k;
  }
  if (best) step(best);
}

function syncActive() {
  const idx = mod(Math.round(progress), COUNT);
  items.forEach((it, i) => {
    const on = i === idx;
    it.el.classList.toggle("is-active", on);
    it.el.tabIndex = on ? 0 : -1;
    it.el.setAttribute("aria-hidden", on ? "false" : "true");
  });
  const p = items[idx].p;
  if (p !== activeProject) {
    const dir = target >= progress ? 1 : -1;
    const first = activeProject === -1;
    activeProject = p;
    showProject(p, dir, first);
  }
}

/* ------------------------------------------------------------ side content */

function applyInfo(project) {
  $("#infoTitle").textContent = project.name;
  $("#infoDesc").textContent = project[lang].desc;
  $("#infoTags").innerHTML = project[lang].tags.map((t) => `<li>${t}</li>`).join("");
  $("#visit").href = project.url;
  $("#visitLabel").textContent = `${COPY[lang].visit} ${project.domain}`;
}

function showProject(p, dir, first) {
  const project = PROJECTS[p];

  if (reduceMotion.matches || first) {
    applyInfo(project);
  } else {
    info.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: `translateY(${-10 * dir}px)` }], {
      duration: 160, easing: "ease-in", fill: "forwards",
    }).finished.then(() => {
      applyInfo(PROJECTS[activeProject]);
      info.animate([{ opacity: 0, transform: `translateY(${18 * dir}px)` }, { opacity: 1, transform: "translateY(0)" }], {
        duration: 700, easing: EASE, fill: "forwards",
      });
      // chips arrive one after another
      [...$("#infoTags").children].forEach((li, i) => {
        li.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], {
          duration: 500, delay: 80 + i * 60, easing: EASE, fill: "backwards",
        });
      });
    });
  }

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

  wheel.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
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
    target = startTarget - dy / pitch;
    kick();
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    wheel.classList.remove("dragging");
    if (moved) {
      const fling = Math.max(-1, Math.min(1, -velocity * 0.6));
      target = Math.round(target + fling);
      kick();
    }
  };
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);

  // click: the active name opens the site, the others roll into place
  wheel.addEventListener("click", (e) => {
    const item = e.target.closest(".item");
    if (!item) return;
    if (moved) { e.preventDefault(); moved = false; return; }
    const i = Number(item.dataset.i);
    const d = mod(i - Math.round(target) + COUNT / 2, COUNT) - COUNT / 2;
    if (d !== 0) { e.preventDefault(); step(d); }
  });
  wheel.addEventListener("dragstart", (e) => e.preventDefault());

  let resizeRaf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => { measure(); render(); });
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
  if (activeProject > -1) applyInfo(PROJECTS[activeProject]);
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

    // the project names rise into the wheel while the intro leaves
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
  buildItems();
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
    document.fonts.ready.then(() => { measure(); render(); });
  }

  playIntro();
}

init();
