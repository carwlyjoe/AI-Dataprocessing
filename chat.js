
let messagesHistory = []

function initializeSettings() {

document.getElementById('api-key').value = localStorage.getItem('apikey');
document.getElementById('proxy-url').value = localStorage.getItem('proxyUrl');

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

// 
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
document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
});



appendMessage('ChatGPT', '你好，有什么可以帮助你的吗？')


document.addEventListener('DOMContentLoaded', initializeSettings);


// 因为加入stream=true参数时会影响函数调用的接收，我想的是能不能一开始还是用stream=true进行请求，当检测到函数调用的时候，再回去重新发起请求，但是这次请求不带stream=true参数，用const {变量} = await response.json()获取函数调用，在创建一个{变量}=tempresponse.choices[0].message.function_call来获取函数调用，这时候用获得的参数执行相应的函数获取结果，把获取的结果作为role: function, content: {函数处理结果}加入到对话历史中。最后定义一个getCompletion函数，这个函数不需要接受任何输入就能发送请求，他只需要接受message,temperature,stream=true（注意，这时候需要开启流式传输）就能完成请求，把模型的输出流式相应给用户，我是这么想的，你觉得有什么更改好的办法吗，如果没有就按这个想法编写代码

async function sendMessage(text) {
  const currentApiKey = localStorage.getItem('apikey');
  const baseUrl = localStorage.getItem('proxyUrl' || 'https://2993212868.top');
  const currentProxyUrl = baseUrl +'/v1/chat/completions';
  const selectedModel = localStorage.getItem('selectedModel') || 'gpt-3.5-turbo-16k';
  const temperature = localStorage.getItem('temperature') || 0.5;
  const topP = localStorage.getItem('topP') || 1;
  const maxTokens = localStorage.getItem('maxTokens') || 2000;
  const presencePenalty = localStorage.getItem('presencePenalty') || 0;
  const frequencyPenalty = localStorage.getItem('frequencyPenalty') || 0;
  const memoryTurns = localStorage.getItem('memoryTurns') || 20;
  const systemMessageContent = "你是ChatGPT"    ;
  const converter = new showdown.Converter({
    literalMidWordUnderscores: true,
    strikethrough: true,
    tables: true,
    tablesHeaderId: true,
    ghCodeBlocks: true,
    tasklists: true,
    smoothLivePreview: true,
    simpleLineBreaks: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    parseImgDimensions: true, // 允许解析图片尺寸
  });


    
  
  if (messagesHistory.length > memoryTurns) {
  
    const latestNonSystemMessages = messagesHistory.slice(-memoryTurns);
  
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
       stream: true,
        functions: [{
          "name": "bing_search",
          "description": "使用Bing Search API根据用户的查询和其他参数执行搜索。这可以帮助用户获取相关信息，例如新闻、图片、视频等。",
          "parameters": {
            "type": "object",
            "properties": {
              "query": {
                "type": "string",
                "description": "用户想要搜索的文本。这通常是用户对话中的一部分，或者是一个明确的查询语句。"
              },
              "market": {
                "type": "string",
                "default": "en-US",
                "description": "市场和语言设置，决定了搜索结果的地区和语言偏好。例如，'en-US'将返回美国市场的英语内容。"
              },
              "count": {
                "type": "number",
                "default": 10,
                "description": "指定返回结果的数量。如果未指定，默认返回10条结果。"
              }
            },
            "required": ["query","market","count"]
          }
        },
        {
          "name": "crawler",
          "description": "使用Crawlbase API根据用户提供的URL来抓取网页内容。这可以帮助用户获取网页的HTML内容，包括通过JavaScript动态生成的内容。",
          "parameters": {
            "type": "object",
            "properties": {
              "url": {
                "type": "string",
                "description": "用户想要抓取内容的网页URL。"
              },
              "jsRendering": {
                "type": "boolean",
                "default": false,
                "description": "指定是否需要执行JavaScript来渲染页面。默认为false，如果设置为true，则使用真实浏览器环境。"
              }
            },
            "required": ["url"]
          }
        }]

        
        
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
    let messageWrapper = null;
    let isFirstChunk = true;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      if (chunk.includes('"function_call"')) {
        console.log("检测到函数调用");
        getfunctioncallresult(messagesHistory)
          .then(() => {
            getCompletion(messagesHistory);
          });
        break;
      }
      





      // 请确保您的API响应格式与此兼容
      const data = chunk.split('\n').filter(line => line.startsWith('data: ') && !line.includes("[DONE]")).map(line => {
        try {
          return JSON.parse(line.substring(5));
        } catch {
          return null;
        }
      }).filter(Boolean);
  
  
  
  
  
      data.forEach(({choices}) => {
        if (choices && choices[0].delta && choices[0].delta.content) {
          botMessage += choices[0].delta.content;
          finalmessage = createHighlightedCodeBlocks(botMessage)

        const htmlMessage = converter.makeHtml(finalmessage);
        const strippedHtmlMessage = htmlMessage.replace(/^<p>|<\/p>$/g, '');
  
          
  
          if (isFirstChunk) {
            messageWrapper = appendMessage('ChatGPT', strippedHtmlMessage); // 创建气泡并填充内容
            isFirstChunk = false;
          } else {
          updateMessage(messageWrapper, strippedHtmlMessage); // 更新气泡内容
    
          }
        }
      });
  // 或者如果你想针对特定的元素下的 <pre><code> 应用高亮
  
    }
  
  
  if(botMessage.trim() !== ''){
    messagesHistory.push({ role: 'assistant', content: botMessage });
  }
  } catch (error) {
    console.error('发送消息时发生错误:', error);
    appendMessage('ChatGPT', `发生错误：${error.message}`); // 显示错误信息
  }
  
  
  }
  

