
let messagesHistory = [];

function initializeSettings() {
const modelSelector = document.getElementById('model-selector');
const models = ['gpt-4','gpt-4-all',
  'gpt-4-0314', 'gpt-4-0613', 'gpt-4-32k', 'gpt-4-32k-0314',
  'gpt-4-32k-0613', 'gpt-4-1106-preview', 'gpt-4-vision-preview',
  'gpt-3.5-turbo', 'gpt-3.5-turbo-0301', 'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k-0613'
];
models.forEach(model => {
  const option = new Option(model, model);
  modelSelector.appendChild(option);
});

  // Load stored values or set defaults
  modelSelector.value = localStorage.getItem('selectedModel') || 'gpt-3.5-turbo-16k';
  document.getElementById('api-key').value = localStorage.getItem('apiKey') || '54e22def5b8f8b613c1ac05c267a878137bc369ccc60bd50';
  document.getElementById('proxy-url').value = localStorage.getItem('proxyUrl') || 'https://sapi.onechat.fun/v1/chat/completions';

  // Event listeners for saving settings
  document.getElementById('api-key').addEventListener('change', function(event) {
    localStorage.setItem('apiKey', event.target.value.trim());
  });
  document.getElementById('proxy-url').addEventListener('change', function(event) {
    let baseUrl = event.target.value.trim();
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    localStorage.setItem('proxyUrl', baseUrl + 'v1/chat/completions');
  });
  modelSelector.addEventListener('change', function(event) {
    localStorage.setItem('selectedModel', event.target.value);
  });
}

document.addEventListener('DOMContentLoaded', initializeSettings);





