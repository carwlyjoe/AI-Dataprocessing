  const processButton = document.getElementById('processButton');
  const reverseButton = document.getElementById('reverseButton');
  const quoteButton = document.getElementById('quoteButton');
  const clearButton = document.getElementById('clearButton');
  const uppercaseButton = document.getElementById('uppercaseButton');
  const lowercaseButton = document.getElementById('lowercaseButton');
  const capitalizeButton = document.getElementById('capitalizeButton');
  const clearSpaceButton = document.getElementById('clearSpaceButton');
  const clearLineButton = document.getElementById('clearLineButton');
  const clearSymbolButton = document.getElementById('clearSymbolButton');
  const copyButton = document.getElementById('copyButton');
  const dataInput = document.getElementById('dataInput');
  const processedOutput = document.getElementById('processedOutput');
  const copySuccessMsg = document.getElementById('copySuccessMsg');
  const commaToNewlineButton = document.getElementById('commaToNewlineButton');

  processButton.addEventListener('click', () => processInput(/\s+/g, ','));
  reverseButton.addEventListener('click', () => reverseInput(','));
  quoteButton.addEventListener('click', addQuotes);
  clearButton.addEventListener('click', clearData);
  uppercaseButton.addEventListener('click', toUppercase);
  lowercaseButton.addEventListener('click', toLowercase);
  capitalizeButton.addEventListener('click', capitalize);
  clearSpaceButton.addEventListener('click', clearSpaces);
  clearLineButton.addEventListener('click', clearLines);
  clearSymbolButton.addEventListener('click', clearSymbols);
  copyButton.addEventListener('click', copyOutput);
  commaToNewlineButton.addEventListener('click', commaToNewline);


  document.addEventListener('DOMContentLoaded', function() {
        setupCharCountListener('processedOutput', 'processedOutputCharCount');
        setupCharCountListener('dataInput', 'dataInputCharCount');
        setupCharCountListener('columnDataOutput', 'columnDataOutputCharCount'); // 注意大小写
        setupCharCountListener('columnDataInput', 'columnDataInputCharCount');
        // ...为其他文本框设置监听器...

      });
  
      function updateCharCount(textAreaId, charCountId) {
        var charCount = document.getElementById(textAreaId).value.length;
        document.getElementById(charCountId).textContent = charCount + " 字符";
      }
  
      function triggerContentUpdateEvent(textAreaId) {
        var event = new Event('contentupdate');
        document.getElementById(textAreaId).dispatchEvent(event);
      }
  
      function setupCharCountListener(textAreaId, charCountId) {
        var textArea = document.getElementById(textAreaId);
        textArea.addEventListener('input', function() {
          updateCharCount(textAreaId, charCountId);
        });
        textArea.addEventListener('contentupdate', function() {
          updateCharCount(textAreaId, charCountId);
        });
      }
  // 英文去重按钮事件处理程序
document.getElementById('deduplicateWordsButton').addEventListener('click', function() {
  var inputData = document.getElementById('dataInput').value; // 假设您已经有了一个ID为dataInput的文本域来接收用户输入的数据
  var words = inputData.match(/\b\w+\b/g); // 使用正则表达式匹配所有英文单词
  var uniqueWords = Array.from(new Set(words)); // 创建一个Set来去除重复单词，然后转换回数组
  document.getElementById('processedOutput').value = uniqueWords.join(' '); // 假设您已经有了一个ID为processedOutput的文本域来显示处理后的数据
  triggerContentUpdateEvent('dataInput');
  triggerContentUpdateEvent('processedOutput');
});

document.getElementById('cmToInchButton').addEventListener('click', toggleConversion);
document.getElementById('gToPoundsButton').addEventListener('click', toggleGramPoundConversion);
document.getElementById('convertToTabButton').addEventListener('click', convertNewlinesToTabs);
document.getElementById('newlineToCommaButton').addEventListener('click',newlineToComma)

function convertNewlinesToTabs() {
  let inputData = dataInput.value;
  let outputData = inputData.replace(/\n+/g, '\t');  // 替换所有连续换行符为单个制表符
  processedOutput.value = outputData;
  processedOutput.readOnly = false;
  copyButton.disabled = false;
}
// 标志变量，用于追踪转换模式，初始设置为true，表示第一次点击时进行厘米到英寸的转换
let isCmToInches = true;

function toggleConversion() {
    let inputData = parseFloat(dataInput.value.trim()); // 获取用户输入并转换为浮点数
    if (!isNaN(inputData)) {
        let result;
        if (isCmToInches) {
            // 执行厘米到英寸的转换
            result = (inputData * 0.3937).toFixed(2) + "英寸";
        } else {
            // 执行英寸到厘米的转换
            result = (inputData / 0.3937).toFixed(2) + "厘米";
        }
        processedOutput.value = result; // 显示转换结果
        processedOutput.readOnly = false;
        copyButton.disabled = false;

        isCmToInches = !isCmToInches; // 切换转换模式
    } else {
        processedOutput.value = "请输入有效的数字";
        processedOutput.readOnly = false;
        copyButton.disabled = true;
    }
}




