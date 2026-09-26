// ── ONJJEM landing page engine ───────────────────────────────────────────────
// Used by mug.html, magnets.html, blanket.html (and the promo/reviews on
// index.html + tiktok.html). Each product page sets window.PAGE = {...} and
// has an empty <div id="app"></div>.

const API_BASE = "https://onjjem-production-5ef8.up.railway.app";

// ── EDIT THESE TWO THINGS IN ONE PLACE ──────────────────────────────────────
// 1. The current offer. The code MUST exist in Stripe as a *promotion code*
//    (Stripe → Product catalogue → Coupons → create coupon → add promotion code).
//    Set active:false to hide the offer everywhere.
const ONJJEM_PROMO = {
  active: false,
  code: "XMAS15",
  headline: "🎃 Halloween cartoons are here! Plus 15% off everything",
  small: "Enter the code at checkout. Ends 30 November."
};

// 2. Real customer reviews only. Add new ones to the top as they come in.
const ONJJEM_REVIEWS = [
  { name: "Kelly W.", bought: "Photo print", text: "I purchased a print of my children — fantastic quality, great value and super fast delivery. Will definitely be using ONJJEM again." },
  { name: "Niamh", bought: "Colour-changing mug", text: "Love the mug I ordered. Such a cute design and the heat-activated effect works perfectly. Really happy with it!" }
];
// ─────────────────────────────────────────────────────────────────────────────

function onjjemGa() { if (typeof gtag === "function") { try { gtag.apply(null, arguments); } catch (e) {} } }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function money(p) { return "£" + Number(p).toFixed(2); }

function ONJJEM_offerBarHtml() {
  if (!ONJJEM_PROMO.active) return "";
  return `<div class="offer-bar">${ONJJEM_PROMO.headline} — use code <code>${esc(ONJJEM_PROMO.code)}</code></div>`;
}

function ONJJEM_reviewsHtml() {
  if (!ONJJEM_REVIEWS.length) return "";
  return `
  <section class="l-section wrap">
    <h2>What customers say <span class="gold">★★★★★</span></h2>
    <div class="reviews">
      ${ONJJEM_REVIEWS.map(r => `
        <div class="review">
          <div class="stars">★★★★★</div>
          <p>“${esc(r.text)}”</p>
          <div class="who">${esc(r.name)} · ${esc(r.bought)}</div>
        </div>`).join("")}
    </div>
  </section>`;
}

function ONJJEM_headerHtml() {
  return `
  ${ONJJEM_offerBarHtml()}
  <header class="l-header">
    <a href="/" class="l-logo">ONJJEM</a>
    <nav class="l-nav"><a href="/">Shop</a><a href="/#faq">Help</a></nav>
  </header>`;
}

function ONJJEM_footerHtml() {
  return `
  <footer class="l-footer">
    <p style="margin-bottom:0.5rem">Personalised gifts, handmade to order in the UK · <a href="mailto:hello@onjjem.com">hello@onjjem.com</a></p>
    <a href="/delivery.html">Delivery</a><a href="/terms.html">Terms</a><a href="/privacy.html">Privacy</a>
  </footer>`;
}

