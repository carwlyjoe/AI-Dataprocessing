


const apiKey = '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';
let messagesHistory = [];

async function sendMessage(text) {
  try {
    // 更新对话历史
    messagesHistory.push({role: 'user', content: text});

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messagesHistory,
      }),
    });

    if (!response.ok) {
      throw new Error('网络请求失败'); // 当HTTP状态码非2xx时
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
      throw new Error('返回值为空或格式不正确'); // 当返回的数据为空或格式不符合预期时
    }

    const botMessage = data.choices[0].message.content;
    
    // 将ChatGPT的回复也添加到对话历史中
    messagesHistory.push({role: 'system', content: botMessage});
    
    return botMessage;
  } catch (error) {
    console.error('发送消息时发生错误:', error);
    return "Bot无法正常工作，请检查代理是否正确设置"; // 向用户展示错误信息
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

const chatContainer = document.querySelector('.chat-container');

    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    
    chatContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragOffsetX = e.clientX - chatContainer.offsetLeft;
      dragOffsetY = e.clientY - chatContainer.offsetTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
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

document.addEventListener('DOMContentLoaded', () => {

  // 当用户按下鼠标时开始拖动
  chatContainer.addEventListener('mousedown', (e) => {
    drag = true;
    offsetX = e.clientX - chatContainer.offsetLeft;
    offsetY = e.clientY - chatContainer.offsetTop;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!drag) return;
    chatContainer.style.left = `${e.clientX - offsetX}px`;
    chatContainer.style.top = `${e.clientY - offsetY}px`;
  }

  function onMouseUp() {
    drag = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
});
