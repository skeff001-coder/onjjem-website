// Jemzi's Christmas Surprise Sack showcase. Drop <div class="xs-mount"></div> where it should appear.
(function () {
  if (!document.querySelector('link[data-xs-font]')) {
    var l = document.createElement("link");
    l.rel = "stylesheet"; l.setAttribute("data-xs-font", "1");
    l.href = "https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&display=swap";
    document.head.appendChild(l);
  }
  var css = `
  .xs-hero{position:relative;display:block;overflow:hidden;max-width:1100px;margin:1rem auto;border-radius:22px;text-decoration:none;color:#fff8e6;
    background:radial-gradient(ellipse at 50% 35%,#8f1d1d 0%,#5a0d12 55%,#2a0508 100%);border:2px solid #d4af37;
    box-shadow:0 0 0 4px rgba(212,175,55,.18),0 18px 40px rgba(0,0,0,.45);padding:1.4rem 1.1rem 1.5rem;text-align:center;font-family:system-ui,-apple-system,sans-serif}
  .xs-hero:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.85;
    background-image:radial-gradient(2px 2px at 20px 30px,#fff,transparent),radial-gradient(2px 2px at 120px 80px,#fff,transparent),radial-gradient(3px 3px at 220px 20px,#fff,transparent),radial-gradient(2px 2px at 300px 120px,#fff,transparent),radial-gradient(2px 2px at 60px 160px,#fff,transparent),radial-gradient(3px 3px at 180px 200px,#fff,transparent);
    background-size:340px 240px;animation:xsSnow 9s linear infinite}
  @keyframes xsSnow{from{background-position:0 0}to{background-position:40px 240px}}
  .xs-ribbon{display:inline-block;background:linear-gradient(90deg,#1f6b3a,#2e8b4f);color:#fff;font-weight:800;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;padding:.4rem 1rem;border-radius:99px;border:1px solid #d4af37;position:relative}
  .xs-title{font-family:"Mountains of Christmas",Georgia,serif;font-weight:700;font-size:clamp(2.4rem,9vw,4rem);line-height:1;margin:.5rem 0 .2rem;position:relative;
    background:linear-gradient(180deg,#fff6d6 0%,#f5d78e 45%,#c9960c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(0 3px 0 rgba(0,0,0,.45))}
  .xs-tag{font-size:clamp(1.1rem,4.6vw,1.45rem);font-weight:800;margin:.3rem 0 .9rem;position:relative}
  .xs-tag b{color:#ffd66b}
  .xs-img{width:100%;max-width:640px;border-radius:16px;display:block;margin:0 auto 1rem;position:relative;animation:xsGlow 2.6s ease-in-out infinite}
  @keyframes xsGlow{0%,100%{box-shadow:0 0 18px rgba(245,215,142,.35)}50%{box-shadow:0 0 38px rgba(245,215,142,.75)}}
  .xs-list{list-style:none;padding:0;margin:0 auto 1rem;max-width:520px;text-align:left;position:relative}
  .xs-list li{font-size:1.05rem;font-weight:700;padding:.45rem .2rem;border-bottom:1px dashed rgba(245,215,142,.35)}
  .xs-list li:last-child{border:0;color:#ffd66b;font-style:italic}
  .xs-price{position:relative;margin:.4rem 0 .2rem;font-size:1.05rem}
  .xs-price span{opacity:.9;margin-right:.4rem}
  .xs-price b{font-size:2rem;color:#ffd66b;vertical-align:middle}
  .xs-btn{position:relative;display:inline-block;margin:.7rem 0 .5rem;padding:1rem 2.2rem;border-radius:99px;font-weight:900;font-size:1.2rem;color:#2a0508;
    background:linear-gradient(135deg,#f5d78e,#d4af37 50%,#f5d78e);box-shadow:0 6px 0 #8b6200;animation:xsPulse 1.8s ease-in-out infinite}
  @keyframes xsPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
  .xs-small{position:relative;display:block;font-size:.85rem;opacity:.85}
  @media (prefers-reduced-motion:reduce){.xs-hero:before,.xs-img,.xs-btn{animation:none}}`;
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var html =
    '<a class="xs-hero" href="/christmas?pick=jemzi-surprise-sack#order">' +
    '<span class="xs-ribbon">🎄 New · only at ONJJEM 🎄</span>' +
    '<div class="xs-title">Jemzi\'s Christmas<br>Surprise Sack</div>' +
    '<p class="xs-tag">A giant Santa sack <b>STUFFED</b> with personalised goodies! 🎁</p>' +
    '<img class="xs-img" src="/xmas-sack-showcase.webp?v=1" alt="Santa sack full of personalised Christmas gifts" loading="lazy">' +
    '<ul class="xs-list">' +
    '<li>✨ A MAGIC mug: pour in hot chocolate and your photo appears</li>' +
    '<li>🎄 Shatterproof photo baubles for the tree</li>' +
    '<li>🃏 Your family on a whole deck of playing cards</li>' +
    '<li>🎅 A huge Santa sack with your photo on it</li>' +
    '<li>🧲 A photo fridge magnet, a letter from Jemzi…</li>' +
    '<li>🦔 …and even more surprises hidden inside!</li>' +
    '</ul>' +
    '<div class="xs-price"><span>Worth over £100, yours for</span> <b>£79.99</b></div>' +
    '<span class="xs-btn">Fill my sack 🎁</span>' +
    '<span class="xs-small">Every gift made with YOUR photos · Free UK delivery · Order by 12 Dec for Christmas</span>' +
    '</a>';
  document.querySelectorAll(".xs-mount").forEach(function (m) { m.innerHTML = html; });
})();
