// Halloween Colouring Championship promo: a bottom pop-up on every page view, plus a top bar.
// Runs until entries close (Sat 31 Oct, 6pm UK). Never on the colouring page or giveaway page.
(function(){
  if (new Date() >= new Date("2026-10-31T18:00:00Z")) return; // Championship closes Sat 31 Oct, 6pm UK
  // Top priority until Halloween: on every page except the colouring page itself and the giveaway entry form.
  if (/printables|giveaway/.test(location.pathname)) return;
  var US = /^\/us(\/|$)/.test(location.pathname) || /region=us/.test(location.search);
  var href = US ? "/us/printables" : "/printables", price = US ? "$1.49" : "99p", w = US ? "coloring" : "colouring";
  var ga = function(a){ try { gtag("event", "printable_promo", { action: a }); } catch(e){} };
  var css = document.createElement("style");
  css.textContent = ".prp{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:440px;margin:0 auto;background:linear-gradient(160deg,#4a1466,#1e0a2c);color:#fff;border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.55);border:2px solid #FF962A;font-family:system-ui,-apple-system,sans-serif;transform:translateY(130%);transition:transform .45s cubic-bezier(.2,1.2,.4,1);overflow:hidden}.prp.in{transform:none}.prp .pi{display:flex;gap:12px;padding:14px 14px 12px}.prp img{width:104px;height:104px;object-fit:cover;border-radius:12px;flex:none;background:#fff}.prp .k{display:inline-block;background:#FF962A;color:#2a0d3d;font-weight:900;font-size:11px;padding:3px 9px;border-radius:12px;letter-spacing:.05em}.prp h3{margin:6px 0 4px;font-size:18px;line-height:1.2}.prp p{margin:0;font-size:13px;opacity:.85;line-height:1.35}.prp a.b{display:block;margin:0 14px 14px;text-align:center;background:linear-gradient(90deg,#E8287F,#FF8A1C);color:#fff;font-weight:900;font-size:17px;padding:13px;border-radius:14px;text-decoration:none}.prp .x{position:absolute;top:6px;right:8px;background:rgba(0,0,0,.25);border:0;color:#fff;font-size:20px;width:30px;height:30px;border-radius:50%;cursor:pointer;line-height:30px;padding:0}.prp .em{font-size:20px;display:inline-block;animation:prw 1s ease-in-out infinite alternate}@keyframes prw{to{transform:rotate(14deg) scale(1.15)}}";
  document.head.appendChild(css);
  function show(){
    var d = document.createElement("div"); d.className = "prp"; d.setAttribute("role","dialog");
    d.innerHTML = '<button class="x" aria-label="Close">×</button><div class="pi"><img src="/pr-promo.webp?v=3" alt=""><div><span class="k">🏆 HALLOWEEN ' + w.toUpperCase() + ' CHAMPIONSHIP</span><h3><span class="em">🎃</span> Win a ' + (US ? '$60' : '£50') + ' gift card!</h3><p>Plus their artwork on a ' + (US ? 'photo' : 'magic') + ' mug! Get your family\'s ' + w + ' page for ' + price + ', colour it in and send it back. Closes Sat 31 Oct, 6pm UK.</p></div></div><a class="b" href="' + href + '">🖍️ Enter now</a>';
    document.body.appendChild(d);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ d.classList.add("in"); }); });
    ga("shown");
    d.querySelector(".x").onclick = function(){ d.classList.remove("in"); setTimeout(function(){ d.remove(); }, 500); ga("closed"); };
    d.querySelector("a.b").onclick = function(){ ga("click"); };
  }
  // Halloween and cartoon pages: a bold strip at the very top too.
  {
    var addStrip = function(){
      if (document.getElementById("prStrip")) return;
      var a = document.createElement("a"); a.id = "prStrip"; a.href = href;
      a.setAttribute("style","display:block;position:relative;z-index:60;background:linear-gradient(90deg,#4a1466,#8E2DE2);color:#fff;font:800 15px/1.35 system-ui,sans-serif;text-align:center;padding:11px 14px;text-decoration:none;border-bottom:2px solid #FF962A");
      a.innerHTML = "🏆 Halloween " + w.charAt(0).toUpperCase() + w.slice(1) + " Championship: win your artwork on a " + (US ? "photo" : "magic") + " mug + " + (US ? "$60" : "£50") + " gift card! <u>Enter →</u>";
      a.onclick = function(){ ga("strip_click"); };
      document.body.insertBefore(a, document.body.firstChild);
    };
    if (document.body) addStrip(); else document.addEventListener("DOMContentLoaded", addStrip);
  }
  // Show after 7 seconds, or when they start scrolling down, whichever comes first.
  var done = false, go = function(){ if (done) return; done = true; show(); };
  setTimeout(go, 4000);
  window.addEventListener("scroll", function(){ if (window.scrollY > 400) go(); }, { passive: true });
})();
