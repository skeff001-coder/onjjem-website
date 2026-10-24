export default {
  async fetch(request, env0) {
    // Accept the same variable names Railway used, so copied keys work as they are.
    const env = Object.assign({}, env0, { STRIPE_SECRET_KEY: env0.STRIPE_SECRET_KEY || env0.STRIPE_KEY_TEMP, GEMINI_API_KEY: env0.GEMINI_API_KEY || env0.AI_INTEGRATIONS_GEMINI_API_KEY });
    const url = new URL(request.url);
    // Search engines and link previews crawl from the USA. Never send them to
    // the US shop, or Google lists the US page for UK searches.
    const isBot = /bot|crawler|spider|slurp|facebookexternalhit|Google-InspectionTool|Mediapartners-Google|APIs-Google/i.test(request.headers.get('user-agent') || '');

    // One-time setup: creates the WINNER15 code (15% off, one use per customer). Does nothing if it already exists.
    if (url.pathname === '/api/make-winner15' && env.STRIPE_SECRET_KEY) {
      try {
        const ex = await pbStripe(env, 'GET', '/promotion_codes?code=WINNER15&limit=1');
        if (ex.data && ex.data.length) return pbJson({ ok: true, already: true, active: ex.data[0].active });
        const c = await pbStripe(env, 'POST', '/coupons', { percent_off: '15', duration: 'once', name: 'Giveaway entrants 15% off' });
        const pc = await pbStripe(env, 'POST', '/promotion_codes', { coupon: c.id, code: 'WINNER15', 'restrictions[first_time_transaction]': 'true' });
        return pbJson({ ok: true, created: pc.code });
      } catch (e) { return pbJson({ ok: false, error: String(e && e.message).slice(0, 200) }, 500); }
    }
    if (url.pathname === '/api/pc-ready') {
      let ready = !!(env.STRIPE_SECRET_KEY && env.GEMINI_API_KEY && env.RESEND_API_KEY);
      // Pause the colouring page by itself if Google's AI is refusing calls (e.g. spend cap reached).
      if (ready && !url.searchParams.get('ai')) {
        const now = Date.now();
        if (!globalThis.__aiCheck || now - globalThis.__aiCheck.at > 5 * 60 * 1000) {
          let ok = true;
          try {
            const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', { method: 'POST', headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with OK' }] }], generationConfig: { maxOutputTokens: 5 } }) });
            ok = r.status !== 429 && r.status !== 403 && r.status !== 401;
          } catch (e) { ok = true; }
          globalThis.__aiCheck = { at: now, ok };
        }
        ready = globalThis.__aiCheck.ok;
      }
      const missing = ['STRIPE_SECRET_KEY', 'GEMINI_API_KEY', 'RESEND_API_KEY'].filter((k) => !env[k]);
      // ?ai=1: tiny test call to Google AI (reports only the status and error text, never the key).
      if (url.searchParams.get('ai') && env.GEMINI_API_KEY) {
        let ai = {};
        try {
          const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', { method: 'POST', headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with OK' }] }] }) });
          const j = await r.json().catch(() => ({}));
          ai = { status: r.status, error: j.error ? String(j.error.message || '').slice(0, 200) : null };
        } catch (e) { ai = { error: String(e && e.message) }; }
        return new Response(JSON.stringify({ ready, missing, ai }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
      }
      return new Response(JSON.stringify({ ready, missing }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    }
    // Colouring page checkout, drawing and competition run here on Cloudflare.
    if (PB_ROUTES.includes(url.pathname) && request.method === 'POST' && env.STRIPE_SECRET_KEY && env.GEMINI_API_KEY && env.RESEND_API_KEY) {
      return handlePB(url.pathname, request, env);
    }

    // API proxy to Railway backend
    if (url.pathname.startsWith('/api/')) {
      const target = 'https://onjjem-production-5ef8.up.railway.app' + url.pathname + url.search;
      return fetch(new Request(target, request));
    }

    // Visitors in the USA landing on the UK homepage go to the US shop
    // (unless they chose the UK shop on purpose: /?uk=1 or the uk cookie).
    if (url.pathname === '/' && !url.searchParams.has('order') && !url.searchParams.has('uk')) {
      const country = (request.cf && request.cf.country) || '';
      const cookie = request.headers.get('cookie') || '';
      if (country === 'US' && !isBot && !cookie.includes('onjjem_shop=uk')) {
        return Response.redirect(url.origin + '/us/' + url.search, 302);
      }
    }
    // US visitors on the UK Halloween / Christmas pages (e.g. from the TikTok
    // bio link onjjem.com/halloween) go to the US versions.
    const US_PAGES = { '/printables': '/us/printables', '/printables.html': '/us/printables', '/halloween': '/us/halloween', '/halloween.html': '/us/halloween', '/christmas': '/us/christmas', '/christmas.html': '/us/christmas' };
    if (US_PAGES[url.pathname] && !url.searchParams.has('uk')) {
      const country = (request.cf && request.cf.country) || '';
      const cookie = request.headers.get('cookie') || '';
      if (country === 'US' && !isBot && !cookie.includes('onjjem_shop=uk')) {
        return Response.redirect(url.origin + US_PAGES[url.pathname] + url.search, 302);
      }
    }
    // US visitors on the free cartoon page (TikTok bio link) get the US gift list.
    if ((url.pathname === '/cartoon' || url.pathname === '/cartoon.html') && !url.searchParams.has('region') && !url.searchParams.has('uk')) {
      const country = (request.cf && request.cf.country) || '';
      const cookie = request.headers.get('cookie') || '';
      if (country === 'US' && !isBot && !cookie.includes('onjjem_shop=uk')) {
        url.searchParams.set('region', 'us');
        return Response.redirect(url.toString(), 302);
      }
    }
    if (url.pathname === '/' && url.searchParams.has('uk')) {
      const res = await env.ASSETS.fetch(new Request(url.origin + '/index.html', request));
      const r2 = new Response(res.body, res);
      r2.headers.append('Set-Cookie', 'onjjem_shop=uk; Path=/; Max-Age=2592000; SameSite=Lax');
      return r2;
    }

    // Old landing page redirect
    if (url.pathname === '/onjjem-landing.html') {
      return Response.redirect(url.origin + '/', 301);
    }

    // Stripe webhook endpoint
    if (url.pathname === '/webhook/stripe' && request.method === 'POST') {
      return handleStripeWebhook(request, env);
    }

    // Static asset serving with SPA fallback
    const res = await env.ASSETS.fetch(request);
    if (res.status === 404 && (request.headers.get('accept') || '').includes('text/html')) {
      return env.ASSETS.fetch(new Request(url.origin + '/index.html', request));
    }
    return res;
  }
};

