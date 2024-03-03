  let messagesHistory = []

  function initializeSettings() {

  document.getElementById('api-key').value = localStorage.getItem('apikey');
  document.getElementById('proxy-url').value = localStorage.getItem('proxyUrl') || 'https://2993212868.top';

  // Event listeners for saving settings
  document.getElementById('api-key').addEventListener('change', function(event) {
    localStorage.setItem('apikey',event.target.value.trim());
  });

  document.getElementById('proxy-url').addEventListener('change', function(event) {
    let baseUrl = event.target.value.trim();
    if (baseUrl === '') {
      // 如果输入为空，则设置为默认值，并保存到localStorage
      baseUrl = 'https://2993212868.top';
      event.target.value = baseUrl;
    }
    localStorage.setItem('proxyUrl', baseUrl);
  });
    
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
  modelSelector.addEventListener('change', function(event) {
    localStorage.setItem('selectedModel', event.target.value);
  });
  


  const temperatureSlider = document.getElementById('temperature-slider') || '0.5';
  const temperatureValueDisplay = document.getElementById('temperature-value') || '0.5';
  // 从localStorage获取值，如果没有则使用默认值
  const savedTemperature = localStorage.getItem('temperature') || '0.5';
  temperatureSlider.value = savedTemperature;
  temperatureValueDisplay.textContent = savedTemperature;

  temperatureSlider.oninput = function() {
    temperatureValueDisplay.textContent = this.value;
    localStorage.setItem('temperature', this.value);
  };

    // Top P slider
  const topPSlider = document.getElementById('top-p-slider') || '1';
  const topPValueDisplay = document.getElementById('top-p-value') || '1';

  const savedtopP = localStorage.getItem('topP') || '0.5';
  topPSlider.value = savedtopP;
  topPValueDisplay.textContent = savedtopP;

  topPSlider.oninput = function() {
    topPValueDisplay.textContent = this.value;
    localStorage.setItem('topP', this.value);
  };

  // Presence Penalty slider
  const presencePenaltySlider = document.getElementById('presence-penalty-slider') || '0';
  const presencePenaltyValueDisplay = document.getElementById('presence-penalty-value') || '0';

  const savedpresencePenalty = localStorage.getItem('presencePenalty') || '0';
  presencePenaltySlider.value = savedpresencePenalty;
  presencePenaltyValueDisplay.textContent = savedpresencePenalty;

  presencePenaltySlider.oninput = function() {
    presencePenaltyValueDisplay.textContent = this.value;
    localStorage.setItem('presencePenalty', this.value);
  };

  // Frequency Penalty slider
  const frequencyPenaltySlider = document.getElementById('frequency-penalty-slider') || '0';
  const frequencyPenaltyValueDisplay = document.getElementById('frequency-penalty-value') || '0';

  const savedfrequencyPenalty = localStorage.getItem('frequencyPenalty') || '0';
  frequencyPenaltySlider.value = savedfrequencyPenalty;
  frequencyPenaltyValueDisplay.text = savedfrequencyPenalty;

  frequencyPenaltySlider.oninput = function() {
    frequencyPenaltyValueDisplay.textContent = this.value;
    localStorage.setItem('frequencyPenalty', this.value);
  };

  const maxTokensSlider = document.getElementById('max-tokens') || '2000';
  const maxTokensValueDisplay = document.getElementById('max_tokens-vlaue') || '2000'; // 注意这里的ID拼写应与HTML中保持一致

  const savedmaxTokens = localStorage.getItem('maxTokens') || '2000';
  maxTokensSlider.value = savedmaxTokens;
  maxTokensValueDisplay.textContent =savedmaxTokens;

  maxTokensSlider.oninput = function() {
    maxTokensValueDisplay.textContent = this.value;
    localStorage.setItem('maxTokens', this.value);
  };

  const memoryTurnsInput =  document.getElementById('memory-turns') || '20';
  const savedMemoryTurns = localStorage.getItem('memoryTurns') || '20';

  memoryTurnsInput.value = savedMemoryTurns;

  memoryTurnsInput.addEventListener('change', function() {
    if (parseInt(this.value, 10) > 64) {
        this.value = 64; // 如果值超过64，设置为64
    } else if (parseInt(this.value, 10) < 1) {
        this.value = 1; // 如果值小于1，设置为1
    }
    localStorage.setItem('memoryTurns', this.value); // 使用setItem来更新localStorage中的值
  });

  }


  appendMessage('ChatGPT', '你好，有什么可以帮助你的吗？')


