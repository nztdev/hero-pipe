/* ═══════════════════════════════════════════════════════════════
   HERO'S PIPE — LOADER MODULE v1.0
   Entry animations and exit transitions for exported heroes.

   Exposes: window.HeroPipeLoader
     .init(config)     — run entry animation, then call onComplete
     .exit(config, cb) — run exit animation, then call cb

   Styles: fade | wipe | bloom | glitch | bars
═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  function injectStyles() {
    if (document.getElementById('hp-loader-styles')) return;
    var s = document.createElement('style');
    s.id = 'hp-loader-styles';
    s.textContent = '#hp-loader{position:fixed;inset:0;z-index:9000;pointer-events:all;overflow:hidden;}';
    document.head.appendChild(s);
  }

  function el(tag, css, parent) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (parent) parent.appendChild(e);
    return e;
  }

  function hexToRgb(hex) {
    hex = (hex || '#04040C').replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return { r: parseInt(hex.substr(0,2),16), g: parseInt(hex.substr(2,2),16), b: parseInt(hex.substr(4,2),16) };
  }

  /* ── FADE ── */
  function runFade(cfg, onDone) {
    var dur = cfg.duration || 900;
    var o = el('div','position:fixed;inset:0;z-index:9000;background:'+(cfg.color||'#04040C')+';transition:opacity '+(dur/1000).toFixed(2)+'s ease;',document.body);
    o.style.opacity='1';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      o.style.opacity='0';
      setTimeout(function(){ if(o.parentNode)o.parentNode.removeChild(o); if(onDone)onDone(); }, dur+50);
    });});
  }
  function exitFade(cfg, cb) {
    var dur=(cfg.duration||900)*0.7;
    var o=el('div','position:fixed;inset:0;z-index:9000;background:'+(cfg.color||'#04040C')+';opacity:0;pointer-events:none;transition:opacity '+(dur/1000).toFixed(2)+'s ease;',document.body);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ o.style.opacity='1'; setTimeout(function(){if(cb)cb();},dur); }); });
  }

  /* ── WIPE ── */
  function runWipe(cfg, onDone) {
    var dur=cfg.duration||900, color=cfg.color||'#04040C', dir=cfg.wipeDir||'left';
    var W=window.innerWidth, H=window.innerHeight;
    var wrap=el('div','position:fixed;inset:0;z-index:9000;',document.body);
    var canvas=el('canvas','position:absolute;inset:0;width:100%;height:100%;',wrap);
    canvas.width=W; canvas.height=H;
    var ctx=canvas.getContext('2d'), start=null;
    function frame(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1), e=1-Math.pow(1-p,3);
      ctx.clearRect(0,0,W,H); ctx.fillStyle=color;
      if(dir==='left')ctx.fillRect(W*e,0,W*(1-e),H);
      else if(dir==='right')ctx.fillRect(0,0,W*(1-e),H);
      else if(dir==='up')ctx.fillRect(0,H*e,W,H*(1-e));
      else ctx.fillRect(0,0,W,H*(1-e));
      if(p<1)requestAnimationFrame(frame);
      else{ if(wrap.parentNode)wrap.parentNode.removeChild(wrap); if(onDone)onDone(); }
    }
    requestAnimationFrame(frame);
  }
  function exitWipe(cfg, cb) {
    var dur=(cfg.duration||900)*0.7, color=cfg.color||'#04040C', dir=cfg.wipeDir||'left';
    var W=window.innerWidth, H=window.innerHeight;
    var wrap=el('div','position:fixed;inset:0;z-index:9000;',document.body);
    var canvas=el('canvas','position:absolute;inset:0;',wrap);
    canvas.width=W; canvas.height=H;
    var ctx=canvas.getContext('2d'), start=null;
    function frame(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1), e=p*p;
      ctx.clearRect(0,0,W,H); ctx.fillStyle=color;
      if(dir==='left')ctx.fillRect(0,0,W*e,H);
      else if(dir==='right')ctx.fillRect(W*(1-e),0,W*e,H);
      else if(dir==='up')ctx.fillRect(0,0,W,H*e);
      else ctx.fillRect(0,H*(1-e),W,H*e);
      if(p<1)requestAnimationFrame(frame); else if(cb)cb();
    }
    requestAnimationFrame(frame);
  }

  /* ── BLOOM ── */
  function runBloom(cfg, onDone) {
    var dur=cfg.duration||1000, color=cfg.color||'#04040C', accent=cfg.accentHex||'#4B3BFF';
    var W=window.innerWidth, H=window.innerHeight, maxR=Math.sqrt(W*W+H*H)/2+10;
    var wrap=el('div','position:fixed;inset:0;z-index:9000;',document.body);
    var canvas=el('canvas','position:absolute;inset:0;',wrap);
    canvas.width=W; canvas.height=H;
    var ctx=canvas.getContext('2d'), cx=W/2, cy=H/2, start=null;
    function frame(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1);
      var e=p<0.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=color; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.globalCompositeOperation='destination-out';
      ctx.beginPath(); ctx.arc(cx,cy,maxR*e,0,Math.PI*2); ctx.fill(); ctx.restore();
      if(e>0.05&&e<0.95){
        ctx.beginPath(); ctx.arc(cx,cy,maxR*e,0,Math.PI*2);
        ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.globalAlpha=1-e; ctx.stroke(); ctx.globalAlpha=1;
      }
      if(p<1)requestAnimationFrame(frame);
      else{ if(wrap.parentNode)wrap.parentNode.removeChild(wrap); if(onDone)onDone(); }
    }
    requestAnimationFrame(frame);
  }
  function exitBloom(cfg, cb) {
    var dur=(cfg.duration||1000)*0.6, color=cfg.color||'#04040C';
    var W=window.innerWidth, H=window.innerHeight, maxR=Math.sqrt(W*W+H*H)/2+10;
    var wrap=el('div','position:fixed;inset:0;z-index:9000;',document.body);
    var canvas=el('canvas','position:absolute;inset:0;',wrap);
    canvas.width=W; canvas.height=H;
    var ctx=canvas.getContext('2d'), cx=W/2, cy=H/2, start=null;
    function frame(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1), e=1-p*p;
      ctx.clearRect(0,0,W,H); ctx.fillStyle=color; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.globalCompositeOperation='destination-out';
      ctx.beginPath(); ctx.arc(cx,cy,maxR*e,0,Math.PI*2); ctx.fill(); ctx.restore();
      if(p<1)requestAnimationFrame(frame); else if(cb)cb();
    }
    requestAnimationFrame(frame);
  }

  /* ── GLITCH ── */
  function runGlitch(cfg, onDone) {
    var dur=cfg.duration||1100, color=cfg.color||'#04040C', accent=cfg.accentHex||'#4B3BFF';
    var rgb=hexToRgb(accent), bgRgb=hexToRgb(color);
    var W=window.innerWidth, H=window.innerHeight;
    var wrap=el('div','position:fixed;inset:0;z-index:9000;',document.body);
    var canvas=el('canvas','position:absolute;inset:0;',wrap);
    canvas.width=W; canvas.height=H;
    var ctx=canvas.getContext('2d'), start=null;
    function draw(intensity){
      ctx.clearRect(0,0,W,H); ctx.fillStyle=color; ctx.fillRect(0,0,W,H);
      var bars=Math.floor(intensity*18);
      for(var i=0;i<bars;i++){
        ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+(Math.random()*0.7)+')';
        ctx.fillRect((Math.random()-0.5)*W*intensity*0.4,Math.random()*H,W,2+Math.random()*24);
      }
      for(var y=0;y<H;y+=4){ ctx.fillStyle='rgba(0,0,0,'+(0.15*intensity)+')'; ctx.fillRect(0,y,W,2); }
    }
    function frame(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/dur,1);
      if(p<0.6){ draw(1-p/0.6*0.3+Math.sin(p*40)*0.2); }
      else{
        var fp=(p-0.6)/0.4; draw(0.3*(1-fp));
        ctx.globalAlpha=fp; ctx.fillStyle='rgba('+bgRgb.r+','+bgRgb.g+','+bgRgb.b+',1)'; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1;
      }
      if(p<1)requestAnimationFrame(frame);
      else{ ctx.clearRect(0,0,W,H); if(wrap.parentNode)wrap.parentNode.removeChild(wrap); if(onDone)onDone(); }
    }
    requestAnimationFrame(frame);
  }
  function exitGlitch(cfg, cb) {
    var rgb=hexToRgb(cfg.accentHex||'#4B3BFF');
    var W=window.innerWidth, H=window.innerHeight;
    var wrap=el('div','position:fixed;inset:0;z-index:9000;',document.body);
    var canvas=el('canvas','position:absolute;inset:0;',wrap);
    canvas.width=W; canvas.height=H;
    var ctx=canvas.getContext('2d'), start=null;
    function frame(ts){
      if(!start)start=ts;
      var p=Math.min((ts-start)/400,1);
      ctx.clearRect(0,0,W,H);
      var bars=Math.floor((1-p)*20);
      for(var i=0;i<bars;i++){
        ctx.fillStyle='rgba('+rgb.r+','+rgb.g+','+rgb.b+','+Math.random()*0.8+')';
        ctx.fillRect(0,Math.random()*H,W,2+Math.random()*20);
      }
      ctx.fillStyle='rgba(0,0,0,'+p+')'; ctx.fillRect(0,0,W,H);
      if(p<1)requestAnimationFrame(frame); else if(cb)cb();
    }
    requestAnimationFrame(frame);
  }

  /* ── BARS ── */
  function runBars(cfg, onDone) {
    var dur=cfg.duration||900, color=cfg.color||'#04040C', barCount=cfg.barCount||8;
    var H=window.innerHeight, barH=H/barCount;
    var wrap=el('div','position:fixed;inset:0;z-index:9000;overflow:hidden;',document.body);
    var bars=[];
    for(var i=0;i<barCount;i++){
      bars.push(el('div','position:absolute;left:0;right:0;height:'+(barH+1)+'px;top:'+(i*barH)+'px;background:'+color+';',wrap));
    }
    bars.forEach(function(b,i){
      var delay=(i/barCount)*dur*0.35, barDur=dur*0.65;
      setTimeout(function(){
        b.style.transformOrigin=i%2===0?'left center':'right center';
        b.style.transition='transform '+(barDur/1000).toFixed(2)+'s cubic-bezier(0.77,0,0.18,1)';
        b.style.transform=i%2===0?'scaleX(0)':'translateX(100%) scaleX(0)';
      },delay);
    });
    setTimeout(function(){ if(wrap.parentNode)wrap.parentNode.removeChild(wrap); if(onDone)onDone(); },dur+100);
  }
  function exitBars(cfg, cb) {
    var dur=(cfg.duration||900)*0.6, color=cfg.color||'#04040C', barCount=cfg.barCount||8;
    var H=window.innerHeight, barH=H/barCount;
    var wrap=el('div','position:fixed;inset:0;z-index:9000;overflow:hidden;',document.body);
    for(var i=0;i<barCount;i++){
      var b=el('div','position:absolute;left:0;right:0;height:'+(barH+1)+'px;top:'+(i*barH)+'px;background:'+color+';transform:scaleX(0);transform-origin:left center;',wrap);
      ;(function(bar,delay,barDur){
        setTimeout(function(){
          bar.style.transition='transform '+(barDur/1000).toFixed(2)+'s cubic-bezier(0.77,0,0.18,1)';
          bar.style.transform='scaleX(1)';
        },delay);
      })(b,(i/barCount)*dur*0.3,dur*0.7);
    }
    setTimeout(function(){if(cb)cb();},dur+100);
  }

  /* ── PUBLIC API ── */
  var runners={
    fade:{entry:runFade,exit:exitFade},
    wipe:{entry:runWipe,exit:exitWipe},
    bloom:{entry:runBloom,exit:exitBloom},
    glitch:{entry:runGlitch,exit:exitGlitch},
    bars:{entry:runBars,exit:exitBars},
  };

  window.HeroPipeLoader = {
    version: '1.0.0',
    init: function(config) {
      injectStyles();
      var cfg=config||{}, runner=runners[cfg.style]||runners.fade;
      runner.entry(cfg, cfg.onComplete);
    },
    exit: function(config, cb) {
      injectStyles();
      var cfg=config||{}, runner=runners[cfg.style]||runners.fade;
      runner.exit(cfg, cb);
    },
    styles: injectStyles,
  };

  console.log('[HeroPipeLoader] v1.0.0 ready. Styles: fade, wipe, bloom, glitch, bars');
})();
