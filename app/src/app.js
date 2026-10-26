import { categories, exhibits, soundboard, templates } from "./data.js";

const $ = (id) => document.getElementById(id);
const likesKey = "kirkive-likes";
const gateKey = "kirkive-gate";

const state = {
  filter: "all",
  query: "",
  likes: JSON.parse(localStorage.getItem(likesKey) || "{}"),
  active: null,
  tpl: "closeup",
  top: "PROVE ME WRONG",
  bottom: "OKAY",
};

const captionsPool = [
  { top: "PROVE ME WRONG", bottom: "OKAY" },
  { top: "FACTS DON'T CARE", bottom: "ABOUT YOUR FEELINGS" },
  { top: "SOME GUN DEATHS ARE WORTH IT", bottom: "RECEIPT INCLUDED" },
  { top: "I'M JUST ASKING", bottom: "QUESTIONS" },
  { top: "THE DEBATE IS OVER", bottom: "PERMANENTLY" },
  { top: "CHANGE MY MIND", bottom: "CHANGED HIS LOCATION" },
  { top: "EMPATHY IS MADE UP", bottom: "NEW AGE TERM" },
  { top: "NEXT QUESTION", bottom: "THERE IS NO NEXT" },
];

function dayIndex() {
  const now = new Date();
  const seed = now.getFullYear() * 1000 + now.getMonth() * 50 + now.getDate();
  return seed % exhibits.length;
}

function matches(ex) {
  const q = state.query.trim().toLowerCase();
  const inCat = state.filter === "all" || ex.category === state.filter;
  if (!q) return inCat;
  const blob = [ex.title, ex.plaque, ex.category, ex.year, ...Object.values(ex.lines || {})]
    .join(" ")
    .toLowerCase();
  return inCat && blob.includes(q);
}

function overlayHTML(ex) {
  const l = ex.lines || {};
  if (ex.layout === "quote") {
    return `<div class="meme-text quote">${esc(l.quote || "")}</div>`;
  }
  if (ex.layout === "drake") {
    return `<div class="meme-text drake-a">${esc(l.a || "")}</div><div class="meme-text drake-b">${esc(l.b || "")}</div>`;
  }
  if (ex.layout === "galaxy") {
    return ["l1", "l2", "l3", "l4"]
      .map((k, i) => `<div class="meme-text g${i + 1}">${esc(l[k] || "")}</div>`)
      .join("");
  }
  if (ex.layout === "buttons") {
    return `<div class="meme-text btn-a">${esc(l.a || "")}</div><div class="meme-text btn-b">${esc(l.b || "")}</div>`;
  }
  if (ex.layout === "split") {
    return `<div class="meme-text split-l">${esc(l.left || "")}</div><div class="meme-text split-r">${esc(l.right || "")}</div>`;
  }
  if (ex.layout === "distracted") {
    return `<div class="meme-text d-gf">${esc(l.gf || "")}</div><div class="meme-text d-guy">${esc(l.guy || "")}</div><div class="meme-text d-other">${esc(l.other || "")}</div>`;
  }
  return `<div class="meme-text top">${esc(l.top || "")}</div><div class="meme-text bottom">${esc(l.bottom || "")}</div>`;
}