async function getfunctioncallresult(messagesHistory){
  const currentApiKey = localStorage.getItem('apikey');
  const baseUrl = localStorage.getItem('proxyUrl');
  const currentProxyUrl = baseUrl +'/v1/chat/completions';
  const selectedModel = localStorage.getItem('selectedModel') || 'gpt-3.5-turbo-16k';
  
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
        temperature: 0.1,
        functions: [{
          "name": "bing_search",
          "description": "使用Bing Search API根据用户的查询和其他参数执行搜索。这可以帮助用户获取相关信息，例如新闻、图片、视频等。",
          "parameters": {
            "type": "object",
            "properties": {
              "query": {
                "type": "string",
                "description": "用户想要搜索的文本。这通常是用户对话中的一部分，或者是一个明确的查询语句。"
              },
              "market": {
                "type": "string",
                "default": "en-US",
                "description": "市场和语言设置，决定了搜索结果的地区和语言偏好。例如，'en-US'将返回美国市场的英语内容。"
              },
              "count": {
                "type": "number",
                "default": 10,
                "description": "指定返回结果的数量。如果未指定，默认返回10条结果。"
              }
            },
            "required": ["query","market","count"]
          }
        },
        {
          "name": "crawler",
          "description": "使用Crawlbase API根据用户提供的URL来抓取网页内容。这可以帮助用户获取网页的HTML内容，包括通过JavaScript动态生成的内容。",
          "parameters": {
            "type": "object",
            "properties": {
              "url": {
                "type": "string",
                "description": "用户想要抓取内容的网页URL。"
              },
              "jsRendering": {
                "type": "boolean",
                "default": false,
                "description": "指定是否需要执行JavaScript来渲染页面。默认为false，如果设置为true，则使用真实浏览器环境。"
              }
            },
            "required": ["url"]
          }
        }]
        
        
      }),
    });
  
  
    const functionCallResponse = await response.json();
    const functionCall = functionCallResponse.choices[0].message.function_call;
    console.log("函数调用名称：", functionCall.name);
    console.log("函数调用参数字符串：", functionCall.arguments);
    
    // 解析args字符串为JSON对象
    const args = JSON.parse(functionCall.arguments);
    const name = functionCall.name;
    // 根据函数调用的名称执行相应的操作
    if (name === 'bing_search') {
      const searchResults = await performSearch(args.query,args.market,args.count); // 假设args包含了所有必要的参数
      console.log("搜索结果：", searchResults);
      messagesHistory.push({ role: 'function', content: JSON.stringify(searchResults),name: name });
      }
      if (name === 'crawler') {
        // 假设args包含了所有必要的参数，比如 URL
        const pageContent = await crawlWebContent(args.url);

        messagesHistory.push({ role: 'function', content: JSON.stringify(pageContent), name: name });
      }
  
  } catch (error) {
    console.error('处理函数调用时发生错误:', error);
  }
}



  
  

