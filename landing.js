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
  active: true,
  code: "XMAS15",
  headline: "🎄 Early Christmas offer: 15% off everything",
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
        <div class="step"><div class="step-num">1</div><div><h3>Pick your photo</h3><p>Any photo from your phone — pets, kids, family, anything.</p></div></div>
        <div class="step"><div class="step-num">2</div><div><h3>${P.cartoon ? "Cartoon it (optional)" : "Choose your option"}</h3><p>${P.cartoon ? "See a free preview of your photo as a cartoon. Add it for £1.99, or keep the original." : "Pick the size or style you want."}</p></div></div>
        <div class="step"><div class="step-num">3</div><div><h3>We make it &amp; post it</h3><p>Printed to order in the UK and sent with free tracked delivery.</p></div></div>
      </div>
    </section>

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

        <span class="order-label">2. Add your photo${opts.some(o => o.multi) ? "s" : ""}</span>
        <input type="file" id="photoInput" accept="image/*" style="display:none">
        <div class="upload" id="uploadBox" role="button" tabindex="0"></div>

        <div class="order-total"><span>Total <small style="color:var(--muted)">(free UK delivery)</small></span><strong id="total">${money(opts[selected].price)}</strong></div>
        <button class="btn" id="buyBtn">${P.cartoon ? "Continue — preview & checkout" : "Continue to secure checkout"}</button>
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

  async function refreshPhoto() {
    if (!photos.length) { photo = null; box.classList.remove("has-photo"); box.innerHTML = emptyBox(); return; }
    if (isMulti() && photos.length > 1) {
      box.innerHTML = `<div class="u-text">Building your collage…</div>`;
      photo = await ONJJEM_buildCollage(photos.slice(0, opts[selected].multi));
    } else {
      photo = photos[0];
    }
    const n = isMulti() ? Math.min(photos.length, opts[selected].multi) : 1;
    box.classList.add("has-photo");
    box.innerHTML = `<img class="u-preview" src="${photo}" alt="Your photo"><div class="u-text">✓ ${n > 1 ? n + " photos added" : "Photo added"}</div><div class="u-hint">Tap to change</div>`;
  }

  optionEls.forEach(el => el.addEventListener("click", async () => {
    const wasMulti = isMulti();
    selected = Number(el.dataset.i);
    optionEls.forEach(e => e.classList.toggle("selected", e === el));
    el.querySelector("input").checked = true;
    document.getElementById("total").textContent = money(opts[selected].price);
    input.multiple = isMulti();
    if (wasMulti !== isMulti()) await refreshPhoto();
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
      await refreshPhoto();
      input.value = "";
      onjjemGa("event", "add_to_cart", { currency: "GBP", value: opts[selected].price, items: [{ item_id: opts[selected].sku, item_name: opts[selected].name, price: opts[selected].price }] });
    } catch (err) {
      photos = []; await refreshPhoto();
      status.textContent = err.message;
    }
  });

  // Buy
  const buyBtn = document.getElementById("buyBtn");
  buyBtn.addEventListener("click", () => {
    if (!photo) { status.textContent = "Please add your photo first 📸"; box.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    status.textContent = "";
    const collage = isMulti() && photos.length > 1; // cartoons are for single photos
    if (P.cartoon && !collage && typeof ONJJEM_showPhotoPreview === "function") {
      ONJJEM_showPhotoPreview(photo, cartoonOpts => checkout(cartoonOpts));
    } else {
      checkout(null);
    }
  });

  async function checkout(cartoonOpts) {
    const o = opts[selected];
    buyBtn.disabled = true;
    status.style.color = "var(--muted)";
    status.textContent = "Taking you to secure checkout…";
    onjjemGa("event", "begin_checkout", { currency: "GBP", value: o.price, items: [{ item_id: o.sku, item_name: o.name, price: o.price }] });
    try {
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({
          sku: o.sku,
          photoBase64: photo,
          successUrl: window.location.origin + "/?order=success&session_id={CHECKOUT_SESSION_ID}",
          cancelUrl: window.location.href.split("#")[0] + "#order"
        }, cartoonOpts || {}))
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) { window.location.href = data.url; return; }
      throw new Error(data.error || "Checkout didn't start");
    } catch (err) {
      buyBtn.disabled = false;
      status.style.color = "#ffb4a8";
      status.textContent = "Sorry — something went wrong. Please try again, or email hello@onjjem.com and we'll sort it.";
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

if (window.PAGE) {
  document.addEventListener("DOMContentLoaded", () => ONJJEM_renderLanding(window.PAGE));
}