function stageHTML(ex, extraClass = "") {
  return `<div class="meme-stage ${extraClass}" data-layout="${ex.layout}">
    <img src="${ex.image}" alt="${esc(ex.title)}" />
    ${overlayHTML(ex)}
  </div>`;
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderFilters() {
  $("filters").innerHTML = categories
    .map(
      (c) =>
        `<button class="chip ${state.filter === c.id ? "active" : ""}" data-id="${c.id}" type="button">${c.label}</button>`,
    )
    .join("");
}

function renderGrid() {
  const list = exhibits.filter(matches).sort((a, b) => b.heat - a.heat);
  $("result-meta").textContent = `${list.length} Exponate · Sortierung: Heat`;
  $("grid").innerHTML = list
    .map(
      (ex) => `<article class="card" data-id="${ex.id}">
        ${stageHTML(ex)}
        <div class="card-meta">
          <div class="card-top"><span>EXHIBIT ${ex.id.slice(1)} · ${ex.year}</span><span class="heat">${ex.heat}°</span></div>
          <h3>${esc(ex.title)}</h3>
          <p>${esc(ex.plaque)}</p>
        </div>
      </article>`,
    )
    .join("");
}

function renderFeatured() {
  const ex = exhibits[dayIndex()];
  $("stat-day").textContent = ex.title;
  $("featured-slot").innerHTML = `<article class="featured-card">
    ${stageHTML(ex)}
    <div>
      <p class="kicker">Exhibit ${ex.id.slice(1)} · ${ex.year} · ${ex.category}</p>
      <h3 style="font-size:3rem;margin:.2rem 0 1rem">${esc(ex.title)}</h3>
      <p class="lede">${esc(ex.plaque)}</p>
      <div class="hero-cta">
        <button class="btn btn-red" data-open="${ex.id}" type="button">Öffnen</button>
        <button class="btn btn-ghost" data-like="${ex.id}" type="button">${likeLabel(ex.id)}</button>
      </div>
    </div>
  </article>`;
}

function renderDarkRail() {
  const dark = exhibits.filter((e) => e.category === "dark").slice(0, 4);
  $("dark-rail").innerHTML = dark
    .map(
      (ex) => `<article class="card" data-id="${ex.id}">${stageHTML(ex)}
      <div class="card-meta"><h3>${esc(ex.title)}</h3></div></article>`,
    )
    .join("");
}

function likeLabel(id) {
  const n = (state.likes[id] || 0) + Math.round(exhibits.find((e) => e.id === id).heat / 3);
  return `▲ ${n}`;
}

function openLightbox(id) {
  const ex = exhibits.find((e) => e.id === id);
  if (!ex) return;
  state.active = ex;
  $("lb-stage").innerHTML = stageHTML(ex);
  $("lb-kicker").textContent = `EXHIBIT ${ex.id.slice(1)} · ${ex.year} · ${ex.category.toUpperCase()}`;
  $("lb-title").textContent = ex.title;
  $("lb-plaque").textContent = ex.plaque;
  $("lb-like").textContent = likeLabel(ex.id);
  $("lightbox").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  $("lightbox").hidden = true;
  state.active = null;
  document.body.style.overflow = "";
}

function bumpLike(id) {
  state.likes[id] = (state.likes[id] || 0) + 1;
  localStorage.setItem(likesKey, JSON.stringify(state.likes));
  if (state.active?.id === id) $("lb-like").textContent = likeLabel(id);
  renderFeatured();
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function strokeFill(ctx, text, x, y, align = "center") {
  ctx.textAlign = align;
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawBlock(ctx, text, x, y, maxWidth, fontSize, align, v = "top") {
  ctx.font = `900 ${fontSize}px Impact, Haettenschweiler, sans-serif`;
  ctx.lineWidth = Math.max(6, fontSize / 8);
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#fff";
  const lines = wrapText(ctx, text.toUpperCase(), maxWidth);
  const start = v === "bottom" ? y - (lines.length - 1) * fontSize * 1.08 : y;
  lines.forEach((ln, i) => strokeFill(ctx, ln, x, start + i * fontSize * 1.08, align));
}

async function memeToCanvas(ex) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = ex.image;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const w = canvas.width;
  const h = canvas.height;
  const l = ex.lines || {};
  const big = Math.round(w / 12);
  const mid = Math.round(w / 18);
  const sm = Math.round(w / 24);

  if (ex.layout === "classic") {
    if (l.top) drawBlock(ctx, l.top, w / 2, big * 0.9, w * 0.9, big, "center", "top");
    if (l.bottom) drawBlock(ctx, l.bottom, w / 2, h - big * 0.55, w * 0.9, big, "center", "bottom");
  } else if (ex.layout === "quote") {
    ctx.font = `italic 600 ${mid}px Georgia, serif`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    wrapText(ctx, l.quote || "", w * 0.78).forEach((ln, i) => {
      ctx.fillText(ln, w / 2, h * 0.42 + i * mid * 1.3);
    });
  } else if (ex.layout === "drake") {
    drawBlock(ctx, l.a || "", w * 0.58, h * 0.22, w * 0.38, sm, "left", "top");
    drawBlock(ctx, l.b || "", w * 0.58, h * 0.7, w * 0.38, sm, "left", "top");
  } else if (ex.layout === "galaxy") {
    ["l1", "l2", "l3", "l4"].forEach((k, i) => {
      drawBlock(ctx, l[k] || "", w * 0.46, h * (0.1 + i * 0.24), w * 0.5, sm, "left", "top");
    });
  } else if (ex.layout === "buttons") {
    drawBlock(ctx, l.a || "", w * 0.32, h * 0.42, w * 0.28, sm, "center", "top");
    drawBlock(ctx, l.b || "", w * 0.66, h * 0.34, w * 0.28, sm, "center", "top");
  } else if (ex.layout === "split") {
    drawBlock(ctx, l.left || "", w * 0.05, h * 0.88, w * 0.4, sm, "left", "bottom");
    drawBlock(ctx, l.right || "", w * 0.95, h * 0.88, w * 0.4, sm, "right", "bottom");
  } else if (ex.layout === "distracted") {
    drawBlock(ctx, l.gf || "", w * 0.16, h * 0.9, w * 0.28, sm, "center", "bottom");
    drawBlock(ctx, l.guy || "", w * 0.42, h * 0.9, w * 0.28, sm, "center", "bottom");
    drawBlock(ctx, l.other || "", w * 0.82, h * 0.9, w * 0.3, sm, "center", "bottom");
  }
  return canvas;
}

async function downloadExhibit(ex) {
  const canvas = await memeToCanvas(ex);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `${ex.id}-${ex.title.replace(/\s+/g, "-").toLowerCase()}.png`;
  a.click();
}

function currentTpl() {
  return templates.find((t) => t.id === state.tpl) || templates[0];
}

function currentGenExhibit() {
  const tpl = currentTpl();
  return {
    id: "custom",
    title: tpl.name,
    image: tpl.src,
    layout: "classic",
    lines: { top: state.top, bottom: state.bottom },
    plaque: "",
    year: "2026",
    category: "classic",
    heat: 50,
  };
}

function setGenStatus(msg) {
  const el = $("gen-status");
  if (el) el.textContent = msg;
}

function syncGenFields() {
  const ids = ["gen-top", "gen-bottom", "gen-top-field", "gen-bottom-field"];
  const values = { "gen-top": state.top, "gen-bottom": state.bottom, "gen-top-field": state.top, "gen-bottom-field": state.bottom };
  ids.forEach((id) => {
    const el = $(id);
    if (el && el.value !== values[id]) el.value = values[id];
  });
}

function paintGenerator() {
  const tpl = currentTpl();
  const img = $("gen-img");
  if (img.getAttribute("src") !== tpl.src) img.src = tpl.src;
  $("gen-stage").dataset.layout = "classic";
  syncGenFields();
  document.querySelectorAll("#tpl-strip .tpl").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tpl === state.tpl);
  });
}