// 标志变量，初始设置为true，表示从克到英镑的转换
let isGramsToPounds = true;

function toggleGramPoundConversion() {
    let inputData = parseFloat(dataInput.value.trim()); // 获取用户输入并转换为浮点数
    if (!isNaN(inputData)) {
        let result;
        if (isGramsToPounds) {
            // 执行克到英镑的转换
            result = (inputData * 0.00220462).toFixed(2) + "英镑";
        } else {
            // 执行英镑到克的转换
            result = (inputData / 0.00220462).toFixed(2) + "克";
        }
        processedOutput.value = result; // 显示转换结果
        processedOutput.readOnly = false;
        copyButton.disabled = false;

        isGramsToPounds = !isGramsToPounds; // 切换转换模式
    } else {
        processedOutput.value = "请输入有效的数字";
        processedOutput.readOnly = false;
        copyButton.disabled = true;
    }
}


function newlineToComma() {
  let inputData = dataInput.value.trim();
  let outputData = inputData.replace(/\n/g, ',')
  processedOutput.value = outputData;
  processedOutput.value.readOnly = false
  copyButton.disabled = false;

}



  function commaToNewline() {
    let inputData = dataInput.value.trim();
    let outputData = inputData.replace(/,/g, '\n'); // 将逗号替换为换行符
    processedOutput.value = outputData;
    processedOutput.readOnly = false;
    copyButton.disabled = false;
    triggerContentUpdateEvent('dataInput');
    triggerContentUpdateEvent('processedOutput');
  }

  function processInput() {
  let inputData = dataInput.value.trim();
  try {
    // Replace spaces and newline characters with commas
    let processedData = inputData.replace(/[\s\n]+/g, ',');
    processedOutput.value = processedData;
    processedOutput.readOnly = false;
    copyButton.disabled = false;
  } catch (e) {
    console.error("Error processing input: ", e);
    // Handle the error (e.g., display a message to the user)
  }
  triggerContentUpdateEvent('dataInput');
  triggerContentUpdateEvent('processedOutput');
  }

  function reverseInput(oldDelimiter) {
  let inputData = dataInput.value.trim();
  // Check for English comma or Chinese comma and replace with space
  if (inputData.includes(oldDelimiter) || inputData.includes('，')) {
    processedOutput.value = inputData.replace(/,|，/g, ' ');
    processedOutput.readOnly = false;
    copyButton.disabled = false;
  }
  triggerContentUpdateEvent('dataInput');
  triggerContentUpdateEvent('processedOutput');
  }

  function addQuotes() {
    let inputData = dataInput.value.trim();
    if (inputData.includes(',')) {
      let quotedData = inputData.split(',').map(item => "'" + item.trim() + "'");
      processedOutput.value = quotedData.join(', ');
      processedOutput.readOnly = false;
      copyButton.disabled = false;
    }
    triggerContentUpdateEvent('dataInput');
    triggerContentUpdateEvent('processedOutput');
  }

  function clearData() {
    dataInput.value = '';
    processedOutput.value = '';
    processedOutput.readOnly = true;
    copyButton.disabled = true;
    triggerContentUpdateEvent('dataInput');
    triggerContentUpdateEvent('processedOutput');
  }

  function toUppercase() {
  let inputData = dataInput.value;
  processedOutput.value = inputData.toUpperCase();
  processedOutput.readOnly = false;
  

  if (processedOutput.value === '') {
    copyButton.disabled = true;
  } else {
    copyButton.disabled = false;
  }
  triggerContentUpdateEvent('dataInput');
  triggerContentUpdateEvent('processedOutput');
  }

  function toLowercase() {
  let inputData = dataInput.value;
  processedOutput.value = inputData.toLowerCase();
  processedOutput.readOnly = false;
  copyButton.disabled = processedOutput.value === '';
  triggerContentUpdateEvent('processedOutput');
  triggerContentUpdateEvent('dataInput');
  }

  function capitalize() {
  let inputData = dataInput.value;
  processedOutput.value = inputData.replace(/(^|\s)\S/g, l => l.toUpperCase());
  processedOutput.readOnly = false;
  copyButton.disabled = processedOutput.value === '';
  triggerContentUpdateEvent('processedOutput');
  triggerContentUpdateEvent('dataInput');
  }

  function clearSpaces() {
  let inputData = dataInput.value;
  processedOutput.value = inputData.replace(/\s/g, '');
  processedOutput.readOnly = false;
  copyButton.disabled = processedOutput.value === '';
  triggerContentUpdateEvent('processedOutput');
  triggerContentUpdateEvent('dataInput');
  }

  function clearLines() {
  let inputData = dataInput.value;
  processedOutput.value = inputData.replace(/\n/g, ' ');
  processedOutput.readOnly = false;
  copyButton.disabled = processedOutput.value === '';
  triggerContentUpdateEvent('processedOutput');
  triggerContentUpdateEvent('dataInput');
 }

  function clearSymbols() {
   let inputData = dataInput.value;
   // 使用一个详尽的正则表达式来匹配并移除各种中英文特殊符号
   processedOutput.value = inputData.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/·～！@#￥%……&*（）—+|{}【】‘；：”“'。，、《》]/gi, '');
   processedOutput.readOnly = false;
   copyButton.disabled = processedOutput.value === '';
   triggerContentUpdateEvent('dataInput');
   triggerContentUpdateEvent('processedOutput');
  }



  function copyOutput() {
    processedOutput.select();
    document.execCommand('copy');
    let copySuccessMsg1 = document.getElementById('copySuccessMsg1'); // 使用copySuccessMsg1
    copySuccessMsg1.style.display = 'block';
    setTimeout(() => { copySuccessMsg1.style.display = 'none'; }, 2000);
    triggerContentUpdateEvent('dataInput');
    triggerContentUpdateEvent('processedOutput');
  }

  processedOutput.addEventListener('input', function() {
  copyButton.disabled = processedOutput.value === '';
  });


  document.getElementById('copyColumnDataButton').addEventListener('click', copyColumnData);
  document.getElementById('clearColumnDataButton').addEventListener('click', clearColumnData);

  document.getElementById('addSerialNumbersButton').addEventListener('click', function() {
  var format = document.getElementById('serialFormatSelect').value;
  var startNumber = parseInt(document.getElementById('startNumberInput').value, 10);
  var interval = parseInt(document.getElementById('numberIntervalInput').value, 10);
  var inputData = document.getElementById('columnDataInput').value; // Corrected ID
  var outputData = '';
  var currentNumber = startNumber;

  inputData.split('\n').forEach(function(line, index) {
    if (line.trim() !== '') { // Skip empty lines
      // Replace 'n' in the selected format with the current number
      outputData += format.replace(/n/g, currentNumber) + line + '\n';
      currentNumber += interval; // Increment by the interval
    }
  });

  document.getElementById('columnDataOutput').value = outputData; 
  triggerContentUpdateEvent('columnDataOutput');
  triggerContentUpdateEvent('columnDataInput');// Corrected ID
});


