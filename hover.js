/* ═══════════════════════════════════════════════════════════════
   HERO'S PIPE — HOVER MODULE v1.0
   Opt-in hover interactions via data attributes. Zero cost when unused.

   Exposes: window.HeroPipeHover
     .init()     — scan document and activate all hover elements
     .destroy()  — remove all effects and listeners
     .rescan()   — re-scan for new elements (call after DOM changes)

   ── TILT ──
   <div data-tilt data-tilt-strength="15" data-tilt-scale="1.03">...</div>
   Element tilts in 3D following cursor position within its bounds.
   data-tilt-strength: max rotation in degrees (default 12)
   data-tilt-scale: scale on hover (default 1.02)

   ── SCRAMBLE ──
   <h1 data-scramble>Original Text</h1>
   Text scrambles through random characters then resolves back to
   the original on hover. Re-triggers each time cursor enters.
   data-scramble-speed: ms per character reveal (default 35)
   data-scramble-chars: character set to scramble through (default set)
═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  var _tiltEls     = [];
  var _scrambleEls = [];
  var _active      = false;

  /* ══════════════════════════════════════════
     TILT
  ══════════════════════════════════════════ */
  function setupTilt(el) {
    var strength = parseFloat(el.dataset.tiltStrength || '12');
    var scale    = parseFloat(el.dataset.tiltScale    || '1.02');

    el.style.transformStyle = 'preserve-3d';
    el.style.transition     = 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)';
    el.style.willChange     = 'transform';

    var rafId = null;
    var targetRX = 0, targetRY = 0, targetScale = 1;
    var curRX = 0, curRY = 0, curScale = 1;

    function onMove(e) {
      var rect = el.getBoundingClientRect();
      var cx = e.clientX - rect.left - rect.width  / 2;
      var cy = e.clientY - rect.top  - rect.height / 2;
      targetRY =  (cx / (rect.width  / 2)) * strength;
      targetRX = -(cy / (rect.height / 2)) * strength;
      targetScale = scale;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function onLeave() {
      targetRX = 0; targetRY = 0; targetScale = 1;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function tick() {
      curRX += (targetRX - curRX) * 0.15;
      curRY += (targetRY - curRY) * 0.15;
      curScale += (targetScale - curScale) * 0.15;
      el.style.transform = 'perspective(800px) rotateX(' + curRX.toFixed(2) + 'deg) rotateY(' + curRY.toFixed(2) + 'deg) scale(' + curScale.toFixed(3) + ')';
      var settled = Math.abs(targetRX - curRX) < 0.05 && Math.abs(targetRY - curRY) < 0.05 && Math.abs(targetScale - curScale) < 0.001;
      if (!settled) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return { el: el, onMove: onMove, onLeave: onLeave };
  }

  function teardownTilt(entry) {
    entry.el.removeEventListener('mousemove', entry.onMove);
    entry.el.removeEventListener('mouseleave', entry.onLeave);
    entry.el.style.transform = '';
    entry.el.style.willChange = '';
  }

  /* ══════════════════════════════════════════
     SCRAMBLE
  ══════════════════════════════════════════ */
  var DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

  function setupScramble(el) {
    var speed = parseInt(el.dataset.scrambleSpeed || '35', 10);
    var chars = el.dataset.scrambleChars || DEFAULT_CHARS;
    var original = el.textContent;
    var timer = null;
    var running = false;

    function randomChar() {
      return chars[Math.floor(Math.random() * chars.length)];
    }

    function scramble() {
      if (running) return;
      running = true;
      var len = original.length;
      var revealed = 0;
      var frame = 0;

      if (timer) clearInterval(timer);
      timer = setInterval(function() {
        frame++;
        var out = '';
        for (var i = 0; i < len; i++) {
          if (i < revealed) {
            out += original[i];
          } else if (original[i] === ' ') {
            out += ' ';
          } else {
            out += randomChar();
          }
        }
        el.textContent = out;

        /* reveal roughly one more character every ~2 frames */
        if (frame % 2 === 0) revealed++;

        if (revealed >= len) {
          clearInterval(timer);
          el.textContent = original;
          running = false;
        }
      }, speed);
    }

    el.addEventListener('mouseenter', scramble);

    return { el: el, onEnter: scramble, getTimer: function(){return timer;} };
  }

  function teardownScramble(entry) {
    entry.el.removeEventListener('mouseenter', entry.onEnter);
    var t = entry.getTimer();
    if (t) clearInterval(t);
  }

  /* ══════════════════════════════════════════
     SCAN & INIT
  ══════════════════════════════════════════ */
  function scan() {
    /* tear down existing before rescanning */
    _tiltEls.forEach(teardownTilt);
    _scrambleEls.forEach(teardownScramble);
    _tiltEls = [];
    _scrambleEls = [];

    Array.from(document.querySelectorAll('[data-tilt]')).forEach(function(el) {
      _tiltEls.push(setupTilt(el));
    });
    Array.from(document.querySelectorAll('[data-scramble]')).forEach(function(el) {
      _scrambleEls.push(setupScramble(el));
    });
  }

  function init() {
    if (_active) destroy();
    _active = true;
    scan();
    console.log('[HeroPipeHover] Initialised —', _tiltEls.length, 'tilt,', _scrambleEls.length, 'scramble elements.');
  }

  function destroy() {
    _tiltEls.forEach(teardownTilt);
    _scrambleEls.forEach(teardownScramble);
    _tiltEls = [];
    _scrambleEls = [];
    _active = false;
  }

  window.HeroPipeHover = {
    version: '1.0.0',
    init:    init,
    destroy: destroy,
    rescan:  scan,
  };

})();