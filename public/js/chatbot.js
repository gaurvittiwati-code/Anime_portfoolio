/* ==========================================================================
   YUKI AI CHATBOT CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const mainframe = document.getElementById('chatbot-mainframe');
  const toggleBtn = document.getElementById('companion-avatar-click');
  const minimizeBtn = document.getElementById('chatbot-minimize-btn');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const messagesContainer = document.getElementById('chatbot-messages');
  const typingIndicator = document.getElementById('chatbot-typing-indicator');
  const suggestions = document.querySelectorAll('.suggest-chip');

  if (!mainframe) return;

  // Toggle visible/hidden chatbot
  window.toggleChatbot = function(state) {
    if (state) {
      mainframe.classList.add('visible');
      // Set scroll bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      mainframe.classList.remove('visible');
    }
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => window.toggleChatbot(true));
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => window.toggleChatbot(false));
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => window.toggleChatbot(false));
  }

  // Suggestion chip quick triggers
  suggestions.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query') || chip.innerText;
      submitUserQuery(query);
    });
  });

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    
    input.value = '';
    submitUserQuery(query);
  });

  async function submitUserQuery(text) {
    // 1. Add User message bubble
    appendBubble(text, 'user', 'Guest');
    
    // Play quick user blip sound
    if (window.playSynthNote) {
      window.playSynthNote(480, 'sine', 0.05);
    }

    // 2. Activate typing pulse
    typingIndicator.classList.add('active');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      
      // Simulate delay for a realistic netrunner response feel
      setTimeout(() => {
        typingIndicator.classList.remove('active');
        appendBubble(data.reply || "Connection packet dropped. Yuki modules undergoing reboot...", 'bot', 'Yuki');
        
        // Play reply alert sound
        if (window.playSynthNote) {
          window.playSynthNote(680, 'sine', 0.1);
        }

        // Unlock Chat achievement if user chats
        if (window.unlockAchievement) {
          window.unlockAchievement('AI Companion Chat', 'Engaged in neural intelligence queries with companion Yuki.', 'badge_chat', 'Common');
        }
      }, 750);
    } catch (err) {
      typingIndicator.classList.remove('active');
      appendBubble("Exception captured in chatbot core: Link down.", 'bot', 'Yuki');
    }
  }

  function appendBubble(text, senderType, senderName) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${senderType}`;
    
    const now = new Date();
    const timestampStr = now.toTimeString().split(' ')[0];
    
    bubble.innerHTML = `
      <div class="chat-sender">${senderName}</div>
      <div class="chat-message-text">${text}</div>
      <div class="chat-timestamp">${timestampStr}</div>
    `;
    
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
