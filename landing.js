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
  { name: "W Taylor", bought: "Cartoon prints", text: "My cartoon style prints of my kids arrived in just 3 days, and the colours look brilliant. Will definitely buy again! Thanks ONJJEM" },
  { name: "Kelly W.", bought: "Photo print", text: "I purchased a print of my children — fantastic quality, great value and super fast delivery. Will definitely be using ONJJEM again." },
  { name: "Niamh", bought: "Colour-changing mug", text: "Love the mug I ordered. Such a cute design and the heat-activated effect works perfectly. Really happy with it!" }
];
// ─────────────────────────────────────────────────────────────────────────────


// ── "About this item" facts, by SKU prefix (from Prodigi's product lists) ──
const ONJJEM_CLOTHES_CARE = "Wash inside out on cold, tumble dry low, and don't iron over the print.";
const ONJJEM_DETAILS = [
  ["tote-canvas", ["Strong canvas tote bag, 36×47cm", "Your picture is printed on the front", "Made in the UK, tracked delivery"]],
  ["trick-bag", ["Light woven tote bag, 42×37cm, with long 65cm handles", "Your picture is printed on the front", "Big enough for a whole night of trick-or-treating", "Made in the UK, tracked delivery"]],
  ["US-TOTE", ["17×18″ woven tote bag: your picture is woven into the fabric", "Lined, with double-stitched seams and cotton webbing straps", "The picture shows on both sides", "Made in the USA"]],
  ["US-KTEE", ["Gildan Softstyle youth T-shirt", "100% ring-spun cotton: soft and light (Sport Grey has a little polyester)", "Your photo or cartoon is printed on the front in full color", "Youth sizes: XS fits about 4–5, S 6–8, M 10–12, L 14–16, XL 18–20", ONJJEM_CLOTHES_CARE]],
  ["US-TTEE", ["Rabbit Skins toddler T-shirt", "100% combed ring-spun cotton, soft on little ones' skin", "Printed on the front in full color", "Sizes 2T to 5/6", ONJJEM_CLOTHES_CARE]],
  ["US-BTEE", ["Rabbit Skins baby T-shirt", "100% combed ring-spun cotton", "Envelope shoulders for easy on and off", "Printed on the front in full color", ONJJEM_CLOTHES_CARE]],
  ["US-ATEE", ["District classic unisex T-shirt", "100% ring-spun cotton, soft and light (heather colors are a cotton mix)", "Printed on the front in full color", "True to size. If you're between sizes, go up one", ONJJEM_CLOTHES_CARE]],
  ["US-AHOOD", ["Gildan Heavy Blend pullover hoodie", "50% cotton, 50% polyester fleece: warm and cozy", "Double-lined hood with drawstring, front pouch pocket, ribbed cuffs and waistband", "Classic unisex fit. If you're between sizes, go up one", "Printed on the front in full color", ONJJEM_CLOTHES_CARE]],
  ["US-KHOOD", ["Gildan Heavy Blend youth pullover hoodie", "50% cotton, 50% polyester fleece: warm and cozy", "Hood, front pouch pocket, ribbed cuffs and waistband", "Youth sizes: S fits about 6–8, M 10–12, L 14–16, XL 18–20", "Printed on the front in full color", ONJJEM_CLOTHES_CARE]],
  ["US-KSWEAT", ["Gildan Heavy Blend youth crew-neck sweatshirt", "50% cotton, 50% polyester fleece: warm and cozy", "Ribbed collar, cuffs and waistband", "Youth sizes: XS fits about 4–5, S 6–8, M 10–12, L 14–16, XL 18–20", "Printed on the front in full color", ONJJEM_CLOTHES_CARE]],
  ["XSWEAT-AD", ["AWDis crew-neck sweatshirt", "80% cotton, 20% polyester with a soft brushed fleece inside", "Ribbed collar, cuffs and waistband", "Unisex fit, S to 2XL", "Printed on the front in full colour", ONJJEM_CLOTHES_CARE]],
  ["XSWEAT-KD", ["AWDis kids' crew-neck sweatshirt", "80% cotton, 20% polyester with a soft brushed fleece inside", "Ribbed collar, cuffs and waistband", "Ages 3–4 up to 12–13", "Printed on the front in full colour", ONJJEM_CLOTHES_CARE]],
  ["TEE-STTK184", ["Stanley/Stella kids' T-shirt", "100% organic ring-spun cotton", "Printed on the front in full colour", "Ages 3–4 up to 12–14", ONJJEM_CLOTHES_CARE]],
  ["US-MUG", ["White ceramic mug: 11oz, or 15oz for the big one", "Your picture wraps around the mug in full color", "Hand wash to keep the colors bright for longest"]],
  ["US-TUMB20", ["20oz (600ml) copper-lined, vacuum-insulated stainless steel tumbler", "Comes with a stainless steel straw", "Keeps drinks cold or hot for hours", "Your picture is printed around the tumbler", "Hand wash only"]],
  ["US-TUMB22", ["22oz (650ml) vacuum-insulated stainless steel tumbler", "Keeps drinks cold or hot for hours", "Your picture is printed around the tumbler", "Hand wash only"]],
  ["US-BOTTLE32", ["32oz (950ml) vacuum-insulated water bottle", "Keeps drinks cold for hours", "Your picture is printed around the bottle", "Hand wash only"]],
  ["US-BLANKET", ["Premium soft fleece throw blanket", "Your picture is printed edge to edge on the front", "Machine wash cold, gentle cycle, tumble dry low"]],
  ["US-SPREAD", ["Quilted polyester bedspread with a chevron stitch pattern", "Your picture is printed across the top, with a gray back and hemmed edges", "Machine wash cold, gentle cycle, tumble dry low"]],
  ["US-CURTAIN-LINER", ["71×74″ polyester shower curtain with 12 button holes for hooks", "Comes with a waterproof PVC liner", "Hooks not included"]],
  ["US-CURTAIN", ["71×74″ polyester shower curtain with 12 button holes for hooks", "Use with a liner (or choose the version with a liner included)", "Hooks not included"]],
  ["US-PILLOWCASE", ["Standard size 30×22″ pillowcase", "Soft microfiber: your picture on the front, brushed taupe back", "Machine wash cold"]],
  ["US-CANDLE", ["11oz apothecary-style glass jar candle", "Two scents: Ocean Mist & Moss, or White Tea & Fig", "Your picture is printed on the label"]],
  ["US-CLOCK", ["10″ round wall clock with a wooden frame (black, white or natural)", "Your picture is the clock face, with black hands"]],
  ["US-PRINT", ["Archival professional photo paper with a luster finish", "Ships flat and unframed, ready for your frame"]],
  ["US-POSTER", ["Enhanced matte art paper, 200gsm", "Ships unframed"]],
  ["US-MOUSEMAT", ["8×10″ mouse mat", "Anti-slip base, smooth printed top"]],
  ["US-GOLF", ["Pack of 6 standard golf balls", "The same picture printed on each ball"]],
  ["US-PADDLE", ["Pickleball paddle (the set has two)", "Your picture is printed on the paddle face"]],
];
function ONJJEM_detailsFor(sku) {
  const hit = ONJJEM_DETAILS.find(([p]) => String(sku || "").startsWith(p));
  return hit ? hit[1] : null;
}