// Shrink very large phone photos so upload + checkout stay fast.
function ONJJEM_readPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that photo — please try another."));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (file.size < 6 * 1024 * 1024) { resolve(dataUrl); return; }
      const img = new Image();
      img.onload = () => {
        const max = 3600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// Lay 1–9 photos out as a square grid (print-ready, 1800px = 6" at 300dpi).
// 2–3 photos fill a 2x2 grid and 5–8 fill a 3x3 grid by repeating photos.
function ONJJEM_buildCollage(dataUrls) {
  const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  return Promise.all(dataUrls.map(load)).then(imgs => {
    imgs = imgs.filter(Boolean);
    const n = imgs.length;
    const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
    const size = 1800, gap = 18;
    const cell = (size - gap * (cols + 1)) / cols;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    for (let k = 0; k < cols * cols; k++) {
      const img = imgs[k % n];
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2, sy = (img.height - s) / 2;
      const x = gap + (k % cols) * (cell + gap), y = gap + Math.floor(k / cols) * (cell + gap);
      ctx.drawImage(img, sx, sy, s, s, x, y, cell, cell);
    }
    return c.toDataURL("image/jpeg", 0.92);
  });
}

// Convert a photo to PNG (some print products, like stickers, need PNG files).
function ONJJEM_toPng(dataUrl, maxPx) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Burn optional words onto a picture, meme-style (white with a dark outline).
function ONJJEM_addCaption(dataUrl, text, pos) {
  text = (text || "").trim();
  if (!text) return Promise.resolve(dataUrl);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const W = c.width, H = c.height;
      const maxW = W * 0.86;
      const words = text.split(/\s+/);
      let size = Math.round(Math.min(W, H) * 0.13), lines = [];
      for (; size > 12; size -= 2) {
        ctx.font = `900 ${size}px -apple-system, 'Helvetica Neue', Impact, Arial, sans-serif`;
        lines = []; let line = "";
        for (const w of words) {
          const t = line ? line + " " + w : w;
          if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
        }
        lines.push(line);
        if (lines.length <= 3 && Math.max(...lines.map(l => ctx.measureText(l).width)) <= maxW) break;
      }
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineJoin = "round"; ctx.lineWidth = Math.max(4, size * 0.16);
      ctx.strokeStyle = "rgba(0,0,0,0.9)"; ctx.fillStyle = "#ffffff";
      const lh = size * 1.15, margin = Math.min(W, H) * 0.12;
      const block = lines.length * lh;
      const top = pos === "top" ? margin + lh / 2 : H - margin - block + lh / 2;
      lines.forEach((l, i) => { const y = top + i * lh; ctx.strokeText(l, W / 2, y); ctx.fillText(l, W / 2, y); });
      resolve(c.toDataURL("image/jpeg", 0.93));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function ONJJEM_loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
// Centre-crop a picture to an exact shape (w:h) so what they see is what prints.
async function ONJJEM_cropTo(dataUrl, w, h) {
  const img = await ONJJEM_loadImg(dataUrl);
  const target = w / h, have = img.width / img.height;
  let sw = img.width, sh = img.height;
  if (have > target) sw = img.height * target; else sh = img.width / target;
  if (Math.abs(have - target) < 0.01) return dataUrl;
  const c = document.createElement("canvas");
  c.width = Math.round(sw); c.height = Math.round(sh);
  c.getContext("2d").drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.93);
}
async function ONJJEM_rotate90(dataUrl) {
  const img = await ONJJEM_loadImg(dataUrl);
  const c = document.createElement("canvas");
  c.width = img.height; c.height = img.width;
  const ctx = c.getContext("2d");
  ctx.translate(c.width, 0); ctx.rotate(Math.PI / 2); ctx.drawImage(img, 0, 0);
  return c.toDataURL("image/jpeg", 0.93);
}
// Mug wrap: the whole picture (nothing cut off), shown twice so it faces
// out whichever hand holds the mug, on a soft blurred background.
async function ONJJEM_mugWrap(dataUrl, aspect) {
  const img = await ONJJEM_loadImg(dataUrl);
  const H = 1100, W = Math.round(H * aspect);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const s = Math.max(W / img.width, H / img.height);
  ctx.filter = "blur(40px) brightness(0.9)";
  ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
  ctx.filter = "none";
  const ph = H * 0.9, pw = Math.min(ph * img.width / img.height, W * 0.46);
  const fh = pw * img.height / img.width;
  const slots = pw * 2 <= W * 0.96 ? [0.25, 0.75] : [0.5];
  for (const f of slots) {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 24;
    ctx.drawImage(img, W * f - pw / 2, (H - fh) / 2, pw, fh); ctx.restore();
  }
  return c.toDataURL("image/jpeg", 0.93);
}

function ONJJEM_printAnythingHtml() {
  const items = [
    ["📸", "Photos", "Family, friends, holidays"],
    ["🐶", "Pets", "Dogs, cats, even the hamster"],
    ["✏️", "Your words", "Slogans, names, in-jokes, quotes"],
    ["🖍️", "Kids' drawings", "Snap a photo of their artwork"],
    ["🎨", "Cartoons", "We turn your photo into one"],
    ["📱", "Screenshots", "A funny message or a sweet text"]
  ];
  return `
  <section class="l-section wrap">
    <h2>Print <span class="gold">anything</span></h2>
    <p style="text-align:center;color:var(--muted);margin:-0.4rem auto 1rem;max-width:520px">If it's on your phone, we can print it. No photo? Type your words and we'll design it for you.</p>
    <div class="tiles" style="grid-template-columns:repeat(3,1fr)">
      ${items.map(i => `<div class="tile" style="padding:0.9rem 0.6rem;text-align:center"><div style="font-size:1.8rem">${i[0]}</div><h3 style="margin-top:0.3rem">${i[1]}</h3><div class="t-tag">${i[2]}</div></div>`).join("")}
    </div>
  </section>`;
}

// ── Text maker: customer types words, we draw a print-ready design ──────────
const ONJJEM_TEXT_THEMES = [
  { name: "Classic", bg: "#ffffff", fg: "#111111" },
  { name: "Gold", bg: "#141414", fg: "#e8c75a" },
  { name: "Pink", bg: "#ffd6e5", fg: "#b0144f" },
  { name: "Halloween", bg: "#2b1240", fg: "#ff9a2e" },
  { name: "Christmas", bg: "#b3121f", fg: "#ffffff" },
  { name: "Mint", bg: "#d8f3e6", fg: "#0f5a3c" }
];
const ONJJEM_TEXT_FONTS = [
  { name: "Bold", css: "800 {px}px -apple-system, 'Helvetica Neue', Arial, sans-serif" },
  { name: "Fun", css: "700 {px}px 'Chalkboard SE', 'Comic Sans MS', 'Marker Felt', cursive" },
  { name: "Elegant", css: "italic 600 {px}px Georgia, 'Times New Roman', serif" }
];

function ONJJEM_drawText(canvas, text, theme, font) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, W, H);
  // Keep words in the middle so nothing is cut off when the print is trimmed.
  const boxW = Math.min(W, H * 1.4) * 0.72, boxH = Math.min(H, W * 1.4) * 0.62;
  const words = (text.trim() || "Your words here").split(/\s+/);
  let size = Math.round(boxH / 2), lines = [];
  for (; size > 16; size -= 4) {
    ctx.font = font.css.replace("{px}", size);
    lines = []; let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > boxW && line) { lines.push(line); line = w; } else { line = test; }
    }
    lines.push(line);
    const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
    if (lines.length * size * 1.2 <= boxH && widest <= boxW) break;
  }
  ctx.fillStyle = theme.fg; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const top = H / 2 - ((lines.length - 1) * size * 1.2) / 2;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, top + i * size * 1.2));
}