async function handleStripeWebhook(request, env) {
  try {
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    // Verify Stripe signature
    const valid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extract order details from session metadata
      const sku = session.metadata?.sku || 'unknown';
      const cartoonify = session.metadata?.cartoonify_upgrade === 'true';
      const photoUrl = session.metadata?.photo_url || 'No photo provided';
      
      // Extract shipping address
      const shippingDetails = session.shipping_details;
      const shippingAddress = shippingDetails?.address || {};
      
      const orderDetails = {
        order_id: session.id,
        sku: sku,
        cartoonify_upgrade: cartoonify,
        photo_url: photoUrl,
        customer_email: session.customer_email || session.customer_details?.email || 'No email',
        shipping_address: {
          name: shippingDetails?.name || 'No name',
          line1: shippingAddress.line1 || '',
          line2: shippingAddress.line2 || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          postal_code: shippingAddress.postal_code || '',
          country: shippingAddress.country || ''
        }
      };

      // Send email notification
      await sendOrderEmail(orderDetails, env);
      
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

async function verifyStripeSignature(body, signature, secret) {
  try {
    // Stripe signature format: t=timestamp,v1=signature
    const [timestamp, ...parts] = signature.split(',');
    const v1Sig = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    const signedContent = timestamp.split('=')[1] + '.' + body;
    
    // Create HMAC SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature_bytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedContent)
    );

    const computed_sig = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computed_sig === v1Sig;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function sendOrderEmail(orderDetails, env) {
  try {
    // Gmail SMTP configuration
    const gmailEmail = 'hello@onjjem.com';
    const gmailAppPassword = 'fknt hxct pisx xtpa'; // Remove spaces for SMTP
    const recipientEmail = 'hello@onjjem.com';

    const emailBody = formatOrderEmail(orderDetails);

    // Send via Gmail SMTP
    const smtpResponse = await sendViaGmailSMTP(
      gmailEmail,
      gmailAppPassword,
      recipientEmail,
      'New ONJJEM Order - ' + orderDetails.order_id,
      emailBody
    );

    console.log('Order email sent:', smtpResponse);
    return smtpResponse;

  } catch (error) {
    console.error('Email sending error:', error);
    // Don't fail the webhook - log and continue
    return { error: error.message };
  }
}

async function sendViaGmailSMTP(sender, password, recipient, subject, body) {
  try {
    // Use Cloudflare's Mailchannels integration for SMTP relay
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: recipient }] }],
        from: { email: sender, name: 'ONJJEM Orders' },
        subject: subject,
        content: [{
          type: 'text/html',
          value: body
        }],
        reply_to: { email: sender }
      })
    });

    if (!response.ok) {
      throw new Error(`SMTP failed: ${response.status}`);
    }

    return { success: true };

  } catch (error) {
    console.error('SMTP error:', error);
    throw error;
  }
}

