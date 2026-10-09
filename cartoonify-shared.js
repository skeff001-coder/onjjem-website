// ── Faster cartoons: send a smaller copy of the photo to the cartoon maker ──
// Phone photos are 2–5 MB; uploading that on mobile data and having the AI
// read it is most of the wait. The cartoon only needs ~1500px, so every
// /api/cartoonify request gets a shrunk JPEG. The original photo is still
// used for printing. While it works, the waiting text changes every few
// seconds so people can see it's still going.
(function () {
  if (window.__onjjemCartoonFetch) return;
  window.__onjjemCartoonFetch = true;
  const MAX = 1536, cache = new Map();
  function shrink(dataUrl) {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image") || dataUrl.length < 400000) return Promise.resolve(dataUrl);
    if (cache.has(dataUrl)) return cache.get(dataUrl);
    const job = new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          const out = c.toDataURL("image/jpeg", 0.88);
          resolve(out.length < dataUrl.length ? out : dataUrl);
        } catch (e) { resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
    cache.set(dataUrl, job);
    return job;
  }
  const steps = ["Finding the faces… 🔍", "Drawing the outlines… ✏️", "Adding the colours… 🎨", "Adding the magic… ✨", "Nearly there… 🎁"];
  const realFetch = window.fetch.bind(window);
  window.fetch = async function (url, opts) {
    if (typeof url !== "string" || url.indexOf("/api/cartoonify") === -1 || !opts || typeof opts.body !== "string") return realFetch(url, opts);
    let body;
    try { body = JSON.parse(opts.body); } catch (e) { return realFetch(url, opts); }
    let i = 0;
    const tick = setInterval(() => {
      const notes = document.querySelectorAll(".cartoon-preview-overlay .cartoon-email-note");
      const n = notes[notes.length - 1];
      if (n && document.querySelector(".cartoon-preview-overlay .cartoon-preview-loading")) n.textContent = steps[Math.min(i++, steps.length - 1)];
    }, 2500);
    try {
      if (body && body.base64Image) {
        const small = await shrink(body.base64Image);
        if (small !== body.base64Image) { body.base64Image = small; body.mimeType = "image/jpeg"; }
      }
      return await realFetch(url, Object.assign({}, opts, { body: JSON.stringify(body) }));
    } finally { clearInterval(tick); }
  };
})();

