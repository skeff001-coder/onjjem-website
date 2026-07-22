export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Homepage and old landing page go straight to the gift shop
    if (url.pathname === '/' || url.pathname === '/onjjem-landing.html') {
      return Response.redirect(url.origin + '/shop', 302);
    }

    // Proxy API calls to the Railway backend (checkout, uploads, etc.)
    if (url.pathname.startsWith('/api/')) {
      const target = 'https://onjjem-production-5ef8.up.railway.app' + url.pathname + url.search;
      return fetch(new Request(target, request));
    }

    // Serve static files; fall back to the app for client-side routes
    const res = await env.ASSETS.fetch(request);
    if (res.status === 404 && (request.headers.get('accept') || '').includes('text/html')) {
      return env.ASSETS.fetch(new Request(url.origin + '/index.html', request));
    }
    return res;
  }
};
