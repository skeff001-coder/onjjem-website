// Halloween decorations (homepages + Halloween pages): fine see-through cobwebs on
// the edges and two spiders that slowly drop to halfway down the screen and climb
// back up. Never block taps (pointer-events: none). Switch off on 1 November.
(function(){
  if (new Date() >= new Date("2026-11-01T00:00:00")) return;
  var st=document.createElement('style');
  st.textContent='.hw2{position:fixed;inset:0;pointer-events:none;z-index:40;overflow:hidden}\n.hw2 svg.w{position:absolute;width:150px;height:150px;opacity:.38}\n.hw2 .tl{top:0;left:0}.hw2 .tr{top:0;right:0;transform:scaleX(-1)}\n.hw2 .ml{top:42%;left:0;transform:rotate(-90deg) scale(.7);transform-origin:0 0}\n.hw2 .mr{top:58%;right:0;transform:scaleX(-1) rotate(-90deg) scale(.7);transform-origin:0 0}\n.hw2 .bl{bottom:0;left:0;transform:scaleY(-1) scale(.85);transform-origin:0 100%}\n.hw2 .br{bottom:0;right:0;transform:scale(-.85,-.85);transform-origin:100% 100%}\n.hw2 .sp{position:absolute;top:0;width:26px;animation:hw2sway 3s ease-in-out infinite;transform-origin:50% 0}\n.hw2 .sp i{display:block;width:1px;margin:0 auto;background:rgba(235,235,235,.45);height:60px;animation:hw2drop 11s ease-in-out infinite}\n.hw2 .sp svg{display:block;width:26px;height:26px;margin-top:-2px}\n.hw2 .s1{left:5%}\n.hw2 .s2{right:6%;animation-delay:-1.4s}.hw2 .s2 i{animation-delay:-5.5s;animation-duration:13s}\n@keyframes hw2drop{0%,100%{height:50px}15%{height:70px}50%,60%{height:50vh}85%{height:90px}}\n@keyframes hw2sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}\n@media (max-width:600px){.hw2 svg.w{width:96px;height:96px}.hw2 .ml,.hw2 .mr{display:none}}\n@media (prefers-reduced-motion:reduce){.hw2 .sp,.hw2 .sp i{animation:none}.hw2 .sp i{height:120px}}';
  document.head.appendChild(st);
  var box=document.createElement('div'); box.className='hw2'; box.id='hw2'; box.setAttribute('aria-hidden','true');
  (document.body||document.documentElement).appendChild(box);


  var web='<svg class="w CLS" viewBox="0 0 100 100"><g fill="none" stroke="rgba(235,235,235,.9)" stroke-width=".7">'+
    '<path d="M0 0L100 6M0 0L90 38M0 0L64 68M0 0L34 92M0 0L6 100"/>'+
    '<path d="M18 1Q15 8 16 15Q10 13 5 18Q3 11 1 18"/><path d="M38 3Q33 15 33 28Q22 27 12 35Q9 22 3 37"/>'+
    '<path d="M60 4Q53 22 52 42Q36 42 21 54Q15 37 5 57"/><path d="M84 5Q75 30 72 56Q50 57 28 76Q21 54 7 80"/></g></svg>';
  var spider='<span class="sp CLS"><i></i><svg viewBox="0 0 40 40"><g stroke="#0d0d0d" stroke-width="2.2" fill="none" stroke-linecap="round">'+
    '<path d="M14 18L5 12L2 4M14 21L4 20L1 26M15 24L6 29L5 37M26 18L35 12L38 4M26 21L36 20L39 26M25 24L34 29L35 37"/></g>'+
    '<ellipse cx="20" cy="22" rx="8" ry="9" fill="#111"/><circle cx="20" cy="12" r="5.5" fill="#111"/>'+
    '<circle cx="17.8" cy="11.3" r="1.5" fill="#ff8a1c"/><circle cx="22.2" cy="11.3" r="1.5" fill="#ff8a1c"/></svg></span>';
  var h='';['tl','tr','ml','mr','bl','br'].forEach(function(c){h+=web.replace('CLS',c)});
  h+=spider.replace('CLS','s1')+spider.replace('CLS','s2');
  document.getElementById('hw2').innerHTML=h;

  // Big spider: 3s after landing, drops from the top centre on its thread, wriggles,
  // then climbs back up and disappears (once per visit; skipped for reduced motion).
  try {
    return; // Big drop-down spider switched off: it covered the headline on first visit.
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('onjjem_bigspider')) return;
    sessionStorage.setItem('onjjem_bigspider','1');
  } catch (e) {}
  var bs=document.createElement('style');
  bs.textContent='.hwbig{position:absolute;top:0;left:50%;width:210px;margin-left:-105px;transform:translateY(-190px);animation:hwbigdrop 5.6s forwards}\n'+
    '.hwbig i{position:absolute;bottom:calc(100% - 22px);left:50%;width:2px;margin-left:-1px;height:100vh;background:rgba(245,245,245,.85)}\n'+
    '.hwbig svg{display:block;width:210px;height:210px;filter:drop-shadow(0 0 6px rgba(255,140,40,.55)) drop-shadow(0 8px 12px rgba(0,0,0,.5));animation:hwbigsway 1.1s ease-in-out infinite;transform-origin:50% 0}\n'+
    '.hwbig .lg{animation:hwleg .16s ease-in-out infinite alternate;transform-origin:50px 52px}\n'+
    '.hwbig .rg{animation:hwleg .16s ease-in-out infinite alternate-reverse;transform-origin:50px 52px}\n'+
    '@keyframes hwbigdrop{0%{transform:translateY(-190px);animation-timing-function:cubic-bezier(.55,0,.9,.6)}'+
      '14%{transform:translateY(40vh);animation-timing-function:ease-out}19%{transform:translateY(33vh);animation-timing-function:ease-in-out}'+
      '24%{transform:translateY(38vh)}64%{transform:translateY(36vh);animation-timing-function:cubic-bezier(.5,0,.75,0)}100%{transform:translateY(-210px)}}\n'+
    '@keyframes hwbigsway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}\n'+
    '@keyframes hwleg{from{transform:rotate(-7deg)}to{transform:rotate(7deg)}}\n'+
    '@media (max-width:600px){.hwbig{width:170px;margin-left:-85px}.hwbig svg{width:170px;height:170px}}';
  document.head.appendChild(bs);
  setTimeout(function(){
    var b=document.createElement('div'); b.className='hwbig';
    b.innerHTML='<i></i><svg viewBox="0 0 100 100">'+
      '<g class="lg" stroke="#0b0b0b" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round">'+
        '<path d="M40 44L24 30L14 8"/><path d="M38 50L18 42L4 30"/><path d="M38 56L16 60L4 74"/><path d="M41 62L26 76L20 96"/></g>'+
      '<g class="rg" stroke="#0b0b0b" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round">'+
        '<path d="M60 44L76 30L86 8"/><path d="M62 50L82 42L96 30"/><path d="M62 56L84 60L96 74"/><path d="M59 62L74 76L80 96"/></g>'+
      '<ellipse cx="50" cy="64" rx="17" ry="20" fill="#121212"/>'+
      '<ellipse cx="50" cy="62" rx="9" ry="11" fill="#2a0d00" opacity=".55"/>'+
      '<circle cx="50" cy="40" r="12" fill="#151515"/>'+
      '<circle cx="45" cy="38" r="3.4" fill="#ff3b1a"/><circle cx="55" cy="38" r="3.4" fill="#ff3b1a"/>'+
      '<circle cx="45.8" cy="37.2" r="1.1" fill="#ffd2a0"/><circle cx="55.8" cy="37.2" r="1.1" fill="#ffd2a0"/>'+
      '<circle cx="47" cy="33" r="1.6" fill="#ff3b1a"/><circle cx="53" cy="33" r="1.6" fill="#ff3b1a"/>'+
      '<path d="M46 47L47.5 52L49 47M51 47L52.5 52L54 47" fill="#f2f2f2"/></svg>';
    document.getElementById('hw2').appendChild(b);
    setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); }, 6000);
  }, 3000);

})();
