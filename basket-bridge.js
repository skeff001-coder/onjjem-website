// ── Basket for the older category pages ─────────────────────────────────────
// kids.html, household.html, frames-gifts.html and winter-warmers.html build
// their own product cards with a "Buy Now" button that goes straight to
// Stripe. This adds an "Add to basket" button to every card so those gifts
// join the same basket (landing.js → ONJJEM_Basket) as the rest of the site,
// with the bundle discount. Load after landing.js and the page's own script.
(function () {
  if (typeof ONJJEM_Basket === "undefined") return;

  function priceOf(label) {
    const m = String(label).match(/£\s*([0-9]+(?:\.[0-9]{1,2})?)/);
    return m ? Number(m[1]) : 0;
  }
  function nameOf(item, variant) {
    const bit = String(variant.label).replace(/\s*[-–—]\s*£.*$/, "").trim();
    return item.variants.length > 1 && bit ? `${item.name} (${bit})` : item.name;
  }
  function photoFor(i) {
    const input = document.querySelector(`input[type="file"][data-item="${i}"]`);
    if (input && input.dataset.photo) return input.dataset.photo;
    try { if (typeof photoBase64Map !== "undefined" && photoBase64Map[i]) return photoBase64Map[i]; } catch (e) {}
    return null;
  }
  function cartoonFor(i) {
    try {
      if (typeof itemPendingCartoonOptions !== "undefined" && itemPendingCartoonOptions[i]) return itemPendingCartoonOptions[i];
    } catch (e) {}
    const cb = document.querySelector(`[data-role="cartoon-checkbox"][data-item="${i}"]`);
    if (cb && cb.checked) return { addCartoon: true };
    return null;
  }

  async function addToBasket(i, btn) {
    const item = window.__items && window.__items[i];
    const status = document.querySelector(`[data-status="${i}"]`);
    const photo = photoFor(i);
    if (!item || !photo) { if (status) status.textContent = "Please choose a photo first"; return; }
    const select = document.querySelector(`select[data-item="${i}"]`);
    const sku = select ? select.value : item.variants[0].sku;
    const variant = item.variants.find(v => v.sku === sku) || item.variants[0];
    const price = priceOf(variant.label);
    const name = nameOf(item, variant);

    btn.disabled = true;
    if (status) { status.style.color = "#666"; status.textContent = "Adding to your basket…"; }
    try {
      let source = photo, cartoon = false;
      const opts = cartoonFor(i);
      if (opts && opts.addCartoon) {
        let c = opts.confirmedCartoonBase64;
        if (!c) {
          if (status) status.textContent = "Making your cartoon… this takes a few seconds";
          const r = await fetch(`${API_BASE}/api/cartoonify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base64Image: photo, mimeType: "image/jpeg", watermark: false }) });
          const d = await r.json();
          if (!d.base64Image) throw new Error("the cartoon couldn't be made");
          c = d.base64Image;
        }
        source = c.startsWith("data:") ? c : "data:image/png;base64," + c;
        cartoon = true;
      }
      const print = await ONJJEM_limitSize(source, 2600);
      const thumb = await ONJJEM_limitSize(source, 240);
      await ONJJEM_Basket.add({ sku, name, price, cartoon, photo: print, thumb, page: location.pathname });
      onjjemGa("event", "add_to_cart", { currency: "GBP", value: price, items: [{ item_id: sku, item_name: name, price }] });
      if (status) { status.style.color = "#2e7d32"; status.textContent = "✅ In your basket"; }
      ONJJEM_showAddedToast(thumb, name);
    } catch (err) {
      if (status) { status.style.color = "#c62828"; status.textContent = "Sorry, that didn't add (" + (err && err.message ? err.message : "please try again") + ")."; }
    } finally {
      btn.disabled = false;
    }
  }

  document.querySelectorAll('button[data-type="checkout"]').forEach(buy => {
    const i = buy.dataset.item;
    const add = document.createElement("button");
    add.type = "button";
    add.className = "buy-btn basket-add";
    add.dataset.item = i;
    add.dataset.type = "basket";
    add.textContent = "🧺 Add to basket";
    add.style.display = buy.style.display;
    buy.parentNode.insertBefore(add, buy);
    buy.textContent = "Buy this one now";
    buy.classList.add("buy-now-secondary");
    add.addEventListener("click", () => addToBasket(i, add));
    // Show the basket button whenever the page shows its Buy button.
    new MutationObserver(() => { add.style.display = buy.style.display; })
      .observe(buy, { attributes: true, attributeFilter: ["style"] });
  });

  // If there's already something in the basket, "Buy this one now" would
  // leave it behind — add this gift to the basket and open it instead.
  let inBasket = 0;
  const refresh = () => ONJJEM_Basket.load().then(items => { inBasket = items.length; });
  refresh();
  document.querySelectorAll('button[data-type="checkout"]').forEach(buy => {
    buy.addEventListener("click", async e => {
      if (!inBasket) return; // basket empty: normal Buy Now straight to Stripe
      e.preventDefault();
      e.stopImmediatePropagation();
      const add = buy.parentNode.querySelector('button[data-type="basket"]');
      await addToBasket(buy.dataset.item, add || buy);
      await refresh();
    }, true); // capture phase, so this runs before the page's own Buy handler
  });
  const origAdd = ONJJEM_Basket.add;
  ONJJEM_Basket.add = async item => { const r = await origAdd(item); inBasket = r.length; return r; };
  const origRemove = ONJJEM_Basket.remove;
  ONJJEM_Basket.remove = async id => { const r = await origRemove(id); inBasket = r.length; return r; };
})();