function onjjemGa() { if (typeof gtag === "function") { try { gtag.apply(null, arguments); } catch (e) {} } }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
// US shop pages set window.ONJJEM_REGION = "us" before loading this file.
// Phones and tablets get "from my phone"; laptops and desktops get "from my computer".
function ONJJEM_pickLabel() { const touch = window.matchMedia && matchMedia("(pointer: coarse)").matches; return touch ? "📷 Choose from my phone" : "🖼️ Choose a photo from my computer"; }
function ONJJEM_isUS() { return window.ONJJEM_REGION === "us"; }
function money(p) { return (ONJJEM_isUS() ? "$" : "£") + Number(p).toFixed(2); }
function ONJJEM_cur() { return ONJJEM_isUS() ? "USD" : "GBP"; }
function ONJJEM_home() { return ONJJEM_isUS() ? "/us/" : "/"; }
function ONJJEM_deliveryWord() { return ONJJEM_isUS() ? "free US shipping" : "free UK delivery"; }
// The cartoon is free in the US shop and on Christmas sweatshirts.
function ONJJEM_cartoonFee(sku, item) { return ONJJEM_isUS() || String(sku || "").startsWith("XSWEAT-") || (item && item.cartoonFree) || (!item && window.ONJJEM_CARTOON_FREE) ? 0 : 1.99; }

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
          <div class="who">${esc(r.name)} · ${esc(r.bought)}${ONJJEM_isUS() ? " · 🇬🇧 UK customer" : ""}</div>
        </div>`).join("")}
    </div>
  </section>`;
}