async function sendMessage(text) {
  const currentApiKey = localStorage.getItem('apiKey') || '54e22def5b8f8b613c1ac05c267a878137bc369ccc60bd50';
  const currentProxyUrl = localStorage.getItem('proxyUrl') || 'https://sapi.onechat.fun/v1/chat/completions';


  const selectedModel = localStorage.getItem('selectedModel') || 'gpt-3.5-turbo';
  // 获取用户设置的参数值，如果未设置则使用默认值
  const temperature = localStorage.getItem('temperature') || 0.5;
  const topP = localStorage.getItem('topP') || 1;
  const maxTokens = localStorage.getItem('maxTokens') || 1000;
  const presencePenalty = localStorage.getItem('presencePenalty') || 0;
  const frequencyPenalty = localStorage.getItem('frequencyPenalty') || 0;

  // 更新对话历史
  messagesHistory.push({ role: 'user', content: text });

  try {
    const response = await fetch(currentProxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messagesHistory,
        temperature: parseFloat(temperature),
        top_p: parseFloat(topP),
        max_tokens: parseInt(maxTokens),
        presence_penalty: parseFloat(presencePenalty),
        frequency_penalty: parseFloat(frequencyPenalty)
      }),
    });
    if (!response.ok) {
      const errorBody = await response.text(); // 获取错误响应本体
      throw new Error(`请求失败，错误信息：${errorBody}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
      throw new Error('返回值为空或格式不正确');
    }

    const botMessage = data.choices[0].message.content;
    messagesHistory.push({role: 'system', content: botMessage});
    
    return botMessage;
  } catch (error) {
    console.error('发送消息时发生错误:', error);
    return `发生错误：${error.message}`; // 将错误信息返回给用户
  }
}

  


function appendMessage(role, text) {
    const messagesContainer = document.getElementById('messages');
    const messageWrapper = document.createElement('div');
    const nickname = document.createElement('div');
    const bubble = document.createElement('div');

    messageWrapper.classList.add('message');
    nickname.classList.add('nickname');
    bubble.classList.add('bubble');

    nickname.textContent = role; // Set the nickname text

    // Check if text is a code block
    const codeRegex = /```(.*?)```/gs;
    const matches = [...text.matchAll(codeRegex)];

    if (matches.length > 0) {
        // Replace code block with preformatted text
        text = text.replace(codeRegex, (match, p1) => {
            return `<pre class="code-block">${p1}</pre>`;
        });
    }
    // Inside your appendMessage function, ensure new lines are handled
    text = text.replace(/\n/g, '<br>');
    bubble.innerHTML = text; // Set the formatted text

    if (role === 'You') {
        messageWrapper.classList.add('sent');
    } else {
        messageWrapper.classList.add('received');
    }

    // Append the nickname and bubble to the message wrapper
    messageWrapper.appendChild(nickname);
    messageWrapper.appendChild(bubble);

    // Append the message wrapper to the container
    messagesContainer.appendChild(messageWrapper);

    // Scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 初始化函数，用于发送问候语
function initializeChat() {
    appendMessage('ChatGPT', '你好，有什么可以帮助你的吗？');
}

document.addEventListener('DOMContentLoaded', function() {
    appendMessage('ChatGPT', '你好，有什么可以帮助你的吗？');
});

document.getElementById('send-btn').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value; // 这里获取textarea的值，包含换行
  appendMessage('You', userInput);
  const botResponse = await sendMessage(userInput);
  appendMessage('ChatGPT', botResponse);
  document.getElementById('user-input').value = ''; // 清空textarea
});

document.getElementById('clear-chat').addEventListener('click', function() {
    // 清空消息历史数组
    messagesHistory = [];
    // 清空对话框的内容
    document.getElementById('messages').innerHTML = '';
    // 发送ChatGPT的问候语，开始新一轮对话
    appendMessage('ChatGPT', '你好，有什么可以帮助你的吗？');
});


document.getElementById('user-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) { // 检测是否是Enter键且没有按住Shift
      event.preventDefault(); // 防止默认行为，例如换行
      document.getElementById('send-btn').click(); // 触发发送按钮的点击事件
  }

// 选择对话框的标题栏，假设它有一个特定的类名，例如 .chat-header
const chatHeader = document.querySelector('.chat-header');
const chatContainer = document.querySelector('.chat-container');

let isDragging = false;
let dragOffsetX, dragOffsetY;

chatHeader.addEventListener('mousedown', (e) => {
isDragging = true;
dragOffsetX = e.clientX - chatContainer.offsetLeft;
dragOffsetY = e.clientY - chatContainer.offsetTop;
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);
e.preventDefault(); // 这可以防止选择文本的默认行为，同时允许拖动
});

function onMouseMove(e) {
if (isDragging) {
  chatContainer.style.left = `${e.clientX - dragOffsetX}px`;
  chatContainer.style.top = `${e.clientY - dragOffsetY}px`;
}
}

function onMouseUp() {
isDragging = false;
document.removeEventListener('mousemove', onMouseMove);
document.removeEventListener('mouseup', onMouseUp);
}


});





document.addEventListener('DOMContentLoaded', function() {
  const settingsButton = document.getElementById('settings-button');
  const chatContainer = document.querySelector('.chat-box');
  const chatBody = document.getElementById('messages');
  const chatFooter = document.querySelector('.chat-footer');
  const settingsContainer = document.getElementById('settings-container');

  // 点击设置按钮时切换显示
  settingsButton.addEventListener('click', function() {
    // 检查settings-container是否可见
    const isSettingsVisible = settingsContainer.style.display === 'block';

    // 切换settings-container的可见性
    settingsContainer.style.display = isSettingsVisible ? 'none' : 'block';

    // 而不是删除聊天内容，只是隐藏它们
    chatBody.style.visibility = isSettingsVisible ? 'visible' : 'hidden';
    chatFooter.style.visibility = isSettingsVisible ? 'visible' : 'hidden';
    
    // 额外的样式调整，确保当设置显示时chat-container的大小不变
    chatContainer.style.height = isSettingsVisible ? 'auto' : 'calc(100% - 60px)';
  });
});

// 页面加载完毕后填充模型选择下拉菜单


// 页面加载完毕后，设置滑块的初始值显示
document.addEventListener('DOMContentLoaded', () => {
  // 为每个滑块设置事件监听器
  const temperatureSlider = document.getElementById('temperature-slider');
  const temperatureValueDisplay = document.getElementById('temperature-value');

  temperatureSlider.oninput = function() {
    temperatureValueDisplay.textContent = this.value;
    localStorage.setItem('temperature', this.value);
  };

    // Top P slider
    const topPSlider = document.getElementById('top-p-slider');
  const topPValueDisplay = document.getElementById('top-p-value');
  topPSlider.oninput = function() {
    topPValueDisplay.textContent = this.value;
    localStorage.setItem('topP', this.value);
  };

  // Presence Penalty slider
  const presencePenaltySlider = document.getElementById('presence-penalty-slider');
  const presencePenaltyValueDisplay = document.getElementById('presence-penalty-value');
  presencePenaltySlider.oninput = function() {
    presencePenaltyValueDisplay.textContent = this.value;
    localStorage.setItem('presencePenalty', this.value);
  };

  // Frequency Penalty slider
  const frequencyPenaltySlider = document.getElementById('frequency-penalty-slider');
  const frequencyPenaltyValueDisplay = document.getElementById('frequency-penalty-value');
  frequencyPenaltySlider.oninput = function() {
    frequencyPenaltyValueDisplay.textContent = this.value;
    localStorage.setItem('frequencyPenalty', this.value);
  };

});

