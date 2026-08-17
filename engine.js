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
      cursorFX:       true,
      cursorSpotlight:true,
      cursorTrail:    true,
      cursorMagnetic: true,
      cursorCustom:   false,
      cursorColor:    null,
      loaderStyle:    'bloom',
      loaderDuration: 1000,
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
      particleCount:    Math.round(partP.count * (window.innerWidth < 600 ? 0.55 : 1)),
      particleSizeMin:  partP.sizeMin,
      particleSizeMax:  partP.sizeMax,
      particleFocusMax: partP.focusMax,
      particleSwirlMax: partP.swirlMax,
      particleDriftX:   partP.driftX * energyP.speedMult,
      particleDriftY:   partP.driftY * energyP.speedMult,
      particleSpeed:    energyP.speedMult,
      particleMode:     partP.mode || 'default',
      /* mode-specific params */
      particleWaveCount:       partP.waveCount       || 5,
      particleWaveAmplitude:   partP.waveAmplitude   || 18,
      particleWavePulseSpeed:  partP.wavePulseSpeed  || 1.4,
      particleLayerSpread:     partP.layerSpread     || 60,
      particleHueShiftSpeed:   partP.hueShiftSpeed   || 0.15,
      particleLayerSpeeds:     partP.layerSpeeds     || [0.15, 0.5, 1.0],
      particleLayerSizes:      partP.layerSizes      || [0.4, 1.0, 1.8],
      particleBlobCount:       partP.blobCount       || 4,
      particleBlobRadius:      partP.blobRadius      || 22,
      particleBlobMergeSpeed:  partP.blobMergeSpeed  || 0.3,
      particleTunnelSpeed:     partP.tunnelSpeed     || 1.2,
      particleTunnelRadius:    partP.tunnelRadius    || 40,
      particleArmCount:        partP.armCount        || 3,
      particleArmTightness:    partP.armTightness    || 0.4,
      particleCoreRadius:      partP.coreRadius      || 8,
      particleGridCols:        partP.gridCols        || 50,
      particleGridRows:        partP.gridRows        || 30,
      particleDistortAmplitude:partP.distortAmplitude|| 12,
      particleDistortSpeed:    partP.distortSpeed    || 0.8,
      particleTerrainWidth:    partP.terrainWidth    || 120,
      particleTerrainDepth:    partP.terrainDepth    || 80,
      particleTerrainAmplitude:partP.terrainAmplitude|| 20,
      particleTerrainSpeed:    partP.terrainSpeed    || 0.4,

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
      textParallax: energyP.textParallax || 0.3,

      /* cursor fx */
      cursorFX:        cfg.cursorFX !== false,
      cursorSpotlight: cfg.cursorSpotlight !== false,
      cursorTrail:     cfg.cursorTrail !== false,
      cursorMagnetic:  cfg.cursorMagnetic !== false,
      cursorCustom:    cfg.cursorCustom || false,
      cursorColor:     cfg.cursorColor  || null,

      /* loader */
      loaderStyle:    cfg.loaderStyle    || 'bloom',
      loaderDuration: cfg.loaderDuration || 1000,

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

  /* mode index map for shader */
  var _modeMap = {'default':0,'nebula':0,'network':0,'constellation':0,'aura':0,'grid':0,'dust':0,'rain':0,'bloom':0,'shards':0,'waves':0,'fireflies':0,'matrix':0,'smoke':0,'crystal':0,'waves-pulse':1,'aurora':2,'parallax':3,'blobs':4,'wormhole':5,'galaxy':6,'grid-distort':7,'terrain':8};
  function _modeIndex(mode) { return _modeMap[mode] !== undefined ? _modeMap[mode] : 0; }

  var _activeRenderer = null;
  var _activeRAF      = null;

  function stopCurrent() {
    if (_activeRAF) { cancelAnimationFrame(_activeRAF); _activeRAF = null; }
    if (_activeRenderer) { try { _activeRenderer.dispose(); } catch(e) {} _activeRenderer = null; }
    if (window.HeroPipeCursor) { try { window.HeroPipeCursor.destroy(); } catch(e) {} }
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
      var px, py, pz, hv;
      var mode = P.particleMode || 'default';
      var fi = i / count; /* normalised 0-1 index */

      if (mode === 'waves-pulse' || mode === 'aurora') {
        /* sine wave / aurora: particles in horizontal bands */
        var wCount = P.particleWaveCount || 5;
        var wAmp   = P.particleWaveAmplitude || 18;
        var band   = Math.floor(fi * wCount);
        var bandT  = (fi * wCount) % 1;
        px = (Math.random() - 0.5) * 160;
        py = (band / wCount - 0.5) * (P.particleLayerSpread || 60) + (mode === 'aurora' ? 0 : Math.sin(bandT * Math.PI * 2) * wAmp * 0.3);
        pz = (Math.random() - 0.5) * 60 - 20;
        hv = P.hue + (band / wCount) * (P.particleHueShiftSpeed || 0.15);

      } else if (mode === 'parallax') {
        /* depth parallax: 3 distinct Z layers */
        var layer = i % 3;
        var lSpeeds = P.particleLayerSpeeds || [0.15, 0.5, 1.0];
        var lSizes  = P.particleLayerSizes  || [0.4, 1.0, 1.8];
        var r = 40 + Math.random() * 70;
        var th2 = Math.random() * Math.PI * 2;
        px = r * Math.cos(th2);
        py = (Math.random() - 0.5) * 80;
        pz = layer === 0 ? -60 - Math.random()*30 : layer === 1 ? -20 - Math.random()*20 : 10 + Math.random()*20;
        sz[i] = (P.particleSizeMin || 0.3) * lSizes[layer] + Math.random() * (P.particleSizeMax || 2.0) * lSizes[layer] * 0.5;
        hv = P.hue + (Math.random() - 0.5) * 0.06;

      } else if (mode === 'blobs') {
        /* morphing blobs: particles clustered around N blob centres */
        var bCount  = P.particleBlobCount  || 4;
        var bRadius = P.particleBlobRadius || 22;
        var bIdx    = Math.floor(Math.random() * bCount);
        var angle3  = (bIdx / bCount) * Math.PI * 2;
        var bCx = Math.cos(angle3) * 35;
        var bCy = Math.sin(angle3) * 20;
        var bCz = (Math.random() - 0.5) * 20 - 15;
        var br  = Math.random() * bRadius;
        var ba  = Math.random() * Math.PI * 2;
        px = bCx + Math.cos(ba) * br;
        py = bCy + Math.sin(ba) * br * 0.6;
        pz = bCz + (Math.random() - 0.5) * 10;
        hv = P.hue + (bIdx / bCount) * 0.08;

      } else if (mode === 'wormhole') {
        /* wormhole: spiral tube converging to centre */
        var tRadius = P.particleTunnelRadius || 40;
        var tAngle  = fi * Math.PI * 2 * 8; /* 8 spirals */
        var tDepth  = (fi - 0.5) * 100;
        var tR      = tRadius * (1 - fi * 0.85); /* taper toward centre */
        px = Math.cos(tAngle) * tR + (Math.random()-0.5)*3;
        py = Math.sin(tAngle) * tR + (Math.random()-0.5)*3;
        pz = tDepth;
        hv = P.hue + fi * 0.12;

      } else if (mode === 'galaxy') {
        /* galaxy spiral: logarithmic spiral arms */
        var armCount  = P.particleArmCount    || 3;
        var armTight  = P.particleArmTightness|| 0.4;
        var arm       = Math.floor(Math.random() * armCount);
        var armOffset = (arm / armCount) * Math.PI * 2;
        var dist      = 8 + Math.random() * 65;
        var spiralA   = armOffset + armTight * Math.log(dist + 1);
        var scatter   = (Math.random() - 0.5) * dist * 0.25;
        px = Math.cos(spiralA) * dist + Math.cos(spiralA + Math.PI/2) * scatter;
        py = (Math.random() - 0.5) * 12;
        pz = Math.sin(spiralA) * dist + Math.sin(spiralA + Math.PI/2) * scatter - 20;
        hv = P.hue + (arm / armCount) * 0.1 + (dist / 65) * 0.05;

      } else if (mode === 'grid-distort') {
        /* grid distortion: regular grid, distortion applied in shader */
        var gCols = P.particleGridCols || 50;
        var gRows = P.particleGridRows || 30;
        var gCol  = i % gCols;
        var gRow  = Math.floor(i / gCols) % gRows;
        px = (gCol / gCols - 0.5) * 140;
        py = (gRow / gRows - 0.5) * 80;
        pz = -20 + (Math.random()-0.5)*4;
        hv = P.hue + (gCol / gCols) * 0.04;

      } else if (mode === 'terrain') {
        /* terrain wave: grid on XZ plane, Y driven by noise */
        var tW  = P.particleTerrainWidth || 120;
        var tD  = P.particleTerrainDepth || 80;
        var tCols2 = Math.sqrt(count) | 0;
        var tCol2  = i % tCols2;
        var tRow2  = Math.floor(i / tCols2);
        px = (tCol2 / tCols2 - 0.5) * tW;
        pz = (tRow2 / tCols2 - 0.5) * tD - 15;
        /* multi-octave approximation using sin/cos sums */
        var amp = P.particleTerrainAmplitude || 20;
        py = Math.sin(px * 0.08) * amp * 0.5
           + Math.cos(pz * 0.06) * amp * 0.35
           + Math.sin((px + pz) * 0.04) * amp * 0.15
           - 18;
        hv = P.hue + (py / amp) * 0.06;

      } else {
        /* default: sphere distribution */
        var r2 = 55 + Math.random() * 90;
        var th3 = Math.random() * Math.PI * 2;
        var ph3 = Math.acos(2 * Math.random() - 1);
        px = r2 * Math.sin(ph3) * Math.cos(th3);
        py = r2 * Math.sin(ph3) * Math.sin(th3);
        pz = r2 * Math.cos(ph3) - 30;
        hv = P.hue + (Math.random() - 0.5) * 0.08;
      }

      pos[i*3]   = px;
      pos[i*3+1] = py;
      pos[i*3+2] = pz;
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
        uTime:       { value: 0 },
        uOpacity:    { value: 0 },
        uFocus:      { value: 0 },
        uHue:        { value: P.hue },
        uSat:        { value: P.sat },
        uBright:     { value: P.bright },
        uSpeedX:     { value: P.particleDriftX },
        uSpeedY:     { value: P.particleDriftY },
        uSwirl:      { value: 0 },
        uPulse:      { value: 0 },
        uMode:       { value: _modeIndex(P.particleMode) },
        uWavePulse:  { value: P.particleWavePulseSpeed  || 1.4 },
        uTunnelSpd:  { value: P.particleTunnelSpeed     || 1.2 },
        uDistortAmp: { value: P.particleDistortAmplitude|| 12  },
        uDistortSpd: { value: P.particleDistortSpeed    || 0.8 },
        uTerrainSpd: { value: P.particleTerrainSpeed    || 0.4 },
        uTerrainAmp: { value: P.particleTerrainAmplitude|| 20  },
      },
      vertexShader: [
        'attribute float size;',
        'varying vec3 vPos;',
        'uniform float uTime,uFocus,uSpeedX,uSpeedY,uSwirl,uPulse,uMode,uDistortAmp,uDistortSpd,uWavePulse,uTunnelSpd,uTerrainSpd,uTerrainAmp;',
        'void main(){',
        '  vec3 p=position;',
        '  float m=uMode;',
        '  if(m<0.5){',
        '    p.y+=sin(uTime*uSpeedY*0.28+p.x*0.05)*1.4*(1.0-uFocus*0.8);',
        '    p.x+=cos(uTime*uSpeedX*0.18+p.z*0.04)*1.0*(1.0-uFocus*0.7);',
        '  } else if(m<1.5){',
        '    float pulse=sin(uTime*uWavePulse+p.x*0.12)*8.0;',
        '    p.y+=pulse*(1.0-uFocus*0.5);',
        '    p.x+=sin(uTime*0.3+p.y*0.08)*2.0;',
        '  } else if(m<2.5){',
        '    p.x+=sin(uTime*0.18+p.y*0.06)*6.0;',
        '    p.y+=cos(uTime*0.12+p.x*0.04)*2.5;',
        '  } else if(m<3.5){',
        '    float layer=step(-40.0,p.z)+step(-15.0,p.z);',
        '    float spd=0.15+layer*0.35;',
        '    p.y+=sin(uTime*spd*0.28+p.x*0.05)*1.4;',
        '    p.x+=cos(uTime*spd*0.18+p.z*0.04)*1.0;',
        '  } else if(m<4.5){',
        '    p.x+=sin(uTime*0.22+p.y*0.08)*4.0;',
        '    p.y+=cos(uTime*0.18+p.x*0.06)*3.0;',
        '    p.z+=sin(uTime*0.14+p.x*0.04)*2.0;',
        '  } else if(m<5.5){',
        '    float ang=uTime*uTunnelSpd*0.4;',
        '    float cx=p.x*cos(ang)-p.y*sin(ang);',
        '    float cy=p.x*sin(ang)+p.y*cos(ang);',
        '    p.x=cx; p.y=cy;',
        '    p.z=mod(p.z+uTime*uTunnelSpd*2.0+50.0,100.0)-50.0;',
        '  } else if(m<6.5){',
        '    float ga=uTime*0.08;',
        '    float gcx=p.x*cos(ga)-p.z*sin(ga);',
        '    float gcz=p.x*sin(ga)+p.z*cos(ga);',
        '    p.x=gcx; p.z=gcz;',
        '    p.y+=sin(uTime*0.15+length(p.xz)*0.05)*1.5;',
        '  } else if(m<7.5){',
        '    float dx=sin(uTime*uDistortSpd+p.x*0.15)*uDistortAmp;',
        '    float dy=cos(uTime*uDistortSpd*0.7+p.y*0.12)*uDistortAmp*0.6;',
        '    p.y+=dx*0.5+dy*0.3;',
        '    p.x+=cos(uTime*uDistortSpd*0.5+p.y*0.1)*uDistortAmp*0.3;',
        '  } else {',
        '    float tw=sin(uTime*uTerrainSpd+p.x*0.08)*uTerrainAmp*0.3;',
        '    float tw2=cos(uTime*uTerrainSpd*0.6+p.z*0.06)*uTerrainAmp*0.2;',
        '    p.y+=tw+tw2;',
        '  }',
        '  if(uSwirl>0.0){',
        '    float angle2=uSwirl*uTime*0.4+length(p.xz)*0.02;',
        '    float sx=p.x*cos(angle2)-p.z*sin(angle2);',
        '    float sz=p.x*sin(angle2)+p.z*cos(angle2);',
        '    p.x=mix(p.x,sx,uSwirl*0.5);p.z=mix(p.z,sz,uSwirl*0.5);',
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
      /* mode uniforms are set at init; only time changes per frame */

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

    /* ── cursor FX ── */
    if (P.cursorFX && window.HeroPipeCursor) {
      var cColor = P.cursorColor || P.accentHex2 || '#8B7FFF';
      window.HeroPipeCursor.init({
        spotlight:       P.cursorSpotlight,
        spotlightColor:  'rgba(' + _hexToRgb(cColor) + ',0.18)',
        spotlightRadius: 300,
        trail:           P.cursorTrail,
        trailColor:      cColor,
        trailDensity:    3,
        magnetic:        P.cursorMagnetic,
        customCursor:    P.cursorCustom,
        cursorColor:     cColor,
      }, canvas);
    }

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
    /* determine CTA text colour: dark for light accents, white for dark */
    var lightAccents = ['arctic-white','monochrome','aurora','rose-gold'];
    var ctaText = lightAccents.indexOf(config.colour || '') !== -1 ? '#111122' : '#ffffff';

    /* inline the manifest and engine into the export */
    var manifestSrc = document.querySelector('script[src*="manifest"]');
    var engineSrc   = document.querySelector('script[src*="engine"]');
    var cursorSrc   = document.querySelector('script[src*="cursor"]');
    var loaderSrc   = document.querySelector('script[src*="loader"]');
    var hoverSrc    = document.querySelector('script[src*="hover"]');
    var manifestUrl = manifestSrc ? manifestSrc.src : '';
    var engineUrl   = engineSrc   ? engineSrc.src   : '';
    var cursorUrl   = cursorSrc   ? cursorSrc.src   : '';
    var loaderUrl   = loaderSrc   ? loaderSrc.src   : '';
    var hoverUrl    = hoverSrc    ? hoverSrc.src    : '';

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
      '    :root{--accent:' + ac + ';--accent2:' + ac2 + ';--white:#F0EEF8;--muted:#6666AA;--cta-text:' + ctaText + ';}' ,
      '    html{overflow-x:hidden;overflow-y:scroll;-webkit-overflow-scrolling:touch;}',
      '    body{width:100%;height:500vh;background:rgb(' + Math.round(P.bgR*255) + ',' + Math.round(P.bgG*255) + ',' + Math.round(P.bgB*255) + ');overflow:hidden;}',
      '    #stage{position:fixed;top:0;left:0;width:100vw;height:100vh;height:100dvh;overflow:hidden;touch-action:pan-y;}',
      '    #hero-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}',
      '    #vignette{position:absolute;inset:0;background:radial-gradient(ellipse 88% 88% at 50% 50%,transparent 32%,rgba(0,0,0,' + P.vignetteStrength + ') 100%);pointer-events:none;}',
      '    #hero-content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;pointer-events:none;will-change:transform;transition:transform 0.15s linear;}',
      '    #hero-headline{',
      '      pointer-events:auto;cursor:default;',
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
      '      background:var(--accent);color:var(--cta-text);',
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
      '    <h1 id="hero-headline" data-scramble>' + _esc(P.headline) + '</h1>',
      '    <p  id="hero-sub">' + _esc(P.subHeadline) + '</p>',
      '    <a  id="hero-cta" href="#" data-tilt data-tilt-strength="8" data-tilt-scale="1.05">' + _esc(P.cta) + '</a>',
      '  </div>',
      '  <div id="scroll-progress"></div>',
      '</div>',
      '<a id="built-with" href="https://heropipe.io" target="_blank">Built with Hero\'s Pipe</a>',
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>',
      manifestUrl ? '<script src="' + manifestUrl + '"><\/script>' : '',
      engineUrl   ? '<script src="' + engineUrl   + '"><\/script>' : '',
      cursorUrl   ? '<script src="' + cursorUrl   + '"><\/script>' : '',
      loaderUrl   ? '<script src="' + loaderUrl   + '"><\/script>' : '',
      hoverUrl    ? '<script src="' + hoverUrl    + '"><\/script>' : '',
      '<script>',
      '(function(){',
      '  var config=' + JSON.stringify(config) + ';',
      '  var canvas=document.getElementById("hero-canvas");',
      '  var progress=document.getElementById("scroll-progress");',
      '  var ctrl;',
      '  window.addEventListener("load",function(){',
      '    if(window.HeroPipeLoader){',
      '      window.HeroPipeLoader.init({',
      '        style: config.loaderStyle||"bloom",',
      '        duration: config.loaderDuration||1000,',
      '        color: "#04040C",',
      '        accentHex: config.accentHex||"#4B3BFF",',
      '        onComplete: function(){',
      '          if(window.HeroPipe){ctrl=window.HeroPipe.render(config,canvas);ctrl.enableAutoScroll(false);}',
      '          setTimeout(function(){document.getElementById("hero-headline").classList.add("in");},80);',
      '          setTimeout(function(){document.getElementById("hero-sub").classList.add("in");},80);',
      '          setTimeout(function(){document.getElementById("hero-cta").classList.add("in");},80);',
      '          if(window.HeroPipeHover)setTimeout(function(){window.HeroPipeHover.init();},150);',
      '        }',
      '      });',
      '    } else {',
      '      if(window.HeroPipe){ctrl=window.HeroPipe.render(config,canvas);ctrl.enableAutoScroll(false);}',
      '      setTimeout(function(){document.getElementById("hero-headline").classList.add("in");},100);',
      '      setTimeout(function(){document.getElementById("hero-sub").classList.add("in");},100);',
      '      setTimeout(function(){document.getElementById("hero-cta").classList.add("in");},100);',
      '      if(window.HeroPipeHover)setTimeout(function(){window.HeroPipeHover.init();},170);',
      '    }',
      '    /* scroll driver */',
      '    var heroContent=document.getElementById("hero-content");',
      '    var textParallax=config.textParallax!==undefined?config.textParallax:0.3;',
      '    window.addEventListener("scroll",function(){',
      '      var p=window.scrollY/(document.body.scrollHeight-window.innerHeight);',
      '      if(ctrl)ctrl.setScroll(p);',
      '      if(progress)progress.style.transform="scaleX("+p+")";',
      '      /* text moves at a different speed than the particle field for depth */',
      '      if(heroContent){',
      '        var offset=(p-0.5)*textParallax*120;',
      '        heroContent.style.transform="translateY("+offset.toFixed(1)+"px)";',
      '      }',
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

  /* ── hex to rgb helper for cursor colour ── */
  function _hexToRgb(hex) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substr(0,2),16);
    var g = parseInt(hex.substr(2,2),16);
    var b = parseInt(hex.substr(4,2),16);
    return r+','+g+','+b;
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