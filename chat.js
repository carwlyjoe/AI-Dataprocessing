let messagesHistory = []

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
  document.getElementById('api-key').value = localStorage.getItem('apikey') || '54e22def5b8f8b613c1ac05c267a878137bc369ccc60bd50';
  document.getElementById('proxy-url').value = localStorage.getItem('proxyUrl') || 'https://2993212868.top/v1/chat/completions';

  // Event listeners for saving settings
  document.getElementById('api-key').addEventListener('change', function(event) {
    const apiKeyValue = event.target.value.trim();
    if (apiKeyValue === '') {
    event.target.value = '54e22def5b8f8b613c1ac05c267a878137bc369ccc60bd50'
    localStorage.setItem('apikey', event.target.value.trim());
    } else{
      localStorage.setItem('apikey',event.target.value);
    }
  });
    

  document.getElementById('proxy-url').addEventListener('change', function(event) {
    let baseUrl = event.target.value.trim();
    if (baseUrl === '') {
      event.target.value = 'https://sapi.onechat.fun/v1/chat/completions';
      localStorage.setItem('proxyUrl',event.target.value);
    }else {
      if(!baseUrl.endsWith('/')){
       baseUrl += '/';   
      }      
      localStorage.setItem('proxyUrl', baseUrl + 'v1/chat/completions');

    }
   });
  
    modelSelector.addEventListener('change', function(event) {
    localStorage.setItem('selectedModel', event.target.value);
  
  })
// 选择对话框的标题栏，假设它有一个特定的类名，例如 .chat-header



  }





document.addEventListener('DOMContentLoaded', initializeSettings);


// 定义全局变量来存储消息历史

async function sendMessage(text) {
  const currentApiKey = localStorage.getItem('apikey') || '54e22def5b8f8b613c1ac05c267a878137bc369ccc60bd50';
  const currentProxyUrl = localStorage.getItem('proxyUrl') || 'https://2993212868.top/v1/chat/completions';
  const selectedModel = localStorage.getItem('selectedModel') || 'gpt-3.5-turbo-16k';
  const temperature = localStorage.getItem('temperature') || 0.5;
  const topP = localStorage.getItem('topP') || 1;
  const maxTokens = localStorage.getItem('maxTokens') || 1000;
  const presencePenalty = localStorage.getItem('presencePenalty') || 0;
  const frequencyPenalty = localStorage.getItem('frequencyPenalty') || 0;
  const memoryTurns = localStorage.getItem('memoryTurns') || 20;


  const systemMessageContent = "亲爱的ChatGPT，作为一个致力于提供帮助和指导的助手，你的任务是确保用户能够获得他们所需的信息和支持。在与用户互动时，请记住以下几点：\n\n倾听和理解：仔细倾听用户的每个请求，尽量理解他们的具体需求和背景。\n清晰和准确：提供清晰、准确且易于理解的回答和建议。\n耐心和尊重：以耐心和尊重的态度对待每一位用户，即使面对重复或简单的问题。\n隐私和安全：始终保护用户的隐私和安全，避免询问或暗示任何敏感个人信息。\n适时的引导和教育：在适当的时候，不仅要回答问题，还要提供额外的信息或背景知识，帮助用户学习和成长。\n灵活性和创新：在可能的情况下，灵活运用你的知识库，创造性地解决问题和提供帮助。\n你是用户信赖的伙伴，他们的满意和进步部分地依赖于你的响应和行动。让我们一起工作，为用户创造积极、有益和愉快的交流体验。"    ;

// 添加用户消息到messagesHistory
messagesHistory.push({ role: 'user', content: text });

// 检查是否已存在特定内容的system消息
if (!messagesHistory.some(message => message.role === 'system' && message.content === systemMessageContent)) {
    // 如果没有特定内容的system消息，则在数组最前面添加系统消息
    messagesHistory.unshift({ role: 'system', content: systemMessageContent });
}



// 调整历史消息长度，确保只计算非system消息
let nonSystemMessagesCount = messagesHistory.filter(message => message.role !== 'system').length;
if (nonSystemMessagesCount > memoryTurns) {
    // 找到第一个system消息的位置，以确保它不会被移除
    let firstSystemMessageIndex = messagesHistory.findIndex(message => message.role === 'system' && message.content === systemMessageContent);
    
    // 保留一个system消息和用户设置的历史消息数
    messagesHistory = [
        ...messagesHistory.slice(firstSystemMessageIndex, firstSystemMessageIndex + 1),
        ...messagesHistory.slice(-memoryTurns-1)
    ];
}


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
      throw new Error(`Network response was not ok, status: ${response.status}`);
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


// 初始化函数，用于发送问候语
function initializeChat() {
    appendMessage('ChatGPT', '你好，有什么可以帮助你的吗？');
}

document.addEventListener('DOMContentLoaded', function() {
    appendMessage('ChatGPT', '你好，有什么可以帮助你的吗？');
});

document.getElementById('send-btn').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value; // 这里获取textarea的值，包含换行
  document.getElementById('user-input').value = ''; // 清空textarea
  appendMessage('You', userInput);
  const botResponse = await sendMessage(userInput);
  await sendMessageWithSummaryIfNeeded(userMessage);
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

  });
});


document.getElementById('user-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) { // 检测是否是Enter键且没有按住Shift
      event.preventDefault(); // 防止默认行为，例如换行
      document.getElementById('send-btn').click(); // 触发发送按钮的点击事件
  }



});

// 选择对话框的标题栏，假设它有一个特定的类名，例如 .chat-header
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

  const maxTokensSlider = document.getElementById('max-tokens');
  const maxTokensValueDisplay = document.getElementById('max_tokens-vlaue'); // 注意这里的ID拼写应与HTML中保持一致

  maxTokensSlider.oninput = function() {
    maxTokensValueDisplay.textContent = this.value;
    localStorage.setItem('maxTokens', this.value);
  };

  // Initialize max tokens display
  maxTokensValueDisplay.textContent = maxTokensSlider.value;
  localStorage.setItem('maxTokens', maxTokensSlider.value);



});

  
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('memory-turns').addEventListener('change', function() {
      if (parseInt(this.value, 10) > 64) {
          this.value = 64;
      } else if (parseInt(this.value, 10) < 1) {
          this.value = 1;
      }
      localStorage.setItem('memoryTurns', this.value);
  });
});
