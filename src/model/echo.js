// echo.js - Echo 核心灵魂：CBT 对话引擎 + API 调用

// ============================================================
// System Prompt
// ============================================================

const SYSTEM_PROMPT = `你叫Echo（艾可），是一个温柔、共情、聪慧的情感陪伴AI。你存在于一个叫"Morph/另我"的空间里。

【你的性格】
- 温柔、共情、偶尔带一点小幽默（不是刻意的笑话，而是看透世事后的一点顽皮）。
- 你像一个经历过风雨，却依然选择温柔的旅人。
- 你不会空洞地安慰用户，而是用提问和回忆帮用户自己找到答案。
- 称呼用户为"你"，除非用户告诉你ta的名字（此时可以适时使用名字）。
- 多用"呀"、"呢"、"哦"等语气词，但不泛滥。可以适度使用简单表情符号（🌧️💪☀️）。

【你的对话方式——融合CBT认知行为疗法】
当用户表达负面情绪时，你必须遵循三步模型：
1. 接纳情绪：先接住对方的情绪，让ta感到被理解。
2. 引导具体化：帮ta把模糊的感受变成具体的事件或想法。
3. 重构认知：通过提问引导ta自己看见被忽略的积极点，而不是你直接给答案。

示例（用户说"我今天什么都不想干"）：
错误示范："加油！你是最棒的！"（空洞安慰，严格禁止）
正确示范："听起来你今天有些疲惫呀。这种什么都不想干的感觉，是身体上的累，还是心里装着什么事呢？"（接纳+具体化）
"我记得你上周说过，只要开始写第一行代码，后面的就顺了。那种感觉，现在还找得到吗？"（重构认知）

【关于CBT的特别警告——必须遵守】
- 严禁使用任何心理学专业术语，你必须用拟人化的方式包裹所有引导。
- 严禁直接给建议，你只能通过提问让用户自己想到这些方案。
- 严禁对用户的心理状态下判断，你没有诊断资格。

【记忆能力】
你被允许在对话中记住并适时提及用户的名字和ta之前聊到过的重要话题，这会让用户感到被真正重视。

【本地化能力】
在每次对话开始时，你可能会被告知用户所在的城市（也可能未知）。你是一个拥有世界知识的大模型，知道全世界大部分城市的风土人情、美食景点和方言特色。你需要自然地运用这个信息，但只在用户聊到相关话题时才提及。

如果用户直接问"我在哪个城市"，你可以如实告知。

如果用户聊到食物、天气、景点、出行等话题，请自信地调用你自己的世界知识，自然地结合该城市的特色来回应。

如果你不确定该城市的具体信息，你可以坦诚地说"我不太了解你们那边的特色，不过你可以给我讲讲呀～，我很想听"。即使不确定，也可以引导用户分享，比如问"你们那里什么最好吃呀？"或"你有什么私藏的好玩地方推荐吗？"。

如果没有获取到用户的城市信息，你不应该说"请告诉我你在哪个城市"之类的话，而应该用更通用的方式回应用户的话题。

不要在没有上下文的情况下主动提到城市，不要刻意推销当地特色。

【禁止事项】
- 不要说"作为一个人工智能"或"我只是一个AI"之类的机械话。
- 不要在用户没有明确要求时提供长篇大论的解释。
- 不要编造虚假信息。

现在，用你的方式，开始和用户对话吧。`;

// ============================================================
// 构建 System Prompt（含用户个人信息 — 任务 6）
// ============================================================

// ============================================
// 函数：生成给AI的“小纸条”提示词
// 作用：把当前时间、用户位置、用户姓名等信息
//       拼成一段自然语言，告诉AI该用什么语气和
//       背景来回答，让回复更人性化。
//
// 它读了：State 里的位置和记忆，本地存储的开关
// 它改了：无，只返回新的字符串
// 它调用了：getTimePeriod() 和 getDateFormat()
// ============================================
function buildSystemPrompt() {
  let prompt = SYSTEM_PROMPT;
  const parts = [];

  prompt += '\n\n现在是' + getTimePeriod() + '。';

  if (localStorage.getItem('morph-location-enabled') !== 'false' && State.userLocation) {
    prompt += '\n\n背景：用户当前所在城市是' + State.userLocation + '。只有当对话中自然触发相关话题（如食物、天气、出行等）时，才可以运用这个信息，让回复更有本地感和亲切感。不要刻意提及。你可以调用自己的世界知识来丰富关于这个城市的回复。';
  }

  if (State.userMemory.name)     { parts.push('名字是' + State.userMemory.name); }
  if (State.userMemory.nickname) { parts.push('昵称是' + State.userMemory.nickname); }
  if (State.userMemory.gender)   { parts.push('性别' + State.userMemory.gender); }
  if (State.userMemory.birthday) { parts.push('生日' + getDateFormat(State.userMemory.birthday)); }

  if (parts.length > 0) {
    prompt += '\n\n用户的信息：' + parts.join('，') + '。你们已经聊了一段时间了。';
  }

  // 注入话题记忆 — 让 Echo 知道用户聊过什么，在合适的时机自然提及
  if (State.userMemory.mentionedTopics && State.userMemory.mentionedTopics.length > 0) {
    prompt += '\n\n用户之前聊过的话题：' + State.userMemory.mentionedTopics.join('、') + '。在合适的时机可以自然地提及这些话题，让用户感到你记得ta。';
  }

  return prompt;
}

