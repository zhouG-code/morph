// chat.js - 聊天 UI：消息气泡、发送、主题、搜索

// ============================================================
// 核心：addMessage
// ============================================================

function addMessage(messageText, sender, timestampFirst) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return null;

  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'message ' + sender;

  const timeEl = document.createElement('div');
  timeEl.className = 'message-time';
  timeEl.textContent = getCurrentTime();

  const bubbleEl = document.createElement('div');
  bubbleEl.className = 'bubble ' + sender;
  bubbleEl.textContent = messageText;

  if (timestampFirst) {
    messageWrapper.appendChild(timeEl);
    messageWrapper.appendChild(bubbleEl);
  } else {
    messageWrapper.appendChild(bubbleEl);
    messageWrapper.appendChild(timeEl);
  }

  chatMessages.appendChild(messageWrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageWrapper;
}

// ============================================================
// 打字指示器
// ============================================================

function createTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return null;

  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'message echo typing-indicator';

  const bubbleEl = document.createElement('div');
  bubbleEl.className = 'bubble echo typing-bubble';

  const dots = document.createElement('span');
  dots.className = 'typing-dots';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'typing-dot';
    dots.appendChild(dot);
  }

  bubbleEl.appendChild(dots);
  messageWrapper.appendChild(bubbleEl);
  chatMessages.appendChild(messageWrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageWrapper;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

function renderHistoryMessages() {
  for (let i = 0; i < State.chatHistory.length; i++) {
    const msg = State.chatHistory[i];
    addMessage(msg.content, msg.role === 'user' ? 'user' : 'echo');
  }
}

function initWelcomeBubble() {
  setTimeout(function () {
    var nickname = State.userMemory.nickname;
    var greeting;
    if (nickname) {
      greeting = '嘿，' + nickname + '，你来了。我等了你好久呀。';
    } else {
      greeting = '嘿，你来了。我等了你好久呀。';
    }
    addMessage(greeting, 'echo');
  }, CONFIG.UI.WELCOME_DELAY_MS);
}

/**
 * 通用发送绑定：将输入框、发送按钮、消息容器组装为完整的聊天发送流程
 * 桌面端和移动端各自调用，共享 State.chatHistory / State.userMemory / sendToAI
 */
function bindSendButton(inputEl, sendBtnEl, messagesContainer) {
  if (!inputEl || !sendBtnEl || !messagesContainer) return;

  let isSending = false;

  function addMessageToContainer(messageText, sender, timestampFirst) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'message ' + sender;

    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = getCurrentTime();

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'bubble ' + sender;
    bubbleEl.textContent = messageText;

    if (timestampFirst) {
      messageWrapper.appendChild(timeEl);
      messageWrapper.appendChild(bubbleEl);
    } else {
      messageWrapper.appendChild(bubbleEl);
      messageWrapper.appendChild(timeEl);
    }

    messagesContainer.appendChild(messageWrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageWrapper;
  }

  sendBtnEl.addEventListener('click', async function () {
    const userText = inputEl.value.trim();
    if (!userText || isSending) return;

    // Trigger geolocation on first message
    requestLocation();

    isSending = true;
    sendBtnEl.disabled = true;

    addMessageToContainer(userText, 'user');
    // also render to desktop container for sync
    if (messagesContainer.id !== 'chatMessages') {
      addMessage(userText, 'user');
    }
    inputEl.value = '';
    extractMemory(userText);

    // Check if API key is configured
    if (!getEffectiveApiKey()) {
      const guideMsg = '嘿，你来了。想和你好好聊聊，但需要先配置一个 API Key 哦～ 点击左上角的头像就能找到设置入口，在那里填入你的 DeepSeek API Key 就好啦。';
      addMessageToContainer(guideMsg, 'echo');
      if (messagesContainer.id !== 'chatMessages') {
        addMessage(guideMsg, 'echo');
      }
      // Save to history so context is preserved
      State.chatHistory.push({ role: 'user', content: userText });
      State.chatHistory.push({ role: 'assistant', content: guideMsg });
      saveMessage('user', userText);
      saveMessage('assistant', guideMsg);

      isSending = false;
      sendBtnEl.disabled = false;
      inputEl.focus();
      return;
    }

    const echoMsg = addMessageToContainer('', 'echo');
    const bubbleEl = echoMsg ? echoMsg.querySelector('.bubble') : null;
    const replyText = '';

    try {
      for await (var token of sendToAI(userText)) {
        if (token === '__DONE__') {
          // 流正常结束
        } else {
          replyText += token;
          if (bubbleEl) { bubbleEl.textContent = replyText; }
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    } catch (err) {
      if (!replyText && bubbleEl) {
        bubbleEl.textContent = API_FALLBACK_TEXT;
      }
    }

    isSending = false;
    sendBtnEl.disabled = false;
    inputEl.focus();
  });
}

function initSendButton() {
  bindSendButton(
    document.getElementById('userInput'),
    document.getElementById('sendBtn'),
    document.getElementById('chatMessages')
  );
}

// ============================================================
// 初始化模块
// ============================================================

function initKeyboardShortcuts(inputEl, sendBtnEl) {
  if (!inputEl || !sendBtnEl) return;
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtnEl.click();
    }
  });
}

