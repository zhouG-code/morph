// modals.js - 弹窗 + 头像：确认对话框、个人信息、引导、头像上传

// ============================================================
// 确认对话框（支持动态文字与回调）
// ============================================================

var CONFIRM_DEFAULT_TEXT = '确定要清除所有聊天记录吗？此操作将删除当前对话历史，但 Echo 对你的基本记忆（名字、偏好等）会保留。此操作不可撤销。';
let _confirmCallback = null;

function openConfirmDialogWithText(text, onConfirm) {
  var textEl = document.getElementById('confirmText');
  if (textEl) textEl.textContent = text;
  _confirmCallback = onConfirm || null;
  document.getElementById('confirmOverlay').classList.add('show');
}

function openConfirmDialog() {
  openConfirmDialogWithText(CONFIRM_DEFAULT_TEXT, async function () {
    State.chatHistory.length = 0;
    try { await db.messages.clear(); } catch (e) { /* ignore */ }
    document.getElementById('chatMessages').innerHTML = '';
    initWelcomeBubble();
  });
}

function initConfirmDialog() {
  var overlay = document.getElementById('confirmOverlay');
  var cancelBtn = document.getElementById('confirmCancel');
  var okBtn = document.getElementById('confirmOk');

  cancelBtn.addEventListener('click', function () { overlay.classList.remove('show'); });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('show');
  });

  okBtn.addEventListener('click', async function () {
    overlay.classList.remove('show');
    if (_confirmCallback) {
      var cb = _confirmCallback;
      _confirmCallback = null;
      await cb();
    }
  });
}

// ============================================================
// 重置所有数据（个性化标签页 — 危险操作）
// ============================================================

var RESET_ALL_TEXT = '确定要重置所有数据吗？这将删除所有聊天记录、用户记忆和本地设置（包括 API Key、主题、头像等）。此操作不可撤销，执行后页面将自动刷新。';

function resetAllData() {
  openConfirmDialogWithText(RESET_ALL_TEXT, async function () {
    try {
      // 1. 清空 IndexedDB
      await db.messages.clear();
      await db.userInfo.clear();
    } catch (e) { /* ignore */ }

    // 2. 清空 localStorage
    var keysToRemove = [
      'morph-theme',
      'morph-avatar',
      'morph-temperature',
      'morph-max-tokens',
      'morph-api-key',
      'morph-intro-shown',
      'morph-avatar-guide-shown',
      'morph-location-enabled',
      'morph-location-greeted'
    ];
    for (var i = 0; i < keysToRemove.length; i++) {
      localStorage.removeItem(keysToRemove[i]);
    }

    // 3. 清空内存
    State.chatHistory.length = 0;
    State.userMemory.name = null;
    State.userMemory.nickname = null;
    State.userMemory.gender = '';
    State.userMemory.birthday = '';
    State.userMemory.mentionedTopics = [];

    // 4. 刷新页面
    setTimeout(function () {
      location.reload(true);
    }, 200);
  });
}

function initResetAllButton() {
  var btn = document.getElementById('resetAllBtn');
  if (btn) {
    btn.addEventListener('click', resetAllData);
  }
}

// ============================================================
// 关于 Echo 模态框（任务 2）
// ============================================================

function openAboutModal() {
  document.getElementById('aboutOverlay').classList.add('show');
}

function initAboutModal() {
  var overlay = document.getElementById('aboutOverlay');
  var closeBtn = document.getElementById('aboutClose');

  closeBtn.addEventListener('click', function () { overlay.classList.remove('show'); });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('show');
  });
}

// ============================================================
// 个人信息模态框（任务 3）
// ============================================================

function openProfileModal() {
  // 填充当前值
  document.getElementById('nicknameInput').value = State.userMemory.nickname || '';
  document.getElementById('genderSelect').value = State.userMemory.gender || '';
  document.getElementById('birthdayInput').value = State.userMemory.birthday || '';
  document.getElementById('profileOverlay').classList.add('show');
}

function initProfileModal() {
  var overlay = document.getElementById('profileOverlay');
  var closeBtn = document.getElementById('profileClose');
  var saveBtn = document.getElementById('saveProfileBtn');
  var loginBtn = document.getElementById('loginPlaceholderBtn');
  var avatarBtn = document.getElementById('avatarBtn');

  avatarBtn.addEventListener('click', openProfileModal);
  closeBtn.addEventListener('click', function () { overlay.classList.remove('show'); });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('show');
  });

  saveBtn.addEventListener('click', function () {
    State.userMemory.nickname = document.getElementById('nicknameInput').value.trim() || null;
    State.userMemory.gender = document.getElementById('genderSelect').value;
    State.userMemory.birthday = document.getElementById('birthdayInput').value;
    saveMemory();
    overlay.classList.remove('show');
    showToast('个人信息已保存');
  });

  loginBtn.addEventListener('click', function () { showToast('即将开放'); });
}