function ONJJEM_openTextMaker(aspect, onDone) {
  let theme = ONJJEM_TEXT_THEMES[0], font = ONJJEM_TEXT_FONTS[0];
  const long = 2400;
  const W = aspect >= 1 ? long : Math.round(long * aspect);
  const H = aspect >= 1 ? Math.round(long / aspect) : long;
  const overlay = document.createElement("div");
  overlay.className = "cartoon-preview-overlay";
  overlay.innerHTML = `
    <div class="cartoon-preview-card" style="max-width:440px">
      <div class="cartoon-preview-title">Type your words ✏️</div>
      <p class="cartoon-email-note">A slogan, a name, an in-joke or a message. Emojis work too 🎉</p>
      <textarea id="tmText" rows="3" maxlength="120" placeholder="e.g. World's Best Grandad" style="width:100%;border-radius:10px;padding:0.7rem;font-size:1rem;border:1px solid #ccc;font-family:inherit"></textarea>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin:0.7rem 0 0.4rem" id="tmThemes">
        ${ONJJEM_TEXT_THEMES.map((t, i) => `<button type="button" data-t="${i}" title="${t.name}" style="width:38px;height:38px;border-radius:50%;border:3px solid ${i === 0 ? "#d4af37" : "transparent"};background:linear-gradient(135deg,${t.bg} 50%,${t.fg} 50%);cursor:pointer"></button>`).join("")}
      </div>
      <div style="display:flex;gap:0.4rem;margin-bottom:0.7rem" id="tmFonts">
        ${ONJJEM_TEXT_FONTS.map((f, i) => `<button type="button" data-f="${i}" style="flex:1;padding:0.5rem;border-radius:8px;border:2px solid ${i === 0 ? "#d4af37" : "#ccc"};background:#fff;color:#111;font:${f.css.replace("{px}", 15)};cursor:pointer">${f.name}</button>`).join("")}
      </div>
      <canvas id="tmCanvas" width="${W}" height="${H}" style="width:100%;border-radius:10px;border:1px solid #ddd;display:block"></canvas>
      <button class="cartoon-btn-primary" id="tmUse" style="width:100%;margin-top:0.8rem">Use this design →</button>
      <button class="cartoon-btn-secondary" id="tmCancel" style="width:100%;margin-top:0.5rem">Cancel</button>
    </div>`;
  document.body.appendChild(overlay);
  const canvas = overlay.querySelector("#tmCanvas");
  const textEl = overlay.querySelector("#tmText");
  const redraw = () => ONJJEM_drawText(canvas, textEl.value, theme, font);
  textEl.addEventListener("input", redraw);
  overlay.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => {
    theme = ONJJEM_TEXT_THEMES[+b.dataset.t];
    overlay.querySelectorAll("[data-t]").forEach(x => x.style.borderColor = x === b ? "#d4af37" : "transparent");
    redraw();
  }));
  overlay.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => {
    font = ONJJEM_TEXT_FONTS[+b.dataset.f];
    overlay.querySelectorAll("[data-f]").forEach(x => x.style.borderColor = x === b ? "#d4af37" : "#ccc");
    redraw();
  }));
  overlay.querySelector("#tmCancel").addEventListener("click", () => overlay.remove());
  overlay.querySelector("#tmUse").addEventListener("click", () => {
    if (!textEl.value.trim()) { textEl.focus(); textEl.placeholder = "Type something first 🙂"; return; }
    redraw();
    const url = canvas.toDataURL("image/jpeg", 0.95);
    overlay.remove();
    onDone(url);
  });
  redraw();
  setTimeout(() => textEl.focus(), 50);
}

function ONJJEM_renderLanding(P) {
  const app = document.getElementById("app");
  const opts = P.options;
  let selected = Math.max(0, opts.findIndex(o => o.default));
  let photo = null;

  const fromPrice = Math.min(...opts.map(o => o.price));

  app.innerHTML = `
  ${ONJJEM_headerHtml()}
  <main>
    <section class="wrap l-hero">
      <div class="l-hero-img"><img src="${P.heroImg}" alt="${esc(P.heroAlt || P.title)}"></div>
      <div>
        <div class="l-kicker">${esc(P.kicker)}</div>
        <h1>${esc(P.title)}</h1>
        <p class="sub">${esc(P.sub)}</p>
        <div class="l-price">${opts.length > 1 ? "From " : ""}${money(fromPrice)} <small>· free UK delivery</small></div>
        <ul class="l-ticks">${P.ticks.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
        <a href="#order" class="btn">${esc(P.cta || "Create yours now")}</a>
      </div>
    </section>

    <section class="l-section wrap">
      <h2>How it works</h2>
      <div class="steps">
        <div class="step"><div class="step-num">1</div><div><h3>Pick a photo or type words</h3><p>Pets, kids, family, a drawing, or your own slogan.</p></div></div>
        <div class="step"><div class="step-num">2</div><div><h3>${P.cartoon ? "Cartoon it (optional)" : "Choose your option"}</h3><p>${P.cartoon ? "See a free preview of your photo as a cartoon. Add it for £1.99, or keep the original." : "Pick the size or style you want."}</p></div></div>
        <div class="step"><div class="step-num">3</div><div><h3>We make it &amp; post it</h3><p>Printed to order in the UK and sent with free delivery.</p></div></div>
      </div>
    </section>

    ${ONJJEM_printAnythingHtml()}

    <section class="l-section wrap" id="order">
      <div class="order-box">
        <h2>${esc(P.orderTitle || "Make yours")}</h2>

        <span class="order-label">1. Choose ${esc(P.optionWord || "your option")}</span>
        <div class="options" id="options">
          ${opts.map((o, i) => `
            <label class="option${i === selected ? " selected" : ""}" data-i="${i}">
              <input type="radio" name="opt" value="${i}"${i === selected ? " checked" : ""}>
              <span class="o-name">${esc(o.name)}${o.badge ? `<span class="o-badge">${esc(o.badge)}</span>` : ""}${o.note ? `<small>${esc(o.note)}</small>` : ""}</span>
              <span class="o-price">${money(o.price)}</span>
            </label>`).join("")}
        </div>

        <span class="order-label">2. Add your photo${opts.some(o => o.multi) ? "s" : ""}, drawing or words</span>
        <input type="file" id="photoInput" accept="image/*" style="display:none">
        <div class="upload" id="uploadBox" role="button" tabindex="0"></div>
        <div id="orientWrap" style="display:none;margin-top:0.7rem">
          <span style="font-weight:700;display:block;margin-bottom:0.35rem">Which way round?</span>
          <div style="display:flex;gap:0.4rem">
            <button type="button" class="btn btn-ghost orientBtn" data-o="portrait" style="padding:0.55rem;font-size:0.9rem">▯ Portrait (tall)</button>
            <button type="button" class="btn btn-ghost orientBtn" data-o="landscape" style="padding:0.55rem;font-size:0.9rem">▭ Landscape (wide)</button>
          </div>
        </div>
        <div id="captionWrap" style="display:none;margin-top:0.7rem">
          <label for="captionText" style="font-weight:700;display:block;margin-bottom:0.35rem">Add funny words to your picture? <span style="color:var(--muted);font-weight:400">(optional)</span></label>
          <input id="captionText" maxlength="60" placeholder="e.g. Chief Treat Inspector 🐾" style="width:100%;padding:0.75rem;border-radius:10px;border:1px solid #555;background:#1f1f1f;color:#fff;font-size:1rem">
          <div style="display:flex;gap:0.4rem;margin-top:0.4rem">
            <button type="button" class="btn btn-ghost capPos" data-pos="bottom" style="padding:0.45rem;font-size:0.85rem;border-color:var(--gold)">Words at bottom</button>
            <button type="button" class="btn btn-ghost capPos" data-pos="top" style="padding:0.45rem;font-size:0.85rem">Words at top</button>
          </div>
        </div>
        <button type="button" class="btn btn-ghost" id="typeBtn" style="margin-top:0.6rem;font-size:0.95rem;padding:0.75rem">✏️ No photo? Type your own words or slogan</button>

        <div class="order-total"><span>Total <small style="color:var(--muted)">(free UK delivery)</small></span><strong id="total">${money(opts[selected].price)}</strong></div>
        <button class="btn" id="basketBtn">🧺 Add to basket</button>
        <button class="btn btn-ghost" id="buyBtn" style="margin-top:0.5rem">Buy just this one now →</button>
        <p class="order-note" style="margin-top:0.5rem">🎁 Bundle &amp; save: <strong>10% off 2 gifts</strong>, <strong>15% off 3 or more</strong>, applied automatically in your basket.</p>
        <div class="order-status" id="status"></div>
        <p class="order-note">🔒 Secure payment by Stripe${ONJJEM_PROMO.active ? ` · Code <strong>${esc(ONJJEM_PROMO.code)}</strong> goes in at checkout` : ""}</p>
      </div>
    </section>

    ${ONJJEM_reviewsHtml()}

    ${P.faq && P.faq.length ? `
    <section class="l-section wrap faq">
      <h2>Questions</h2>
      ${P.faq.map(f => `<details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join("")}
    </section>` : ""}
  </main>
  ${ONJJEM_footerHtml()}
  <div class="sticky-buy" id="stickyBuy"><a href="#order" class="btn">${esc(P.cta || "Create yours now")} — ${money(fromPrice)}</a></div>
  `;

  // Option selection
  const optionEls = app.querySelectorAll(".option");
  const input = document.getElementById("photoInput");
  const box = document.getElementById("uploadBox");
  const status = document.getElementById("status");
  let photos = []; // every photo the customer picked (for collage options)
  const isMulti = () => !!opts[selected].multi;
  const emptyBox = () => `<div class="u-icon">📸</div><div class="u-text">${isMulti() ? "Tap to choose up to " + opts[selected].multi + " photos" : "Tap to choose a photo"}</div><div class="u-hint">${esc(isMulti() ? (opts[selected].multiHint || "Pick 1, 4 or 9 photos for a perfect grid.") : (P.photoHint || "Clear, bright photos print best."))}</div>`;

  let isTextDesign = false;
  const capText = document.getElementById("captionText");
  let capPos = "bottom", capTimer;
  capText.addEventListener("input", () => { clearTimeout(capTimer); capTimer = setTimeout(refreshPhoto, 250); });
  document.querySelectorAll(".capPos").forEach(b => b.addEventListener("click", () => {
    capPos = b.dataset.pos;
    document.querySelectorAll(".capPos").forEach(x => x.style.borderColor = x === b ? "var(--gold)" : "");
    refreshPhoto();
  }));
  let orient = null; // "portrait" | "landscape", set from the photo, customer can switch
  const orientWrap = document.getElementById("orientWrap");
  const nominalOrient = o => (o.ratio && o.ratio[0] > o.ratio[1]) ? "landscape" : "portrait";
  function targetRatio(o) {
    if (!o.ratio) return null;
    let [w, h] = o.ratio;
    if (o.orient && orient && orient !== nominalOrient(o) && w !== h) [w, h] = [h, w];
    return [w, h];
  }
  // Everything that turns the picture into the exact print file.
  async function finalize(src, words, forPrint) {
    const o = opts[selected];
    let out = src;
    const r = targetRatio(o);
    if (r && !o.wrap) out = await ONJJEM_cropTo(out, r[0], r[1]);
    out = await ONJJEM_addCaption(out, words, capPos);
    if (o.wrap) out = await ONJJEM_mugWrap(out, o.wrap);
    else if (forPrint && r && r[0] !== r[1] && (r[0] > r[1]) !== (o.ratio[0] > o.ratio[1])) out = await ONJJEM_rotate90(out);
    return out;
  }
  document.querySelectorAll(".orientBtn").forEach(b => b.addEventListener("click", () => { orient = b.dataset.o; refreshPhoto(); }));

  async function refreshPhoto() {
    const o0 = opts[selected];
    orientWrap.style.display = photos.length && o0.orient && !o0.wrap && o0.ratio && o0.ratio[0] !== o0.ratio[1] ? "block" : "none";
    document.querySelectorAll(".orientBtn").forEach(x => x.style.borderColor = x.dataset.o === orient ? "var(--gold)" : "");
    if (!photos.length) document.getElementById("captionWrap").style.display = "none";
    if (!photos.length) { photo = null; box.classList.remove("has-photo"); box.innerHTML = emptyBox(); return; }
    if (isMulti() && photos.length > 1) {
      box.innerHTML = `<div class="u-text">Building your collage…</div>`;
      photo = await ONJJEM_buildCollage(photos.slice(0, opts[selected].multi));
    } else {
      photo = photos[0];
    }
    const n = isMulti() ? Math.min(photos.length, opts[selected].multi) : 1;
    box.classList.add("has-photo");
    document.getElementById("captionWrap").style.display = isTextDesign ? "none" : "block";
    if (!orient) { const im = await ONJJEM_loadImg(photo); orient = im.width > im.height ? "landscape" : "portrait"; document.querySelectorAll(".orientBtn").forEach(x => x.style.borderColor = x.dataset.o === orient ? "var(--gold)" : ""); }
    const shown = await finalize(photo, isTextDesign ? "" : capText.value, false);
    const o1 = opts[selected];
    const label = o1.wrap ? "This wraps around your mug (your picture shows on both sides)" : (o1.ratio ? "This is exactly how it will print" : "Tap to change");
    box.innerHTML = `<img class="u-preview" src="${shown}" alt="Your photo" style="${o1.wrap ? "max-height:140px" : ""}"><div class="u-text">✓ ${n > 1 ? n + " photos added" : "Photo added"}</div><div class="u-hint">${label} · tap to change</div>`;
  }

  optionEls.forEach(el => el.addEventListener("click", async () => {
    const wasMulti = isMulti();
    selected = Number(el.dataset.i);
    optionEls.forEach(e => e.classList.toggle("selected", e === el));
    el.querySelector("input").checked = true;
    document.getElementById("total").textContent = money(opts[selected].price);
    input.multiple = isMulti();
    await refreshPhoto();
  }));
  input.multiple = isMulti();
  box.innerHTML = emptyBox();

  // Photo upload
  box.addEventListener("click", () => input.click());
  box.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") input.click(); });
  input.addEventListener("change", async () => {
    const files = Array.from(input.files || []);
    if (!files.length) return;
    status.textContent = "";
    box.innerHTML = `<div class="u-text">Loading your photo${files.length > 1 ? "s" : ""}…</div>`;
    try {
      const max = isMulti() ? opts[selected].multi : 1;
      if (files.length > max) status.textContent = `We've used your first ${max} photos.`;
      photos = await Promise.all(files.slice(0, max).map(ONJJEM_readPhoto));
      orient = null;
      await refreshPhoto();
      input.value = "";
      onjjemGa("event", "add_to_cart", { currency: "GBP", value: opts[selected].price, items: [{ item_id: opts[selected].sku, item_name: opts[selected].name, price: opts[selected].price }] });
    } catch (err) {
      photos = []; await refreshPhoto();
      status.textContent = err.message;
    }
  });

  // Typed words / slogans
  document.getElementById("typeBtn").addEventListener("click", () => {
    const o = opts[selected];
    const tr = targetRatio(o);
    ONJJEM_openTextMaker(o.wrap ? 1.3 : (tr ? tr[0] / tr[1] : (o.aspect || P.textAspect || 1)), async dataUrl => {
      photos = [dataUrl];
      isTextDesign = true;
      await refreshPhoto();
      box.querySelector(".u-text").textContent = "✓ Your words are ready";
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  input.addEventListener("change", () => { isTextDesign = false; }, true);

  // Buy
  const buyBtn = document.getElementById("buyBtn");
  const basketBtn = document.getElementById("basketBtn");
  function startFlow(then) {
    if (!photo) { status.textContent = "Please add your photo first 📸"; box.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    status.textContent = "";
    const collage = isMulti() && photos.length > 1; // cartoons are for single photos
    if (P.cartoon && !collage && !isTextDesign && typeof ONJJEM_showPhotoPreview === "function") {
      ONJJEM_showPhotoPreview(photo, cartoonOpts => then(cartoonOpts));
    } else {
      then(null);
    }
  }
  buyBtn.addEventListener("click", () => startFlow(checkout));
  basketBtn.addEventListener("click", () => startFlow(addToBasket));

  // Make the exact print file for this gift and put it in the basket.
  async function addToBasket(cartoonOpts) {
    const o = opts[selected];
    basketBtn.disabled = true; buyBtn.disabled = true;
    status.style.color = "var(--muted)";
    status.textContent = "Adding to your basket…";
    try {
      const words = isTextDesign ? "" : capText.value;
      let source = photo, cartoon = false;
      if (cartoonOpts && cartoonOpts.addCartoon) {
        let c = cartoonOpts.confirmedCartoonBase64;
        if (!c) {
          // Free previews used up: make the final cartoon now.
          status.textContent = "Making your cartoon… this takes a few seconds";
          const r = await fetch(`${API_BASE}/api/cartoonify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base64Image: photo, mimeType: "image/jpeg", watermark: false, style: window.ONJJEM_CARTOON_STYLE || undefined }) });
          const d = await r.json();
          if (!d.base64Image) throw new Error("the cartoon couldn't be made");
          c = d.base64Image;
        }
        source = c.startsWith("data:") ? c : "data:image/png;base64," + c;
        cartoon = true;
      }
      let print = await finalize(source, words, true);
      print = P.pngMaxPx ? await ONJJEM_toPng(print, P.pngMaxPx) : await ONJJEM_limitSize(print, 2600);
      const preview = await finalize(source, words, false);
      const thumb = await ONJJEM_limitSize(preview, 240);
      await ONJJEM_Basket.add({ sku: o.sku, name: o.name, price: o.price, cartoon, photo: print, thumb, page: location.pathname });
      onjjemGa("event", "add_to_cart", { currency: "GBP", value: o.price, items: [{ item_id: o.sku, item_name: o.name, price: o.price }] });
      status.textContent = "";
      ONJJEM_showAddedToast(thumb, o.name);
    } catch (err) {
      status.style.color = "#ffb4a8";
      status.textContent = "Sorry, that didn't add (" + (err && err.message ? err.message : "please try again") + ").";
    } finally {
      basketBtn.disabled = false; buyBtn.disabled = false;
    }
  }

  async function checkout(cartoonOpts) {
    const o = opts[selected];
    buyBtn.disabled = true;
    status.style.color = "var(--muted)";
    status.textContent = "Taking you to secure checkout…";
    onjjemGa("event", "begin_checkout", { currency: "GBP", value: o.price, items: [{ item_id: o.sku, item_name: o.name, price: o.price }] });
    try {
      const words = isTextDesign ? "" : capText.value;
      let finalPhoto = await finalize(photo, words, true);
      const extra = Object.assign({}, cartoonOpts || {});
      if (extra.confirmedCartoonBase64) {
        // Show the customer the exact cartoon that will be printed, with their words.
        const cartoonUrl = extra.confirmedCartoonBase64.startsWith("data:") ? extra.confirmedCartoonBase64 : "data:image/png;base64," + extra.confirmedCartoonBase64;
        const finalCartoon = await finalize(cartoonUrl, words, true);
        extra.confirmedCartoonBase64 = P.pngMaxPx ? await ONJJEM_toPng(finalCartoon, P.pngMaxPx) : finalCartoon;
        box.innerHTML = `<img class="u-preview" src="${await finalize(cartoonUrl, words, false)}" alt="Your cartoon"><div class="u-text">✓ Cartoon added — this is what we'll print</div>`;
      }
      const photoToSend = P.pngMaxPx ? await ONJJEM_toPng(finalPhoto, P.pngMaxPx) : finalPhoto;
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({
          sku: o.sku,
          photoBase64: photoToSend,
          successUrl: window.location.origin + "/?order=success&session_id={CHECKOUT_SESSION_ID}",
          cancelUrl: window.location.href.split("#")[0] + "#order"
        }, extra))
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) { window.location.href = data.url; return; }
      throw new Error(data.error || "Checkout didn't start");
    } catch (err) {
      buyBtn.disabled = false;
      status.style.color = "#ffb4a8";
      status.textContent = "Sorry, checkout didn't start (" + (err && err.message ? err.message : "connection problem") + "). Please try again, or email hello@onjjem.com and we'll sort it.";
    }
  }

  // Sticky buy bar on mobile until the order box is on screen
  const sticky = document.getElementById("stickyBuy");
  const orderBox = document.getElementById("order");
  document.body.classList.add("has-sticky");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      sticky.classList.toggle("show", !entries[0].isIntersecting && window.scrollY > 200);
    }).observe(orderBox);
    window.addEventListener("scroll", () => {
      const r = orderBox.getBoundingClientRect();
      const visible = r.top < window.innerHeight && r.bottom > 0;
      sticky.classList.toggle("show", !visible && window.scrollY > 200);
    }, { passive: true });
  }

  onjjemGa("event", "view_item", { currency: "GBP", value: fromPrice, items: opts.map(o => ({ item_id: o.sku, item_name: o.name, price: o.price })) });
}

// ── Basket ───────────────────────────────────────────────────────────────────
// Kept in the browser (IndexedDB, which can hold pictures) so it survives
// moving between pages. Checkout sends every gift with its own picture.
async function ONJJEM_limitSize(dataUrl, maxPx) {
  const img = await ONJJEM_loadImg(dataUrl);
  const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
  if (scale === 1 && dataUrl.startsWith("data:image/jpeg")) return dataUrl;
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.9);
}

const ONJJEM_Basket = (() => {
  let memory = [];
  function db() {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open("onjjem", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("basket");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      } catch (e) { reject(e); }
    });
  }
  async function load() {
    try {
      const d = await db();
      return await new Promise(res => {
        const r = d.transaction("basket").objectStore("basket").get("items");
        r.onsuccess = () => res(r.result || []);
        r.onerror = () => res(memory);
      });
    } catch (e) { return memory; }
  }
  async function save(items) {
    memory = items;
    try {
      const d = await db();
      await new Promise(res => { const t = d.transaction("basket", "readwrite"); t.objectStore("basket").put(items, "items"); t.oncomplete = res; t.onerror = res; });
    } catch (e) {}
    ONJJEM_updateBasketButton(items);
  }
  return {
    load,
    async add(item) {
      const items = await load();
      if (items.length >= 8) throw new Error("your basket is full (8 gifts max)");
      item.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      items.push(item); await save(items); return items;
    },
    async remove(id) { const items = (await load()).filter(i => i.id !== id); await save(items); return items; },
    async clear() { await save([]); }
  };
})();