// ── Halloween decorations (cobwebs + dangling spiders), until 1 November ──
function ONJJEM_spookyHtml() {
  if (new Date() >= new Date("2026-11-01T00:00:00")) return "";
  const web = (cls) => `<svg class="hw-web ${cls}" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="rgba(240,240,240,0.8)" stroke-width="1.1">
    <path d="M0 0L100 8M0 0L88 40M0 0L60 70M0 0L32 92M0 0L8 100"/>
    <path d="M22 2Q19 9 20 18Q13 16 7 21Q5 13 2 22"/><path d="M45 4Q40 18 40 34Q27 33 15 42Q11 27 4 45"/>
    <path d="M70 6Q62 26 61 50Q42 50 24 64Q17 44 6 68"/><path d="M95 8Q85 34 82 63Q57 64 31 87Q23 62 8 92"/></g></svg>`;
  const spider = (cls) => `<span class="hw-spider ${cls}" aria-hidden="true"><i></i><svg viewBox="0 0 40 40"><g stroke="#1a1a1a" stroke-width="2.4" fill="none" stroke-linecap="round">
    <path d="M14 18L5 12L2 4M14 21L4 20L1 26M15 24L6 29L5 37M26 18L35 12L38 4M26 21L36 20L39 26M25 24L34 29L35 37"/></g>
    <ellipse cx="20" cy="22" rx="8" ry="9" fill="#111"/><circle cx="20" cy="12" r="5.5" fill="#111"/>
    <circle cx="17.8" cy="11.3" r="1.5" fill="#ff8a1c"/><circle cx="22.2" cy="11.3" r="1.5" fill="#ff8a1c"/></svg></span>`;
  return web("hw-web-l") + web("hw-web-r") + spider("hw-sp1") + spider("hw-sp2");
}
// ── Gift search: live suggestions from the first few letters ("mag" → magnets) ──
const ONJJEM_GIFTS_UK = [
  ["Fridge magnets", "/magnets", "magnet fridge photo grid acrylic"],
  ["✨ Magic Reveal mug (colour-changing)", "/mug", "mug cup magic colour color changing heat reveal tea coffee"],
  ["Photo mugs", "/mug", "mug cup tea coffee photo 11oz 15oz"],
  ["Luxury photo throws (fleece blankets)", "/blanket", "blanket throw fleece sofa bed cosy"],
  ["Scenic fine art prints", "/scenic-prints", "print poster scenery landscape fine art wall art santorini highlands amalfi"],
  ["Giant posters & wall stickers", "/poster-sale", "poster giant wall sticker decal a1 a2 a3"],
  ["Photo prints & postcards", "/prints", "print photo postcard 6x4 frame"],
  ["Peel & Go photo frames", "/photo-tiles", "frame tile peel stick wall photo"],
  ["Cushions", "/cushions", "cushion pillow sofa"],
  ["Towels", "/cushions", "towel beach bath"],
  ["Photo tote bags", "/tote", "tote bag shopping canvas"],
  ["Baby reveal mug (it's a boy / girl)", "/baby-reveal", "baby gender reveal pregnancy announcement mug"],
  ["Photo mouse mats", "/mousemat", "mouse mat mousepad desk computer"],
  ["Coasters, tea towels & aprons", "/household.html", "coaster tea towel apron kitchen"],
  ["Photo water bottles", "/water-bottle", "water bottle flask drink steel"],
  ["Halloween cartoon gifts", "/halloween", "halloween spooky witch pumpkin costume trick treat"],
  ["Kids football tees", "/football", "football soccer kit shirt kids"],
  ["Kids t-shirts, jigsaws & cards", "/kids.html", "kids children tshirt tee shirt jigsaw puzzle card"],
  ["Cartoon stickers", "/stickers", "sticker cartoon decal"],
  ["Photo pin badges", "/badges", "badge pin button"],
  ["Photo tattoos & iron-on patches", "/frames-gifts.html", "tattoo patch iron on"],
  ["Christmas sweatshirts", "/christmas-sweatshirt", "christmas xmas jumper sweatshirt family"],
  ["Christmas baubles & Santa sacks", "/christmas", "christmas xmas bauble santa sack stocking ornament"],
  ["Your dog on a Christmas bauble", "/bauble", "bauble dog pet ornament christmas tree"],
  ["Gift cards", "/gift-cards.html", "gift card voucher present"]
];
const ONJJEM_GIFTS_US = [
  ["Wall tapestries (scenery or your photo)", "/us/tapestry", "tapestry wall hanging scenery landscape santorini alps"],
  ["Photo fleece blankets", "/us/blanket", "blanket throw fleece cozy"],
  ["Photo bedspreads", "/us/bedspread", "bedspread bed cover quilt twin queen king"],
  ["Shower curtains", "/us/shower-curtain", "shower curtain bathroom beach"],
  ["Woven photo tote bags", "/us/tote", "tote bag shopping"],
  ["Photo wall clocks", "/us/clock", "clock wall time"],
  ["Photo candles", "/us/candle", "candle jar scented"],
  ["Photo prints & giant posters", "/us/prints", "print poster photo wall art"],
  ["Photo mugs", "/us/mug", "mug cup coffee tea"],
  ["Tumblers & water bottles", "/us/tumbler", "tumbler bottle water drink straw"],
  ["Photo mouse mats", "/us/mousemat", "mouse mat mousepad desk"],
  ["Halloween T-shirts & gifts", "/us/halloween", "halloween spooky witch pumpkin costume trick treat"],
  ["Trick-or-treat pillowcase", "/us/pillowcase", "pillowcase pillow candy trick treat"],
  ["Photo T-shirts & hoodies", "/us/tshirts", "tshirt tee shirt hoodie kids baby adult"],
  ["Photo golf balls", "/us/golf", "golf ball"],
  ["Photo pickleball paddles", "/us/pickleball", "pickleball paddle"],
  ["Family Christmas sweatshirts & hoodies", "/us/christmas", "christmas xmas sweatshirt hoodie family"]
];
function ONJJEM_searchHtml() {
  return `<form class="l-search" role="search" onsubmit="return ONJJEM_search(event)"><input id="gsearch" type="search" placeholder="Search gifts: mug, blanket, tote…" autocomplete="off" enterkeyhint="search" aria-label="Search gifts" oninput="ONJJEM_search(event)" onfocus="ONJJEM_search(event)"><div id="gsuggest" class="l-suggest" role="listbox"></div></form>`;
}
(function () {
  const norm = x => String(x || "").toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9 ]/g, " ");
  const compact = x => norm(x).replace(/ /g, "");
  // One typo allowed in longer words ("magents" → magnets).
  const near = (a, b) => {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++e > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else if (a[i + 1] === b[j] && a[i] === b[j + 1]) { i += 2; j += 2; } else { i++; j++; }
    }
    return e + (a.length - i) + (b.length - j) <= 1;
  };
  const wordScore = (q, words) => {
    let best = 0;
    for (const w of words) {
      if (w === q) return 3;
      if (w.startsWith(q)) best = Math.max(best, 2);
      else if (q.length >= 4 && (w.includes(q) || near(q, w.slice(0, q.length)) || near(q, w))) best = Math.max(best, 1);
    }
    return best;
  };
  const rank = (raw) => {
    const qs = norm(raw).split(/\s+/).filter(Boolean);
    if (!qs.length) return [];
    const list = ONJJEM_isUS() ? ONJJEM_GIFTS_US : ONJJEM_GIFTS_UK;
    return list.map(([name, url, kw], i) => {
      const words = norm(name + " " + kw).split(/\s+/).filter(Boolean);
      let total = 0;
      for (const q of qs) { const s = wordScore(q, words); if (!s) return null; total += s; }
      if (norm(name).split(/\s+/).some(w => w.startsWith(qs[0]))) total += 1;
      return { name, url, total, i };
    }).filter(Boolean).sort((a, b) => b.total - a.total || a.i - b.i);
  };
  window.ONJJEM_search = function (ev) {
    const input = document.getElementById("gsearch");
    const box = document.getElementById("gsuggest");
    const raw = input ? input.value.trim() : "";
    const hits = rank(raw);
    if (ev && ev.type === "submit") {
      if (ev.preventDefault) ev.preventDefault();
      if (hits.length) { location.href = hits[0].url; return false; }
    }
    if (box) {
      box.innerHTML = !raw ? "" : hits.length
        ? hits.slice(0, 6).map(h => `<a href="${h.url}" role="option">${esc(h.name)}</a>`).join("")
        : `<div class="l-suggest-none">No match. Try mug, blanket, print or tote, or email hello@onjjem.com</div>`;
      box.style.display = raw ? "block" : "none";
    }
    // On the homepage, also narrow the tiles to what matches.
    const tiles = document.querySelectorAll(".home-sec .tile");
    if (tiles.length) {
      const urls = new Set(hits.map(h => h.url.replace(/\.html$/, "")));
      tiles.forEach(t => { const href = (t.getAttribute("href") || "").replace(/\.html$/, "").split("#")[0]; t.style.display = !raw || urls.has(href) ? "" : "none"; });
      document.querySelectorAll(".home-sec").forEach(sec => { sec.style.display = !raw || [...sec.querySelectorAll(".tile")].some(t => t.style.display !== "none") ? "" : "none"; });
    }
    return false;
  };
  document.addEventListener("click", e => { const b = document.getElementById("gsuggest"); if (b && !e.target.closest(".l-search")) b.style.display = "none"; });
  window.addEventListener("DOMContentLoaded", () => {
    const q = new URLSearchParams(location.search).get("q");
    if (q) setTimeout(() => { const i = document.getElementById("gsearch"); if (i) { i.value = q; ONJJEM_search({ type: "input" }); } }, 50);
  });
})();
function ONJJEM_headerHtml() {
  if (ONJJEM_isUS()) return `
  ${ONJJEM_offerBarHtml()}
  <header class="l-header">${ONJJEM_spookyHtml()}
    <a href="/us/" class="l-logo">ONJJEM</a>
    <nav class="l-nav"><a href="/?uk=1" class="region-pill" title="Go to the UK shop"><img src="/flag-uk.svg" alt="" width="26" height="13">UK<span class="rp-word"> shop</span></a></nav>
    ${ONJJEM_searchHtml()}
  </header>
  <nav class="cat-bar" aria-label="Gift categories">
    <a href="/us/#cat-tapestries">🏔️ Tapestries</a><a href="/us/#cat-home">🛋️ Blankets &amp; home</a><a href="/us/#cat-walls">📸 Prints &amp; posters</a><a href="/us/halloween">🎃 Halloween</a><a href="/us/#cat-clothing">T-shirts &amp; hoodies</a><a href="/us/#cat-sports">Golf &amp; pickleball</a><a href="/us/#cat-christmas">🎄 Christmas</a>
  </nav>`;
  return `
  ${ONJJEM_offerBarHtml()}
  <header class="l-header">${ONJJEM_spookyHtml()}
    <a href="/" class="l-logo">ONJJEM</a>
    <nav class="l-nav"><a href="/us/" class="region-pill" title="Go to the US shop"><img src="/flag-us.svg" alt="" width="25" height="13">US<span class="rp-word"> shop</span></a></nav>
    ${ONJJEM_searchHtml()}
  </header>
  <nav class="cat-bar" aria-label="Gift categories">
    <a href="/#cat-walls">🛋️ Blankets &amp; wall art</a><a href="/#cat-home">For the home &amp; desk</a><a href="/halloween">🎃 Halloween</a><a href="/#cat-kids">Kids &amp; small gifts</a><a href="/#cat-christmas">🎄 Christmas</a><a href="/gift-cards.html">Gift cards</a>
  </nav>`;
}