async function getCompletion(messagesHistory){
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
  const systemMessageContent = "你是ChatGPT"    ;
  const converter = new showdown.Converter({
    literalMidWordUnderscores: true,
    strikethrough: true,
    tables: true,
    tablesHeaderId: true,
    ghCodeBlocks: true,
    tasklists: true,
    smoothLivePreview: true,
    simpleLineBreaks: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    parseImgDimensions: true, // 允许解析图片尺寸
  });
  
  if (messagesHistory.length > memoryTurns) {
  
    const latestNonSystemMessages = messagesHistory.slice(-memoryTurns);
  
    messagesHistory = [...latestNonSystemMessages];
  }
  
  if (!messagesHistory.some(message => message.role === 'system' && message.content === systemMessageContent)) {
    
    messagesHistory.unshift({ role: 'system', content: systemMessageContent });
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
        stream: true,
        

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
          const data = chunk.split('\n').filter(line => line.startsWith('data: ') && !line.includes("[DONE]")).map(line => {
            try {
              return JSON.parse(line.substring(5));
            } catch {
              return null;
            }
          }).filter(Boolean);
      
      
      
      
      
          data.forEach(({choices}) => {
            if (choices && choices[0].delta && choices[0].delta.content) {
              botMessage += choices[0].delta.content;
              finalmessage = createHighlightedCodeBlocks(botMessage)
            const htmlMessage = converter.makeHtml(finalmessage);
            const strippedHtmlMessage = htmlMessage.replace(/^<p>|<\/p>$/g, '');
      
              
      
              if (isFirstChunk) {
                messageWrapper = appendMessage('ChatGPT', strippedHtmlMessage); // 创建气泡并填充内容
                isFirstChunk = false;
              } else {
              updateMessage(messageWrapper, strippedHtmlMessage); // 更新气泡内容
        
              }
            }
          });
      // 或者如果你想针对特定的元素下的 <pre><code> 应用高亮
      
        }
      
      
      
      
        messagesHistory.push({ role: 'assistant', content: botMessage });
      
      } catch (error) {
        console.error('发送消息时发生错误:', error);
        appendMessage('ChatGPT', `发生错误：${error.message}`); // 显示错误信息
      }
      
      
      }

      async function performSearch(query, market, count) {
        const bingSearchSubscriptionKey = '282ab1a137c94666b7306a33efea0f5c';
        const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&mkt=${market}&count=${count}`, {
          method: 'GET',
          headers: { 'Ocp-Apim-Subscription-Key': bingSearchSubscriptionKey }
        });
      
        if (!response.ok) {
          throw new Error('Search request failed');
        }
      
        const searchResultsJson = await response.json();
        return searchResultsJson.webPages.value.map(page => ({
          title: page.name,
          link: page.url,
          snippet: page.snippet
        }));
      }
      


      async function crawlWebContent(url) {
        userToken = '2j6e-IyIF7xiqGJyLxYCfw';
        const apiUrl = `https://api.crawlbase.com/scraper?token=${userToken}&url=${encodeURIComponent(url)}`;
      
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
          }
          let content = await response.text();
          const startindex = content.indexOf('"links":')
          if(startindex === -1){
            return content
          }

          const slicedcontent = content.slice(0,startindex);
          console.log("解析的内容：",slicedcontent);
          return slicedcontent;


        } catch (error) {
          console.error(`Error fetching web content: ${error.message}`);
          return null;  // 在发生错误时返回null或适当的错误信息
        }
      }
      
  







  function appendMessage(role, text) {
    // 确保text是一个非空、非仅包含空白字符的字符串
    if (typeof text === 'string' && text.trim() !== '') {
        const messagesContainer = document.getElementById('messages');
        const messageWrapper = document.createElement('div');
        const nickname = document.createElement('div');
        const bubble = document.createElement('div');
  
        messageWrapper.classList.add('message', role === 'You' ? 'sent' : 'received');
        bubble.classList.add('bubble');
        nickname.textContent = role; // 设置昵称文本

    // Check if the text contains <pre><code> elements, indicating a code block
    const containsPreCode = text.includes('<pre><code') || text.includes('</code></pre>');

    // Replace newlines with <br> tags only if not in a code block
    // and avoid adding a <br> tag at the end of the text
    const containsTable = text.includes('<table>') && text.includes('</table>');
    if (!containsPreCode && !containsTable) {
      // 只有当文本既不在代码块内也不在表格内时，才替换换行符
      text = text.replace(/\n/g, '<br>').replace(/<br>$/, '');
    }
    bubble.innerHTML = text;
    
    if (containsPreCode) {
      // Highlight code blocks
      const codeBlocks = bubble.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block)
      });
    }

        
        // 将昵称和消息泡泡添加到消息容器
        messageWrapper.appendChild(nickname);
        messageWrapper.appendChild(bubble);
        messagesContainer.appendChild(messageWrapper);

        // 滚动到消息容器的底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
        // 返回创建的消息容器，以便后续更新
        return messageWrapper;
    }
}





  function updateMessage(messageWrapper, text) {
    const bubble = messageWrapper.querySelector('.bubble');
    // Check if the text contains <pre><code> elements, indicating a code block
    const containsPreCode = text.includes('<pre><code') || text.includes('</code></pre>');

    // Replace newlines with <br> tags only if not in a code block
    // and avoid adding a <br> tag at the end of the text
    const containsTable = text.includes('<table>') && text.includes('</table>');
    if (!containsPreCode && !containsTable) {
      // 只有当文本既不在代码块内也不在表格内时，才替换换行符
      text = text.replace(/\n/g, '<br>').replace(/<br>$/, '');
    }
    bubble.innerHTML = text;
    if (containsPreCode) {
      // Highlight code blocks
      const codeBlocks = bubble.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block)
      });
    }
  }

  function createHighlightedCodeBlocks(text) {
    const lines = text.split('\n');
    let inCodeBlock = false;
    let language = '';
    let result = '';
    let inTable = false;

  
    lines.forEach(line => {
      if (/^```/.test(line)) {
        if (!inCodeBlock) {
          // 提取语言标记
          language = line.replace(/^```/, '').trim() || "";
          // 创建包含复制按钮的代码块开头
          result += language ? `<pre class="code-block"><button type="button" class="copy-button" >复制</button><code class="language-${language}">` : `<pre class="code-block"><button type="button" class="copy-button">复制</button><code>`;
          inCodeBlock = true;
        } else {
          // 结束代码块
          result += '</code></pre>\n';
          inCodeBlock = false;
        }
      } else if (inCodeBlock) {
        // 将代码行添加到结果中
        result += line + '\n';
      } else if (/^\|(.+\|)+/.test(line)) { // This regex checks for Markdown table syntax
        if (!inTable) {
          inTable = true; // We're now in a table
        }
        result += line + '\n'; // Tables should maintain newlines, not <br>

      } else {
        if (inTable && !/^\|(.+\|)+/.test(line)) {
          inTable = false; // We've reached the end of the table
        }
        // Only add <br> if not in a table
        result += inTable ? line + '\n' : line + '<br>';
        
      }
    });
  
    // 确保所有代码块都已关闭
    if (inCodeBlock) {
      result += '</code></pre>\n';
    }

    return result
    ;
  
  
  }
  


  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('copy-button')) {
      const parentPre = e.target.closest('pre');
      if (parentPre) {
        const codeBlock = parentPre.querySelector('code');
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
          console.log('Text copied to clipboard');
          e.target.textContent = '复制成功！'; // 更新按钮的文本为复制成功
          setTimeout(() => {
            e.target.textContent = '复制'; // 3秒后恢复按钮原来的文本
          }, 3000); // 设置延时为3000毫秒（3秒）
        }).catch(err => {
          console.error('Failed to copy text: ', err);
        });
        
      } else {
        console.error('未找到预期的pre元素');
      }
    }
  });