function initRipple() {
  var targets = document.querySelectorAll('.nav-btn, #sendBtn, .user-avatar, .search-box');
  targets.forEach(function (target) {
    target.addEventListener('click', function (e) {
      var existing = target.querySelectorAll('.ripple-effect');
      for (var i = 0; i < existing.length; i++) { existing[i].remove(); }

      var rippleEl = document.createElement('span');
      rippleEl.className = 'ripple-effect';
      var rect = target.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2;
      rippleEl.style.width = size + 'px';
      rippleEl.style.height = size + 'px';
      rippleEl.style.left = (e.clientX - rect.left - size / 2) + 'px';
      rippleEl.style.top = (e.clientY - rect.top - size / 2) + 'px';
      target.appendChild(rippleEl);
      rippleEl.addEventListener('animationend', function () { rippleEl.remove(); });
    });
  });
}

// ============================================================
// 下拉菜单 + AI 设置（任务 2）
// ============================================================

function initChatDropdown() {
  var dropdown = document.getElementById('chatDropdown');
  var btn = document.getElementById('chatDropdownBtn');
  var aiToggle = document.getElementById('dropdownAiSettings');
  var aiPanel = document.getElementById('aiSettingsPanel');
  var tempSlider = document.getElementById('tempSlider');
  var tempValue = document.getElementById('tempValue');
  var lengthGroup = document.getElementById('lengthGroup');
  var clearBtn = document.getElementById('dropdownClear');
  var aboutBtn = document.getElementById('dropdownAbout');

  // 开关下拉
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  // 点击外部关闭
  document.addEventListener('click', function () { dropdown.classList.remove('show'); });
  dropdown.addEventListener('click', function (e) { e.stopPropagation(); });

  // AI 设置面板展开/折叠
  aiToggle.addEventListener('click', function () { aiPanel.classList.toggle('show'); });

  // 温度滑块
  var savedTemp = parseFloat(localStorage.getItem('morph-temperature')) || CONFIG.API.TEMPERATURE;
  tempSlider.value = savedTemp;
  tempValue.textContent = savedTemp.toFixed(2);

  tempSlider.addEventListener('input', function () {
    var v = parseFloat(tempSlider.value);
    tempValue.textContent = v.toFixed(2);
    localStorage.setItem('morph-temperature', v);
  });

  // 回复长度单选
  var savedLen = localStorage.getItem('morph-max-tokens') || String(CONFIG.API.MAX_TOKENS);
  var radios = lengthGroup.querySelectorAll('input[name="length"]');
  radios.forEach(function (r) {
    if (r.value === savedLen) { r.checked = true; }
    r.addEventListener('change', function () {
      localStorage.setItem('morph-max-tokens', r.value);
    });
  });

  // 清除对话
  clearBtn.addEventListener('click', function () {
    dropdown.classList.remove('show');
    openConfirmDialog();
  });

  // 关于 Echo
  aboutBtn.addEventListener('click', function () {
    dropdown.classList.remove('show');
    openAboutModal();
  });
}

// ============================================================
// 会话搜索（任务 4）
// ============================================================