// Pages can set window.ONJJEM_CARTOON_FREE = true to include the cartoon at no charge.
function ONJJEM_freeText(html) {
  if (!window.ONJJEM_CARTOON_FREE) return html;
  return html
    .replace(/,? for just £1\.99\./g, ", free with your order.")
    .replace(/ — for just £1\.99\./g, ", free with your order.")
    .replace(/you can still add a Custom Cartoon upgrade for £1\.99/g, "you can still add your free Custom Cartoon")
    .replace(/For just £1\.99, we'll add/g, "We'll add")
    .replace(/ — £1\.99/g, " (FREE)")
    .replace(/ for £1\.99/g, " (FREE)")
    .replace(/£1\.99/g, "FREE");
}
// ── ONJJEM Shared Cartoonify Flow ────────────────────────────────────────────
// Include this file on any product page with:
//   <script src="/cartoonify-shared.js"></script>
// after defining `const API_BASE = "https://onjjem-production-5ef8.up.railway.app";`
//
// Call ONJJEM_showPhotoPreview(photoBase64, mimeType, onProceed) once a customer
// has picked a photo. onProceed(finalOptions) is called when they're ready to
// check out — finalOptions is either null (no cartoon) or
// { addCartoon: true, confirmedCartoonBase64?: string } to merge into your
// existing checkout request body.

function ONJJEM_toDataUrlParts(photoBase64) {
  const mimeMatch = photoBase64.match(/^data:([^;]+);/);
  return mimeMatch ? mimeMatch[1] : "image/jpeg";
}

function ONJJEM_showPhotoPreview(photoBase64, onProceed) {
  const mimeType = ONJJEM_toDataUrlParts(photoBase64);
  const overlay = document.createElement("div");
  overlay.className = "cartoon-preview-overlay";
  overlay.innerHTML = ONJJEM_freeText(`
    <div class="cartoon-preview-card">
      <div class="cartoon-preview-title">Check Your Photo 👀</div>
      <p class="cartoon-email-note">Take a look — is everything in the frame the way you want it? Check nothing important is too close to the edge.</p>
      <img class="cartoon-preview-img" src="${photoBase64}" alt="Your uploaded photo" style="display:block; margin-bottom: 14px;">
      <button class="cartoon-btn-primary" data-role="looks-good" style="width:100%;">Looks Good — Continue →</button>
      <div style="margin-top: 10px;">
        <button class="cartoon-btn-secondary" data-role="choose-again" style="width:100%">Choose a Different Photo</button>
      </div>
    </div>
  `);
  document.body.appendChild(overlay);

  overlay.querySelector('[data-role="choose-again"]').addEventListener("click", () => {
    overlay.remove();
    // Caller is responsible for re-opening their own file picker if desired.
  });

  overlay.querySelector('[data-role="looks-good"]').addEventListener("click", () => {
    overlay.remove();
    ONJJEM_showCartoonOffer(photoBase64, mimeType, onProceed);
  });
}

function ONJJEM_showCartoonOffer(photoBase64, mimeType, onProceed) {
  // Pages can set window.ONJJEM_CARTOON_STYLE = "halloween" (or "christmas")
  // for a seasonal cartoon.
  const style = window.ONJJEM_CARTOON_STYLE || undefined;
  const isHalloween = style === "halloween";
  const isChristmas = style === "christmas";
  let previewId;
  const overlay = document.createElement("div");
  overlay.className = "cartoon-preview-overlay";
  overlay.innerHTML = ONJJEM_freeText(`
    <div class="cartoon-preview-card">
      <div class="cartoon-sparkle-badge">${isHalloween ? "🎃 HALLOWEEN 🎃" : isChristmas ? "🎄 CHRISTMAS 🎄" : "✨ NEW ✨"}</div>
      <div class="cartoon-preview-title">${isHalloween ? "See Them as a Halloween Cartoon! 🎃" : isChristmas ? "See Them as a Christmas Cartoon! 🎄" : "See Yourself as a Cartoon! 🎨"}</div>
      <p class="cartoon-email-note cartoon-highlight">${isHalloween ? "We'll turn your photo into a cute Halloween cartoon, with a costume, pumpkins and a spooky moonlit night, for just £1.99." : isChristmas ? "We'll turn your photo into a cosy Christmas cartoon, with a Santa hat, fairy lights and falling snow, for just £1.99." : "Turn everyone in your photo into their own unique cartoon character — for just £1.99."}</p>
      <p class="cartoon-email-note">Free to preview first. No obligation, no risk — just tap below and see the magic.</p>
      <button class="cartoon-btn-primary cartoon-btn-glow" data-role="generate" style="width:100%; margin-top:10px;">✨ Show Me My Cartoon! ✨</button>
      <div style="margin-top: 10px;">
        <button class="cartoon-btn-secondary" data-role="skip" style="width:100%">No Thanks, Just My Order</button>
      </div>
    </div>
  `);
  document.body.appendChild(overlay);

  overlay.querySelector('[data-role="skip"]').addEventListener("click", () => {
    overlay.remove();
    onProceed(null);
  });

  overlay.querySelector('[data-role="generate"]').addEventListener("click", async () => {
    const card = overlay.querySelector(".cartoon-preview-card");
    card.innerHTML = ONJJEM_freeText(`
      <div class="cartoon-preview-title">Working our magic... ✨</div>
      <p class="cartoon-email-note">This takes a few seconds — creating your one-of-a-kind cartoon now.</p>
      <div class="cartoon-preview-loading"></div>
    `);
    try {
      const res = await fetch(`${API_BASE}/api/cartoonify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: photoBase64, mimeType, watermark: true, style }),
      });
      const data = await res.json();
      try { if (typeof gtag === "function") gtag("event", data.alreadyUsed ? "cartoon_preview_limit" : "cartoon_preview"); } catch (e) {}

      if (data.alreadyUsed) {
        card.innerHTML = ONJJEM_freeText(`
          <div class="cartoon-preview-title">You've used your free previews ✨</div>
          <p class="cartoon-email-note">No problem — you can still add a Custom Cartoon upgrade for £1.99 and see the real, unwatermarked result once your order is placed.</p>
          <button class="cartoon-btn-primary" data-role="yes-blind" style="width:100%; margin-top:10px;">Add Custom Cartoon — £1.99</button>
          <div style="margin-top: 10px;">
            <button class="cartoon-btn-secondary" data-role="skip2" style="width:100%">No Thanks, Just My Order</button>
          </div>
        `);
        card.querySelector('[data-role="yes-blind"]').addEventListener("click", () => {
          overlay.remove();
          onProceed({ addCartoon: true });
        });
        card.querySelector('[data-role="skip2"]').addEventListener("click", () => {
          overlay.remove();
          onProceed(null);
        });
        return;
      }

      if (!res.ok || !data.base64Image) {
        throw new Error(data.details || data.error || "Could not generate preview");
      }

      previewId = data.previewId;
      const previewSrc = `data:${data.mimeType};base64,${data.base64Image}`;
      card.innerHTML = ONJJEM_freeText(`
        <div class="cartoon-preview-title">Here's your cartoon! ✨</div>
        <img class="cartoon-preview-img" src="${previewSrc}" alt="Your cartoon preview" style="display:block; margin-bottom: 14px; border-radius: 12px;">
        <p class="cartoon-email-note" style="font-weight:700; color:#F3D078;">This exact cartoon can be printed on your gift today — watermark-free.</p>
        <p class="cartoon-email-note">For just £1.99, we'll add this full-quality artwork to your order instead of the plain photo. It's a genuinely one-of-a-kind piece, made just for you.</p>
        <button class="cartoon-btn-primary" data-role="yes" style="width:100%; margin-top:10px;">Yes — Add This Cartoon for £1.99</button>
        <div style="margin-top: 10px;">
          <button class="cartoon-btn-secondary" data-role="no" style="width:100%">No Thanks, Use My Plain Photo</button>
        </div>
      `);

      card.querySelector('[data-role="yes"]').addEventListener("click", async () => {
        card.innerHTML = ONJJEM_freeText(`
          <div class="cartoon-preview-title">Locking in your cartoon... ✨</div>
          <p class="cartoon-email-note">One moment — preparing the full-quality version for your order.</p>
          <div class="cartoon-preview-loading"></div>
        `);
        try {
          const finalRes = await fetch(`${API_BASE}/api/cartoonify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Image: photoBase64, mimeType, watermark: false, style, previewId }),
          });
          const finalData = await finalRes.json();
          if (!finalRes.ok || !finalData.base64Image) {
            throw new Error(finalData.error || "Could not prepare final cartoon");
          }
          overlay.remove();
          // Send the exact confirmed cartoon forward — checkout stores THIS
          // image directly rather than generating a fresh one later, so
          // what ships is guaranteed to match what the customer approved.
          onProceed({ addCartoon: true, confirmedCartoonBase64: finalData.base64Image });
        } catch (err) {
          card.innerHTML = ONJJEM_freeText(`
            <div class="cartoon-preview-title">Something went wrong</div>
            <p class="cartoon-email-note">We couldn't prepare the full-quality cartoon just now. You can continue with your order as a standard photo instead.</p>
            <button class="cartoon-btn-primary" data-role="continue-anyway" style="width:100%; margin-top:10px;">Continue With My Order</button>
          `);
          card.querySelector('[data-role="continue-anyway"]').addEventListener("click", () => {
            overlay.remove();
            onProceed(null);
          });
        }
      });
      card.querySelector('[data-role="no"]').addEventListener("click", () => {
        overlay.remove();
        onProceed(null);
      });
    } catch (err) {
      card.innerHTML = ONJJEM_freeText(`
        <div class="cartoon-preview-title">Couldn't generate a preview</div>
        <p class="cartoon-email-note">Something went wrong on our end. You can still continue with your order as a standard photo.</p>
        <button class="cartoon-btn-primary" data-role="continue-anyway" style="width:100%; margin-top:10px;">Continue With My Order</button>
      `);
      card.querySelector('[data-role="continue-anyway"]').addEventListener("click", () => {
        overlay.remove();
        onProceed(null);
      });
    }
  });
}

