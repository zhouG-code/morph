// helpers.js - 工具函数（纯函数+通用工具）

// ============================================================
// 工具函数
// ============================================================

// 跟看钟表一样，返回当前“时:分”，比如 "08:30"
// 不需要任何输入，保证小时分钟都是两位数
function getCurrentTime() {
  const now = new Date();
  return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}

function getTimePeriod() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 8)  return '清晨';
  if (hour >= 8 && hour < 12) return '上午';
  if (hour >= 12 && hour < 14) return '中午';
  if (hour >= 14 && hour < 18) return '下午';
  if (hour >= 18 && hour < 22) return '晚上';
  return '深夜';
}

/**
 * 尝试获取用户当前所在的城市，并根据城市发一条随机问候语。
 * 
 * 工作流程像这样：
 * 1. 先检查有没有已经请求过（避免重复请求）。
 * 2. 如果浏览器有定位能力，就尝试获取经纬度。
 * 3. 用经纬度去查一个“地图翻译机”，把经纬度变成城市名。
 * 4. 拿到城市名后，检查以前有没有对这个城市说过话（看小本本 localStorage）。
 * 5. 如果没说过，随机选一句问候语，显示在聊天界面上（通过 addMessage），
 *    存到对话记录里（通过 saveMessage），并在小本本上记下“已问候”。
 * 
 * 整个过程在幕后自动运行，用户完全无感。
 */
function requestLocation() {
  if (State.locationRequested) return;
  State.locationRequested = true;

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;       // 经纬度不会变，用 const
      const lon = position.coords.longitude;
      const url = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json&accept-language=zh';

      fetch(url)
        .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
        .then(function (data) {
          if (data && data.address) {
            const addr = data.address;
            let city = addr.city || addr.town || addr.county || addr.state || addr.country || '';  // 会被赋多个值，用 let
            if (city) {
              State.userLocation = city;

              const greetedCity = localStorage.getItem('morph-location-greeted');  // 只读一次，用 const
              if (greetedCity !== city) {
                const greetings = [
                  '原来你在' + city + '呀～ 我听说那边的美食很有名，是不是真的？',
                  city + '呀，那边的天气最近怎么样？',
                  '我还没去过' + city + '呢，你有什么推荐的地方吗？'
                ];
                const greeting = greetings[Math.floor(Math.random() * greetings.length)];  // 选出来就不再改了

                addMessage(greeting, 'echo');
                State.chatHistory.push({ role: 'assistant', content: greeting });
                saveMessage('assistant', greeting);
                localStorage.setItem('morph-location-greeted', city);
              }
            }
          }
        })
        .catch(function () { /* silent */ });
    },
    function () { /* user denied — silent */ },
    { timeout: 5000, maximumAge: 3600000 }
  );
}

/**
 * 获取当前可用的API密钥
 * 就像先看看自己有没有私房钱，有就用自己的，没有就用家里公用的备用金。
 * 返回一个字符串（密钥）。
 */
function getEffectiveApiKey() {
  const key = localStorage.getItem('morph-api-key');
  return key || CONFIG.API.API_KEY;
}

// 从浏览器的本地存储中获取 AI 设置（温度和最大长度）
// 如果没存过，就用项目配置文件里的默认值
// 返回一个对象，包含 temperature（创意程度）和 maxTokens（回答最大字数）
function getAiSettings() {
  const temp = parseFloat(localStorage.getItem('morph-temperature')) || CONFIG.API.TEMPERATURE;
  const maxTokens = parseInt(localStorage.getItem('morph-max-tokens'), 10) || CONFIG.API.MAX_TOKENS;
  return { temperature: temp, maxTokens: maxTokens };
}

function getDateFormat(yyyymmdd) {
  if (!yyyymmdd) return '';
  const parts = yyyymmdd.split('-');
  if (parts.length !== 3) return yyyymmdd;
  return parts[0] + '年' + parts[1] + '月' + parts[2] + '日';
}

// 显示一个“吐司”小提示（比如“操作成功”），过一会儿自动消失
// text  : 要显示的文字
// duration : 显示时长（毫秒），默认 1.8 秒
function showToast(text, duration) {
  duration = duration || 1800;
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function () { toast.classList.remove('show'); }, duration);
}

// ============================================================
// 打开设置面板并切换到指定标签页
// ============================================================

/**
 * 打开设置面板并切换到指定标签页。
 *
 * 功能比喻：先打开一个带遮罩的弹窗（像按下遥控器的“设置”键），
 * 然后根据你给的标签页 ID（比如 "video"），
 * 把所有标签页的“激活”状态清空，再只点亮你要的那个标签页和它的内容。
 *
 * 输入：tabId —— 你想激活的标签页名字（字符串）。
 * 输出：无返回值，但界面会变化：遮罩、面板出现，对应标签页显示。
 */
function openSettingsToTab(tabId) {
  const overlay = document.getElementById('settingsOverlay');
  const panel = document.getElementById('settingsPanel');
  overlay.classList.add('show');
  panel.classList.add('show');

  const tabs = document.querySelectorAll('#settingsTabs .panel-tab');
  const contents = document.querySelectorAll('.panel-tab-content');
  tabs.forEach(function (t) { t.classList.remove('active'); });
  contents.forEach(function (c) { c.classList.remove('active'); });

  const targetTab = document.querySelector('#settingsTabs .panel-tab[data-tab="' + tabId + '"]');
  if (targetTab) targetTab.classList.add('active');
  const targetContent = document.getElementById(tabId);
  if (targetContent) targetContent.classList.add('active');
}