document.addEventListener('DOMContentLoaded', initializeSettings);


// 定义全局变量来存储消息历史

async function sendMessage(text) {
  const currentApiKey = localStorage.getItem('apikey');
  const baseUrl = localStorage.getItem('proxyUrl');
  const currentProxyUrl = baseUrl +'/v1/chat/completions';
  const selectedModel = localStorage.getItem('selectedModel') || 'gpt-3.5-turbo-16k';
  const temperature = localStorage.getItem('temperature') || 0.5;
  const topP = localStorage.getItem('topP') || 1;
  const maxTokens = localStorage.getItem('maxTokens') || 2000;
  const presencePenalty = localStorage.getItem('presencePenalty') || 0;
  const frequencyPenalty = localStorage.getItem('frequencyPenalty') || 0;
  const memoryTurns = localStorage.getItem('memoryTurns') || 20;
  const systemMessageContent = "亲爱的ChatGPT，作为一个致力于提供帮助和指导的助手，你的任务是确保用户能够获得他们所需的信息和支持。在与用户互动时，请记住以下几点：\n\n倾听和理解：仔细倾听用户的每个请求，尽量理解他们的具体需求和背景。\n清晰和准确：提供清晰、准确且易于理解的回答和建议。\n耐心和尊重：以耐心和尊重的态度对待每一位用户，即使面对重复或简单的问题。\n隐私和安全：始终保护用户的隐私和安全，避免询问或暗示任何敏感个人信息。\n适时的引导和教育：在适当的时候，不仅要回答问题，还要提供额外的信息或背景知识，帮助用户学习和成长。\n灵活性和创新：在可能的情况下，灵活运用你的知识库，创造性地解决问题和提供帮助。\n你是用户信赖的伙伴，他们的满意和进步部分地依赖于你的响应和行动。让我们一起工作，为用户创造积极、有益和愉快的交流体验。"    ;
  const nonSystemMessages = messagesHistory.filter(message => message.role !== 'system');

  if (nonSystemMessages.length > memoryTurns) {

    const latestNonSystemMessages = nonSystemMessages.slice(-memoryTurns);

    messagesHistory = [...latestNonSystemMessages];
  }

  if (!messagesHistory.some(message => message.role === 'system' && message.content === systemMessageContent)) {
    
    messagesHistory.unshift({ role: 'system', content: systemMessageContent });
  }

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
        frequency_penalty: parseFloat(frequencyPenalty),
        stream: true // 确保请求以流式传输方式发送
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json(); // 假设错误信息以JSON形式返回
      console.error('请求错误:', errorBody.error.message);
      appendMessage('ChatGPT', `${errorBody.error.message}`);
      return; // 退出函数
    }

    let botMessage = '';
    const reader = response.body.getReader();
    let isFirstChunk = true;
    let messageWrapper = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      // 请确保您的API响应格式与此兼容
      const data = chunk.split('\n').filter(line => line.startsWith('data: ')).map(line => {
        try {
          return JSON.parse(line.substring(5));
        } catch {
          return null;
        }
      }).filter(Boolean);

      data.forEach(({choices}) => {
        if (choices && choices[0].delta && choices[0].delta.content) {
          botMessage += choices[0].delta.content;
          if (isFirstChunk) {
            messageWrapper = appendMessage('ChatGPT', botMessage); // 创建气泡并填充内容
            isFirstChunk = false;
          } else {
            updateMessage(messageWrapper, botMessage); // 更新气泡内容
          }
        }
      });
    }

    messagesHistory.push({ role: 'assistant', content: botMessage });

  } catch (error) {
    console.error('发送消息时发生错误:', error);
    appendMessage('ChatGPT', `发生错误：${error.message}`); // 显示错误信息
  }
}