// ── Instant free cartoon (straight after upload, no buying needed) ──────────
// onDone({ addCartoon: true, confirmedCartoonBase64 }) when they choose to use it.
function ONJJEM_quickCartoon(photoBase64, onDone) {
  const mimeType = ONJJEM_toDataUrlParts(photoBase64);
  const style = window.ONJJEM_CARTOON_STYLE || undefined;
  const free = window.ONJJEM_CARTOON_FREE || window.ONJJEM_REGION === "us";
  const overlay = document.createElement("div");
  overlay.className = "cartoon-preview-overlay";
  overlay.innerHTML = `<div class="cartoon-preview-card">
      <div class="cartoon-preview-title">Making your cartoon… ✨</div>
      <p class="cartoon-email-note">This takes a few seconds.</p>
      <div class="cartoon-preview-loading"></div></div>`;
  document.body.appendChild(overlay);
  const card = overlay.querySelector(".cartoon-preview-card");
  const close = () => overlay.remove();
  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cartoonify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base64Image: photoBase64, mimeType, watermark: true, style }) });
      const data = await res.json();
      try { if (typeof gtag === "function") gtag("event", data.alreadyUsed ? "cartoon_preview_limit" : "cartoon_preview", { where: "instant" }); } catch (e) {}
      if (data.alreadyUsed) {
        card.innerHTML = `<div class="cartoon-preview-title">You've used your free previews ✨</div>
          <p class="cartoon-email-note">You can still have your photo made into a cartoon when you order. Just tick yes at checkout.</p>
          <button class="cartoon-btn-primary" data-role="ok" style="width:100%;margin-top:10px">OK</button>`;
        card.querySelector('[data-role="ok"]').onclick = close;
        return;
      }
      if (!res.ok || !data.base64Image) throw new Error("preview failed");
      const src = `data:${data.mimeType};base64,${data.base64Image}`;
      card.innerHTML = `<div class="cartoon-preview-title">Here's your cartoon! ✨</div>
        <img class="cartoon-preview-img" src="${src}" alt="Your cartoon preview" style="display:block;margin-bottom:12px;border-radius:12px">
        <button class="cartoon-btn-primary" data-role="use" style="width:100%">Put this cartoon on my gift${free ? " (FREE)" : " (+£1.99)"}</button>
        <button class="cartoon-btn-secondary" data-role="share" style="width:100%;margin-top:10px">📲 Share my cartoon</button>
        <button class="cartoon-btn-secondary" data-role="no" style="width:100%;margin-top:10px">Keep my original photo</button>`;
      card.querySelector('[data-role="share"]').onclick = () => ONJJEM_shareCartoon(src);
      card.querySelector('[data-role="no"]').onclick = close;
      card.querySelector('[data-role="use"]').onclick = () => {
        close();
        onDone({ addCartoon: true, previewId: data.previewId, previewSrc: src });
      };
    } catch (e) {
      card.innerHTML = `<div class="cartoon-preview-title">Couldn't make a preview</div><p class="cartoon-email-note">Please try again, or try a brighter photo with clear faces.</p><button class="cartoon-btn-primary" data-role="ok" style="width:100%">OK</button>`;
      card.querySelector('[data-role="ok"]').onclick = close;
    }
  })();
}

