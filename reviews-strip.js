// Small rotating "what customers say" line. Real customer reviews only:
// keep this list in step with ONJJEM_REVIEWS in landing.js.
// Usage: <div class="rv-strip"></div> anywhere on a page, then load this file.
(function () {
  var R = [
    ["My Yorkshire terrier on the Magic mug is class in the cartoon style. Kids love it!", "C. Murphy", "Magic Reveal mug"],
    ["Arrived in just 3 days, and the colours look brilliant.", "W Taylor", "cartoon prints"],
    ["The heat-activated effect works perfectly. Really happy with it!", "Niamh", "colour-changing mug"]
  ];
  var css = document.createElement("style");
  css.textContent =
    ".rv-strip{max-width:520px;margin:14px auto 0;text-align:center;min-height:3.2em;font-size:.92rem;line-height:1.4;color:#d9cfb8}" +
    ".rv-strip .rv-q{font-style:italic;transition:opacity .6s}" +
    ".rv-strip .rv-who{display:block;font-style:normal;font-size:.78rem;color:#a89a7c;margin-top:3px}" +
    ".rv-strip .rv-h{display:block;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:#d4af37;margin-bottom:4px}";
  document.head.appendChild(css);
  function start(el) {
    el.innerHTML = '<span class="rv-h">What our customers say</span><span class="rv-q"></span>';
    var q = el.querySelector(".rv-q"), i = Math.floor(Math.random() * R.length);
    function show() {
      var r = R[i % R.length];
      q.innerHTML = "“" + r[0] + "”<span class=\"rv-who\">" + r[1] + " · bought " + (/s$/.test(r[2]) ? "" : "a ") + r[2] + "</span>";
      q.style.opacity = 1;
    }
    show();
    setInterval(function () { q.style.opacity = 0; setTimeout(function () { i++; show(); }, 600); }, 5000);
  }
  function go() { Array.prototype.forEach.call(document.querySelectorAll(".rv-strip"), start); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