function renderTplStrip() {
  $("tpl-strip").innerHTML = templates
    .map(
      (t) =>
        `<button class="tpl ${state.tpl === t.id ? "active" : ""}" data-tpl="${t.id}" type="button">
          <img src="${t.src}" alt="${esc(t.name)}" />
          <span>${esc(t.name)}</span>
        </button>`,
    )
    .join("");
}

function applyCaption(which, value) {
  state[which] = value;
  syncGenFields();
}

function remixExhibit(ex) {
  const tpl = templates.find((t) => t.src === ex.image) || currentTpl();
  const l = ex.lines || {};
  state.tpl = tpl.id;
  state.top = l.top || l.a || l.left || l.quote || l.l1 || "";
  state.bottom = l.bottom || l.b || l.right || l.l4 || l.other || "";
  paintGenerator();
  closeLightbox();
  $("generator").scrollIntoView({ behavior: "smooth" });
  setGenStatus("Caption sitzt. Ändern und downloaden.");
}

function speak(line, btn) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(line);
  u.rate = 0.92;
  u.pitch = 0.85;
  const voices = window.speechSynthesis.getVoices();
  u.voice =
    voices.find((v) => /en-US|en_US/i.test(v.lang) && /Daniel|Alex|Male|David/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null;
  btn?.classList.add("playing");
  u.onend = () => btn?.classList.remove("playing");
  window.speechSynthesis.speak(u);
}

