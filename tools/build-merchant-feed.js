// Builds Google Merchant Center product feeds from the product pages.
//   node tools/build-merchant-feed.js
// Writes merchant-feed-uk.xml and merchant-feed-us.xml at the site root.
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const SITE = "https://onjjem.com";
const SKIP = new Set(["index.html", "basket.html", "404.html"]);

function readPage(file) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(s => s.includes("window.PAGE"));
  if (!scripts.length) return null;
  const noop = new Proxy(function () {}, { get: () => noop, apply: () => noop });
  const win = {};
  const ctx = vm.createContext({ window: win, document: noop, location: { pathname: "/" }, navigator: {}, console });
  try { for (const s of scripts) vm.runInContext(s, ctx, { timeout: 1000 }); } catch (e) { return null; }
  if (!win.PAGE || !Array.isArray(win.PAGE.options)) return null;
  return { page: win.PAGE, us: win.ONJJEM_REGION === "us" || file.startsWith("us/") };
}

const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = s => String(s || "").replace(/<[^>]+>/g, "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/\s+/g, " ").trim();
const abs = u => !u ? "" : /^https?:/.test(u) ? u : SITE + (u.startsWith("/") ? u : "/" + u);

const LATE = /(halloween|christmas|bauble|baby-reveal|poster-sale|winter-warmers|football)/; // seasonal pages: only for products no other page sells
// Clothing needs colour, size, gender and age group for Google Shopping.
function apparelInfo(o, title) {
  if (!/t-shirt|tee\b|sweatshirt|hoodie/i.test(title)) return null;
  const cols = (o.colours || []).map(c => c[1]).slice(0, 3);
  const colour = cols.length ? cols.join("/") : (/christmas/i.test(title) ? "Red/Green/Navy" : "Black/White");
  const size = o.sizes && o.sizes.length ? String(o.sizes[0][1]).replace(/[–]/g, "-") : (/kid|youth|toddler|baby/i.test(title) ? "5-6 years" : "M");
  const age = /baby/i.test(title) ? "infant" : /toddler/i.test(title) ? "toddler" : /kid|youth/i.test(title) ? "kids" : "adult";
  return { colour, size, age };
}
const files = fs.readdirSync(ROOT).filter(f => f.endsWith(".html")).concat(fs.readdirSync(path.join(ROOT, "us")).filter(f => f.endsWith(".html")).map(f => "us/" + f))
  .sort((a, b) => (LATE.test(a) ? 1 : 0) - (LATE.test(b) ? 1 : 0));
const NOUN = { blanket: "Luxury photo throw", prints: "Photo print", "us/blanket": "", cushions: "" };
const feeds = { uk: new Map(), us: new Map() };
for (const f of files) {
  if (SKIP.has(path.basename(f)) && !f.startsWith("us/")) continue;
  if (path.basename(f) === "index.html") continue;
  const r = readPage(f);
  if (!r) continue;
  const { page, us } = r;
  const region = us ? "us" : "uk";
  const link = SITE + "/" + f.replace(/\.html$/, "") + "?utm_source=google&utm_medium=shopping";
  const img = abs(page.ogImage || page.heroImg);
  for (const o of page.options) {
    if (!o.sku || !o.price || o.hidden) continue;
    if (feeds[region].has(o.sku)) continue;
    const word = us ? "Personalized" : "Personalised";
    let title = plain(o.name).replace(/\s+—\s+/g, " ");
    const g = f.replace(/\.html$/, "");
    if (o.sku === "magic-mug") title += " – colour-changing";
    if (/^(Small|Medium|Large|Giant|Extra)\b/.test(title) && NOUN[g]) title = NOUN[g] + " " + title.charAt(0).toLowerCase() + title.slice(1);
    const desc = plain([o.note, page.sub].filter(Boolean).join(". "));
    feeds[region].set(o.sku, {
      id: (us ? "US-" : "UK-") + o.sku.replace(/^US-/, ""),
      title: `${title} – ${word} with your photo`.slice(0, 150),
      description: desc.slice(0, 4900),
      link, image: abs(o.img || o.image) || img,
      price: `${Number(o.price).toFixed(2)} ${us ? "USD" : "GBP"}`,
      country: us ? "US" : "GB",
      group: f.replace(/\.html$/, ""),
      apparel: apparelInfo(o, title)
    });
  }
}

for (const [region, items] of Object.entries(feeds)) {
  const cur = region === "us" ? "USD" : "GBP";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>ONJJEM ${region.toUpperCase()} personalised photo gifts</title>
<link>${SITE}${region === "us" ? "/us/" : "/"}</link>
<description>Photo and cartoon gifts made to order</description>
${[...items.values()].map(i => `<item>
<g:id>${esc(i.id)}</g:id>
<g:title>${esc(i.title)}</g:title>
<g:description>${esc(i.description)}</g:description>
<g:link>${esc(i.link)}</g:link>
<g:image_link>${esc(i.image)}</g:image_link>
<g:availability>in_stock</g:availability>
<g:price>${esc(i.price)}</g:price>
<g:condition>new</g:condition>
<g:brand>ONJJEM</g:brand>
<g:identifier_exists>no</g:identifier_exists>
<g:is_bundle>no</g:is_bundle>
<g:item_group_id>${esc(i.group)}</g:item_group_id>${i.apparel ? `
<g:color>${esc(i.apparel.colour)}</g:color>
<g:size>${esc(i.apparel.size)}</g:size>
<g:gender>unisex</g:gender>
<g:age_group>${i.apparel.age}</g:age_group>
<g:google_product_category>212</g:google_product_category>` : ""}
<g:shipping><g:country>${i.country}</g:country><g:price>0.00 ${cur}</g:price></g:shipping>
</item>`).join("\n")}
</channel>
</rss>
`;
  fs.writeFileSync(path.join(ROOT, `merchant-feed-${region}.xml`), xml);
  console.log(region, items.size, "products");
}