function ONJJEM_footerHtml() {
  if (ONJJEM_isUS()) return `
  <footer class="l-footer">
    <p style="margin-bottom:0.5rem">Personalized gifts, made to order in the USA · <a href="mailto:hello@onjjem.com">hello@onjjem.com</a></p>
<p class="l-social" style="margin:0.4rem 0 0.7rem"><a href="https://www.tiktok.com/@onjjem123" target="_blank" rel="noopener">▶ Watch us on TikTok</a><a href="https://www.instagram.com/onjjemgifts" target="_blank" rel="noopener">📸 Instagram</a></p>
    <a href="/us/shipping">Shipping</a><a href="/terms.html">Terms</a><a href="/privacy.html">Privacy</a><a href="/?uk=1">🇬🇧 UK shop</a>
  </footer>`;
  return `
  <footer class="l-footer">
    <p style="margin-bottom:0.5rem">Personalised gifts, handmade to order in the UK · <a href="mailto:hello@onjjem.com">hello@onjjem.com</a></p>
<p class="l-social" style="margin:0.4rem 0 0.7rem"><a href="https://www.tiktok.com/@onjjem123" target="_blank" rel="noopener">▶ Watch us on TikTok</a><a href="https://www.instagram.com/onjjemgifts" target="_blank" rel="noopener">📸 Instagram</a></p>
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
      const cs0 = (window.PAGE && window.PAGE.captionStyle) || {};
      const below = !!(window.PAGE && window.PAGE.captionBelow);
      const c = document.createElement("canvas");
      c.width = img.width; c.height = below ? Math.round(img.height * 1.28) : img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const W = c.width, H = c.height;
      const maxW = W * 0.86;
      const words = text.split(/\s+/);
      const cs = (window.PAGE && window.PAGE.captionStyle) || {};
      let size = Math.round(Math.min(W, H) * (cs.scale || 0.13)), lines = [];
      for (; size > 12; size -= 2) {
        ctx.font = cs.font ? cs.font.replace("{size}", size) : `900 ${size}px -apple-system, 'Helvetica Neue', Impact, Arial, sans-serif`;
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
      ctx.strokeStyle = cs.stroke || "rgba(0,0,0,0.9)"; ctx.fillStyle = cs.fill || "#ffffff";
      const lh = size * 1.15, margin = Math.min(W, H) * 0.12;
      const block = lines.length * lh;
      const top = below ? img.height + (H - img.height - block) / 2 + lh / 2 : (pos === "top" ? margin + lh / 2 : H - margin - block + lh / 2);
      lines.forEach((l, i) => { const y = top + i * lh; ctx.strokeText(l, W / 2, y); ctx.fillText(l, W / 2, y); });
      const png = below || /^data:image\/png/.test(dataUrl) || /\.png($|\?)/.test(dataUrl);
      resolve(png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.93));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function ONJJEM_loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
// Centre-crop a picture to an exact shape (w:h) so what they see is what prints.
// Turn an image link (e.g. one of our ready-made designs) into image data.
async function ONJJEM_inlineImage(src) {
  const img = await ONJJEM_loadImg(src);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
  c.getContext("2d").drawImage(img, 0, 0);
  return /\.png($|\?)/i.test(src) ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.93);
}
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
  const seamless = window.PAGE && window.PAGE.wrapSeamless;
  if (seamless) {
    // Designs with a plain background: stretch the design's own edge colours
    // across the gaps, so the two copies sit on one continuous background.
    ctx.drawImage(img, 0, 0, Math.max(2, img.width * 0.03), img.height, 0, 0, W, H);
    ctx.filter = "blur(30px)"; ctx.drawImage(c, 0, 0); ctx.filter = "none";
  } else {
    ctx.filter = "blur(40px) brightness(0.9)";
    ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
    ctx.filter = "none";
  }
  const ph = H * (seamless ? 1 : 0.9), pw = Math.min(ph * img.width / img.height, W * (seamless ? 0.5 : 0.46));
  const fh = pw * img.height / img.width;
  const slots = pw * 2 <= W * 0.96 ? [0.25, 0.75] : [0.5];
  for (const f of slots) {
    ctx.save(); if (!seamless) { ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 24; }
    ctx.drawImage(img, W * f - pw / 2, (H - fh) / 2, pw, fh); ctx.restore();
  }
  return c.toDataURL("image/jpeg", 0.93);
}

function ONJJEM_printAnythingHtml() {
  const items = [
    ["📸", "Photos", "Family, friends, holidays"],
    ["🐶", "Pets", "Dogs, cats, even the hamster"],
    ["🖍️", "Kids' drawings", "Snap a photo of their artwork"],
    ["🎨", "Cartoons", "We turn your photo into one"],
    ["📱", "Screenshots", "A funny message or a sweet text"]
  ];
  return `
  <section class="l-section wrap">
    <h2>Print <span class="gold">anything</span></h2>
    <p style="text-align:center;color:var(--muted);margin:-0.4rem auto 1rem;max-width:520px">If it's on your phone or computer, we can print it.</p>
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
  let early = null; // instant free cartoon made straight after upload: { forPhoto, previewId, previewSrc }

  const fromPrice = Math.min(...opts.map(o => o.price));

  app.innerHTML = `
  ${ONJJEM_headerHtml()}
  <main>
    <section class="wrap l-hero">
      ${P.cartoon && window.ONJJEM_CARTOON_STYLE ? `<div class="quick-cta"><button type="button" class="btn quick-cta-btn" id="quickCartoonBtn">${window.ONJJEM_CARTOON_STYLE === "christmas" ? "🎄 See YOUR Christmas cartoon FREE" : "🎃 See YOUR Halloween cartoon FREE"}</button><div class="quick-cta-sub">Pick a photo of your kids, family or pet. Ready in seconds, nothing to pay.</div></div>` : ""}
      <div class="l-hero-img"><img src="${P.heroImg}" alt="${esc(P.heroAlt || P.title)}"></div>
      <div>
        <div class="l-kicker">${esc(P.kicker)}</div>
        <h1>${esc(P.title)}</h1>
        <p class="sub">${esc(P.sub)}</p>
        <div class="l-price">${opts.length > 1 ? "From " : ""}${money(fromPrice)} <small>· ${ONJJEM_deliveryWord()}</small></div>
        <ul class="l-ticks">${P.ticks.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
        <a href="#order" class="btn">${esc(P.cta || "Create yours now")}</a>
      </div>
    </section>

    <section class="l-section wrap">
      <h2>How it works</h2>
      <div class="steps">
        <div class="step"><div class="step-num">1</div><div><h3>Pick a photo</h3><p>Kids, family, couples, pets or a child's drawing.</p></div></div>
        <div class="step"><div class="step-num">2</div><div><h3>${P.cartoon ? "Cartoon it (optional)" : "Choose your option"}</h3><p>${P.cartoon ? (ONJJEM_isUS() || window.ONJJEM_CARTOON_FREE ? "See your photo as a cartoon. It's FREE, or keep the original." : "See a free preview of your photo as a cartoon. Add it for £1.99, or keep the original.") : "Pick the size or style you want."}</p></div></div>
        <div class="step"><div class="step-num">3</div><div><h3>We make it &amp; post it</h3><p>${ONJJEM_isUS() ? "Printed to order in the USA and shipped free." : "Printed to order in the UK and sent with free delivery."}</p></div></div>
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
        <div id="variantWrap" style="display:none;margin:0.7rem 0 0.9rem">
          <span id="variantLabel" style="font-weight:700;display:block;margin-bottom:0.35rem">👕 Choose ${esc(P.variantWord || "the T-shirt")} size &amp; colour</span>
          <div style="display:flex;gap:0.5rem">
          <select id="sizeSel" aria-label="Size" style="flex:1;padding:0.75rem;border-radius:10px;border:1px solid #555;background:#1f1f1f;color:#fff;font-size:1rem"></select>
          <select id="colourSel" aria-label="Colour / color" style="flex:1;padding:0.75rem;border-radius:10px;border:1px solid #555;background:#1f1f1f;color:#fff;font-size:1rem"></select>
          </div>
        </div>

        <span class="order-label">2. ${P.photoLabel ? esc(P.photoLabel) : "Add your photo" + (opts.some(o => o.multi) ? "s" : "")}</span>
        <input type="file" id="photoInput" accept="image/*" style="display:none">
        ${P.makerHtml ? `<div id="makerWrap">${P.makerHtml}</div>` : ""}
        <div class="upload" id="uploadBox" role="button" tabindex="0"${P.designsOnly ? ' style="display:none"' : ""}></div>
        ${P.designs ? `<div id="designWrap" style="display:none;margin-top:0.9rem">
          <span style="font-weight:700;display:block;margin-bottom:0.45rem">${esc(P.designsLabel || "…or pick one of our designs 👇")}</span>
          <div class="design-grid">${P.designs.map((d, i) => `<button type="button" class="design-tile" data-d="${i}"><img src="${d.thumb}" alt="${esc(d.name)}" loading="lazy"${P.designAspect ? ` style="aspect-ratio:${P.designAspect}"` : ""}><span>${esc(d.name)}</span></button>`).join("")}</div>
        </div>` : ""}
        <div id="orientWrap" style="display:none;margin-top:0.7rem">
          <span style="font-weight:700;display:block;margin-bottom:0.35rem">Which way round?</span>
          <div style="display:flex;gap:0.4rem">
            <button type="button" class="btn btn-ghost orientBtn" data-o="portrait" style="padding:0.55rem;font-size:0.9rem">▯ Portrait (tall)</button>
            <button type="button" class="btn btn-ghost orientBtn" data-o="landscape" style="padding:0.55rem;font-size:0.9rem">▭ Landscape (wide)</button>
          </div>
        </div>
        <div id="captionWrap" style="display:none;margin-top:0.7rem">
          <label for="captionText" style="font-weight:700;display:block;margin-bottom:0.35rem">${esc(P.captionLabel || "Add funny words to your picture?")} <span style="color:var(--muted);font-weight:400">(optional)</span></label>
          <input id="captionText" maxlength="60" placeholder="${esc(P.captionPlaceholder || "e.g. Chief Treat Inspector 🐾")}" style="width:100%;padding:0.75rem;border-radius:10px;border:1px solid #555;background:#1f1f1f;color:#fff;font-size:1rem">
          <div style="display:${P.captionBelow ? "none" : "flex"};gap:0.4rem;margin-top:0.4rem">
            <button type="button" class="btn btn-ghost capPos" data-pos="bottom" style="padding:0.45rem;font-size:0.85rem;border-color:var(--gold)">Words at bottom</button>
            <button type="button" class="btn btn-ghost capPos" data-pos="top" style="padding:0.45rem;font-size:0.85rem">Words at top</button>
          </div>
        </div>

        <div class="order-total"><span>Total <small style="color:var(--muted)">(${ONJJEM_deliveryWord()})</small></span><strong id="total">${money(opts[selected].price)}</strong></div>
        <ul class="trust-line">
          <li>👀 You see your picture before you pay</li>
          <li>🔒 Secure payment by Stripe</li>
          <li>🚚 ${ONJJEM_isUS() ? "Free US shipping, made in the USA" : "Free UK delivery"}</li>
          <li>🛡️ Arrives damaged or misprinted? Free replacement</li>
        </ul>
        ${P.confirmText ? `<label class="ft-note" style="display:flex;gap:.5rem;align-items:flex-start;text-align:left;margin:0 0 .75rem;cursor:pointer"><input type="checkbox" id="confirmBox" style="margin-top:.2rem;flex:none;width:1.1rem;height:1.1rem"><span>${P.confirmText}</span></label>` : ""}
        <button class="btn" id="basketBtn">🧺 Add to basket</button>
        <button class="btn btn-ghost" id="buyBtn" style="margin-top:0.5rem">Buy just this one now →</button>
        <p class="order-note" style="margin-top:0.5rem">🎁 Bundle &amp; save: <strong>10% off 2 gifts</strong>, <strong>12% off 3 or more</strong>, applied automatically in your basket.</p>
        <div class="order-status" id="status"></div>
        ${ONJJEM_PROMO.active ? `<p class="order-note">Code <strong>${esc(ONJJEM_PROMO.code)}</strong> goes in at checkout</p>` : ""}
      </div>
    </section>

    ${ONJJEM_reviewsHtml()}

    <section class="l-section wrap" style="text-align:center"><a class="btn btn-ghost" href="/#gifts" style="max-width:420px">See all our gifts →</a></section>

    ${P.faq && P.faq.length ? `
    <section class="l-section wrap faq">
      <h2>Questions</h2>
      ${P.faq.map(f => `<details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join("")}
    </section>` : ""}
  </main>
  ${ONJJEM_footerHtml()}
  <div class="sticky-buy" id="stickyBuy"><a href="#order" class="btn">${P.stickyCta ? esc(P.stickyCta) : `${esc(P.cta || "Create yours now")} — ${opts.length > 1 ? "from " : ""}${money(fromPrice)}`}</a></div>
  `;

  // Pages can ask for the photo step first (it's the step that leads to the free preview).
  if (P.photoFirst !== false) {
    const ob = app.querySelector(".order-box");
    const [lab1, lab2] = ob.querySelectorAll(".order-label");
    const total = ob.querySelector(".order-total");
    const moving = [];
    for (let n = lab2; n && n !== total; n = n.nextSibling) moving.push(n);
    moving.forEach(n => ob.insertBefore(n, lab1));
    lab2.textContent = lab2.textContent.replace(/^2\./, "1.");
    lab1.textContent = lab1.textContent.replace(/^1\./, "2.");
    lab1.style.marginTop = "1rem";
  }

  // Option selection
  const optionEls = app.querySelectorAll(".option");
  // Size / colour choices for options that have them (e.g. T-shirts).
  const variantWrap = document.getElementById("variantWrap");
  const sizeSel = document.getElementById("sizeSel");
  const colourSel = document.getElementById("colourSel");
  // "About this item" box: what it's made of, fit, care. Options can carry details: [..].
  function renderDetails() {
    const o = opts[selected];
    let d = document.getElementById("optDetails");
    if (!d) { d = document.createElement("details"); d.id = "optDetails"; d.className = "opt-details"; if (opts.length <= 2) d.open = true; }
    const facts = o.details || ONJJEM_detailsFor(o.sku);
    if (!facts || !facts.length) { d.style.display = "none"; return; }
    const us = t => ONJJEM_isUS() ? String(t).replace(/colour/g, "color").replace(/Colour/g, "Color") : t;
    d.innerHTML = `<summary class="opt-details-title">About this item <span class="opt-more">tap to read</span></summary><ul>${facts.map(x => `<li>${esc(us(x))}</li>`).join("")}</ul>`;
    d.style.display = "block";
    const anchor = variantWrap.style.display === "block" ? variantWrap : app.querySelectorAll(".option")[selected];
    if (anchor) anchor.after(d);
  }
  function showVariants() { showVariantsInner(); renderDetails(); }
  function showVariantsInner() {
    const o = opts[selected];
    if (!o.skuPattern) { variantWrap.style.display = "none"; return; }
    const lbl = document.getElementById("variantLabel");
    if (!o.sizes) {
      sizeSel.style.display = "none"; sizeSel.innerHTML = "";
      if (lbl) lbl.textContent = P.colourLabel || ("🎨 Choose " + (P.variantWord || "the") + (ONJJEM_isUS() ? " color" : " colour"));
    } else {
      sizeSel.style.display = "";
      if (lbl) lbl.innerHTML = "👕 Choose " + esc(P.variantWord || "the T-shirt") + " size &amp; " + (ONJJEM_isUS() ? "color" : "colour");
    }
    if (o.sizes) sizeSel.innerHTML = `<option value="">Choose a size…</option>` + o.sizes.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("");
    colourSel.innerHTML = o.colours.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("");
    variantWrap.style.display = "block";
    const selEl = app.querySelectorAll(".option")[selected];
    if (selEl) selEl.after(variantWrap);
  }
  // The option as it will be ordered, with the chosen size and colour.
  function chosen() {
    const o = opts[selected];
    if (!o.skuPattern) return o;
    const colour = o.colours.find(x => x[0] === colourSel.value) || o.colours[0];
    if (!o.sizes) return Object.assign({}, o, { sku: o.skuPattern.replace("{colour}", colour[0]), name: `${o.name} (${colour[1]})` });
    const size = o.sizes.find(x => x[0] === sizeSel.value);
    if (!size) return null;
    return Object.assign({}, o, {
      sku: o.skuPattern.replace("{size}", size[0]).replace("{colour}", colour[0]),
      name: `${o.name} (${size[1]}, ${colour[1]})`
    });
  }
  showVariants();
  const input = document.getElementById("photoInput");
  const box = document.getElementById("uploadBox");
  const status = document.getElementById("status");
  // Show the picture on the chosen garment colour (colours entries can carry a hex as 3rd item).
  function applySwatch() {
    const o = opts[selected];
    const img = box.querySelector("img.u-preview");
    if (!o.colours || !o.colours[0][2]) { window.ONJJEM_THUMB_BG = null; if (img) img.style.background = ""; return; }
    const c = o.colours.find(x => x[0] === colourSel.value) || o.colours[0];
    window.ONJJEM_THUMB_BG = c[2];
    if (img) { img.style.background = c[2]; img.style.padding = "12px"; img.style.borderRadius = "12px"; }
  }
  colourSel.addEventListener("change", applySwatch);
  let photos = []; // every photo the customer picked (for collage options)
  const isMulti = () => !!opts[selected].multi;
  const emptyBox = () => `<div class="u-icon">📸</div><div class="u-text">${isMulti() ? "Add up to " + opts[selected].multi + " photos" : "Add your photo"}</div><div class="u-hint">${esc(isMulti() ? (opts[selected].multiHint || "Pick 1, 4 or 9 photos for a perfect grid.") : (P.photoHint || "Clear, bright photos print best."))}</div><span class="u-btn">${ONJJEM_pickLabel()}</span>${P.cartoon ? `<div class="u-free">✨ Free cartoon preview before you pay</div>` : ""}<div class="u-private">🔒 Your photo stays private. It's only used to make your gift.</div>`;

  let isTextDesign = false;
  let isPresetDesign = false; // one of our ready-made designs (no cartoon step)
  const designWrap = document.getElementById("designWrap");
  function showDesigns() {
    if (!designWrap) return;
    const on = !!opts[selected].designs;
    designWrap.style.display = on ? "block" : "none";
    // Our designs are only for the options that allow them (towels): drop a picked design otherwise.
    if (!on && isPresetDesign) {
      isPresetDesign = false; photos = [];
      designWrap.querySelectorAll(".design-tile").forEach(x => x.classList.remove("picked"));
      refreshPhoto();
    }
  }
  if (designWrap) designWrap.querySelectorAll(".design-tile").forEach(t => t.addEventListener("click", async () => {
    const d = P.designs[Number(t.dataset.d)];
    designWrap.querySelectorAll(".design-tile").forEach(x => x.classList.toggle("picked", x === t));
    status.textContent = "";
    box.innerHTML = `<div class="u-text">Loading ${esc(d.name)}…</div>`;
    photos = [d.img]; isTextDesign = false; isPresetDesign = true; orient = null;
    box.style.display = "";
    await refreshPhoto();
    onjjemGa("event", "select_content", { content_type: "design", item_id: d.name });
  }));
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
    // Ready-made designs are file links; always send the actual picture.
    if (forPrint && typeof out === "string" && !out.startsWith("data:")) out = await ONJJEM_inlineImage(out);
    return out;
  }
  document.querySelectorAll(".orientBtn").forEach(b => b.addEventListener("click", () => { orient = b.dataset.o; refreshPhoto(); }));

  async function refreshPhoto() {
    const o0 = opts[selected];
    orientWrap.style.display = photos.length && o0.orient && !o0.wrap && o0.ratio && o0.ratio[0] !== o0.ratio[1] ? "block" : "none";
    document.querySelectorAll(".orientBtn").forEach(x => x.style.borderColor = x.dataset.o === orient ? "var(--gold)" : "");
    if (!photos.length) document.getElementById("captionWrap").style.display = "none";
    if (!photos.length) { photo = null; box.classList.remove("has-photo"); box.innerHTML = emptyBox(); showCartoonBtn(); return; }
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
    const label = o1.wrap ? "This wraps around your " + (P.wrapWord || "mug") + " (your picture shows on both sides)" : (o1.ratio ? "This is exactly how it will print" : "Tap to change");
    box.innerHTML = `<img class="u-preview" src="${shown}" alt="Your photo" style="${o1.wrap ? "max-height:140px" : ""}${P.round ? ";border-radius:50%" : ""}"><div class="u-text">✓ ${isPresetDesign ? "Design chosen" : (n > 1 ? n + " photos added" : "Photo added")}</div><div class="u-hint">${label}${P.designsOnly || label === "Tap to change" ? "" : " · tap to change"}</div>`;
    applySwatch();
    showCartoonBtn();
  }

  // "See my FREE cartoon" straight after upload, before any buying.
  let cartoonBtn = null;
  const earlyOk = () => !!(early && photo && early.forPhoto === photos[0] && !isTextDesign && !isPresetDesign && !(isMulti() && photos.length > 1));
  function showCartoonBtn() {
    if (!P.cartoon || typeof ONJJEM_quickCartoon !== "function") return;
    if (!cartoonBtn) {
      cartoonBtn = document.createElement("button");
      cartoonBtn.type = "button";
      cartoonBtn.className = "btn";
      cartoonBtn.id = "cartoonNowBtn";
      cartoonBtn.style.marginTop = "0.7rem";
      box.insertAdjacentElement("afterend", cartoonBtn);
      cartoonBtn.addEventListener("click", async () => {
        if (earlyOk()) { early = null; await refreshPhoto(); return; }
        const forPhoto = photos[0];
        ONJJEM_quickCartoon(photo, async r => {
          early = { forPhoto, previewId: r.previewId, previewSrc: r.previewSrc };
          await refreshPhoto();
          box.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
    }
    const can = photo && !isTextDesign && !isPresetDesign && !(isMulti() && photos.length > 1);
    cartoonBtn.style.display = can ? "" : "none";
    if (!can) return;
    if (earlyOk()) {
      box.innerHTML = `<img class="u-preview" src="${early.previewSrc}" alt="Your cartoon"><div class="u-text">✓ Your cartoon is on your gift</div><div class="u-hint">The preview mark won't be printed · tap to change photo</div>`;
      cartoonBtn.textContent = "↩ Use my original photo instead";
      cartoonBtn.style.background = "transparent"; cartoonBtn.style.color = "var(--gold-light)"; cartoonBtn.style.border = "1px solid var(--gold)";
    } else {
      cartoonBtn.textContent = "✨ See my FREE cartoon now";
      cartoonBtn.style.background = ""; cartoonBtn.style.color = ""; cartoonBtn.style.border = "";
    }
  }

  optionEls.forEach(el => el.addEventListener("click", async () => {
    const wasMulti = isMulti();
    selected = Number(el.dataset.i);
    optionEls.forEach(e => e.classList.toggle("selected", e === el));
    el.querySelector("input").checked = true;
    document.getElementById("total").textContent = money(opts[selected].price);
    showVariants();
    showDesigns();
    input.multiple = isMulti();
    if (P.onOption) await P.onOption(opts[selected]);
    await refreshPhoto();
  }));
  input.multiple = isMulti();
  box.innerHTML = emptyBox();
  showDesigns();
  // Pages that build their own design (e.g. football shirts) hand it over here.
  window.ONJJEM_setDesign = async (dataUrl) => {
    photos = dataUrl ? [dataUrl] : []; isTextDesign = true; isPresetDesign = true; orient = null;
    box.style.display = dataUrl ? "" : (P.designsOnly ? "none" : "");
    await refreshPhoto();
  };
  window.ONJJEM_currentOption = () => opts[selected];

  // Big "See YOUR cartoon FREE" button at the top: straight to the photo picker,
  // then straight to the free cartoon. No scrolling, no product choice first.
  let quickMode = false;
  const qBtn = document.getElementById("quickCartoonBtn");
  if (qBtn) qBtn.addEventListener("click", () => {
    quickMode = true;
    onjjemGa("event", "quick_cartoon_click");
    input.click();
  });

  // Photo upload
  box.addEventListener("click", () => { if (!P.designsOnly) input.click(); });
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
      if (quickMode) {
        quickMode = false;
        if (cartoonBtn && cartoonBtn.style.display !== "none") { box.scrollIntoView({ behavior: "smooth", block: "center" }); cartoonBtn.click(); }
      }
      onjjemGa("event", "add_to_cart", { currency: ONJJEM_cur(), value: opts[selected].price, items: [{ item_id: opts[selected].sku, item_name: opts[selected].name, price: opts[selected].price }] });
    } catch (err) {
      photos = []; await refreshPhoto();
      status.textContent = err.message;
    }
  });

  // Typed words / slogans
  document.getElementById("typeBtn")?.addEventListener("click", () => {
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
  input.addEventListener("change", () => { isTextDesign = false; isPresetDesign = false; if (designWrap) designWrap.querySelectorAll(".design-tile").forEach(x => x.classList.remove("picked")); }, true);

  // Buy
  const buyBtn = document.getElementById("buyBtn");
  const basketBtn = document.getElementById("basketBtn");
  const confirmBox = document.getElementById("confirmBox");
  const confirmOk = () => !confirmBox || confirmBox.checked;
  if (confirmBox) { basketBtn.disabled = true; buyBtn.disabled = true; confirmBox.addEventListener("change", () => { basketBtn.disabled = buyBtn.disabled = !confirmOk(); }); }
  function startFlow(then) {
    if (!confirmOk()) return;
    if (!chosen()) { status.textContent = "Please choose a size first 👕"; variantWrap.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!photo) { status.textContent = P.needPhotoMsg || "Please add your photo first 📸"; (P.designsOnly && designWrap ? designWrap : box).scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    status.textContent = "";
    if (earlyOk()) {
      const e = early;
      status.style.color = "var(--muted)";
      status.textContent = "Preparing your cartoon…";
      ONJJEM_finalCartoon(photo, e.previewId)
        .then(c => { status.textContent = ""; then({ addCartoon: true, confirmedCartoonBase64: c }); })
        .catch(() => { status.textContent = ""; then({ addCartoon: true }); });
      return;
    }
    const collage = isMulti() && photos.length > 1; // cartoons are for single photos
    if (P.cartoon && !collage && !isTextDesign && !isPresetDesign && typeof ONJJEM_showPhotoPreview === "function") {
      ONJJEM_showPhotoPreview(photo, cartoonOpts => then(cartoonOpts));
    } else {
      then(null);
    }
  }
  buyBtn.addEventListener("click", () => startFlow(checkout));
  basketBtn.addEventListener("click", () => startFlow(addToBasket));

  // Make the exact print file for this gift and put it in the basket.
  async function addToBasket(cartoonOpts) {
    const o = chosen();
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
      await ONJJEM_Basket.add({ sku: o.sku, name: o.name, price: o.price, cartoon, cartoonFree: !!window.ONJJEM_CARTOON_FREE, photo: print, thumb, page: location.pathname });
      onjjemGa("event", "add_to_cart", { currency: ONJJEM_cur(), value: o.price, items: [{ item_id: o.sku, item_name: o.name, price: o.price }] });
      status.textContent = "";
      ONJJEM_showAddedToast(thumb, o.name);
    } catch (err) {
      status.style.color = "#ffb4a8";
      status.textContent = "Sorry, that didn't add (" + (err && err.message ? err.message : "please try again") + ").";
    } finally {
      basketBtn.disabled = !confirmOk(); buyBtn.disabled = !confirmOk();
    }
  }

  async function checkout(cartoonOpts) {
    const o = chosen();
    buyBtn.disabled = true;
    status.style.color = "var(--muted)";
    status.textContent = "Taking you to secure checkout…";
    onjjemGa("event", "begin_checkout", { currency: ONJJEM_cur(), value: o.price, items: [{ item_id: o.sku, item_name: o.name, price: o.price }] });
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
          ...(ONJJEM_isUS() ? { region: "us" } : {}),
          ...(window.ONJJEM_CARTOON_FREE ? { cartoonFree: true } : {}),
          successUrl: window.location.origin + ONJJEM_home() + "?order=success&session_id={CHECKOUT_SESSION_ID}",
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

  onjjemGa("event", "view_item", { currency: ONJJEM_cur(), value: fromPrice, items: opts.map(o => ({ item_id: o.sku, item_name: o.name, price: o.price })) });
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
  const cx = c.getContext("2d");
  cx.fillStyle = window.ONJJEM_THUMB_BG || "#ffffff"; cx.fillRect(0, 0, c.width, c.height);
  cx.drawImage(img, 0, 0, c.width, c.height);
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
        const r = d.transaction("basket").objectStore("basket").get(ONJJEM_isUS() ? "items-us" : "items");
        r.onsuccess = () => res(r.result || []);
        r.onerror = () => res(memory);
      });
    } catch (e) { return memory; }
  }
  async function save(items) {
    memory = items;
    try {
      const d = await db();
      await new Promise(res => { const t = d.transaction("basket", "readwrite"); t.objectStore("basket").put(items, ONJJEM_isUS() ? "items-us" : "items"); t.oncomplete = res; t.onerror = res; });
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

function ONJJEM_bundlePercent(n) { return n >= 3 ? 12 : n === 2 ? 10 : 0; }

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
    const nudge = next > now ? `Add ${n === 1 ? "one more gift to save 10%" : "one more gift to save 12%"} on everything 🎁` : `You're saving ${now}% on your whole basket 🎉`;
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
    t.querySelector('[data-a="more"]').onclick = () => { t.remove(); location.href = ONJJEM_isUS() ? "/us/" : "/tiktok"; };
    t.querySelector('[data-a="basket"]').onclick = () => { t.remove(); ONJJEM_openBasket(); };
  });
}