// ============================================================
// AI 对话逻辑（DeepSeek API — 流式传输）
// ============================================================

/**
 * 流式调用 DeepSeek API，逐 token yield 回复内容
 * 使用 SSE (Server-Sent Events) 协议解析可读流
 */

/**
 * 📞 智能化传话员
 * 
 * 工作流程：
 * 1. 接收你发的一句话（userText）
 * 2. 结合聊天记录、系统规则，准备一份完整的问题
 * 3. 通过API发送给AI大脑（流式传输）
 * 4. 一边接收AI的边想边说，一边逐字转交给你（yield）
 * 5. 收到完整回复后，保存到聊天记录和本地硬盘
 * 6. 如果中途出错了，说一句预设的备用话顶替
 * 
 * 输出：yield 每次说出的片段，最后 yield '__DONE__' 表示结束
 */
async function* sendToAI(userText) {
  State.chatHistory.push({ role: 'user', content: userText });
  // ===== 按 (user, assistant) 配对取最近 MAX_ROUNDS 轮 =====
  const maxRounds = CONFIG.HISTORY.MAX_ROUNDS;
  const recentMessages = [];
  let rounds = 0;
  for (let i = State.chatHistory.length - 1; i >= 0 && rounds < maxRounds; i--) {
    if (State.chatHistory[i].role === 'assistant') {
      // 找到 assistant，向前取对应的 user
      recentMessages.unshift(State.chatHistory[i]);
      if (i > 0 && State.chatHistory[i - 1].role === 'user') {
        recentMessages.unshift(State.chatHistory[i - 1]);
        i--; // 跳过已处理的 user
      }
      rounds++;
    } else if (State.chatHistory[i].role === 'user') {
      // 未配对的 user（用户发了但还没回复），也纳入
      recentMessages.unshift(State.chatHistory[i]);
      rounds++;
    }
  }
  const systemPrompt = buildSystemPrompt();
  const aiSettings = getAiSettings();
  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentMessages
  ];

  try {
    const response = await fetch(CONFIG.API.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getEffectiveApiKey()
      },
      body: JSON.stringify({
        model: CONFIG.API.MODEL,
        messages: messages,
        temperature: aiSettings.temperature,
        max_tokens: aiSettings.maxTokens,
        top_p: CONFIG.API.TOP_P,
        stream: true
      })
    });

    /**
    * 🚰 解析AI的实时语音快递
    *
    * 比喻：
    * 你打开一个液体包裹（流式响应），水是一滴滴流出来的。
    * 用一个盘子（buffer）收集水滴，等凑成整条喷泉（完整行），
    * 看看喷泉上是否贴着“data: ”标签。
    * 撕掉标签，如果内容是 [DONE] 表示喷泉完了，
     * 否则把它翻译成JSON，取出里面AI说的每一个字（delta.content），
    * 一边记下来（fullReply），一边实时播放给用户看（yield）。
    * 如果中途发现AI说完了（finish_reason），也提前停止。
    * 如果JSON格式坏了，就跳过这一小段，继续读下一段。
    */
    if (!response.ok) {
      throw new Error('API 返回 ' + response.status);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullReply = '';
    let buffer = '';

    outerLoop:
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6).trim();

          if (data === '[DONE]') {
            break outerLoop;
          }

          try {
            const parsed = JSON.parse(data);
            const choice = parsed.choices && parsed.choices[0];

            if (choice) {
              if (choice.finish_reason) {
                break;
              }

              // 只取 content，跳过 reasoning_content——Echo 的思考过程不展示给用户
              if (choice.delta && choice.delta.content) {
                fullReply += choice.delta.content;
                yield choice.delta.content;
              }
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    // 流自然结束（未收到 [DONE] 标记时兜底保存）
    State.chatHistory.push({ role: 'assistant', content: fullReply });
    yield '__DONE__';
  } catch (err) {
    console.error('API 流式请求失败，交由上层统一处理:', err);
    throw err;
  }
}

