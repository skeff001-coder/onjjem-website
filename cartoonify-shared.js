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
  overlay.innerHTML = `
    <div class="cartoon-preview-card">
      <div class="cartoon-preview-title">Check Your Photo 👀</div>
      <p class="cartoon-email-note">Take a look — is everything in the frame the way you want it? Check nothing important is too close to the edge.</p>
      <img class="cartoon-preview-img" src="${photoBase64}" alt="Your uploaded photo" style="display:block; margin-bottom: 14px;">
      <button class="cartoon-btn-primary" data-role="looks-good" style="width:100%;">Looks Good — Continue →</button>
      <div style="margin-top: 10px;">
        <button class="cartoon-btn-secondary" data-role="choose-again" style="width:100%">Choose a Different Photo</button>
      </div>
    </div>
  `;
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
  const overlay = document.createElement("div");
  overlay.className = "cartoon-preview-overlay";
  overlay.innerHTML = `
    <div class="cartoon-preview-card">
      <div class="cartoon-sparkle-badge">✨ NEW ✨</div>
      <div class="cartoon-preview-title">See Yourself as a Cartoon! 🎨</div>
      <p class="cartoon-email-note cartoon-highlight">Turn everyone in your photo into their own unique cartoon character — for just £1.99.</p>
      <p class="cartoon-email-note">Free to preview first. No obligation, no risk — just tap below and see the magic.</p>
      <button class="cartoon-btn-primary cartoon-btn-glow" data-role="generate" style="width:100%; margin-top:10px;">✨ Show Me My Cartoon! ✨</button>
      <div style="margin-top: 10px;">
        <button class="cartoon-btn-secondary" data-role="skip" style="width:100%">No Thanks, Just My Order</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('[data-role="skip"]').addEventListener("click", () => {
    overlay.remove();
    onProceed(null);
  });

  overlay.querySelector('[data-role="generate"]').addEventListener("click", async () => {
    const card = overlay.querySelector(".cartoon-preview-card");
    card.innerHTML = `
      <div class="cartoon-preview-title">Working our magic... ✨</div>
      <p class="cartoon-email-note">This takes a few seconds — creating your one-of-a-kind cartoon now.</p>
      <div class="cartoon-preview-loading"></div>
    `;
    try {
      const res = await fetch(`${API_BASE}/api/cartoonify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: photoBase64, mimeType, watermark: true }),
      });
      const data = await res.json();

      if (data.alreadyUsed) {
        card.innerHTML = `
          <div class="cartoon-preview-title">You've used your free previews ✨</div>
          <p class="cartoon-email-note">No problem — you can still add a Custom Cartoon upgrade for £1.99 and see the real, unwatermarked result once your order is placed.</p>
          <button class="cartoon-btn-primary" data-role="yes-blind" style="width:100%; margin-top:10px;">Add Custom Cartoon — £1.99</button>
          <div style="margin-top: 10px;">
            <button class="cartoon-btn-secondary" data-role="skip2" style="width:100%">No Thanks, Just My Order</button>
          </div>
        `;
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

      const previewSrc = `data:${data.mimeType};base64,${data.base64Image}`;
      card.innerHTML = `
        <div class="cartoon-preview-title">Here's your cartoon! ✨</div>
        <img class="cartoon-preview-img" src="${previewSrc}" alt="Your cartoon preview" style="display:block; margin-bottom: 14px; border-radius: 12px;">
        <p class="cartoon-email-note" style="font-weight:700; color:#F3D078;">This exact cartoon can be printed on your gift today — watermark-free.</p>
        <p class="cartoon-email-note">For just £1.99, we'll add this full-quality artwork to your order instead of the plain photo. It's a genuinely one-of-a-kind piece, made just for you.</p>
        <button class="cartoon-btn-primary" data-role="yes" style="width:100%; margin-top:10px;">Yes — Add This Cartoon for £1.99</button>
        <div style="margin-top: 10px;">
          <button class="cartoon-btn-secondary" data-role="no" style="width:100%">No Thanks, Use My Plain Photo</button>
        </div>
      `;

      card.querySelector('[data-role="yes"]').addEventListener("click", async () => {
        card.innerHTML = `
          <div class="cartoon-preview-title">Locking in your cartoon... ✨</div>
          <p class="cartoon-email-note">One moment — preparing the full-quality version for your order.</p>
          <div class="cartoon-preview-loading"></div>
        `;
        try {
          const finalRes = await fetch(`${API_BASE}/api/cartoonify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Image: photoBase64, mimeType, watermark: false }),
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
          card.innerHTML = `
            <div class="cartoon-preview-title">Something went wrong</div>
            <p class="cartoon-email-note">We couldn't prepare the full-quality cartoon just now. You can continue with your order as a standard photo instead.</p>
            <button class="cartoon-btn-primary" data-role="continue-anyway" style="width:100%; margin-top:10px;">Continue With My Order</button>
          `;
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
      card.innerHTML = `
        <div class="cartoon-preview-title">Couldn't generate a preview</div>
        <p class="cartoon-email-note">Something went wrong on our end. You can still continue with your order as a standard photo.</p>
        <button class="cartoon-btn-primary" data-role="continue-anyway" style="width:100%; margin-top:10px;">Continue With My Order</button>
      `;
      card.querySelector('[data-role="continue-anyway"]').addEventListener("click", () => {
        overlay.remove();
        onProceed(null);
      });
    }
  });
}