// Share the preview with a small "made free at onjjem.com" strip, so friends find us.
async function ONJJEM_shareCartoon(src) {
  try { if (typeof gtag === "function") gtag("event", "cartoon_share"); } catch (e) {}
  const site = window.ONJJEM_REGION === "us" ? "onjjem.com/us" : "onjjem.com";
  const pageUrl = location.origin + location.pathname + "?utm_source=share&utm_medium=cartoon";
  const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = src; });
  const w = img.width, strip = Math.round(w * 0.11);
  const c = document.createElement("canvas"); c.width = w; c.height = img.height + strip;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);
  x.fillStyle = "#14110d"; x.fillRect(0, img.height, w, strip);
  x.fillStyle = "#F3D078"; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = `bold ${Math.round(strip * 0.42)}px system-ui, sans-serif`;
  x.fillText(`Make yours FREE at ${site}`, w / 2, img.height + strip / 2);
  const blob = await new Promise(r => c.toBlob(r, "image/jpeg", 0.9));
  const file = new File([blob], "my-cartoon.jpg", { type: "image/jpeg" });
  const text = `Look at my cartoon! 😂 Make yours free at ${site}`;
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text, url: pageUrl }); return; }
    if (navigator.share) { await navigator.share({ text, url: pageUrl }); return; }
  } catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-cartoon.jpg"; document.body.appendChild(a); a.click(); a.remove();
}

// The full-quality (unwatermarked) version of a preview, made at checkout time.
async function ONJJEM_finalCartoon(photoBase64, previewId) {
  const r = await fetch(`${API_BASE}/api/cartoonify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base64Image: photoBase64, mimeType: ONJJEM_toDataUrlParts(photoBase64), watermark: false, style: window.ONJJEM_CARTOON_STYLE || undefined, previewId }) });
  const d = await r.json();
  if (!r.ok || !d.base64Image) throw new Error("the cartoon couldn't be prepared");
  return d.base64Image;
}