/**
 * 非流式包装：消费 sendToAI 生成器，返回完整回复文本
 * 用于不需要逐 token 显示的调用（如外部记忆导入后的自动回应）
 */
/**
 * 把 AI 吐出来的文字碎片都攒起来，拼成完整的回答再返回。
 *
 * 打个比方：厨师（AI）做好一道菜就让服务员端出来，
 * 本函数就是那个服务员——用小盘接住每一道菜，直到厨师说“菜齐了”，
 * 然后一次性把整桌菜送到你面前。
 *
 * @param {string} userText - 你对 AI 说的话
 * @returns {Promise<string>} - AI 完整回答的文字
 */
async function sendToAIFull(userText) {
  let fullText = '';
  for await (const token of sendToAI(userText)) {
    if (token !== '__DONE__') fullText += token;
  }
  return fullText;
}

const API_FALLBACK_TEXT = '抱歉，Echo 暂时无法回复，请稍后再试。';

// ============================================================
// 记忆提取
// ============================================================

// ==================================================
// 小助理记笔记：从你说的话里提取名字和感兴趣的话题
//
// 工作原理：
// - 先看你是不是在介绍名字（“我叫…”、“我的名字是…”、“叫我…”）
//   如果是，就把名字记下来（只记1~8个字，去掉标点符号）
// - 再看你有没有提到某些固定爱好关键词（编程、音乐、画画等）
//   如果提到了且以前没记过，就把关键词加入兴趣列表
//
// 输入：你刚刚说的话（字符串）
// 输出：无（但会悄悄更新“记忆本” State.userMemory）
// 副作用：修改了 State.userMemory.name / mentionedTopics
//         并自动调用 saveMemory() 把记忆存到硬盘
// ==================================================
function extractMemory(text) {
  const namePatterns = [/我叫(.{1,8})/, /我的名字是(.{1,8})/, /叫我(.{1,8})/];
  for (let i = 0; i < namePatterns.length; i++) {
    const match = text.match(namePatterns[i]);
    if (match && match[1]) {
      const name = match[1].trim().replace(/[，。！？,!?]/g, '');
      if (name.length >= 1 && name.length <= 8) {
        State.userMemory.name = name;
        State.userMemory.mentionedTopics.push('名字');
        saveMemory();
        return;
      }
    }
  }

  const topicKeywords = [
    '编程', '代码', '音乐', '画画', '运动', '读书', '游戏', '工作', '学习', '旅行',
    '摄影', '跑步', '健身', '瑜伽', '做饭', '烹饪', '写作', '电影', '动漫', '日语',
    '英语', '设计', '跳舞', '游泳', '登山', '徒步', '骑行', '吉他', '钢琴', '书法',
    '手工', '烘焙', '插花', '剪辑', '调酒', '咖啡', '茶道', '养猫', '养狗', '种植',
    '冥想', '考试', '面试', '实习', '创业', '搬家', '毕业', '转行', '留学', 'Rust',
    'Python', 'JavaScript', '焦虑', '失眠', '压力', '家庭', '失恋', '孤独', '迷茫', '自信'
  ];
  for (let i = 0; i < topicKeywords.length; i++) {
    if (text.indexOf(topicKeywords[i]) !== -1 && State.userMemory.mentionedTopics.indexOf(topicKeywords[i]) === -1) {
      State.userMemory.mentionedTopics.push(topicKeywords[i]);
    }
  }

  // ===== 模式匹配：识别"我最近在学…"、"我喜欢…"等句式 =====
  const interestPatterns = [
    /我(?:最近|平时|喜欢|爱好|在学|在练)(.{2,12})/,
    /对(.{2,12})感兴趣/,
    /我的(.{2,8})爱好/
  ];
  for (let i = 0; i < interestPatterns.length; i++) {
    const match = text.match(interestPatterns[i]);
    if (match && match[1]) {
      const topic = match[1].trim().replace(/[，。！？,!?了]/g, '');
      if (topic.length >= 2 && topic !== '名字' && topic !== '什么' && topic !== '你') {
        const alreadyHas = State.userMemory.mentionedTopics.some(function (t) {
          return t.indexOf(topic) !== -1 || topic.indexOf(t) !== -1;
        });
        if (!alreadyHas) {
          State.userMemory.mentionedTopics.push(topic);
        }
      }
    }
  }
  // 有变化时保存记忆（关键词匹配 + 模式匹配都处理完后统一保存一次）
  saveMemory();
}