function formatOrderEmail(order) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>New Order Received</h2>
        
        <p><strong>Order ID:</strong> ${order.order_id}</p>
        <p><strong>Customer Email:</strong> ${order.customer_email}</p>
        
        <h3>Product Details</h3>
        <p><strong>SKU:</strong> ${order.sku}</p>
        <p><strong>Cartoonify Upgrade:</strong> ${order.cartoonify_upgrade ? 'Yes (+£1.99)' : 'No'}</p>
        
        <h3>Photo</h3>
        <p><strong>URL:</strong> <a href="${order.photo_url}">${order.photo_url}</a></p>
        
        <h3>Shipping Address</h3>
        <p>
          ${order.shipping_address.name}<br>
          ${order.shipping_address.line1}<br>
          ${order.shipping_address.line2 ? order.shipping_address.line2 + '<br>' : ''}
          ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}<br>
          ${order.shipping_address.country}
        </p>
        
        <hr>
        <p style="font-size: 12px; color: #999;">
          This is an automated order notification from ONJJEM. Please process this order on Imprintable.io dashboard.
        </p>
      </body>
    </html>
  `;
}

// ───────────── Colouring page checkout + competition, run on Cloudflare (no Railway) ─────────────
// Needs these Cloudflare secrets: STRIPE_SECRET_KEY, GEMINI_API_KEY, RESEND_API_KEY.
// If STRIPE_SECRET_KEY is missing these routes fall through to the Railway backend.
const PB_ROUTES = ['/api/printable-checkout', '/api/printable-draw', '/api/printable-email', '/api/contest-entry'];
const PB_CLOSES = Date.parse('2026-10-31T18:00:00Z');
const PB_ADMIN = 'Skeff001@yahoo.com';

const PB_PROMPT =
  "Turn this photo into a printable children's colouring page. Black outlines " +
  "only on a pure white background: no colour at all, no grey shading, no " +
  "filled black areas (except tiny details like pupils). Every outline must be " +
  "BOLD, thick (about 4 pixels), dark black and fully joined up, with no gaps, " +
  "no faint, sketchy or broken lines. Draw the same people " +
  "and pets from the photo as cute, friendly cartoon characters dressed in fun " +
  "Halloween costumes that suit them (a witch hat, a pumpkin outfit, a friendly " +
  "vampire cape, cat ears, a superhero cape). They must stay recognisable to " +
  "their family: same number of people and pets, same hairstyles, glasses, " +
  "ages and breeds. Never add any person or animal that is not in the photo. " +
  "Around them add simple Halloween things to colour in: " +
  "smiling jack-o'-lanterns, friendly bats, a big moon, sweets and a cute " +
  "haunted house. Thick, clean, smooth, closed outlines with big areas to " +
  "colour, suitable for children aged 3 to 10 using crayons. Portrait " +
  "layout. Cute and cheerful, never scary. No text, no letters, no " +
  "watermarks. Output only the image.";
const PB_XMAS_PROMPT = PB_PROMPT
  .replace("fun Halloween costumes that suit them (a witch hat, a pumpkin outfit, a friendly vampire cape, cat ears, a superhero cape)", "cosy Christmas outfits that suit them (Santa hats, elf hats, reindeer antlers, Christmas jumpers, scarves)")
  .replace("simple Halloween things to colour in: smiling jack-o'-lanterns, friendly bats, a big moon, sweets and a cute haunted house", "simple Christmas things to colour in: a decorated Christmas tree, wrapped presents, stockings, snowflakes, a smiling snowman and stars")
  .replace("Cute and cheerful, never scary.", "Cosy, festive and cheerful.");

const pbJson = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

async function pbStripe(env, method, path, params) {
  const init = { method, headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY } };
  if (params) { init.body = new URLSearchParams(params).toString(); init.headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
  const r = await fetch('https://api.stripe.com/v1' + path, init);
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'Stripe error');
  return j;
}

// A paid colouring-page session (and its payment record, where we keep small counters).
async function pbPaidSession(env, sid) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(String(sid || ''))) throw new PbErr(400, 'Bad link');
  const s = await pbStripe(env, 'GET', '/checkout/sessions/' + sid);
  if (s.payment_status !== 'paid' || !String((s.metadata || {}).sku || '').startsWith('printable-')) throw new PbErr(402, "We couldn't find a paid colouring page order for this link.");
  const pi = typeof s.payment_intent === 'string' ? s.payment_intent : (s.payment_intent && s.payment_intent.id);
  if (!pi) throw new PbErr(402, 'Payment not found');
  const p = await pbStripe(env, 'GET', '/payment_intents/' + pi);
  return { s, pi, meta: p.metadata || {} };
}
class PbErr extends Error { constructor(status, msg) { super(msg); this.status = status; } }

const pbText = (html) => String(html || '').replace(/<br\s*\/?>(?!\n)/gi, '\n').replace(/<\/(p|h2|div)>/gi, '\n\n').replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, '$2 ($1)').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\n{3,}/g, '\n\n').trim();
async function pbResend(env, payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    // A plain-text copy and a reply-to address help emails land in the inbox, not spam.
    body: JSON.stringify(Object.assign({ from: 'ONJJEM <hello@onjjem.com>', reply_to: 'hello@onjjem.com', text: pbText(payload.html) }, payload)),
  });
  if (!r.ok) throw new Error('Email failed: ' + (await r.text()).slice(0, 200));
}

async function pbGemini(env, photoDataUrl, theme) {
  const m = /^data:(image\/[a-z+]+);base64,(.+)$/s.exec(photoDataUrl || '');
  if (!m) throw new PbErr(400, 'Please choose a photo (JPG or PNG).');
  const body = JSON.stringify({
    contents: [{ parts: [{ inline_data: { mime_type: m[1], data: m[2] } }, { text: theme === 'christmas' ? PB_XMAS_PROMPT : PB_PROMPT }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  });
  const call = async (model) => {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', { method: 'POST', headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'Content-Type': 'application/json' }, body });
    if (!r.ok) throw new Error('Gemini ' + r.status);
    const j = await r.json();
    const part = (((j.candidates || [])[0] || {}).content || {}).parts;
    const img = (part || []).map((p) => p.inlineData || p.inline_data).find(Boolean);
    if (!img) throw new Error('No image returned');
    return { image: img.data, mime: img.mimeType || img.mime_type || 'image/png' };
  };
  try { return await call(env.CARTOON_MODEL || 'gemini-3.1-flash-image'); }
  catch (e) { return await call('gemini-2.5-flash-image'); }
}

const pbEsc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pbWrap = (inner) => '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#222;line-height:1.6"><div style="background:#12100B;color:#fff;text-align:center;padding:18px;border-radius:12px 12px 0 0"><div style="font-size:11px;letter-spacing:.2em;color:#C9960C">UK FAMILY BUSINESS</div><div style="font-size:28px;font-weight:800;letter-spacing:.12em">ONJJEM</div></div><div style="border:1px solid #eee;border-top:0;padding:20px;border-radius:0 0 12px 12px">' + inner + '</div></div>';

async function handlePB(path, request, env) {
  try {
    const b = await request.json();
    if (path === '/api/printable-checkout') {
      const photo = String(b.photo || '');
      if (!/^data:image\/[a-z+]+;base64,.+$/s.test(photo) || photo.length > 8000000) return pbJson({ error: 'Please choose a photo (JPG or PNG).' }, 400);
      const us = b.region === 'us';
      const xm = b.theme === 'christmas';
      const base = b.page && /^\/[a-z0-9/._-]*$/i.test(b.page) ? b.page : (us ? '/us/printables' : '/printables');
      const s = await pbStripe(env, 'POST', '/checkout/sessions', {
        mode: 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': us ? 'usd' : 'gbp',
        'line_items[0][price_data][unit_amount]': us ? '299' : '199',
        'line_items[0][price_data][product_data][name]': (xm ? 'Christmas ' : 'Halloween ') + (us ? 'coloring' : 'colouring') + ' page of your photo + FREE ' + (xm ? 'Halloween' : 'Christmas') + ' page (instant download)',
        'metadata[sku]': 'printable-coloring',
        'metadata[theme]': xm ? 'christmas' : 'halloween',
        'payment_intent_data[metadata][sku]': 'printable-coloring',
        'custom_text[submit][message]': 'Instant download: we draw your Halloween page plus a FREE Christmas page straight after you pay (about 30 seconds) and email you both. Keep the page open until they appear.',
        success_url: 'https://onjjem.com' + base + '?paid=1&session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://onjjem.com' + base + '?back=1',
      });
      return pbJson({ url: s.url, id: s.id });
    }

    const { s, pi, meta } = await pbPaidSession(env, b.session_id);
    const us = String(s.currency || '').toLowerCase() === 'usd';

    if (path === '/api/printable-draw') {
      const theme = b.theme === 'christmas' ? 'christmas' : 'halloween';
      const key = 'd_' + theme;
      const n = parseInt(meta[key] || '0', 10);
      if (n >= 4) return pbJson({ error: 'Your drawing limit was reached. Email hello@onjjem.com and we will send your pages.' }, 429);
      await pbStripe(env, 'POST', '/payment_intents/' + pi, { ['metadata[' + key + ']']: String(n + 1) });
      const out = await pbGemini(env, b.photo, theme);
      return pbJson({ image: out.image, mime: out.mime });
    }

    const email = (s.customer_details && s.customer_details.email) || '';

    if (path === '/api/printable-email') {
      if (meta.emailed === '1') return pbJson({ ok: true, already: true });
      const files = (Array.isArray(b.files) ? b.files : []).slice(0, 2).filter((f) => f && /^[A-Za-z0-9._-]+\.png$/.test(f.filename || '') && typeof f.base64 === 'string');
      if (!email || !files.length) return pbJson({ ok: false });
      await pbStripe(env, 'POST', '/payment_intents/' + pi, { 'metadata[emailed]': '1' });
      const col = us ? 'coloring' : 'colouring';
      const link = 'https://onjjem.com' + (us ? '/us/printables' : '/printables') + '?paid=1&session_id=' + encodeURIComponent(b.session_id) + '#contest';
      await pbResend(env, {
        to: email,
        subject: (b.theme === 'christmas' ? '🎄 Your Christmas ' : '🎃 Your Halloween ') + col + ' page is ready (plus a free ' + (b.theme === 'christmas' ? 'Halloween' : 'Christmas') + ' one)',
        html: pbWrap('<h2 style="margin:0 0 10px">Here are your ' + col + ' pages! 🎃🎄</h2><p>Thank you for your order. Your Halloween page and your FREE Christmas page are attached. To print: open the file, tap Share, then Print, on ' + (us ? 'Letter' : 'A4') + ' paper. Print as many copies as you like.</p><div style="border:2px solid #C9960C;border-radius:12px;padding:12px 14px;margin:14px 0"><b>🏆 The ONJJEM ' + (us ? 'Coloring' : 'Colouring') + ' Championship</b><br>Your order includes one entry. When it is ' + col.replace('ing', 'ed') + ' in, send us a photo of your masterpiece. Our judges crown ONE champion, who gets their artwork printed on a ' + (us ? 'photo' : 'magic') + ' mug, plus a ' + (us ? '$60' : '£50') + ' ONJJEM gift card! Closes Sat 31 Oct, 6pm UK. Champion crowned at 9pm on Halloween night!<br><a href="' + link + '" style="color:#8E2DE2;font-weight:700">Enter the Championship →</a></div><p>Love it? We can print your family as a cartoon on a blanket, mug or canvas: <a href="https://onjjem.com' + (us ? '/us/' : '/') + '">onjjem.com</a></p><p style="font-size:12px;color:#888">Any problems? Just reply to this email.</p>'),
        attachments: files.map((f) => ({ filename: f.filename, content: f.base64 })),
      });
      await pbResend(env, { to: PB_ADMIN, subject: '🎨 Colouring page sold (' + (us ? '$2.99' : '£1.99') + '): ' + email, html: pbWrap('<p>New colouring page order from <b>' + pbEsc(email) + '</b> (' + (us ? 'US' : 'UK') + ').</p>') }).catch(() => {});
      return pbJson({ ok: true });
    }

    if (path === '/api/contest-entry') {
      if (Date.now() >= PB_CLOSES) return pbJson({ error: 'Sorry, the competition has closed.' }, 400);
      const name = String(b.name || '').trim().slice(0, 60);
      if (!name) return pbJson({ error: 'Please add your first name.' }, 400);
      if (!b.adult) return pbJson({ error: "Please confirm you're 18+ (a parent or carer) and agree to the rules." }, 400);
      const m = /^data:(image\/[a-z+]+);base64,(.+)$/s.exec(String(b.photo || ''));
      if (!m || String(b.photo).length > 8000000) return pbJson({ error: 'Please add a photo of the coloured-in page.' }, 400);
      if (meta.contest === '1') return pbJson({ ok: true, already: true });
      await pbStripe(env, 'POST', '/payment_intents/' + pi, { 'metadata[contest]': '1' });
      const child = String(b.child || '').trim().slice(0, 40);
      const ext = m[1].split('/')[1].replace('jpeg', 'jpg').replace(/[^a-z]/g, '') || 'jpg';
      await pbResend(env, {
        to: PB_ADMIN,
        subject: '🏆 Colouring competition entry: ' + name + (child ? ' (' + child + ')' : '') + ' · ' + (us ? 'US' : 'UK'),
        html: pbWrap('<p><b>New colouring competition entry</b></p><p>Entered by <b>' + pbEsc(name) + '</b> (' + pbEsc(email) + ')<br>Artist: ' + pbEsc(child || '-') + '<br>Country: ' + (us ? 'US' : 'UK') + '</p><p>Photo attached. Keep all entry emails in one folder to judge on Halloween: entries close 6pm Sat 31 Oct, crown the champion at 9pm.</p>'),
        attachments: [{ filename: 'entry-' + name.replace(/[^A-Za-z0-9]/g, '') + '.' + ext, content: m[2] }],
      });
      if (email) await pbResend(env, { to: email, subject: "You're entered in the ONJJEM colouring competition! 🏆", html: pbWrap('<h2 style="margin:0 0 10px">You\'re in, ' + pbEsc(name.split(' ')[0]) + '! 🖍️</h2><p>We have your entry. Good luck to your little artist! We pick the best colouring and crown the champion at 9pm on Halloween night (Sat 31 Oct).</p><p>The champion gets their artwork printed on a ' + (us ? 'photo' : 'magic') + ' mug, plus a ' + (us ? '$60' : '£50') + ' ONJJEM gift card.</p>') }).catch(() => {});
      return pbJson({ ok: true, already: false });
    }
    return pbJson({ error: 'Not found' }, 404);
  } catch (err) {
    if (err instanceof PbErr) return pbJson({ error: err.message }, err.status);
    console.error('PB error', err && err.message);
    return pbJson({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
