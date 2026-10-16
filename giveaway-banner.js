// Giveaway banner: shows on main pages until Sun 1 Nov 2026, 8pm UK (20:00 UTC).
(function(){
  if (new Date() >= new Date("2026-11-01T20:00:00Z")) return;
  try { if (sessionStorage.getItem('onjjem_gw_closed')) return; } catch(e){}
  var b=document.createElement('div');
  b.setAttribute('style','position:relative;z-index:50;background:linear-gradient(90deg,#E8287F,#FF8A1C);color:#fff;font:700 15px/1.35 system-ui,sans-serif;text-align:center;padding:11px 40px 11px 14px');
  b.innerHTML='🎁 <b>GIVEAWAY:</b> win a FREE poster of your pet as a cartoon! <a href="/giveaway#enter" style="color:#fff;text-decoration:underline">Enter free →</a>'+
    '<button aria-label="Close" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:#fff;font-size:20px;cursor:pointer">×</button>';
  b.querySelector('a').onclick=function(){try{gtag('event','giveaway_banner_click');}catch(e){}};
  b.querySelector('button').onclick=function(){b.remove();try{sessionStorage.setItem('onjjem_gw_closed','1')}catch(e){}};
  (document.body||document.documentElement).insertBefore(b,document.body.firstChild);
})();
