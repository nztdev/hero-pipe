/* ═══════════════════════════════════════════════════════════════
   HERO'S PIPE — ENGINE v1.0
   Reads manifest.js, resolves configs, renders scenes, exports.

   Exposes: window.HeroPipe
     .render(config, canvas)   — render config into a canvas element
     .refine(config, apiKey, description) — AI refinement via Gemini
     .export(config)           — download standalone hero HTML file
     .resolve(config)          — return resolved parameters (no render)
     .stop()                   — stop current render loop
═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── guard: manifest must be loaded first ── */
  if (!window.HeroPipeManifest) {
    console.error('[HeroPipe] manifest.js must be loaded before engine.js');
    return;
  }
  var M = window.HeroPipeManifest;

  /* ══════════════════════════════════════════
     1. RESOLVER
     Takes a user config object, returns a flat
     parameter object the renderer can use directly.
  ══════════════════════════════════════════ */
  function resolve(config) {
    var cfg = Object.assign({
      theme:      'ai-tech',
      mood:       'bold',
      energy:     'balanced',
      colour:     'indigo-night',
      particles:  'nebula',
      camera:     'drift',
      typography: 'bold',
      headline:   'Your Hero Section',
      subHeadline:'Built with Hero\'s Pipe',
      cta:        'Get started',
      transition: 'dissolve',
    }, config);

    /* pull param blocks from manifest */
    var moodP   = (M.moods[cfg.mood]       || M.moods.bold).params;
    var energyP = (M.energy[cfg.energy]    || M.energy.balanced).params;
    var colourP = (M.colours[cfg.colour]   || M.colours['indigo-night']).params;
    var partP   = (M.particles[cfg.particles] || M.particles.nebula).params;
    var camP    = (M.cameras[cfg.camera]   || M.cameras.drift).params;
    var typoP   = (M.typography[cfg.typography] || M.typography.bold).params;
    var tranP   = (M.transitions[cfg.transition] || M.transitions.dissolve).params;

    return {
      /* identity */
      theme:      cfg.theme,
      mood:       cfg.mood,
      energy:     cfg.energy,
      colour:     cfg.colour,

      /* copy */
      headline:   cfg.headline,
      subHeadline:cfg.subHeadline,
      cta:        cfg.cta,

      /* particles */
      particleCount:  Math.round(partP.count * (window.innerWidth < 600 ? 0.55 : 1)),
      particleSizeMin:partP.sizeMin,
      particleSizeMax:partP.sizeMax,
      particleFocusMax:partP.focusMax,
      particleSwirlMax:partP.swirlMax,
      particleDriftX: partP.driftX * energyP.speedMult,
      particleDriftY: partP.driftY * energyP.speedMult,
      particleSpeed:  energyP.speedMult,

      /* colour */
      hue:    colourP.hue,
      sat:    Math.min(1, colourP.sat  * moodP.satMult),
      bright: Math.min(1, colourP.bright * moodP.brightMult),
      bgR:    colourP.bgR,
      bgG:    colourP.bgG,
      bgB:    colourP.bgB,
      accentHex:  colourP.accentHex  || '#4B3BFF',
      accentHex2: colourP.accentHex2 || '#8B7FFF',
      particleOpacity: moodP.particleOpacityMult,
      vignetteStrength: moodP.vignetteStrength,

      /* camera */
      camStartZ:     camP.startZ,
      camEndZ:       camP.endZ,
      camMidZ:       camP.midZ,
      camYAmplitude: camP.camYAmplitude,
      camXAmplitude: camP.camXAmplitude,
      cameraEase:    energyP.cameraEase,

      /* typography */
      fontWeight:    typoP.fontWeight,
      letterSpacing: typoP.letterSpacing,
      lineHeight:    typoP.lineHeight,

      /* scroll */
      scrollScrub: energyP.scrollScrub,

      /* transition */
      transitionDuration: tranP.duration,
      transitionEase:     tranP.ease,
    };
  }

  /* ══════════════════════════════════════════
     2. RENDERER
     Builds a Three.js scene inside a given
     canvas element using resolved parameters.
     Returns a controller object with .stop()
  ══════════════════════════════════════════ */

  var _activeRenderer = null;
  var _activeRAF      = null;

  function stopCurrent() {
    if (_activeRAF) { cancelAnimationFrame(_activeRAF); _activeRAF = null; }
    if (_activeRenderer) { try { _activeRenderer.dispose(); } catch(e) {} _activeRenderer = null; }
  }

  function render(config, canvas) {
    if (!canvas) { console.error('[HeroPipe] render() requires a canvas element'); return; }
    if (!window.THREE) { console.error('[HeroPipe] Three.js must be loaded before engine.js'); return; }

    stopCurrent();

    var P = resolve(config);
    var W = canvas.clientWidth  || canvas.width  || 800;
    var H = canvas.clientHeight || canvas.height || 600;

    /* ── Three.js setup ── */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(new THREE.Color(P.bgR, P.bgG, P.bgB), 1);
    _activeRenderer = renderer;

    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.set(0, 0, P.camStartZ);

    /* ── particle geometry ── */
    var count = P.particleCount;
    var pos   = new Float32Array(count * 3);
    var col   = new Float32Array(count * 3);
    var sz    = new Float32Array(count);

    for (var i = 0; i < count; i++) {
      var r  = 55 + Math.random() * 90;
      var th = Math.random() * Math.PI * 2;
      var ph = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(ph) * Math.cos(th);
      pos[i*3+1] = r * Math.sin(ph) * Math.sin(th);
      pos[i*3+2] = r * Math.cos(ph) - 30;
      var hv = P.hue + (Math.random() - 0.5) * 0.08;
      var c  = new THREE.Color().setHSL(hv, P.sat, P.bright * (0.5 + Math.random() * 0.5));
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
      sz[i] = P.particleSizeMin + Math.random() * (P.particleSizeMax - P.particleSizeMin);
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sz, 1));

    /* ── particle shader ── */
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0 },
        uOpacity: { value: 0 },
        uFocus:   { value: 0 },
        uHue:     { value: P.hue },
        uSat:     { value: P.sat },
        uBright:  { value: P.bright },
        uSpeedX:  { value: P.particleDriftX },
        uSpeedY:  { value: P.particleDriftY },
        uSwirl:   { value: 0 },
        uPulse:   { value: 0 },
      },
      vertexShader: [
        'attribute float size;',
        'varying vec3 vPos;',
        'uniform float uTime,uFocus,uSpeedX,uSpeedY,uSwirl,uPulse;',
        'void main(){',
        '  vec3 p=position;',
        '  p.y+=sin(uTime*uSpeedY*0.28+p.x*0.05)*1.4*(1.0-uFocus*0.8);',
        '  p.x+=cos(uTime*uSpeedX*0.18+p.z*0.04)*1.0*(1.0-uFocus*0.7);',
        '  if(uSwirl>0.0){',
        '    float angle=uSwirl*uTime*0.4+length(p.xz)*0.02;',
        '    float cx=p.x*cos(angle)-p.z*sin(angle);',
        '    float cz=p.x*sin(angle)+p.z*cos(angle);',
        '    p.x=mix(p.x,cx,uSwirl*0.5);p.z=mix(p.z,cz,uSwirl*0.5);',
        '  }',
        '  p=mix(p,p*0.28,uFocus*0.68);',
        '  p+=normalize(p)*sin(uTime*1.1)*uPulse*4.0;',
        '  vPos=p;',
        '  vec4 mv=modelViewMatrix*vec4(p,1.0);',
        '  gl_PointSize=size*(320.0/-mv.z);',
        '  gl_Position=projectionMatrix*mv;',
        '}',
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vPos;',
        'uniform float uOpacity,uHue,uSat,uBright;',
        'vec3 hsl2rgb(float h,float s,float l){',
        '  float c=(1.0-abs(2.0*l-1.0))*s;',
        '  float x=c*(1.0-abs(mod(h*6.0,2.0)-1.0));',
        '  float m=l-c*0.5;vec3 rgb;',
        '  if(h<1.0/6.0)rgb=vec3(c,x,0.0);',
        '  else if(h<2.0/6.0)rgb=vec3(x,c,0.0);',
        '  else if(h<3.0/6.0)rgb=vec3(0.0,c,x);',
        '  else if(h<4.0/6.0)rgb=vec3(0.0,x,c);',
        '  else if(h<5.0/6.0)rgb=vec3(x,0.0,c);',
        '  else rgb=vec3(c,0.0,x);',
        '  return rgb+m;',
        '}',
        'void main(){',
        '  vec2 uv=gl_PointCoord-0.5;',
        '  float d=length(uv);',
        '  if(d>0.5)discard;',
        '  float a=smoothstep(0.5,0.05,d);',
        '  float hVar=uHue+(vPos.x*0.002+vPos.y*0.001);',
        '  vec3 c=hsl2rgb(mod(hVar,1.0),uSat,uBright);',
        '  gl_FragColor=vec4(c,a*uOpacity*smoothstep(160.0,10.0,length(vPos)));',
        '}',
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    var particles = new THREE.Points(geo, mat);
    scene.add(particles);

    /* ── nebula glow plane ── */
    var nebMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(P.accentHex) },
        uOp:    { value: 0 },
        uTime:  { value: 0 },
      },
      vertexShader:   'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'varying vec2 vUv;uniform vec3 uColor;uniform float uOp,uTime;void main(){vec2 c=vUv-0.5;float d=length(c);float p=sin(uTime*0.45)*0.07+0.93;gl_FragColor=vec4(uColor,smoothstep(0.5*p,0.0,d)*uOp);}',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    var neb = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), nebMat);
    neb.position.set(-20, 10, -25);
    neb.scale.set(130, 130, 1);
    scene.add(neb);

    /* ── grid ── */
    var grid = new THREE.GridHelper(240, 48, 0x1a1a3a, 0x0b0b1a);
    grid.position.y = -32;
    grid.material.opacity = 0;
    grid.material.transparent = true;
    scene.add(grid);

    /* ── lights ── */
    scene.add(new THREE.AmbientLight(0x111122, 1));
    var ptMain = new THREE.PointLight(new THREE.Color(P.accentHex), 0, 140);
    ptMain.position.set(0, 20, 10);
    scene.add(ptMain);

    /* ── scene state (lerp system) ── */
    var S = { camZ: P.camStartZ, camY: 0, pOp: 0, pFocus: 0, pSwirl: 0, pPulse: 0, nebOp: 0, gridOp: 0, ptInt: 0 };
    var T = Object.assign({}, S);
    var lerpA = 0.035;

    /* ── scroll progress → scene state ── */
    /* The container the canvas lives in drives scroll */
    var scrollEl   = canvas.parentElement || window;
    var scrollProg = 0; /* 0–1, updated by ResizeObserver or manual call */

    function updateFromScroll(p) {
      scrollProg = p;

      /* camera arc */
      if (p < 0.2) {
        T.camZ = P.camStartZ + (P.camMidZ - P.camStartZ) * (p / 0.2);
      } else if (p < 0.8) {
        T.camZ = P.camMidZ + (P.camEndZ - P.camMidZ) * ((p - 0.2) / 0.6);
      } else {
        T.camZ = P.camEndZ + (P.camStartZ - P.camEndZ) * ((p - 0.8) / 0.2) * 0.5;
      }
      T.camY = Math.sin(p * Math.PI) * P.camYAmplitude;

      /* particles */
      T.pOp    = p < 0.08 ? p / 0.08 : p > 0.92 ? 1 - (p - 0.92) / 0.08 : 1;
      T.pFocus = Math.sin(p * Math.PI) * P.particleFocusMax;
      T.pSwirl = p > 0.3 && p < 0.75 ? P.particleSwirlMax * Math.sin((p - 0.3) / 0.45 * Math.PI) : 0;

      /* nebula */
      T.nebOp = p > 0.15 ? Math.min(0.25, (p - 0.15) * 0.5) : 0;

      /* grid */
      T.gridOp = p > 0.4 ? Math.min(0.5, (p - 0.4) * 1.2) : 0;

      /* point light */
      T.ptInt = p > 0.2 ? Math.sin((p - 0.2) / 0.8 * Math.PI) * 2.5 : 0;
    }

    /* initial state */
    updateFromScroll(0);

    /* ── scroll driver: internal (for preview) ── */
    /* The preview canvas has its own scroll simulation via a timer */
    /* In the exported hero, this is replaced by ScrollTrigger */
    var autoScrollActive = true;
    var autoScrollP = 0;
    var autoScrollDir = 1;
    var autoScrollSpeed = 0.0008 * (1 / (P.scrollScrub || 1.6));

    /* ── resize ── */
    var resizeObs = null;
    if (window.ResizeObserver) {
      resizeObs = new ResizeObserver(function() {
        var w = canvas.clientWidth, h = canvas.clientHeight;
        if (w && h) {
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      });
      resizeObs.observe(canvas.parentElement || canvas);
    }

    /* ── render loop ── */
    var clock = new THREE.Clock();
    var running = true;

    function loop() {
      if (!running) return;
      _activeRAF = requestAnimationFrame(loop);
      var t = clock.getElapsedTime();

      /* auto-scroll in preview mode */
      if (autoScrollActive) {
        autoScrollP += autoScrollSpeed * autoScrollDir;
        if (autoScrollP >= 1) { autoScrollP = 1; autoScrollDir = -1; }
        if (autoScrollP <= 0) { autoScrollP = 0; autoScrollDir = 1; }
        updateFromScroll(autoScrollP);
      }

      /* lerp S toward T */
      for (var k in T) {
        if (k === 'camZ' || k === 'camY') continue;
        S[k] += (T[k] - S[k]) * lerpA;
      }
      /* camera lerps faster */
      S.camZ += (T.camZ - S.camZ) * (P.cameraEase || 0.03);
      S.camY += (T.camY - S.camY) * (P.cameraEase || 0.03);

      camera.position.z = S.camZ;
      camera.position.y = S.camY;

      mat.uniforms.uTime.value    = t;
      mat.uniforms.uOpacity.value = S.pOp * P.particleOpacity;
      mat.uniforms.uFocus.value   = S.pFocus;
      mat.uniforms.uSwirl.value   = S.pSwirl;
      mat.uniforms.uPulse.value   = S.pPulse;

      particles.rotation.y = t * 0.022 * P.particleSpeed;
      particles.rotation.x = t * 0.007 * P.particleSpeed;

      nebMat.uniforms.uOp.value   = S.nebOp;
      nebMat.uniforms.uTime.value = t;

      grid.material.opacity = S.gridOp;
      ptMain.intensity      = S.ptInt;

      renderer.setClearColor(new THREE.Color(P.bgR, P.bgG, P.bgB), 1);
      renderer.render(scene, camera);
    }

    loop();

    /* public controller */
    var ctrl = {
      stop: function() {
        running = false;
        if (resizeObs) resizeObs.disconnect();
        renderer.dispose();
        geo.dispose();
        mat.dispose();
        nebMat.dispose();
      },
      setScroll: function(p) {
        autoScrollActive = false;
        updateFromScroll(Math.max(0, Math.min(1, p)));
      },
      enableAutoScroll: function(v) { autoScrollActive = v !== false; },
      getResolved: function() { return P; },
    };

    return ctrl;
  }

  /* ══════════════════════════════════════════
     3. AI REFINE
     Sends config + manifest + description
     to Gemini and returns an improved config.
  ══════════════════════════════════════════ */
  function refine(config, apiKey, description, onSuccess, onError) {
    if (!apiKey) { if (onError) onError('No API key provided'); return; }

    var systemPrompt = M.geminiSystemPrompt();
    var userPrompt   = [
      'Current config:',
      JSON.stringify({
        theme:      config.theme,
        mood:       config.mood,
        energy:     config.energy,
        colour:     config.colour,
        particles:  config.particles,
        camera:     config.camera,
        typography: config.typography,
      }, null, 2),
      '',
      description ? 'Project description: ' + description : 'No project description provided.',
      '',
      'Improve this config. Return only valid JSON with the same 7 keys.',
    ].join('\n');

    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 256 },
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var text = '';
      try { text = data.candidates[0].content.parts[0].text.trim(); } catch(e) { throw new Error('Unexpected Gemini response format'); }
      /* strip markdown fences if present */
      text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/,'').trim();
      var refined = JSON.parse(text);
      /* merge refined values into original config, keep copy fields */
      var result = Object.assign({}, config, {
        theme:      refined.theme      || config.theme,
        mood:       refined.mood       || config.mood,
        energy:     refined.energy     || config.energy,
        colour:     refined.colour     || config.colour,
        particles:  refined.particles  || config.particles,
        camera:     refined.camera     || config.camera,
        typography: refined.typography || config.typography,
      });
      if (onSuccess) onSuccess(result);
    })
    .catch(function(e) {
      console.error('[HeroPipe] Gemini error:', e);
      if (onError) onError(e.message || 'Gemini request failed');
    });
  }

  /* ══════════════════════════════════════════
     4. EXPORT
     Generates a standalone hero HTML file
     with the engine and config embedded.
  ══════════════════════════════════════════ */
  function exportHero(config) {
    var P  = resolve(config);
    var ac = P.accentHex;
    var ac2= P.accentHex2;

    /* inline the manifest and engine into the export */
    var manifestSrc = document.querySelector('script[src*="manifest"]');
    var engineSrc   = document.querySelector('script[src*="engine"]');
    var manifestUrl = manifestSrc ? manifestSrc.src : '';
    var engineUrl   = engineSrc   ? engineSrc.src   : '';

    var html = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8"/>',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>',
      '  <title>' + _esc(P.headline) + '</title>',
      '  <link rel="preconnect" href="https://fonts.googleapis.com"/>',
      '  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@' + P.fontWeight + ';800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>',
      '  <style>',
      '    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}',
      '    :root{--accent:' + ac + ';--accent2:' + ac2 + ';--white:#F0EEF8;--muted:#6666AA;}',
      '    html{overflow-x:hidden;overflow-y:scroll;-webkit-overflow-scrolling:touch;}',
      '    body{width:100%;height:500vh;background:rgb(' + Math.round(P.bgR*255) + ',' + Math.round(P.bgG*255) + ',' + Math.round(P.bgB*255) + ');overflow:hidden;}',
      '    #stage{position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;overflow:hidden;touch-action:pan-y;}',
      '    #hero-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}',
      '    #vignette{position:absolute;inset:0;background:radial-gradient(ellipse 88% 88% at 50% 50%,transparent 32%,rgba(0,0,0,' + P.vignetteStrength + ') 100%);pointer-events:none;}',
      '    #hero-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;pointer-events:none;}',
      '    #hero-headline{',
      '      font-family:\'Syne\',sans-serif;',
      '      font-size:clamp(2.2rem,7vw,5.5rem);',
      '      font-weight:' + P.fontWeight + ';',
      '      letter-spacing:' + P.letterSpacing + ';',
      '      line-height:' + P.lineHeight + ';',
      '      color:var(--white);',
      '      opacity:0;transform:translateY(24px);',
      '      transition:opacity 0.9s ease 0.3s,transform 0.9s ease 0.3s;',
      '    }',
      '    #hero-headline.in{opacity:1;transform:translateY(0);}',
      '    #hero-sub{',
      '      margin-top:1.2rem;',
      '      font-family:\'Inter\',sans-serif;',
      '      font-size:clamp(0.9rem,2vw,1.15rem);',
      '      font-weight:300;',
      '      color:rgba(240,238,248,0.55);',
      '      max-width:50ch;line-height:1.65;',
      '      opacity:0;transform:translateY(16px);',
      '      transition:opacity 0.9s ease 0.55s,transform 0.9s ease 0.55s;',
      '    }',
      '    #hero-sub.in{opacity:1;transform:translateY(0);}',
      '    #hero-cta{',
      '      margin-top:2rem;',
      '      background:var(--accent);color:#fff;',
      '      padding:0.85rem 2.25rem;border-radius:8px;',
      '      font-family:\'Inter\',sans-serif;font-weight:500;font-size:0.95rem;',
      '      text-decoration:none;border:none;cursor:pointer;',
      '      pointer-events:all;',
      '      opacity:0;transform:translateY(12px);',
      '      transition:opacity 0.7s ease 0.8s,transform 0.7s ease 0.8s,background 0.2s;',
      '    }',
      '    #hero-cta.in{opacity:1;transform:translateY(0);}',
      '    #hero-cta:hover{opacity:0.85;}',
      '    #scroll-progress{position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2));transform-origin:left;transform:scaleX(0);transition:transform 0.1s linear;z-index:100;}',
      '    #built-with{position:fixed;bottom:1rem;right:1rem;font-family:\'Inter\',sans-serif;font-size:0.65rem;color:rgba(240,238,248,0.25);letter-spacing:0.06em;text-decoration:none;}',
      '    #built-with:hover{color:rgba(240,238,248,0.5);}',
      '  </style>',
      '</head>',
      '<body>',
      '<div id="stage">',
      '  <canvas id="hero-canvas"></canvas>',
      '  <div id="vignette"></div>',
      '  <div id="hero-content">',
      '    <h1 id="hero-headline">' + _esc(P.headline) + '</h1>',
      '    <p  id="hero-sub">' + _esc(P.subHeadline) + '</p>',
      '    <a  id="hero-cta" href="#">' + _esc(P.cta) + '</a>',
      '  </div>',
      '  <div id="scroll-progress"></div>',
      '</div>',
      '<a id="built-with" href="https://heropipe.io" target="_blank">Built with Hero\'s Pipe</a>',
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>',
      manifestUrl ? '<script src="' + manifestUrl + '"><\/script>' : '',
      engineUrl   ? '<script src="' + engineUrl   + '"><\/script>' : '',
      '<script>',
      '(function(){',
      '  var config=' + JSON.stringify(config) + ';',
      '  var canvas=document.getElementById("hero-canvas");',
      '  var progress=document.getElementById("scroll-progress");',
      '  var ctrl;',
      '  window.addEventListener("load",function(){',
      '    if(window.HeroPipe){',
      '      ctrl=window.HeroPipe.render(config,canvas);',
      '      ctrl.enableAutoScroll(false);',
      '    }',
      '    /* entrance animations */',
      '    setTimeout(function(){document.getElementById("hero-headline").classList.add("in");},100);',
      '    setTimeout(function(){document.getElementById("hero-sub").classList.add("in");},100);',
      '    setTimeout(function(){document.getElementById("hero-cta").classList.add("in");},100);',
      '    /* scroll driver */',
      '    window.addEventListener("scroll",function(){',
      '      var p=window.scrollY/(document.body.scrollHeight-window.innerHeight);',
      '      if(ctrl)ctrl.setScroll(p);',
      '      if(progress)progress.style.transform="scaleX("+p+")";',
      '    },{passive:true});',
      '  });',
      '})();',
      '<\/script>',
      '</body>',
      '</html>',
    ].join('\n');

    var blob = new Blob([html], { type: 'text/html' });
    var a    = document.createElement('a');
    a.href   = URL.createObjectURL(blob);
    a.download = (config.headline || 'hero').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-hero.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  /* ── HTML escape helper ── */
  function _esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ══════════════════════════════════════════
     5. PUBLIC API
  ══════════════════════════════════════════ */
  window.HeroPipe = {
    version: '1.0.0',
    render:  render,
    refine:  refine,
    export:  exportHero,
    resolve: resolve,
    stop:    stopCurrent,
    manifest: M,
  };

  console.log('[HeroPipe] Engine v1.0.0 ready. Manifest loaded with',
    Object.keys(M.themes).length, 'themes,',
    Object.keys(M.particles).length, 'particle systems,',
    Object.keys(M.cameras).length, 'camera paths,',
    Object.keys(M.colours).length, 'colour palettes.'
  );

})();