function ONJJEM_bundlePercent(n) { return n >= 3 ? 15 : n === 2 ? 10 : 0; }

function ONJJEM_updateBasketButton(items) {
  let btn = document.getElementById("basketFab");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "basketFab"; btn.type = "button"; btn.className = "basket-fab";
    btn.addEventListener("click", ONJJEM_openBasket);
    document.body.appendChild(btn);
  }
  btn.innerHTML = `🧺<span class="basket-count">${items.length}</span>`;
  btn.style.display = items.length ? "flex" : "none";
}

function ONJJEM_showAddedToast(thumb, name) {
  const t = document.createElement("div");
  t.className = "cartoon-preview-overlay";
  ONJJEM_Basket.load().then(items => {
    const n = items.length, next = ONJJEM_bundlePercent(n + 1), now = ONJJEM_bundlePercent(n);
    const nudge = next > now ? `Add ${n === 1 ? "one more gift to save 10%" : "one more gift to save 15%"} on everything 🎁` : `You're saving ${now}% on your whole basket 🎉`;
    t.innerHTML = `
      <div class="cartoon-preview-card" style="text-align:center">
        <img src="${thumb}" alt="" style="max-height:130px;margin:0 auto 0.6rem;border-radius:10px">
        <div class="cartoon-preview-title">Added to your basket 🧺</div>
        <p class="cartoon-email-note">${esc(name)}</p>
        <p class="cartoon-email-note" style="font-weight:700;color:#F3D078">${nudge}</p>
        <button class="cartoon-btn-primary" data-a="more" style="width:100%;margin-top:0.4rem">Add another gift</button>
        <button class="cartoon-btn-secondary" data-a="basket" style="width:100%;margin-top:0.5rem">View basket &amp; checkout (${n})</button>
      </div>`;
    document.body.appendChild(t);
    t.querySelector('[data-a="more"]').onclick = () => { t.remove(); location.href = "/tiktok"; };
    t.querySelector('[data-a="basket"]').onclick = () => { t.remove(); ONJJEM_openBasket(); };
  });
}

