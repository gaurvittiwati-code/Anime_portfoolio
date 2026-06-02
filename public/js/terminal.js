/* ==========================================================================
   RETRO HACKER TERMINAL SIMULATOR CLI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('terminal-mainframe-overlay');
  const triggerBtn = document.getElementById('terminal-trigger-btn');
  const closeBtn = document.getElementById('terminal-close-btn');
  const hiddenInput = document.getElementById('terminal-keyboard-input');
  const promptEcho = document.getElementById('terminal-prompt-echo');
  const terminalBody = document.getElementById('terminal-body');
  const historyContainer = document.getElementById('terminal-cli-history');

  if (!overlay) return;

  // Toggle terminal display via shell icon or tilde (~) key
  function toggleTerminal(state) {
    if (state === undefined) {
      overlay.classList.toggle('visible');
    } else if (state) {
      overlay.classList.add('visible');
    } else {
      overlay.classList.remove('visible');
    }

    if (overlay.classList.contains('visible')) {
      hiddenInput.focus();
      // Clear current input prompt lines
      hiddenInput.value = '';
      promptEcho.innerText = '';
      
      // Play a cool mechanical computer startup crunch sound
      if (window.playSynthNote) {
        window.playSynthNote(350, 'sawtooth', 0.15);
        setTimeout(() => window.playSynthNote(450, 'sawtooth', 0.12), 80);
      }

      // Unlock achievements
      if (window.unlockAchievement) {
        window.unlockAchievement('Hacker Shell Access', 'Initiated the retro command terminal CLI.', 'badge_terminal_shell', 'Common');
      }
    }
  }

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => toggleTerminal(true));
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleTerminal(false));
  }

  // Keyboard shortcut listener: tilde/backtick (`) or Esc exits
  document.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      toggleTerminal();
    } else if (e.key === 'Escape' && overlay.classList.contains('visible')) {
      toggleTerminal(false);
    }
  });

  // Ensure click anywhere inside terminal body forces input keyboard focus
  terminalBody.addEventListener('click', () => {
    hiddenInput.focus();
  });

  // Synchronise hidden input with glowing prompt text
  hiddenInput.addEventListener('input', () => {
    promptEcho.innerText = hiddenInput.value;
  });

  // Form command execution loop
  hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const commandText = hiddenInput.value.trim();
      hiddenInput.value = '';
      promptEcho.innerText = '';
      
      if (commandText) {
        executeCLICommand(commandText);
      }
    }
  });

  async function executeCLICommand(rawCommand) {
    const args = rawCommand.split(' ');
    const command = args[0].toLowerCase();
    
    // Add command to scroll lines
    appendHistoryItem(`cyber-guest@gaurvit.sys:~$ ${rawCommand}`, '');

    let output = '';

    switch (command) {
      case 'help':
        output = `
Available procedures in the secure mainframe database:
  neofetch      Show system specs and anime avatar details.
  about         Output Gaurvit Tiwati's professional bio specs.
  projects      Fetch list of developed cyber-projects.
  skills        Inspect specialized full-stack technical competencies.
  theme [val]   Modify system colors: 'cyberpunk', 'sakura', 'matrix', 'steampunk'.
  clear         Purge historical screen buffers.
  sudo login    Open decrypted admin authorization protocols.
  matrix        Initiate cascading raw green hacker stream mode.
  exit          Close terminal shell simulator.
`;
        break;
      
      case 'neofetch':
        output = `
  ██████╗  █████╗ ██╗   ██╗██████╗  \x1b[35mOS:\x1b[0m Node.js / Express Terminal
  ██╔════╝ ██╔══██╗██║   ██║██╔══██╗ \x1b[36mHost:\x1b[0m Gaurvit Tiwati Cyber-Grid
  ██║  ███╗███████║██║   ██║██████╔╝ \x1b[32mEngine:\x1b[0m Yuki v3.5 Neural Assistant
  ██║   ██║██╔══██║██║   ██║██╔══██╗ \x1b[33mTheme:\x1b[0m ${document.documentElement.getAttribute('data-theme') || 'cyberpunk'}
  ╚██████╔╝██║  ██║╚██████╔╝██║  ██║ \x1b[31mStatus:\x1b[0m Sandboxed Sandbox Core
   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ \x1b[34mUptime:\x1b[0m 100% Operational

`;
        break;

      case 'about':
        output = `
Gaurvit Tiwati - Full-stack developer and Node.js netrunner.
He builds lightning fast Express frameworks, secures data structures using JWT crypts,
and models resilient documents using MongoDB clusters. He has a passion for building 
beautiful responsive microservices, canvas interactive nodes, and gamified portfolios.
`;
        break;
        
      case 'projects':
        try {
          const response = await fetch('/api/projects');
          const res = await response.json();
          if (res.success && res.data.length > 0) {
            output = 'RETRIEVING PORTFOLIO DATABASE RECORDS:\n\n';
            res.data.forEach((p, idx) => {
              output += `[0${idx+1}] TITLE: ${p.title}\n`;
              output += `     DESCRIPTION: ${p.description.substring(0, 80)}...\n`;
              output += `     TECH: ${p.tags.join(', ')}\n`;
              output += `     LINK: ${p.githubLink || 'None'}\n\n`;
            });
          } else {
            output = 'Zero active files found.';
          }
        } catch (e) {
          output = 'DB read failed: main link offline.';
        }
        break;

      case 'skills':
        output = `
FULL-STACK SYSTEM CAPABILITIES:
  Node.js / Express [====================] 95%
  JavaScript (ES6+)  [====================] 95%
  MongoDB / Mongoose [==================  ] 90%
  CSS3 / Grid System [====================] 95%
  EJS Views engine   [==================  ] 90%
  Git / Terminal     [====================] 95%
  Cloud Deployment   [==================  ] 90%
`;
        break;

      case 'theme':
        const themeVal = args[1] ? args[1].toLowerCase() : '';
        const validThemes = ['cyberpunk', 'sakura', 'matrix', 'steampunk'];
        if (validThemes.includes(themeVal)) {
          document.documentElement.setAttribute('data-theme', themeVal);
          localStorage.setItem('theme-system-state', themeVal);
          output = `System color schemes modified to: [${themeVal.toUpperCase()}].`;
        } else {
          output = `Invalid parameter. Available themes: 'cyberpunk', 'sakura', 'matrix', 'steampunk'.`;
        }
        break;

      case 'clear':
        historyContainer.innerHTML = '';
        hiddenInput.value = '';
        promptEcho.innerText = '';
        return;
        
      case 'sudo':
        if (args[1] === 'login') {
          output = 'Redirecting console access to authorization terminal...';
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          output = 'Permission denied. Unauthenticated procedure.';
        }
        break;

      case 'matrix':
        initMatrixRainMode();
        return;

      case 'exit':
        toggleTerminal(false);
        return;
        
      default:
        output = `system_err: Procedure "${command}" not recognized inside secure mainframe database. Type "help" for a catalog.`;
        break;
    }

    appendHistoryItem('', output);
    
    // Play quick keyboard click blip sound
    if (window.playSynthNote) {
      window.playSynthNote(400, 'triangle', 0.05);
    }
  }

  function appendHistoryItem(cmdLine, outText) {
    const item = document.createElement('div');
    item.className = 'terminal-history-item';
    
    if (cmdLine) {
      const cmdDiv = document.createElement('div');
      cmdDiv.className = 'history-command';
      cmdDiv.innerText = cmdLine;
      item.appendChild(cmdDiv);
    }
    
    if (outText) {
      const outPre = document.createElement('pre');
      outPre.className = 'history-output';
      outPre.innerHTML = outText;
      item.appendChild(outPre);
    }
    
    historyContainer.appendChild(item);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Easter egg cascading hacker code rain
  function initMatrixRainMode() {
    appendHistoryItem('', 'COMPILING QUANTUM STREAM DATA NODES...');
    
    const matrixCanvas = document.createElement('canvas');
    matrixCanvas.className = 'matrix-rain-overlay active';
    terminalBody.appendChild(matrixCanvas);
    
    const mctx = matrixCanvas.getContext('2d');
    
    let mWidth = (matrixCanvas.width = terminalBody.clientWidth);
    let mHeight = (matrixCanvas.height = terminalBody.clientHeight);
    
    const columns = Math.floor(mWidth / 14);
    const rainDrops = Array(columns).fill(1);
    
    const charList = "アカサタナハマヤラワガザダバパイウエオ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    let matrixInterval = setInterval(() => {
      mctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      mctx.fillRect(0, 0, mWidth, mHeight);
      
      mctx.fillStyle = '#39ff14'; // Matrix hacker green color
      mctx.font = '12px monospace';
      
      for (let i = 0; i < rainDrops.length; i++) {
        const char = charList[Math.floor(Math.random() * charList.length)];
        const x = i * 14;
        const y = rainDrops[i] * 12;
        
        mctx.fillText(char, x, y);
        
        if (y > mHeight && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    }, 33);
    
    // Stop matrix rain on mouse double click inside terminal
    matrixCanvas.addEventListener('click', () => {
      clearInterval(matrixInterval);
      matrixCanvas.remove();
      appendHistoryItem('', 'MATRIX CASCADE TERMINATED successfully. SYSTEM SECURE.');
      
      // Unlock legendary achievement
      if (window.unlockAchievement) {
        window.unlockAchievement('Matrix Breaker', 'Decrypted the scrolling binary cascade easter egg.', 'badge_matrix_rain', 'Epic');
      }
    });
  }
});
