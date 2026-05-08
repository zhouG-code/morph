// mobile.js - 移动端交互：页面切换、抽屉菜单、位置权限、AI设置

// ============================================================
// 移动端导航（联系人 → 聊天页面切换）
// ============================================================

function initMobileNavigation() {
  var contactsPage = document.getElementById('contactsPage');
  if (!contactsPage) return;  // 桌面端不执行

  var chatPage = document.getElementById('mobileChatPage');
  var echoContact = document.getElementById('mobileEchoContact');
  var backBtn = document.getElementById('mobileBackBtn');

  // 默认显示联系人页
  contactsPage.classList.add('show');

  // 点击联系人 → 进入聊天
  echoContact.addEventListener('click', function () {
    contactsPage.classList.remove('show');
    chatPage.classList.add('show');

    // 渲染历史消息到移动端聊天容器
    var mobileContainer = document.getElementById('mobileChatMessages');
    mobileContainer.innerHTML = '';
    for (var i = 0; i < State.chatHistory.length; i++) {
      var msg = State.chatHistory[i];
      var sender = msg.role === 'user' ? 'user' : 'echo';

      var wrapper = document.createElement('div');
      wrapper.className = 'message ' + sender;

      var bubble = document.createElement('div');
      bubble.className = 'bubble ' + sender;
      bubble.textContent = msg.content;

      wrapper.appendChild(bubble);
      mobileContainer.appendChild(wrapper);
    }
    mobileContainer.scrollTop = mobileContainer.scrollHeight;
  });

  // 返回按钮
  backBtn.addEventListener('click', function () {
    chatPage.classList.remove('show');
    contactsPage.classList.add('show');
  });

  // 绑定移动端发送按钮
  var mobileInput = document.getElementById('mobileUserInput');
  var mobileSendBtn = document.getElementById('mobileSendBtn');
  var mobileContainer = document.getElementById('mobileChatMessages');
  bindSendButton(mobileInput, mobileSendBtn, mobileContainer);
}

// ============================================================
// 移动端 AI 设置弹出层（将 aiSettingsPanel 临时移到 body）
// ============================================================

function openMobileAiSettings() {
  var panel = document.getElementById('aiSettingsPanel');
  if (!panel) return;

  // 创建遮罩
  var overlay = document.createElement('div');
  overlay.className = 'ai-settings-mobile-overlay';
  overlay.id = 'aiSettingsMobileOverlay';
  overlay.addEventListener('click', closeMobileAiSettings);

  // 移出原父容器，添加移动端样式类
  panel.classList.add('ai-settings-mobile');
  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // 动画入场
  requestAnimationFrame(function () {
    overlay.classList.add('show');
    panel.classList.add('show');
  });
}

function closeMobileAiSettings() {
  var panel = document.getElementById('aiSettingsPanel');
  var overlay = document.getElementById('aiSettingsMobileOverlay');
  if (!panel) return;

  // 移回下拉菜单内部
  var originalParent = document.querySelector('.dropdown-menu');
  if (originalParent) {
    originalParent.appendChild(panel);
  }
  panel.classList.remove('ai-settings-mobile', 'show');

  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(function () { overlay.remove(); }, 300);
  }
}

// ============================================================
// QQ 式左侧抽屉菜单（头像点击 + 右滑手势）
// ============================================================

function initDrawer() {
  var overlay = document.getElementById('drawerOverlay');
  var drawer = document.getElementById('drawer');
  var contactsPage = document.getElementById('contactsPage');
  if (!overlay || !drawer) return;

  function open()  { overlay.classList.add('show'); drawer.classList.add('show'); }
  function close() { overlay.classList.remove('show'); drawer.classList.remove('show'); }

  // 头像按钮打开抽屉
  var mobileAvatarBtn = document.getElementById('mobileAvatarBtn');
  var drawerAvatarBtn = document.getElementById('drawerAvatar');
  if (mobileAvatarBtn) mobileAvatarBtn.addEventListener('click', open);
  if (drawerAvatarBtn) drawerAvatarBtn.addEventListener('click', open);

  // 遮罩关闭
  overlay.addEventListener('click', close);

  // 菜单项点击
  drawer.addEventListener('click', function (e) {
    var item = e.target.closest('.drawer-item');
    if (!item) return;
    var action = item.dataset.action;

    if (action === 'profile')     { close(); openProfileModal(); }
    if (action === 'memory')      { close(); document.getElementById('navMemoryBtn').click(); }
    if (action === 'settings')    { close(); document.getElementById('navSettingsBtn').click(); }
    if (action === 'ai-settings') { close(); openMobileAiSettings(); }
    if (action === 'clear')       { close(); openConfirmDialog(); }
    if (action === 'about')       { close(); openAboutModal(); }
  });

  // 右滑打开手势（仅在联系人页生效）
  if (!contactsPage) return;
  var touchStartX = 0;
  var touchStartY = 0;

  contactsPage.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  contactsPage.addEventListener('touchend', function (e) {
    var dx = (e.changedTouches[0] ? e.changedTouches[0].clientX : touchStartX) - touchStartX;
    var dy = Math.abs((e.changedTouches[0] ? e.changedTouches[0].clientY : touchStartY) - touchStartY);

    // 右滑超过 50px 且水平位移大于垂直位移
    if (dx > 50 && dx > dy * 1.5 && touchStartX < 40) {
      open();
    }
  });
}

// ============================================================
// 位置权限开关设置
// ============================================================

function initLocationToggle() {
  var toggle = document.getElementById('locationToggle');
  if (!toggle) return;

  toggle.checked = localStorage.getItem('morph-location-enabled') !== 'false';

  toggle.addEventListener('change', function () {
    localStorage.setItem('morph-location-enabled', toggle.checked ? 'true' : 'false');
  });
}