// ============================================================
// 开屏弹窗（任务 3 — 首次访问介绍）
// ============================================================

function openIntroModal() {
  var overlay = document.getElementById('introOverlay');
  if (!overlay) return;
  overlay.classList.add('show');

  // Adjust content based on API key presence
  var startBtn = document.getElementById('introStartBtn');
  var apiHint = document.getElementById('introApiHint');

  if (!getEffectiveApiKey()) {
    // No API key — show guide, demote button
    if (apiHint) apiHint.style.display = 'block';
    if (startBtn) {
      startBtn.classList.remove('action-btn-primary');
      startBtn.classList.add('action-btn-secondary');
    }
  } else {
    // Has API key — hide API hint, primary button
    if (apiHint) apiHint.style.display = 'none';
    if (startBtn) {
      startBtn.classList.add('action-btn-primary');
      startBtn.classList.remove('action-btn-secondary');
    }
  }
}

function closeIntroModal() {
  var overlay = document.getElementById('introOverlay');
  if (overlay) overlay.classList.remove('show');
  localStorage.setItem('morph-intro-shown', 'true');
}

function initIntroModal() {
  if (localStorage.getItem('morph-intro-shown') === 'true') return;

  var overlay = document.getElementById('introOverlay');
  var startBtn = document.getElementById('introStartBtn');
  var apiLink = document.getElementById('introApiLink');

  // Show modal on load
  openIntroModal();

  // Start button closes modal
  if (startBtn) {
    startBtn.addEventListener('click', closeIntroModal);
  }

  // API key link opens settings to API tab
  if (apiLink) {
    apiLink.addEventListener('click', function (e) {
      e.preventDefault();
      closeIntroModal();
      openSettingsToTab('tab-api');
    });
  }

  // Clicking overlay does NOT close — per spec
}

// ============================================================
// 头像系统（自定义头像上传 + 全局同步）
// ============================================================

function loadAvatar() {
  var data = localStorage.getItem('morph-avatar');
  if (data) {
    updateAllAvatars(data);
  }
}

function updateAllAvatars(imageData) {
  var targets = [
    document.getElementById('avatarBtn'),
    document.getElementById('mobileAvatarBtn'),
    document.getElementById('drawerAvatar'),
    document.getElementById('avatarPreview')
  ];
  targets.forEach(function (el) {
    if (!el) return;
    el.style.backgroundImage = 'url(' + imageData + ')';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.textContent = '';
  });
}

function initAvatarUpload() {
  var uploadBtn = document.getElementById('uploadAvatarBtn');
  var fileInput = document.getElementById('avatarFileInput');
  if (!uploadBtn || !fileInput) return;

  uploadBtn.addEventListener('click', function () { fileInput.click(); });

  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var dataUrl = ev.target.result;
      localStorage.setItem('morph-avatar', dataUrl);
      updateAllAvatars(dataUrl);
      showToast('头像已更新');
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });
}

// ============================================================
// 头像光晕引导（任务 2.2）
// ============================================================

function dismissAvatarGlow() {
  var desktopAvatar = document.getElementById('avatarBtn');
  var mobileAvatar = document.getElementById('mobileAvatarBtn');
  if (desktopAvatar) desktopAvatar.classList.remove('avatar-glow-guide');
  if (mobileAvatar) mobileAvatar.classList.remove('avatar-glow-guide');
  localStorage.setItem('morph-avatar-guide-shown', 'true');
}

function initAvatarGlowGuide() {
  if (localStorage.getItem('morph-avatar-guide-shown') === 'true') return;

  setTimeout(function () {
    var desktopAvatar = document.getElementById('avatarBtn');
    var mobileAvatar = document.getElementById('mobileAvatarBtn');
    if (desktopAvatar) desktopAvatar.classList.add('avatar-glow-guide');
    if (mobileAvatar) mobileAvatar.classList.add('avatar-glow-guide');

    // Auto-remove after 8s (4 cycles × 2s each)
    setTimeout(function () {
      if (desktopAvatar) desktopAvatar.classList.remove('avatar-glow-guide');
      if (mobileAvatar) mobileAvatar.classList.remove('avatar-glow-guide');
    }, 8000);
  }, 3000);

  // Dismiss on avatar click
  var desktopAvatar = document.getElementById('avatarBtn');
  var mobileAvatar = document.getElementById('mobileAvatarBtn');
  if (desktopAvatar) desktopAvatar.addEventListener('click', dismissAvatarGlow);
  if (mobileAvatar) mobileAvatar.addEventListener('click', dismissAvatarGlow);
}