async function ONJJEM_openBasket() {
  const items = await ONJJEM_Basket.load();
  const old = document.getElementById("basketPanel"); if (old) old.remove();
  const panel = document.createElement("div");
  panel.id = "basketPanel"; panel.className = "cartoon-preview-overlay";
  const sub = items.reduce((a, i) => a + i.price + (i.cartoon ? ONJJEM_cartoonFee(i.sku, i) : 0), 0);
  const pct = ONJJEM_bundlePercent(items.length);
  // Low-margin gifts (golf balls) count towards the deal but aren't discounted themselves.
  const eligibleSub = items.filter(i => !/^(US-(GOLF|CANDLE|TOTE)|xmas-sack$|trick-bag|FTEE-)/.test(String(i.sku || ""))).reduce((a, i) => a + i.price + (i.cartoon ? ONJJEM_cartoonFee(i.sku, i) : 0), 0);
  const disc = Math.round(eligibleSub * pct) / 100;
  const nextPct = ONJJEM_bundlePercent(items.length + 1);
  panel.innerHTML = `
    <div class="cartoon-preview-card basket-card">
      <div class="cartoon-preview-title">Your basket 🧺</div>
      ${items.length ? items.map(i => `
        <div class="basket-row">
          <img src="${i.thumb}" alt="">
          <div class="basket-info"><strong>${esc(i.name)}</strong>${i.cartoon ? (ONJJEM_cartoonFee(i.sku, i) ? "<small>+ cartoon £1.99</small>" : "<small>+ FREE cartoon</small>") : ""}</div>
          <div class="basket-price">${money(i.price + (i.cartoon ? ONJJEM_cartoonFee(i.sku, i) : 0))}</div>
          <button type="button" class="basket-remove" data-id="${i.id}" aria-label="Remove">✕</button>
        </div>`).join("") : `<p class="cartoon-email-note">Your basket is empty.</p>`}
      ${items.length ? `
        <div class="basket-sum"><span>Subtotal</span><span>${money(sub)}</span></div>
        ${pct ? `<div class="basket-sum" style="color:#7ee2a0"><span>Bundle discount (${pct}%${eligibleSub < sub ? " off eligible gifts" : ""})</span><span>−${money(disc)}</span></div>` : ""}
        <div class="basket-sum"><span>${ONJJEM_isUS() ? "US shipping" : "UK delivery"}</span><span>FREE</span></div>
        <div class="basket-sum basket-total"><span>Total</span><span>${money(sub - disc)}</span></div>
        ${pct ? `<p class="cartoon-email-note" style="font-size:0.8rem">Your bundle discount is applied instead of promo codes.</p>` : ""}
        ${nextPct > pct ? `<p class="cartoon-email-note" style="color:#F3D078;font-weight:700">Add ${items.length === 1 ? "1 more gift to save 10%" : "1 more gift to save 12%"} 🎁</p>` : ""}
        <button class="cartoon-btn-primary" id="basketCheckout" style="width:100%;margin-top:0.6rem">Checkout securely →</button>
        <div id="basketStatus" class="cartoon-email-note" style="min-height:1.2em;margin-top:0.4rem"></div>` : ""}
      <button class="cartoon-btn-secondary" id="basketMore" style="width:100%;margin-top:0.5rem">Keep shopping</button>
      ${items.length ? `<button type="button" id="basketEmpty" style="display:block;margin:0.8rem auto 0;background:none;border:none;color:#bbb;text-decoration:underline;font-size:0.9rem;cursor:pointer">🗑️ Empty basket</button>` : ""}
    </div>`;
  document.body.appendChild(panel);
  panel.addEventListener("click", e => { if (e.target === panel) panel.remove(); });
  panel.querySelector("#basketMore").onclick = () => { panel.remove(); if (!window.PAGE && !/^\/(us\/)?(index\.html)?$/.test(location.pathname)) location.href = ONJJEM_isUS() ? "/us/" : "/"; };
  const emptyBtn = panel.querySelector("#basketEmpty");
  if (emptyBtn) emptyBtn.onclick = async () => {
    if (!confirm("Remove everything from your basket?")) return;
    await ONJJEM_Basket.clear(); ONJJEM_openBasket();
  };
  panel.querySelectorAll(".basket-remove").forEach(b => b.onclick = async () => { await ONJJEM_Basket.remove(b.dataset.id); ONJJEM_openBasket(); });
  const go = panel.querySelector("#basketCheckout");
  if (go) go.onclick = async () => {
    const st = panel.querySelector("#basketStatus");
    go.disabled = true; st.textContent = "Taking you to secure checkout…";
    onjjemGa("event", "begin_checkout", { currency: ONJJEM_cur(), value: sub - disc, items: items.map(i => ({ item_id: i.sku, item_name: i.name, price: i.price })) });
    try {
      const res = await fetch(`${API_BASE}/api/stripe/cart-checkout`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ sku: i.sku, photoBase64: i.photo, cartoon: !!i.cartoon, cartoonFree: !!i.cartoonFree })),
          ...(ONJJEM_isUS() ? { region: "us" } : {}),
          successUrl: location.origin + ONJJEM_home() + "?order=success&basket=1&session_id={CHECKOUT_SESSION_ID}",
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

// Reliable in-page jumps ("Make my blanket", category links). On phones the page keeps growing
// while images and fonts load, so a single smooth scroll can stop short on the first tap, and iOS
// can swallow the first tap while the toolbar is moving. Jump straight to the target on touch end
// (or click), then re-check as the layout settles.
(function () {
  let lastJump = 0, startX = 0, startY = 0, startT = 0;
  function jump(a, e) {
    const id = decodeURIComponent((a.getAttribute("href") || "").slice(1));
    const t = id && document.getElementById(id);
    if (!t) return false;
    if (e && e.cancelable) e.preventDefault();
    if (Date.now() - lastJump < 700) return true; // already handled by touchend
    lastJump = Date.now();
    const root = document.documentElement;
    const off = () => parseFloat(getComputedStyle(t).scrollMarginTop) || 0;
    const go = () => {
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, Math.max(0, t.getBoundingClientRect().top + window.pageYOffset - off()));
      root.style.scrollBehavior = prev;
    };
    go();
    [100, 350, 800, 1600].forEach(ms => setTimeout(() => { if (Math.abs(t.getBoundingClientRect().top - off()) > 3) go(); }, ms));
    try { history.replaceState(null, "", "#" + id); } catch (err) {}
    return true;
  }
  const link = e => e.target && e.target.closest && e.target.closest('a[href^="#"]');
  document.addEventListener("touchstart", e => { const t = e.touches && e.touches[0]; if (t) { startX = t.clientX; startY = t.clientY; startT = Date.now(); } }, { passive: true });
  document.addEventListener("touchend", e => {
    const a = link(e); const t = e.changedTouches && e.changedTouches[0];
    if (!a || !t) return;
    if (Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10 || Date.now() - startT > 600) return; // a scroll or long press, not a tap
    jump(a, e);
  });
  document.addEventListener("click", e => { const a = link(e); if (a) jump(a, e); });
})();