async function ONJJEM_openBasket() {
  const items = await ONJJEM_Basket.load();
  const old = document.getElementById("basketPanel"); if (old) old.remove();
  const panel = document.createElement("div");
  panel.id = "basketPanel"; panel.className = "cartoon-preview-overlay";
  const sub = items.reduce((a, i) => a + i.price + (i.cartoon ? 1.99 : 0), 0);
  const pct = ONJJEM_bundlePercent(items.length);
  const disc = Math.round(sub * pct) / 100;
  const nextPct = ONJJEM_bundlePercent(items.length + 1);
  panel.innerHTML = `
    <div class="cartoon-preview-card basket-card">
      <div class="cartoon-preview-title">Your basket 🧺</div>
      ${items.length ? items.map(i => `
        <div class="basket-row">
          <img src="${i.thumb}" alt="">
          <div class="basket-info"><strong>${esc(i.name)}</strong>${i.cartoon ? "<small>+ cartoon £1.99</small>" : ""}</div>
          <div class="basket-price">${money(i.price + (i.cartoon ? 1.99 : 0))}</div>
          <button type="button" class="basket-remove" data-id="${i.id}" aria-label="Remove">✕</button>
        </div>`).join("") : `<p class="cartoon-email-note">Your basket is empty.</p>`}
      ${items.length ? `
        <div class="basket-sum"><span>Subtotal</span><span>${money(sub)}</span></div>
        ${pct ? `<div class="basket-sum" style="color:#7ee2a0"><span>Bundle discount (${pct}%)</span><span>−${money(disc)}</span></div>` : ""}
        <div class="basket-sum"><span>UK delivery</span><span>FREE</span></div>
        <div class="basket-sum basket-total"><span>Total</span><span>${money(sub - disc)}</span></div>
        ${pct ? `<p class="cartoon-email-note" style="font-size:0.8rem">Your bundle discount is applied instead of promo codes.</p>` : ""}
        ${nextPct > pct ? `<p class="cartoon-email-note" style="color:#F3D078;font-weight:700">Add ${items.length === 1 ? "1 more gift to save 10%" : "1 more gift to save 15%"} 🎁</p>` : ""}
        <button class="cartoon-btn-primary" id="basketCheckout" style="width:100%;margin-top:0.6rem">Checkout securely →</button>
        <div id="basketStatus" class="cartoon-email-note" style="min-height:1.2em;margin-top:0.4rem"></div>` : ""}
      <button class="cartoon-btn-secondary" id="basketMore" style="width:100%;margin-top:0.5rem">Keep shopping</button>
    </div>`;
  document.body.appendChild(panel);
  panel.addEventListener("click", e => { if (e.target === panel) panel.remove(); });
  panel.querySelector("#basketMore").onclick = () => { panel.remove(); if (!window.PAGE) location.href = "/tiktok"; };
  panel.querySelectorAll(".basket-remove").forEach(b => b.onclick = async () => { await ONJJEM_Basket.remove(b.dataset.id); ONJJEM_openBasket(); });
  const go = panel.querySelector("#basketCheckout");
  if (go) go.onclick = async () => {
    const st = panel.querySelector("#basketStatus");
    go.disabled = true; st.textContent = "Taking you to secure checkout…";
    onjjemGa("event", "begin_checkout", { currency: "GBP", value: sub - disc, items: items.map(i => ({ item_id: i.sku, item_name: i.name, price: i.price })) });
    try {
      const res = await fetch(`${API_BASE}/api/stripe/cart-checkout`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ sku: i.sku, photoBase64: i.photo, cartoon: !!i.cartoon })),
          successUrl: location.origin + "/?order=success&basket=1&session_id={CHECKOUT_SESSION_ID}",
          cancelUrl: location.href.split("#")[0]
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) { location.href = data.url; return; }
      throw new Error(data.error || "checkout didn't start");
    } catch (err) {
      go.disabled = false;
      st.style.color = "#ffb4a8";
      st.textContent = "Sorry, checkout didn't start (" + (err.message || "connection problem") + "). Please try again or email hello@onjjem.com.";
    }
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const q = new URLSearchParams(location.search);
  if (q.get("order") === "success" && q.get("basket") === "1") await ONJJEM_Basket.clear();
  ONJJEM_updateBasketButton(await ONJJEM_Basket.load());
});

if (window.PAGE) {
  document.addEventListener("DOMContentLoaded", () => ONJJEM_renderLanding(window.PAGE));
}