function initSearchFilter() {
  var input = document.getElementById('searchInput');
  if (!input) return;

  var debounceTimer = null;
  input.addEventListener('input', function () {
    var keyword = input.value.trim().toLowerCase();

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      var items = document.querySelectorAll('.conversation');
      items.forEach(function (item) {
        var name = (item.querySelector('.conv-name') || {}).textContent || '';
        var preview = (item.querySelector('.conv-preview') || {}).textContent || '';
        var text = (name + ' ' + preview).toLowerCase();
        item.style.display = keyword === '' || text.indexOf(keyword) !== -1 ? '' : 'none';
      });
    }, 200);
  });
}

// ============================================================
// 温度帮助提示
// ============================================================

function initTempHelp() {
  var btn = document.getElementById('tempHelp');
  if (!btn) return;
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    showToast('温度控制回复的随机性。较高的值（>1）让 Echo 更有创造性，较低的值（<0.5）让回复更保守稳定。', 3000);
  });
}

// ============================================================
// 主题系统（任务 1 — 通用标签页）
// ============================================================

const THEMES = {
  warm: {
    '--chat-bg': '#F5F5F6',
    '--list-bg': '#F7F8FA',
    '--brand': '#1677FF',
    '--brand-hover': '#0958D9',
    '--brand-active': '#003EB3',
    '--brand-light': 'rgba(22, 119, 255, 0.08)',
    '--brand-glow': 'rgba(22, 119, 255, 0.15)',
    '--nav-bg': '#2B2B2B',
    '--white': '#FFFFFF',
    '--border-light': '#EBEDF0',
    '--border-input': '#E5E6E8',
    '--text-primary': '#1F1F1F',
    '--text-secondary': '#6E6E6E',
    '--text-placeholder': '#bbb',
    '--shadow-rest': '0 1px 3px rgba(0, 0, 0, 0.08)',
    '--shadow-lift': '0 4px 12px rgba(0, 0, 0, 0.12)',
    '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.16)',
  },
  ink: {
    '--chat-bg': '#1a1a2e',
    '--list-bg': '#16213e',
    '--brand': '#4fc3f7',
    '--brand-hover': '#29b6f6',
    '--brand-active': '#0288d1',
    '--brand-light': 'rgba(79, 195, 247, 0.10)',
    '--brand-glow': 'rgba(79, 195, 247, 0.18)',
    '--nav-bg': '#0f0f1a',
    '--white': '#1e1e32',
    '--border-light': '#1f2937',
    '--border-input': '#2d3748',
    '--text-primary': '#e5e7eb',
    '--text-secondary': '#9ca3af',
    '--text-placeholder': '#6b7280',
    '--shadow-rest': '0 1px 3px rgba(0,0,0,0.3)',
    '--shadow-lift': '0 4px 12px rgba(0,0,0,0.4)',
    '--shadow-lg': '0 8px 32px rgba(0,0,0,0.5)',
  },
  sakura: {
    '--chat-bg': '#fff5f5',
    '--list-bg': '#fff0f0',
    '--brand': '#e8788a',
    '--brand-hover': '#d4607a',
    '--brand-active': '#c0486a',
    '--brand-light': 'rgba(232, 120, 138, 0.10)',
    '--brand-glow': 'rgba(232, 120, 138, 0.18)',
    '--nav-bg': '#2d1a1d',
    '--white': '#FFFFFF',
    '--border-light': '#f0e0e0',
    '--border-input': '#e8d0d0',
    '--text-primary': '#1F1F1F',
    '--text-secondary': '#6E6E6E',
    '--text-placeholder': '#bbb',
    '--shadow-rest': '0 1px 3px rgba(0, 0, 0, 0.06)',
    '--shadow-lift': '0 4px 12px rgba(0, 0, 0, 0.10)',
    '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
};

function applyTheme(name) {
  const vars = THEMES[name] || THEMES.warm;
  Object.keys(vars).forEach(function (key) {
    document.documentElement.style.setProperty(key, vars[key]);
  });
  localStorage.setItem('morph-theme', name);
}

function loadTheme() {
  const saved = localStorage.getItem('morph-theme') || 'warm';
  applyTheme(saved);
}

function initThemeCards() {
  const cards = document.querySelectorAll('.theme-card');
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      cards.forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');
      applyTheme(card.dataset.theme);
    });
  });

  // 初始选中状态
  const saved = localStorage.getItem('morph-theme') || 'warm';
  const activeCard = document.querySelector('.theme-card[data-theme="' + saved + '"]');
  if (activeCard) { activeCard.classList.add('active'); }
}
