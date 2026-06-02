/* ==========================================================================
   GAURVIT TIWATI ANIME PORTFOLIO - CENTRAL VISUAL ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Visual Elements
  initCustomCursor();
  initParticleBackground();
  initThemeManager();
  initVoiceNavigation();
  initSynthMusic();
  initNavigationTracker();
  initAchievementsTracker();
});

// ==========================================
// 1. CUSTOM CURSOR ENGINE
// ==========================================
function initCustomCursor() {
  const ring = document.createElement('div');
  const dot = document.createElement('div');
  
  ring.className = 'cyber-cursor-ring';
  dot.className = 'cyber-cursor-dot';
  
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Smooth ring follow effect (linear interpolation)
  function renderCursor() {
    const ease = 0.15;
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Add click animations and hover states
  document.addEventListener('mousedown', () => {
    ring.style.width = '24px';
    ring.style.height = '24px';
  });
  
  document.addEventListener('mouseup', () => {
    ring.style.width = '32px';
    ring.style.height = '32px';
  });

  const hoverables = 'a, button, input, textarea, [role="button"], .timeline-event-card, .project-card, .suggest-chip';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) {
      ring.style.borderColor = 'var(--color-neon-pink)';
      ring.style.width = '45px';
      ring.style.height = '45px';
      ring.style.boxShadow = 'var(--accent-glow)';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) {
      ring.style.borderColor = 'var(--color-neon-cyan)';
      ring.style.width = '32px';
      ring.style.height = '32px';
      ring.style.boxShadow = 'none';
    }
  });
}

// ==========================================
// 2. PARTICLE BACKGROUND CANVAS ENGINE
// ==========================================
function initParticleBackground() {
  const canvas = document.createElement('canvas');
  canvas.id = 'cyber-canvas';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  const particles = [];
  const particleCount = 65;
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.4 - 0.2;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
    }
    
    draw() {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-neon-cyan').trim() || '#00f3ff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw subtle grid overlay
    const gridSpacing = 60;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw star net connection mesh
    particles.forEach((p, idx) => {
      p.update();
      p.draw();
      
      for (let j = idx + 1; j < particles.length; j++) {
        const dist = Math.hypot(p.x - particles[j].x, p.y - particles[j].y);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.08;
          ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    });
    
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================
// 3. THEME & WALLPAPER CONTROLLER
// ==========================================
function initThemeManager() {
  const themeBtn = document.getElementById('theme-menu-btn');
  const dropdown = document.getElementById('theme-dropdown-menu');
  const options = document.querySelectorAll('.theme-option');
  
  if (!themeBtn) return;
  
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('visible');
  });
  
  document.addEventListener('click', () => {
    dropdown.classList.remove('visible');
  });

  // Load saved preference
  const currentTheme = localStorage.getItem('theme-system-state') || 'cyberpunk';
  setTheme(currentTheme);

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.getAttribute('data-theme');
      setTheme(theme);
      
      // Play a quick tech sound on selection
      if (window.playSynthNote) {
        window.playSynthNote(600, 'triangle', 0.1);
      }
      
      // Unlock "Theme Explorer" achievement
      if (window.unlockAchievement) {
        window.unlockAchievement('Theme Shifter', 'Toggled visual styles inside theme console.', 'badge_theme_shift', 'Common');
      }
    });
  });

  function setTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
    localStorage.setItem('theme-system-state', name);
    
    options.forEach(opt => {
      if (opt.getAttribute('data-theme') === name) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }
}

// ==========================================
// 4. SPEECH RECOGNITION NAVIGATION
// ==========================================
function initVoiceNavigation() {
  const voiceBtn = document.getElementById('voice-nav-btn');
  const label = document.getElementById('voice-btn-label');
  const notif = document.getElementById('voice-notification');
  const notifMsg = document.getElementById('voice-status-msg');
  
  if (!voiceBtn) return;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.style.display = 'none';
    return;
  }
  
  const rec = new SpeechRecognition();
  rec.continuous = true;
  rec.lang = 'en-US';
  rec.interimResults = false;
  
  let isActive = false;
  
  voiceBtn.addEventListener('click', () => {
    isActive = !isActive;
    if (isActive) {
      voiceBtn.classList.add('active');
      label.innerText = 'ON';
      notif.classList.add('visible');
      notifMsg.innerText = 'Mainframe Voice Engine Active! Say: "Go to About", "Projects", or "Sakura Theme"';
      try {
        rec.start();
        // Play activation tone
        if (window.playSynthNote) {
          window.playSynthNote(800, 'sine', 0.15);
        }
      } catch (e) {}
    } else {
      voiceBtn.classList.remove('active');
      label.innerText = 'VOICE';
      notif.classList.remove('visible');
      try {
        rec.stop();
      } catch (e) {}
    }
  });
  
  rec.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log('🎤 Voice Command Parsed:', transcript);
    notifMsg.innerText = `Command parsed: "${transcript}"`;
    
    if (transcript.includes('about')) {
      navigateSection('about');
    } else if (transcript.includes('project')) {
      navigateSection('projects');
    } else if (transcript.includes('skill')) {
      navigateSection('skills');
    } else if (transcript.includes('contact')) {
      navigateSection('contact');
    } else if (transcript.includes('home')) {
      navigateSection('home');
    } else if (transcript.includes('achievement')) {
      navigateSection('achievements');
    } else if (transcript.includes('console') || transcript.includes('admin')) {
      window.location.href = '/admin';
    } else if (transcript.includes('theme') || transcript.includes('color')) {
      // Toggle themes
      if (transcript.includes('sakura') || transcript.includes('pink')) {
        document.documentElement.setAttribute('data-theme', 'sakura');
      } else if (transcript.includes('matrix') || transcript.includes('green')) {
        document.documentElement.setAttribute('data-theme', 'matrix');
      } else if (transcript.includes('steampunk') || transcript.includes('amber')) {
        document.documentElement.setAttribute('data-theme', 'steampunk');
      } else {
        document.documentElement.setAttribute('data-theme', 'cyberpunk');
      }
      notifMsg.innerText = 'System grid themes toggled!';
    }
  };

  function navigateSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Update active nav-link state
      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-section') === id) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      
      // Play high-frequency chime
      if (window.playSynthNote) {
        window.playSynthNote(950, 'sine', 0.08);
      }
      
      // Unlock dynamic achievement
      if (window.unlockAchievement) {
        window.unlockAchievement('Voice Captain', 'Navigated Gaurvit\'s grid using Web Speech AI voice.', 'badge_voice_nav', 'Rare');
      }
    }
  }
}

// ==========================================
// 5. CASSETTE OSCILLATORS AUDIO SYNTHESIZER
// ==========================================
let audioContext = null;
let synthInterval = null;

function initSynthMusic() {
  const musicBtn = document.getElementById('synth-audio-btn');
  if (!musicBtn) return;
  
  let isPlaying = false;
  
  musicBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      musicBtn.classList.add('active');
      musicBtn.querySelector('.deck-label').innerText = 'PLAYING';
      startSynthwaveMusic();
    } else {
      musicBtn.classList.remove('active');
      musicBtn.querySelector('.deck-label').innerText = 'SYNTH';
      stopSynthwaveMusic();
    }
  });
}

function startSynthwaveMusic() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Custom synth chord progression for classic lofi cyberpunk ambient atmosphere
  // Progression: Am -> F -> C -> G (80 BPM equivalent sweeps)
  const progressions = [
    [220, 261, 329, 392], // Am7
    [174, 220, 261, 349], // Fmaj7
    [261, 329, 392, 523], // Cmaj7
    [196, 246, 293, 392]  // G6
  ];
  
  let measure = 0;
  
  function playMeasure() {
    const notes = progressions[measure % progressions.length];
    
    // Play warm bass root node
    playBassOscillator(notes[0], 2.0);
    
    // Sweep higher ambient pads
    notes.slice(1).forEach((freq, idx) => {
      setTimeout(() => {
        playPadOscillator(freq, 1.8);
      }, idx * 250); // Arpeggiated entry
    });
    
    measure++;
  }
  
  playMeasure();
  synthInterval = setInterval(playMeasure, 2000);
}

function stopSynthwaveMusic() {
  clearInterval(synthInterval);
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

function playBassOscillator(freq, duration) {
  if (!audioContext) return;
  
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq / 2, audioContext.currentTime); // Lower octave bass
  
  gain.gain.setValueAtTime(0.04, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

function playPadOscillator(freq, duration) {
  if (!audioContext) return;
  
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  
  gain.gain.setValueAtTime(0.02, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

// Global short synth note synthesiser for page actions/blips
window.playSynthNote = function(freq, type, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {}
};

// ==========================================
// 6. SCROLL NAVIGATION TRACKER & PROGRESSBARS
// ==========================================
function initNavigationTracker() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        
        // Trigger skills loading bars if view scrolls to skills section
        if (sectionId === 'skills') {
          document.querySelectorAll('.meter-fill').forEach(fill => {
            const pct = fill.getAttribute('data-percentage') || '0%';
            fill.style.width = pct;
          });
        }
      }
    });
  });

  // Mobile hamburger toggles
  const burger = document.getElementById('hamburger-toggle');
  const menu = document.getElementById('cyber-nav-menu');
  
  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      menu.classList.toggle('open');
    });
  }
}

// ==========================================
// 7. ACHIEVEMENTS BADGE POPUP CONTROLLER
// ==========================================
function initAchievementsTracker() {
  // Global register method to unlock achievements live on client
  window.unlockAchievement = async function(title, description, badgeId, rarity) {
    try {
      const response = await fetch('/api/achievements/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, badgeId, rarity })
      });
      const resData = await response.json();
      
      if (resData.success && resData.newlyUnlocked) {
        // Render magnificent achievement popup alert on the screen!
        triggerAchievementNotificationPopup(title, description, rarity || 'Common');
      }
    } catch (err) {
      console.warn('Unlock API error:', err);
    }
  };
}

function triggerAchievementNotificationPopup(title, description, rarity) {
  // Check if popup card exists already, otherwise create one
  let popup = document.getElementById('achievement-unlock-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'achievement-unlock-popup';
    popup.className = 'achievement-unlock-notifier';
    document.body.appendChild(popup);
  }
  
  popup.innerHTML = `
    <div class="trophy-glow">🏆</div>
    <div class="achievement-details">
      <div class="achievement-rarity rarity-${rarity.toLowerCase()}">${rarity} Achievement unlocked!</div>
      <div class="achievement-title" style="color: var(--color-neon-gold); font-size: 1rem;">${title}</div>
      <div class="achievement-desc" style="color: #fff;">${description}</div>
    </div>
  `;
  
  // Play beautiful high achievement sweep sound
  if (window.playSynthNote) {
    window.playSynthNote(523.25, 'sine', 0.25); // C5 note
    setTimeout(() => window.playSynthNote(659.25, 'sine', 0.25), 100); // E5 note
    setTimeout(() => window.playSynthNote(783.99, 'sine', 0.4), 200); // G5 note
  }
  
  popup.classList.add('slide-in');
  
  setTimeout(() => {
    popup.classList.remove('slide-in');
  }, 4500);
}
