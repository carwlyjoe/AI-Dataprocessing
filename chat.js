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
  document.getElementById('proxy-url').value = localStorage.getItem('proxyUrl') || 'https://sapi.onechat.fun/v1/chat/completions';

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
  const currentProxyUrl = localStorage.getItem('proxyUrl') || 'https://sapi.onechat.fun/v1/chat/completions';
  const selectedModel = localStorage.getItem('selectedModel') || 'gpt-3.5-turbo-16k';
  const temperature = localStorage.getItem('temperature') || 0.5;
  const topP = localStorage.getItem('topP') || 1;
  const maxTokens = localStorage.getItem('maxTokens') || 1000;
  const presencePenalty = localStorage.getItem('presencePenalty') || 0;
  const frequencyPenalty = localStorage.getItem('frequencyPenalty') || 0;
  const memoryTurns = localStorage.getItem('memoryTurns') || 5;


  const systemMessageContent = "亲爱的ChatGPT，作为一个致力于提供帮助和指导的助手，你的任务是确保用户能够获得他们所需的信息和支持。在与用户互动时，请记住以下几点：\n\n倾听和理解：仔细倾听用户的每个请求，尽量理解他们的具体需求和背景。\n清晰和准确：提供清晰、准确且易于理解的回答和建议。\n耐心和尊重：以耐心和尊重的态度对待每一位用户，即使面对重复或简单的问题。\n隐私和安全：始终保护用户的隐私和安全，避免询问或暗示任何敏感个人信息。\n适时的引导和教育：在适当的时候，不仅要回答问题，还要提供额外的信息或背景知识，帮助用户学习和成长。\n灵活性和创新：在可能的情况下，灵活运用你的知识库，创造性地解决问题和提供帮助。\n你是用户信赖的伙伴，他们的满意和进步部分地依赖于你的响应和行动。让我们一起工作，为用户创造积极、有益和愉快的交流体验。"    ;


      // 如果没有系统消息，则在数组最前面添加系统消息
      messagesHistory.unshift({ role: 'system', content: systemMessageContent });

  
    // 添加用户消息到messagesHistory
    messagesHistory.push({ role: 'user', content: text });

    // 保证system消息在调整后仍然位于最前面
    if (messagesHistory.length > (memoryTurns * 2 + 1)) {
      messagesHistory = messagesHistory.slice(0, 1).concat(messagesHistory.slice(-(memoryTurns * 2)));
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


async function sendMessageWithSummaryIfNeeded(text) {
  // 添加用户的当前消息

  // 计算当前消息历史的token数
  let currentTokens = calculateTokens(messagesHistory);
  let tokensToRemove = currentTokens - 3000; // 假设3000是token的限制

  if (tokensToRemove > 0) {
      // 如果超出了token限制，对最早的消息进行总结
      const messagesToSummarize = getMessagesToSummarize(messagesHistory, tokensToRemove);
      const summary = await generateSummaryWithPrompt(messagesToSummarize);

      // 重组消息历史：包括总结、未超出部分的消息和system消息
      messagesHistory = [
          { role: 'system', content: systemMessageContent },
          { role: 'system', content: summary },
          ...getRemainingMessages(messagesHistory, tokensToRemove)
      ];
  }

    // 构造请求体
    const requestBody = {
      message: messagesHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n"),
      temperature: 0.5, // 根据需要调整

  };

  // 发送请求给OpenAI API
  try {
      const response = await fetch(currentProxyUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentApiKey}`
          },
          body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();

      // 处理模型的响应，例如显示到UI或进行下一步操作
      // 这里假设模型响应的文本位于data.choices[0].text中
      console.log(data.choices[0].text);

      // 如果需要，可以将助手的回复加入到messagesHistory中
      // messagesHistory.push({ role: 'assistant', content: data.choices[0].text.trim() });

  } catch (error) {
      console.error('发送消息时发生错误:', error);
      // 错误处理，例如显示错误信息
  }

  // 注意：这里可能需要根据实际应用的逻辑进行适当的调整和补充
}

function getMessagesToSummarize(messages, maxTokens) {
  let tokensCount = 0;
  let messagesToSummarize = [];
  let index = messages.length - 1;

  // 从最新的消息开始反向累积，直到达到指定的token数
  while (index >= 0 && tokensCount < (maxTokens)) {
      const message = messages[index];
      // 简单估算消息的token数
      let messageTokens = message.content.length;
      tokensCount += messageTokens;

      if (tokensCount > maxTokens) {
          // 当累积的token数超过指定的token数时，开始收集需要总结的消息
          break;
      }

      index--;
  }

  // 从超出部分开始收集需要被总结的消息
  messagesToSummarize = messages.slice(0, index + 1);

  return messagesToSummarize;
}



function getRemainingMessages(messages, maxTokens) {
  let tokensCount = 0;
  let remainingMessages = [];
  for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      // 简单估算消息的token数，这里假设1个字符等于1个token
      let messageTokens = message.content.length;

      // 检查累积token数加上当前消息的token数是否会超过限制
      if (tokensCount + messageTokens <= maxTokens) {
          tokensCount += messageTokens;
          // 如果不超过限制，则将当前消息添加到保留列表
          remainingMessages.unshift(message);
      } else {
          // 一旦添加当前消息会导致超过限制，停止添加
          break;
      }
  }

  // 返回保留的消息列表
  return remainingMessages;
}


async function generateSummaryWithPrompt(messages) {
  // 构造总结的prompt
  const prompt = "Please summarize the following conversation:\n" +
      messages.map(msg => `${msg.role}: ${msg.content}`).join("\n") +
      "\nSummary:";
  
  // 发送请求给OpenAI API
  const response = await fetch(currentProxyUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentApiKey}`
      },
      body: JSON.stringify({
          model: selectedModel,
          message: prompt,
 
      }),
  });

  if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
  }
  
  const data = await response.json();
  // 假设总结文本位于第一个choice的text中
  return data.choices[0].text.trim();
}



function calculateTokens(messages) {
  // 估算messages中所有消息的token总数
  // 这里需要实现一个函数来估算token数量，可以简化为计算字符数
  let totalTokens = 0;
  messages.forEach(message => {
      totalTokens += message.content.length; // 简化的估算方法
  });
  return totalTokens;
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

  
// 监听保留轮次数设置的更改
document.getElementById('memory-turns').addEventListener('change', function() {
  if (parseInt(this.value, 10) > 64) {
    this.value = 64; // Set value to 64 if it exceeds the max
  } else if (parseInt(this.value, 10) < 1) {
    this.value = 1; // Ensure value is at least 1
  }
  localStorage.setItem('memoryTurns', this.value); // Save the corrected value
});