function renderPads() {
  $("pads").innerHTML = soundboard
    .map(
      (s) =>
        `<button class="pad" data-line="${esc(s.line)}" type="button"><strong>${esc(s.label)}</strong><span>${esc(s.line)}</span></button>`,
    )
    .join("");
}

function randomExhibit() {
  const pool = exhibits.filter(matches);
  const list = pool.length ? pool : exhibits;
  openLightbox(list[Math.floor(Math.random() * list.length)].id);
}

function bind() {
  $("filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.filter = chip.dataset.id;
    renderFilters();
    renderGrid();
  });

  $("search").addEventListener("input", (e) => {
    state.query = e.target.value;
    renderGrid();
  });

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card[data-id]");
    if (card && !e.target.closest("button")) openLightbox(card.dataset.id);
    const open = e.target.closest("[data-open]");
    if (open) openLightbox(open.dataset.open);
    const like = e.target.closest("[data-like]");
    if (like) bumpLike(like.dataset.like);
  });

  $("lb-close").addEventListener("click", closeLightbox);
  $("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  $("lb-like").addEventListener("click", () => state.active && bumpLike(state.active.id));
  $("lb-download").addEventListener("click", () => state.active && downloadExhibit(state.active));

  $("random-btn").addEventListener("click", randomExhibit);
  $("dark-filter-link").addEventListener("click", (e) => {
    e.preventDefault();
    state.filter = "dark";
    renderFilters();
    renderGrid();
    $("archive").scrollIntoView({ behavior: "smooth" });
  });

  $("tpl-strip").addEventListener("click", (e) => {
    const btn = e.target.closest(".tpl");
    if (!btn) return;
    state.tpl = btn.dataset.tpl;
    paintGenerator();
  });
  const onCaptionInput = (which) => (e) => applyCaption(which, e.target.value);
  ["gen-top", "gen-bottom", "gen-top-field", "gen-bottom-field"].forEach((id) => {
    const which = id.includes("bottom") ? "bottom" : "top";
    $(id).addEventListener("input", onCaptionInput(which));
    $(id).addEventListener("change", onCaptionInput(which));
  });
  $("shuffle-captions").addEventListener("click", () => {
    const cap = captionsPool[Math.floor(Math.random() * captionsPool.length)];
    state.top = cap.top;
    state.bottom = cap.bottom;
    paintGenerator();
    setGenStatus("Neue Caption. Passt nicht? Nochmal würfeln.");
  });
  $("dl-btn").addEventListener("click", async () => {
    try {
      setGenStatus("Rendert…");
      await downloadExhibit(currentGenExhibit());
      setGenStatus("PNG gespeichert.");
    } catch (err) {
      setGenStatus("Download fehlgeschlagen. Nochmal versuchen.");
    }
  });
  $("lb-remix").addEventListener("click", () => state.active && remixExhibit(state.active));

  $("pads").addEventListener("click", (e) => {
    const pad = e.target.closest(".pad");
    if (pad) speak(pad.dataset.line, pad);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      $("search").focus();
    }
  });

  $("gate-enter").addEventListener("click", () => {
    localStorage.setItem(gateKey, "1");
    $("gate").hidden = true;
  });
  $("gate-leave").addEventListener("click", () => {
    window.location.href = "https://www.google.com";
  });
}

function initGate() {
  if (!localStorage.getItem(gateKey)) $("gate").hidden = false;
}

function init() {
  $("stat-count").textContent = String(exhibits.length);
  $("stat-dark").textContent = String(exhibits.filter((e) => e.category === "dark").length);
  renderFilters();
  renderGrid();
  renderFeatured();
  renderDarkRail();
  renderPads();
  renderTplStrip();
  paintGenerator();
  bind();
  initGate();
}

init();
