/* ═══════════════════════════════════════════════════════════════
   HERO'S PIPE — CAPABILITY MANIFEST
   Single source of truth for everything the engine can do.
   - Sent verbatim to Gemini as context
   - Read by engine.js to resolve configs
   - Add new capabilities here; engine picks them up automatically
═══════════════════════════════════════════════════════════════ */

window.HeroPipeManifest = {

  version: '1.0.0',

  description: 'Hero\'s Pipe is a scroll-driven hero section engine. It renders a fullscreen WebGL particle scene driven by a JSON config object. The config controls visual style, animation behaviour, camera choreography and copy. All values below are the complete set of valid options.',

  /* ── THEMES ─────────────────────────────────────────────── */
  themes: {
    'ai-tech': {
      label: 'AI / Tech',
      description: 'Neural networks, data, intelligence, computation. Cold precision with occasional warmth.',
      defaultMood: 'futuristic',
      defaultParticles: 'network',
      defaultCamera: 'push',
      defaultColour: 'indigo-night',
    },
    'saas': {
      label: 'SaaS',
      description: 'Software product, productivity, clarity, trust. Professional with modern energy.',
      defaultMood: 'bold',
      defaultParticles: 'grid',
      defaultCamera: 'drift',
      defaultColour: 'arctic-white',
    },
    'crypto': {
      label: 'Crypto / Web3',
      description: 'Decentralised finance, blockchain, tokens, protocols. Electric and disruptive.',
      defaultMood: 'futuristic',
      defaultParticles: 'shards',
      defaultCamera: 'ascend',
      defaultColour: 'neon-city',
    },
    'gaming': {
      label: 'Gaming',
      description: 'Games, players, competition, worlds. High energy, dramatic, immersive.',
      defaultMood: 'bold',
      defaultParticles: 'aura',
      defaultCamera: 'orbit',
      defaultColour: 'crimson-edge',
    },
    'media': {
      label: 'Media',
      description: 'Content, storytelling, publishing, video, audio. Dynamic and expressive.',
      defaultMood: 'cinematic',
      defaultParticles: 'bloom',
      defaultCamera: 'sway',
      defaultColour: 'cosmic',
    },
    'community': {
      label: 'Community',
      description: 'People, connection, belonging, collaboration. Warm and expansive.',
      defaultMood: 'warm',
      defaultParticles: 'network',
      defaultCamera: 'orbit',
      defaultColour: 'amber-dusk',
    },
    'education': {
      label: 'Education',
      description: 'Learning, knowledge, growth, discovery. Clear and inspiring.',
      defaultMood: 'elegant',
      defaultParticles: 'constellation',
      defaultCamera: 'ascend',
      defaultColour: 'teal-horizon',
    },
    'health': {
      label: 'Health',
      description: 'Wellness, care, vitality, medicine. Calm and trustworthy.',
      defaultMood: 'organic',
      defaultParticles: 'bloom',
      defaultCamera: 'breathe',
      defaultColour: 'forest',
    },
    'finance': {
      label: 'Finance',
      description: 'Money, markets, investment, banking. Precise, structured, authoritative.',
      defaultMood: 'corporate',
      defaultParticles: 'grid',
      defaultCamera: 'static',
      defaultColour: 'arctic-white',
    },
    'portfolio': {
      label: 'Portfolio',
      description: 'Personal work, creative showcase, craft, identity. Refined and memorable.',
      defaultMood: 'minimal',
      defaultParticles: 'dust',
      defaultCamera: 'drift',
      defaultColour: 'void',
    },
    'creative': {
      label: 'Creative Agency',
      description: 'Design, branding, art direction, ideas. Bold and unexpected.',
      defaultMood: 'playful',
      defaultParticles: 'bloom',
      defaultCamera: 'sway',
      defaultColour: 'aurora',
    },
    'fashion': {
      label: 'Fashion',
      description: 'Style, luxury, identity, aesthetics. Elegant and directional.',
      defaultMood: 'elegant',
      defaultParticles: 'dust',
      defaultCamera: 'pull',
      defaultColour: 'rose-gold',
    },
    'architecture': {
      label: 'Architecture',
      description: 'Space, structure, form, materials. Considered and monumental.',
      defaultMood: 'minimal',
      defaultParticles: 'grid',
      defaultCamera: 'dive',
      defaultColour: 'monochrome',
    },
    'nature': {
      label: 'Nature',
      description: 'Environment, ecology, earth, organic systems. Alive and grounded.',
      defaultMood: 'organic',
      defaultParticles: 'fireflies',
      defaultCamera: 'breathe',
      defaultColour: 'forest',
    },
    'science': {
      label: 'Science',
      description: 'Research, discovery, data, exploration. Precise and vast.',
      defaultMood: 'cinematic',
      defaultParticles: 'constellation',
      defaultCamera: 'pull',
      defaultColour: 'cosmic',
    },
  },

  /* ── MOODS ──────────────────────────────────────────────── */
  moods: {
    bold: {
      label: 'Bold',
      description: 'High contrast, strong presence, confident. Particles dense and bright.',
      params: { particleOpacityMult: 1.3, satMult: 1.1, brightMult: 1.1, vignetteStrength: 0.75 },
    },
    elegant: {
      label: 'Elegant',
      description: 'Refined, spacious, precise. Particles sparse and luminous.',
      params: { particleOpacityMult: 0.8, satMult: 0.75, brightMult: 1.0, vignetteStrength: 0.88 },
    },
    playful: {
      label: 'Playful',
      description: 'Light, energetic, surprising. Particles varied in size, faster drift.',
      params: { particleOpacityMult: 1.1, satMult: 1.15, brightMult: 1.15, vignetteStrength: 0.6 },
    },
    minimal: {
      label: 'Minimal',
      description: 'Restrained, open, deliberate. Very sparse particles, slow motion.',
      params: { particleOpacityMult: 0.55, satMult: 0.6, brightMult: 0.9, vignetteStrength: 0.92 },
    },
    cinematic: {
      label: 'Cinematic',
      description: 'Dramatic, immersive, storytelling. Deep vignette, rich colour.',
      params: { particleOpacityMult: 1.0, satMult: 0.9, brightMult: 0.85, vignetteStrength: 0.95 },
    },
    dark: {
      label: 'Dark',
      description: 'Brooding, mysterious, intense. Low brightness, deep blacks.',
      params: { particleOpacityMult: 0.75, satMult: 0.8, brightMult: 0.65, vignetteStrength: 0.98 },
    },
    warm: {
      label: 'Warm',
      description: 'Inviting, human, approachable. Amber-shifted tones, softer glow.',
      params: { particleOpacityMult: 1.0, satMult: 0.9, brightMult: 1.05, vignetteStrength: 0.7 },
    },
    corporate: {
      label: 'Corporate',
      description: 'Professional, trustworthy, stable. Calm palette, minimal movement.',
      params: { particleOpacityMult: 0.65, satMult: 0.55, brightMult: 0.95, vignetteStrength: 0.8 },
    },
    futuristic: {
      label: 'Futuristic',
      description: 'Forward-looking, technological, precise. Crisp edges, electric colours.',
      params: { particleOpacityMult: 1.1, satMult: 1.2, brightMult: 1.05, vignetteStrength: 0.82 },
    },
    organic: {
      label: 'Organic',
      description: 'Natural, breathing, alive. Irregular motion, earthy tones.',
      params: { particleOpacityMult: 0.9, satMult: 0.7, brightMult: 0.95, vignetteStrength: 0.65 },
    },
  },

  /* ── ENERGY ─────────────────────────────────────────────── */
  energy: {
    contemplative: {
      label: 'Contemplative',
      description: 'Slow, meditative. Camera moves imperceptibly. Particles drift like breath.',
      params: { speedMult: 0.35, scrollScrub: 2.2, cameraEase: 0.012 },
    },
    balanced: {
      label: 'Balanced',
      description: 'Natural pacing. Smooth transitions, readable motion.',
      params: { speedMult: 1.0, scrollScrub: 1.6, cameraEase: 0.03 },
    },
    electric: {
      label: 'Electric',
      description: 'Fast, crackling energy. Particles move rapidly, transitions snap.',
      params: { speedMult: 2.2, scrollScrub: 0.8, cameraEase: 0.07 },
    },
    frantic: {
      label: 'Frantic',
      description: 'Maximum energy. Everything moves fast, high particle activity.',
      params: { speedMult: 3.5, scrollScrub: 0.5, cameraEase: 0.12 },
    },
    glacial: {
      label: 'Glacial',
      description: 'Extremely slow. Scene barely moves. Deep, patient contemplation.',
      params: { speedMult: 0.15, scrollScrub: 3.5, cameraEase: 0.005 },
    },
  },

  /* ── COLOUR PALETTES ─────────────────────────────────────── */
  colours: {
    'indigo-night': {
      label: 'Indigo Night',
      description: 'Deep space indigo with violet highlights. The default HeroPipe palette.',
      params: { hue: 0.68, sat: 0.85, bright: 0.58, bgR: 0.016, bgG: 0.016, bgB: 0.055, accentHex: '#4B3BFF', accentHex2: '#8B7FFF' },
    },
    'amber-dusk': {
      label: 'Amber Dusk',
      description: 'Warm amber and gold. Sunset tones, inviting.',
      params: { hue: 0.08, sat: 0.90, bright: 0.62, bgR: 0.04, bgG: 0.02, bgB: 0.01, accentHex: '#FF9500', accentHex2: '#FFD166' },
    },
    'teal-horizon': {
      label: 'Teal Horizon',
      description: 'Clean teal and cyan. Fresh, modern, confident.',
      params: { hue: 0.50, sat: 0.88, bright: 0.60, bgR: 0.01, bgG: 0.035, bgB: 0.04, accentHex: '#00D4C8', accentHex2: '#00FFE5' },
    },
    'crimson-edge': {
      label: 'Crimson Edge',
      description: 'Deep red and hot pink. Aggressive, passionate, high contrast.',
      params: { hue: 0.96, sat: 0.92, bright: 0.58, bgR: 0.04, bgG: 0.01, bgB: 0.015, accentHex: '#FF1744', accentHex2: '#FF6D00' },
    },
    'arctic-white': {
      label: 'Arctic White',
      description: 'Cool blue-white. Clean, minimal, trustworthy.',
      params: { hue: 0.60, sat: 0.45, bright: 0.80, bgR: 0.01, bgG: 0.01, bgB: 0.025, accentHex: '#E8F0FF', accentHex2: '#A0C4FF' },
    },
    'aurora': {
      label: 'Aurora',
      description: 'Multi-hue aurora borealis. Green, teal, violet, pink.',
      params: { hue: 0.42, sat: 0.95, bright: 0.65, bgR: 0.008, bgG: 0.015, bgB: 0.03, accentHex: '#00FF87', accentHex2: '#60EFFF' },
    },
    'void': {
      label: 'Void',
      description: 'Near-black with faint blue-grey hints. Maximally dark and minimal.',
      params: { hue: 0.64, sat: 0.30, bright: 0.40, bgR: 0.008, bgG: 0.008, bgB: 0.012, accentHex: '#333355', accentHex2: '#555588' },
    },
    'solar': {
      label: 'Solar',
      description: 'Bright orange and yellow. Energy, heat, optimism.',
      params: { hue: 0.06, sat: 1.0, bright: 0.70, bgR: 0.05, bgG: 0.025, bgB: 0.005, accentHex: '#FF6B00', accentHex2: '#FFD000' },
    },
    'forest': {
      label: 'Forest',
      description: 'Deep greens with earthy brown undertones. Grounded and alive.',
      params: { hue: 0.33, sat: 0.80, bright: 0.52, bgR: 0.01, bgG: 0.025, bgB: 0.01, accentHex: '#2D6A4F', accentHex2: '#52B788' },
    },
    'ocean-deep': {
      label: 'Ocean Deep',
      description: 'Abyssal blue-black with bioluminescent cyan accents.',
      params: { hue: 0.57, sat: 0.95, bright: 0.55, bgR: 0.005, bgG: 0.01, bgB: 0.04, accentHex: '#0077B6', accentHex2: '#00B4D8' },
    },
    'rose-gold': {
      label: 'Rose Gold',
      description: 'Soft pink and warm gold. Luxury, femininity, fashion.',
      params: { hue: 0.92, sat: 0.65, bright: 0.68, bgR: 0.03, bgG: 0.015, bgB: 0.02, accentHex: '#E8A0BF', accentHex2: '#FFD700' },
    },
    'neon-city': {
      label: 'Neon City',
      description: 'Hot pink and electric cyan on near-black. Cyberpunk, digital, nocturnal.',
      params: { hue: 0.85, sat: 1.0, bright: 0.72, bgR: 0.008, bgG: 0.005, bgB: 0.012, accentHex: '#FF00FF', accentHex2: '#00FFFF' },
    },
    'monochrome': {
      label: 'Monochrome',
      description: 'Pure greyscale. Timeless, architectural, editorial.',
      params: { hue: 0.60, sat: 0.05, bright: 0.65, bgR: 0.01, bgG: 0.01, bgB: 0.01, accentHex: '#888888', accentHex2: '#CCCCCC' },
    },
    'ember': {
      label: 'Ember',
      description: 'Deep red-orange embers fading to black. Intense and primal.',
      params: { hue: 0.04, sat: 0.95, bright: 0.52, bgR: 0.035, bgG: 0.008, bgB: 0.005, accentHex: '#FF4500', accentHex2: '#FF8C00' },
    },
    'cosmic': {
      label: 'Cosmic',
      description: 'Deep purple and blue-violet. Galaxies, vastness, wonder.',
      params: { hue: 0.74, sat: 0.88, bright: 0.55, bgR: 0.012, bgG: 0.008, bgB: 0.03, accentHex: '#7B2FBE', accentHex2: '#C77DFF' },
    },
  },

  /* ── PARTICLE SYSTEMS ────────────────────────────────────── */
  particles: {
    nebula: {
      label: 'Nebula',
      description: 'Soft glowing clouds of particles in slow organic drift. Cosmic and vast.',
      params: { count: 3000, sizeMin: 0.5, sizeMax: 2.0, focusMax: 0.25, swirlMax: 0, driftX: 1.0, driftY: 1.4 },
    },
    network: {
      label: 'Network',
      description: 'Particles that suggest connection and flow. Nodes in a living graph.',
      params: { count: 2200, sizeMin: 0.4, sizeMax: 1.2, focusMax: 0.55, swirlMax: 0.1, driftX: 0.6, driftY: 0.8 },
    },
    constellation: {
      label: 'Constellation',
      description: 'Sparse bright points like stars. Clean, distant, navigational.',
      params: { count: 1200, sizeMin: 0.8, sizeMax: 2.5, focusMax: 0.15, swirlMax: 0, driftX: 0.3, driftY: 0.4 },
    },
    aura: {
      label: 'Aura',
      description: 'Dense halo of particles that pulse and breathe. Power and identity.',
      params: { count: 3500, sizeMin: 0.3, sizeMax: 1.5, focusMax: 0.75, swirlMax: 0.4, driftX: 0.8, driftY: 1.0 },
    },
    grid: {
      label: 'Grid',
      description: 'Structured geometric particle arrangement. Order, precision, systems.',
      params: { count: 2000, sizeMin: 0.4, sizeMax: 0.8, focusMax: 0.6, swirlMax: 0, driftX: 0.2, driftY: 0.2 },
    },
    dust: {
      label: 'Dust',
      description: 'Fine particles floating like dust in light. Intimate and quiet.',
      params: { count: 2800, sizeMin: 0.2, sizeMax: 0.8, focusMax: 0.1, swirlMax: 0, driftX: 0.5, driftY: 0.7 },
    },
    vortex: {
      label: 'Vortex',
      description: 'Particles spiralling inward. Magnetic, centripetal, hypnotic.',
      params: { count: 3000, sizeMin: 0.3, sizeMax: 1.2, focusMax: 0.8, swirlMax: 1.0, driftX: 0.4, driftY: 0.6 },
    },
    rain: {
      label: 'Rain',
      description: 'Particles falling with gravity. Melancholic, rhythmic, cleansing.',
      params: { count: 2500, sizeMin: 0.2, sizeMax: 0.6, focusMax: 0.3, swirlMax: 0, driftX: 0.1, driftY: 2.5 },
    },
    bloom: {
      label: 'Bloom',
      description: 'Expanding bursts of particles. Growth, emergence, flowering.',
      params: { count: 2800, sizeMin: 0.4, sizeMax: 1.8, focusMax: 0.2, swirlMax: 0.15, driftX: 1.2, driftY: 1.2 },
    },
    shards: {
      label: 'Shards',
      description: 'Angular particles like broken light. Disruptive, sharp, crystalline.',
      params: { count: 2000, sizeMin: 0.6, sizeMax: 2.2, focusMax: 0.4, swirlMax: 0.2, driftX: 0.8, driftY: 1.0 },
    },
    waves: {
      label: 'Waves',
      description: 'Particles arranged in flowing sine waves. Rhythmic, fluid, musical.',
      params: { count: 2500, sizeMin: 0.3, sizeMax: 1.0, focusMax: 0.35, swirlMax: 0, driftX: 2.0, driftY: 0.4 },
    },
    fireflies: {
      label: 'Fireflies',
      description: 'Sparse bright particles blinking and wandering. Magical, natural, warm.',
      params: { count: 800, sizeMin: 1.0, sizeMax: 3.0, focusMax: 0.08, swirlMax: 0, driftX: 1.4, driftY: 1.0 },
    },
    matrix: {
      label: 'Matrix',
      description: 'Dense falling particles in columnar streams. Digital, coded, cascading.',
      params: { count: 3200, sizeMin: 0.2, sizeMax: 0.5, focusMax: 0.5, swirlMax: 0, driftX: 0.05, driftY: 3.0 },
    },
    smoke: {
      label: 'Smoke',
      description: 'Diffuse slow-rising particles. Mysterious, ambient, ethereal.',
      params: { count: 1800, sizeMin: 1.0, sizeMax: 3.5, focusMax: 0.15, swirlMax: 0.05, driftX: 0.6, driftY: -1.2 },
    },
    crystal: {
      label: 'Crystal',
      description: 'Faceted bright particles catching light. Luxury, clarity, precision.',
      params: { count: 1600, sizeMin: 0.8, sizeMax: 2.8, focusMax: 0.45, swirlMax: 0.08, driftX: 0.5, driftY: 0.7 },
    },
  },

  /* ── CAMERA PATHS ────────────────────────────────────────── */
  cameras: {
    drift: {
      label: 'Drift',
      description: 'Gentle lateral float. Relaxed, contemplative, unhurried.',
      params: { startZ: 75, endZ: 55, midZ: 60, camYAmplitude: 3, camXAmplitude: 5 },
    },
    ascend: {
      label: 'Ascend',
      description: 'Camera rises as you scroll. Uplifting, aspirational, rising.',
      params: { startZ: 80, endZ: 45, midZ: 60, camYAmplitude: -12, camXAmplitude: 0 },
    },
    orbit: {
      label: 'Orbit',
      description: 'Camera arcs around the particle field. Exploratory, 360-feeling.',
      params: { startZ: 70, endZ: 70, midZ: 50, camYAmplitude: 0, camXAmplitude: 20 },
    },
    push: {
      label: 'Push',
      description: 'Camera drives forward through the field. Immersive, entering.',
      params: { startZ: 90, endZ: 20, midZ: 50, camYAmplitude: 0, camXAmplitude: 0 },
    },
    pull: {
      label: 'Pull',
      description: 'Camera pulls back to reveal scale. Expansive, zooming out.',
      params: { startZ: 30, endZ: 85, midZ: 55, camYAmplitude: 0, camXAmplitude: 0 },
    },
    sway: {
      label: 'Sway',
      description: 'Gentle side-to-side motion. Human, breathing, living.',
      params: { startZ: 65, endZ: 65, midZ: 55, camYAmplitude: 4, camXAmplitude: 12 },
    },
    spiral: {
      label: 'Spiral',
      description: 'Camera spirals inward while descending. Hypnotic, disorientating.',
      params: { startZ: 80, endZ: 35, midZ: 58, camYAmplitude: -8, camXAmplitude: 15 },
    },
    static: {
      label: 'Static',
      description: 'Camera does not move. Scene motion comes only from particles.',
      params: { startZ: 60, endZ: 60, midZ: 60, camYAmplitude: 0, camXAmplitude: 0 },
    },
    breathe: {
      label: 'Breathe',
      description: 'Camera pulses forward and back like a breath. Meditative, alive.',
      params: { startZ: 65, endZ: 55, midZ: 45, camYAmplitude: 2, camXAmplitude: 0 },
    },
    dive: {
      label: 'Dive',
      description: 'Camera descends steeply. Gravity, weight, commitment.',
      params: { startZ: 70, endZ: 50, midZ: 60, camYAmplitude: -18, camXAmplitude: 0 },
    },
  },

  /* ── TYPOGRAPHY WEIGHTS ──────────────────────────────────── */
  typography: {
    light: {
      label: 'Light',
      description: 'Thin, airy, editorial.',
      params: { fontWeight: 300, letterSpacing: '0.04em', lineHeight: 1.15 },
    },
    regular: {
      label: 'Regular',
      description: 'Neutral, readable, versatile.',
      params: { fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.1 },
    },
    bold: {
      label: 'Bold',
      description: 'Strong, confident, present.',
      params: { fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.06 },
    },
    heavy: {
      label: 'Heavy',
      description: 'Maximum impact, commanding.',
      params: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.02 },
    },
    ultrawide: {
      label: 'Ultrawide',
      description: 'Expanded tracking, monumental, architectural.',
      params: { fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1.08 },
    },
  },

  /* ── SCROLL CHAPTERS ─────────────────────────────────────── */
  chapters: {
    description: 'Every hero has exactly 5 scroll chapters. Their labels and transitions are fixed; their visual state is driven by the config.',
    structure: [
      { index: 0, name: 'Arrival',  scrollPct: [0,    0.18], description: 'First impression. Brand name, particles emerge, camera at start position.' },
      { index: 1, name: 'Reveal',   scrollPct: [0.18, 0.36], description: 'Core value prop. Main headline fully visible, scene brightens.' },
      { index: 2, name: 'Expand',   scrollPct: [0.36, 0.55], description: 'Supporting detail. Camera moves, particle system shifts.' },
      { index: 3, name: 'Deepen',   scrollPct: [0.55, 0.74], description: 'Proof/features. Scene reaches most intense visual state.' },
      { index: 4, name: 'Resolve',  scrollPct: [0.74, 1.0],  description: 'CTA. Visual state returns toward opening, inviting action.' },
    ],
  },

  /* ── TRANSITIONS ─────────────────────────────────────────── */
  transitions: {
    dissolve: { label: 'Dissolve', description: 'Cross-fade between chapter states.', params: { duration: 0.8, ease: 'power2.inOut' } },
    bloom:    { label: 'Bloom',    description: 'Particle brightness blooms then settles.', params: { duration: 0.6, ease: 'power3.out' } },
    shift:    { label: 'Shift',    description: 'Values shift directly, no easing.', params: { duration: 0.4, ease: 'none' } },
    snap:     { label: 'Snap',     description: 'Instant cut. No transition.', params: { duration: 0.05, ease: 'none' } },
    float:    { label: 'Float',    description: 'Very slow, imperceptible transition.', params: { duration: 2.0, ease: 'sine.inOut' } },
  },

  /* ── GEMINI SYSTEM PROMPT ────────────────────────────────── */
  geminiSystemPrompt: function() {
    return [
      "You are the AI refinement layer for Hero's Pipe, a scroll-driven hero section engine.",
      "Your job is to take an existing config object and improve it based on the user's project description.",
      "You MUST only use values that exist in the manifest. Do not invent new keys or values.",
      "Return ONLY a valid JSON object — no explanation, no markdown, no backticks.",
      "The JSON must have these keys: theme, mood, energy, colour, particles, camera, typography.",
      "Values must exactly match the keys defined in the manifest below.",
      "Consider: does the colour palette suit the mood? Does the camera path match the energy?",
      "Does the particle system reinforce the theme? Make the combination feel intentional.",
      "",
      "VALID VALUES:",
      "theme: " + Object.keys(window.HeroPipeManifest.themes).join(', '),
      "mood: " + Object.keys(window.HeroPipeManifest.moods).join(', '),
      "energy: " + Object.keys(window.HeroPipeManifest.energy).join(', '),
      "colour: " + Object.keys(window.HeroPipeManifest.colours).join(', '),
      "particles: " + Object.keys(window.HeroPipeManifest.particles).join(', '),
      "camera: " + Object.keys(window.HeroPipeManifest.cameras).join(', '),
      "typography: " + Object.keys(window.HeroPipeManifest.typography).join(', '),
    ].join('\n');
  },

};
