/* ═══════════════════════════════════════════════════════════════
   HERO'S PIPE — CURSOR FX MODULE v1.0
   Self-contained cursor effects that layer on top of any hero.

   Exposes: window.HeroPipeCursor
     .init(config, canvas)   — activate cursor effects
     .destroy()              — clean up all effects
     .setEffect(name, bool)  — toggle individual effects at runtime

   Effects:
     spotlight  — radial glow follows cursor over the WebGL canvas
     trail      — particle trail spawns at cursor, drifts and fades
     magnetic   — DOM elements with [data-magnetic] are attracted to cursor
═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── active state ── */
  var _active    = false;
  var _canvas    = null;
  var _config    = {};
  var _listeners = [];
  var _rafId     = null;

  /* mouse position (normalised 0-1 and raw px) */
  var mouse = { x: -9999, y: -9999, nx: -0.5, ny: -0.5, inside: false };

  /* ══════════════════════════════════════════
     EFFECT 1 — SPOTLIGHT
     An SVG radial gradient overlay that follows
     the cursor and reveals the scene beneath.
  ══════════════════════════════════════════ */
  var spotlight = {
    el:      null,
    gradEl:  null,
    active:  false,
    radius:  280,
    opacity: 0,
    targetOpacity: 0,

    build: function(cfg) {
      if (this.el) return;
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50;transition:opacity 0.4s;';
      svg.setAttribute('aria-hidden', 'true');

      var defs = document.createElementNS(ns, 'defs');
      var grad = document.createElementNS(ns, 'radialGradient');
      grad.setAttribute('id', 'hp-spot-grad');
      grad.setAttribute('cx', '50%'); grad.setAttribute('cy', '50%');
      grad.setAttribute('r', '50%');

      var s0 = document.createElementNS(ns, 'stop');
      s0.setAttribute('offset', '0%');
      s0.setAttribute('stop-color', cfg.spotlightColor || 'rgba(139,127,255,0.18)');

      var s1 = document.createElementNS(ns, 'stop');
      s1.setAttribute('offset', '60%');
      s1.setAttribute('stop-color', 'rgba(75,59,255,0.06)');

      var s2 = document.createElementNS(ns, 'stop');
      s2.setAttribute('offset', '100%');
      s2.setAttribute('stop-color', 'rgba(0,0,0,0)');

      grad.appendChild(s0); grad.appendChild(s1); grad.appendChild(s2);
      defs.appendChild(grad);

      var rect = document.createElementNS(ns, 'ellipse');
      rect.setAttribute('fill', 'url(#hp-spot-grad)');
      rect.id = 'hp-spot-ellipse';

      svg.appendChild(defs); svg.appendChild(rect);
      document.body.appendChild(svg);
      this.el      = svg;
      this.gradEl  = rect;
      this.radius  = cfg.spotlightRadius || 280;
      this.active  = true;
    },

    update: function() {
      if (!this.el || !this.active) return;
      var r = this.radius;
      this.gradEl.setAttribute('cx', mouse.x);
      this.gradEl.setAttribute('cy', mouse.y);
      this.gradEl.setAttribute('rx', r);
      this.gradEl.setAttribute('ry', r);
      /* fade in when cursor enters, out when it leaves */
      this.targetOpacity = mouse.inside ? 1 : 0;
      this.opacity += (this.targetOpacity - this.opacity) * 0.08;
      this.el.style.opacity = this.opacity;
    },

    destroy: function() {
      if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
      this.el = null; this.active = false;
    },
  };

  /* ══════════════════════════════════════════
     EFFECT 2 — PARTICLE TRAIL
     Canvas overlay. Particles spawn at cursor,
     drift outward, fade with configurable colour.
  ══════════════════════════════════════════ */
  var trail = {
    canvas:   null,
    ctx:      null,
    active:   false,
    particles: [],
    maxCount:  80,
    spawnRate: 3,   /* particles per frame while moving */
    lastX:    -1,
    lastY:    -1,
    color:    [139, 127, 255],
    cfg:      {},

    build: function(cfg) {
      if (this.canvas) return;
      var c = document.createElement('canvas');
      c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:49;';
      c.width  = window.innerWidth;
      c.height = window.innerHeight;
      document.body.appendChild(c);
      this.canvas = c;
      this.ctx    = c.getContext('2d');
      this.active = true;
      this.cfg    = cfg;

      /* parse colour from hex */
      var hex = (cfg.trailColor || '#8B7FFF').replace('#','');
      this.color = [
        parseInt(hex.substr(0,2),16),
        parseInt(hex.substr(2,2),16),
        parseInt(hex.substr(4,2),16),
      ];

      var self = this;
      function onResize() {
        if (self.canvas) {
          self.canvas.width  = window.innerWidth;
          self.canvas.height = window.innerHeight;
        }
      }
      window.addEventListener('resize', onResize);
      this._resizeFn = onResize;
    },

    spawn: function() {
      if (!this.active) return;
      var moved = Math.abs(mouse.x - this.lastX) + Math.abs(mouse.y - this.lastY);
      if (moved < 2) return; /* only spawn when actually moving */
      this.lastX = mouse.x; this.lastY = mouse.y;

      var count = this.cfg.trailDensity || this.spawnRate;
      for (var i = 0; i < count; i++) {
        if (this.particles.length >= this.maxCount) break;
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.3 + Math.random() * 0.8;
        this.particles.push({
          x:    mouse.x + (Math.random()-0.5)*4,
          y:    mouse.y + (Math.random()-0.5)*4,
          vx:   Math.cos(angle) * speed * 0.4,
          vy:   Math.sin(angle) * speed * 0.4 - 0.3,
          life: 1.0,
          decay: 0.018 + Math.random() * 0.022,
          size:  1.5 + Math.random() * 2.5,
        });
      }
    },

    update: function() {
      if (!this.active || !this.ctx) return;
      var ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (!mouse.inside) return;

      this.spawn();

      var alive = [];
      var rgb = this.color;
      for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  -= 0.015; /* slight upward drift */
        p.life -= p.decay;
        if (p.life <= 0) continue;
        alive.push(p);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (p.life * 0.85) + ')';
        ctx.fill();
      }
      this.particles = alive;
    },

    destroy: function() {
      if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
      if (this._resizeFn) window.removeEventListener('resize', this._resizeFn);
      this.canvas = null; this.active = false; this.particles = [];
    },
  };

  /* ══════════════════════════════════════════
     EFFECT 3 — MAGNETIC ELEMENTS
     DOM elements with [data-magnetic] are
     pushed/pulled toward the cursor when nearby.
     data-magnetic="attract" or "repel"
     data-magnetic-strength="0.3" (0-1)
     data-magnetic-radius="120" (px)
  ══════════════════════════════════════════ */
  var magnetic = {
    active:   false,
    elements: [],

    build: function(cfg) {
      this.active = true;
      this.cfg    = cfg || {};
      this.scan();
    },

    scan: function() {
      /* find all magnetic elements in the document */
      var els = Array.from(document.querySelectorAll('[data-magnetic]'));
      this.elements = els.map(function(el) {
        return {
          el:       el,
          mode:     el.dataset.magnetic || 'attract',
          strength: parseFloat(el.dataset.magneticStrength || '0.35'),
          radius:   parseFloat(el.dataset.magneticRadius   || '140'),
          ox: 0, oy: 0, /* current offset */
          tx: 0, ty: 0, /* target offset */
        };
      });
      /* add will-change for performance */
      this.elements.forEach(function(m) {
        m.el.style.willChange   = 'transform';
        m.el.style.transition   = 'transform 0.1s ease';
        m.el.style.display      = m.el.style.display || '';
      });
    },

    update: function() {
      if (!this.active) return;
      var mx = mouse.x, my = mouse.y;

      this.elements.forEach(function(m) {
        var rect = m.el.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = mx - cx;
        var dy   = my - cy;
        var dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < m.radius && mouse.inside) {
          var force  = (1 - dist / m.radius) * m.strength;
          var dir    = m.mode === 'repel' ? -1 : 1;
          m.tx = dx * force * dir * 0.5;
          m.ty = dy * force * dir * 0.5;
        } else {
          m.tx = 0; m.ty = 0;
        }

        /* smooth lerp to target */
        m.ox += (m.tx - m.ox) * 0.14;
        m.oy += (m.ty - m.oy) * 0.14;

        if (Math.abs(m.ox) > 0.05 || Math.abs(m.oy) > 0.05) {
          m.el.style.transform = 'translate(' + m.ox.toFixed(2) + 'px,' + m.oy.toFixed(2) + 'px)';
        } else {
          m.el.style.transform = '';
        }
      });
    },

    destroy: function() {
      this.elements.forEach(function(m) {
        m.el.style.transform  = '';
        m.el.style.willChange = '';
        m.el.style.transition = '';
      });
      this.elements = []; this.active = false;
    },
  };

  /* ══════════════════════════════════════════
     CUSTOM CURSOR DOT
     Optional: replaces system cursor with a
     small dot that leads the trail.
  ══════════════════════════════════════════ */
  var cursorDot = {
    el:     null,
    active: false,
    ox: 0, oy: 0,

    build: function(cfg) {
      if (!cfg.customCursor) return;
      var el = document.createElement('div');
      el.id = 'hp-cursor';
      el.style.cssText = [
        'position:fixed;top:0;left:0;',
        'width:' + (cfg.cursorSize || 10) + 'px;',
        'height:' + (cfg.cursorSize || 10) + 'px;',
        'background:' + (cfg.cursorColor || 'rgba(139,127,255,0.9)') + ';',
        'border-radius:50%;',
        'pointer-events:none;',
        'z-index:9999;',
        'transform:translate(-50%,-50%);',
        'transition:opacity 0.3s,width 0.2s,height 0.2s;',
        'mix-blend-mode:' + (cfg.cursorBlend || 'screen') + ';',
      ].join('');
      document.body.appendChild(el);
      document.body.style.cursor = 'none';
      this.el = el; this.active = true;
      this.size = cfg.cursorSize || 10;
    },

    update: function() {
      if (!this.el) return;
      /* lag behind mouse slightly for smoothness */
      this.ox += (mouse.x - this.ox) * 0.25;
      this.oy += (mouse.y - this.oy) * 0.25;
      this.el.style.left = this.ox + 'px';
      this.el.style.top  = this.oy + 'px';
      this.el.style.opacity = mouse.inside ? '1' : '0';
    },

    destroy: function() {
      if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
      document.body.style.cursor = '';
      this.el = null; this.active = false;
    },
  };

  /* ══════════════════════════════════════════
     CORE LOOP
  ══════════════════════════════════════════ */
  function loop() {
    spotlight.update();
    trail.update();
    magnetic.update();
    cursorDot.update();
    _rafId = requestAnimationFrame(loop);
  }

  /* ══════════════════════════════════════════
     MOUSE TRACKING
  ══════════════════════════════════════════ */
  function trackMouse(e) {
    mouse.x  = e.clientX;
    mouse.y  = e.clientY;
    mouse.nx = (e.clientX / window.innerWidth)  - 0.5;
    mouse.ny = (e.clientY / window.innerHeight) - 0.5;
  }
  function onEnter() { mouse.inside = true;  }
  function onLeave() { mouse.inside = false; }

  /* ══════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════ */

  function init(config, canvas) {
    if (_active) destroy();
    _active = true;
    _canvas = canvas || document.body;
    _config = Object.assign({
      spotlight:      true,
      spotlightColor: 'rgba(139,127,255,0.18)',
      spotlightRadius: 280,
      trail:          true,
      trailColor:     '#8B7FFF',
      trailDensity:   3,
      magnetic:       true,
      customCursor:   false,
      cursorSize:     10,
      cursorColor:    'rgba(139,127,255,0.9)',
      cursorBlend:    'screen',
    }, config || {});

    /* build effects */
    if (_config.spotlight) spotlight.build(_config);
    if (_config.trail)     trail.build(_config);
    if (_config.magnetic)  magnetic.build(_config);
    cursorDot.build(_config);

    /* event listeners */
    var target = _canvas.parentElement || window;
    window.addEventListener('mousemove', trackMouse, { passive: true });
    (_canvas.parentElement || document.body).addEventListener('mouseenter', onEnter);
    (_canvas.parentElement || document.body).addEventListener('mouseleave', onLeave);

    /* start loop */
    loop();

    console.log('[HeroPipeCursor] Initialised. Effects:', [
      _config.spotlight ? 'spotlight' : '',
      _config.trail     ? 'trail'     : '',
      _config.magnetic  ? 'magnetic'  : '',
      _config.customCursor ? 'custom-cursor' : '',
    ].filter(Boolean).join(', '));
  }

  function destroy() {
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    spotlight.destroy();
    trail.destroy();
    magnetic.destroy();
    cursorDot.destroy();
    window.removeEventListener('mousemove', trackMouse);
    _active = false;
    console.log('[HeroPipeCursor] Destroyed');
  }

  function setEffect(name, enabled) {
    if (!_active) return;
    switch(name) {
      case 'spotlight':
        if (enabled && !spotlight.active) spotlight.build(_config);
        if (!enabled) spotlight.destroy();
        break;
      case 'trail':
        if (enabled && !trail.active) trail.build(_config);
        if (!enabled) trail.destroy();
        break;
      case 'magnetic':
        if (enabled && !magnetic.active) magnetic.build(_config);
        if (!enabled) magnetic.destroy();
        break;
      case 'customCursor':
        if (enabled && !cursorDot.active) cursorDot.build(_config);
        if (!enabled) cursorDot.destroy();
        break;
    }
  }

  /* re-scan magnetic elements (call after DOM changes) */
  function scanMagnetic() {
    if (magnetic.active) magnetic.scan();
  }

  /* expose mouse position for other modules */
  function getMouse() { return { x: mouse.x, y: mouse.y, nx: mouse.nx, ny: mouse.ny }; }

  window.HeroPipeCursor = {
    version:     '1.0.0',
    init:        init,
    destroy:     destroy,
    setEffect:   setEffect,
    scanMagnetic:scanMagnetic,
    getMouse:    getMouse,
  };

})();
