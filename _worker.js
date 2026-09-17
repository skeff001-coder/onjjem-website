export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API proxy to Railway backend
    if (url.pathname.startsWith('/api/')) {
      const target = 'https://onjjem-production-5ef8.up.railway.app' + url.pathname + url.search;
      return fetch(new Request(target, request));
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