document.getElementById('send-btn').addEventListener('click', async () => {
const userInput = document.getElementById('user-input').value; // 这里获取textarea的值
const converter = new showdown.Converter({
  literalMidWordUnderscores: true,
  strikethrough: true,
  tables: true,
  tablesHeaderId: true,
  ghCodeBlocks: true,
  tasklists: true,
  smoothLivePreview: true,
  simpleLineBreaks: true,
  simplifiedAutoLink: true,
  excludeTrailingPunctuationFromURLs: true,
  parseImgDimensions: true, // 允许解析图片尺寸
});
finalmessage = createHighlightedCodeBlocks(userInput);

const htmlUsertext = converter.makeHtml(finalmessage);
const strippedHtmlUsertext = htmlUsertext.replace(/^<p>|<\/p>$/g, '');



document.getElementById('user-input').value = ''; // 清空textarea
if(strippedHtmlUsertext !== ''){
appendMessage('You', strippedHtmlUsertext);
const botResponse = await sendMessage(strippedHtmlUsertext);
appendMessage('ChatGPT', botResponse);
}
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



document.getElementById('close-live2d').addEventListener('click', function() {
document.getElementById('live2d-container').style.display = 'none';
document.getElementById('waifu').style.display = 'none';
});

function loadlive2d() {
  if (window.loadlive2d) {
    try {
      window.loadlive2d('live2d', 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hijiki/assets/hijiki.model.json');
    } catch (error) {
      console.error("Error loading live2d model:", error);
    }
  } else {
    console.error("The live2d function is not defined.");
  }
}
window.addEventListener('load', loadlive2d);



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