document.addEventListener('DOMContentLoaded', function() {
  setupCharCountListener('processedOutput', 'processedOutputCharCount');
  setupCharCountListener('dataInput', 'dataInputCharCount');
  setupCharCountListener('columnDataOutput', 'columnDataOutputCharCount'); // 注意大小写
  setupCharCountListener('columnDataInput', 'columnDataInputCharCount');
  // ...为其他文本框设置监听器...
  
  // Set the initial state of the copy button on page load
  updateCopyButtonState();
});

function updateCharCount(textAreaId, charCountId) {
  var charCount = document.getElementById(textAreaId).value.length;
  document.getElementById(charCountId).textContent = charCount + " 字符";
  
  // If the text area being updated is 'columnDataOutput', also update the copy button state
  if (textAreaId === 'columnDataOutput') {
    updateCopyButtonState();
  }
}


function clearColumnData() {
    document.getElementById('columnDataInput').value = '';
    document.getElementById('columnDataOutput').value = '';
    // 禁用复制按钮
    document.getElementById('copyColumnDataButton').disabled = true;
    triggerContentUpdateEvent('columnDataOutput');
    triggerContentUpdateEvent('columnDataInput');
}

function triggerContentUpdateEvent(textAreaId) {
  var event = new Event('contentupdate');
  document.getElementById(textAreaId).dispatchEvent(event);
} 

function setupCharCountListener(textAreaId, charCountId) {
  var textArea = document.getElementById(textAreaId);
  textArea.addEventListener('input', function() {
    updateCharCount(textAreaId, charCountId);
  });
  textArea.addEventListener('contentupdate', function() {
    updateCharCount(textAreaId, charCountId);
  });
}

// New function to update the state of the copy button
function updateCopyButtonState() {
  const outputArea = document.getElementById('columnDataOutput');
  const copyButton = document.getElementById('copyColumnDataButton');
  copyButton.disabled = !outputArea.value.trim();
}

updateCopyButtonState();


  function copyColumnData() {
    const columnDataOutput = document.getElementById('columnDataOutput');
    columnDataOutput.select();
    document.execCommand('copy');
    let copySuccessMsg2 = document.getElementById('copySuccessMsg2'); // 使用copySuccessMsg2
    copySuccessMsg2.style.display = 'block';
    setTimeout(() => { copySuccessMsg2.style.display = 'none'; }, 2000);
  }
  

  // 文本替换按钮事件处理程序
document.getElementById('textReplaceButton').addEventListener('click', function() {
  var findText = document.getElementById('findTextInput').value;
  var replaceText = document.getElementById('replaceTextInput').value;
  var inputData = document.getElementById('columnDataInput').value; // 假设您已经有了一个ID为columnDataInput的文本域来接收用户输入的数据
  var replacedData = inputData.replace(new RegExp(escapeRegExp(findText), 'g'), replaceText);
  document.getElementById('columnDataOutput').value = replacedData; // 假设您已经有了一个ID为columnDataOutput的文本域来显示替换后的数据
  triggerContentUpdateEvent('columnDataOutput');
  triggerContentUpdateEvent('columnDataInput');
});

// 功能：转义正则表达式中的特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