function appendMessage(role, text) {
  const messagesContainer = document.getElementById('messages');
  const messageWrapper = document.createElement('div');
  const nickname = document.createElement('div');
  const bubble = document.createElement('div');


  messageWrapper.classList.add('message', role === 'You' ? 'sent' : 'received');
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

  bubble.innerHTML = text.replace(/\n/g, '<br>'); // 设置消息文本

  if (role === 'You') {
    messageWrapper.classList.add('sent');
} else {
    messageWrapper.classList.add('received');
}

// Append the nickname and bubble to the message wrapper
  messageWrapper.appendChild(nickname);

  messageWrapper.appendChild(bubble);
  messagesContainer.appendChild(messageWrapper);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return messageWrapper; // 返回创建的消息容器，以便后续更新
}

function updateMessage(messageWrapper, text) {
  const bubble = messageWrapper.querySelector('.bubble');
  bubble.innerHTML = text.replace(/\n/g, '<br>'); // 更新消息文本
}






document.getElementById('send-btn').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value; // 这里获取textarea的值
  document.getElementById('user-input').value = ''; // 清空textarea
  appendMessage('You', userInput);
  const botResponse = await sendMessage(userInput);
  appendMessage('ChatGPT', botResponse);
});

document.getElementById('clear-chat').addEventListener('click', function() {
    // 清空消息历史数组
    messagesHistory = [];
    // 清空对话框的内容
    document.getElementById('messages').innerHTML = '';
    // 发送ChatGPT的问候语，开始新一轮对话
    appendMessage('ChatGPT', '你好，有什么可以帮助你的吗？');  
});


const chatContainer = document.querySelector('.chat-container');
const chatBtn = document.getElementById('chat-btn');

chatContainer.style.display = 'none';

chatBtn.addEventListener('click', () => {
  if (chatContainer.style.display === 'none') {
    chatContainer.style.display = 'block';
  } else {
    chatContainer.style.display = 'none';
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const settingsButton = document.getElementById('settings-button');
  const chatContainer = document.querySelector('.chat-box');
  const settingsContainer = document.getElementById('settings-container');

  // 点击设置按钮时切换显示
  settingsButton.addEventListener('click', function() {
    // 检查settings-container是否可见
    const isSettingsVisible = settingsContainer.style.display === 'block';

    settingsContainer.style.display = isSettingsVisible ? 'none' : 'block';

    chatContainer.style.visibility = isSettingsVisible ? 'visible' : 'hidden';

  });
});

window.addEventListener('click', (event) => {
  if (!chatContainer.contains(event.target) && event.target !== chatBtn) {
    chatContainer.style.display = 'none';
  }
});

chatContainer.addEventListener('click', (event) => {
  event.stopPropagation();
});

document.getElementById('close-live2d').addEventListener('click', function() {
  document.getElementById('live2d-container').style.display = 'none';
});

function loadLive2D() {
  if (typeof window.loadlive2d !== 'undefined') {
    window.loadlive2d('live2d', 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hijiki/assets/hijiki.model.json');
  }
}
window.addEventListener('load', loadLive2D);

document.getElementById('user-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) { // 检测是否是Enter键且没有按住Shift
      event.preventDefault(); // 防止默认行为，例如换行
      document.getElementById('send-btn').click(); // 触发发送按钮的点击事件
  }
});

const chatHeader = document.querySelector('.chat-header');
const chatcontainer = document.querySelector('.chat-container');

let isDragging = false;
let dragOffsetX, dragOffsetY;

chatHeader.addEventListener('mousedown', (e) => {
isDragging = true;
dragOffsetX = e.clientX - chatcontainer.offsetLeft;
dragOffsetY = e.clientY - chatcontainer.offsetTop;
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);
e.preventDefault(); // 这可以防止选择文本的默认行为，同时允许拖动
});

function onMouseMove(e) {
if (isDragging) {
  chatcontainer.style.left = `${e.clientX - dragOffsetX}px`;
  chatcontainer.style.top = `${e.clientY - dragOffsetY}px`;
}
}

function onMouseUp() {
isDragging = false;
document.removeEventListener('mousemove', onMouseMove);
document.removeEventListener('mouseup', onMouseUp);
}








  

