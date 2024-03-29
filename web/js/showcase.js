import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import vhtml from 'highlight.js/lib/languages/vbscript-html';
import hlstyle from 'highlight.js/styles/atom-one-dark.css';

let caseName = null;
let noCode = false;
let code = null;
let html = null;
let liveDemo = null;
let debounce = false;

async function showCode() {
  if (!code) {
    const content = await (await fetch(`tut/${caseName}.main.js`)).text();
    code = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.classList.add('hljs');
    code.append(codeElement);
    const highlightCode = hljs.highlight(content, {
      language: 'javascript'
    }).value;
    codeElement.innerHTML = highlightCode;
    const parent = document.querySelector('#content');
    parent.append(code);
  }
  code.style.display = 'block';
  html && (html.style.display = 'none');
  liveDemo && (liveDemo.style.display = 'none');
}

async function showHtml() {
  if (!html) {
    const content = await (await fetch(`tut/${caseName}.html`)).text();
    html = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.classList.add('hljs');
    html.append(codeElement);
    const highlightCode = hljs.highlight(content, {
      language: 'html'
    }).value;
    codeElement.innerHTML = highlightCode;
    const parent = document.querySelector('#content');
    parent.append(html);
  }
  html.style.display = 'block';
  code && (code.style.display = 'none');
  liveDemo && (liveDemo.style.display = 'none');
}

async function showLiveDemo() {
  if (!liveDemo) {
    liveDemo = document.createElement('iframe');
    liveDemo.src = `tut/${caseName}.html`; //`examples/dist/${el.getAttribute('case')}`
    liveDemo.style.border = "0";
    liveDemo.style.position = 'absolute';
    liveDemo.style.left = '0px';
    liveDemo.style.right = '0px';
    liveDemo.style.width = '100%';
    liveDemo.style.height = '100%';
    const parent = document.querySelector('#content');
    parent.append(liveDemo);
  }
  liveDemo.style.display = 'block';
  code && (code.style.display = 'none');
  html && (html.style.display = 'none');
}

window.onload = function () {
  const params = new URL(location.href).searchParams;
  caseName = params.get('showcase');
  noCode = params.get('nocode') !== null;
  if (noCode) {
    showLiveDemo();
  } else {
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('html', vhtml);
    for (const style of [hlstyle]) {
      const styleElement = document.createElement('style');
      styleElement.append(style);
      document.head.append(styleElement);
    }
    const action = function (func) {
      if (!debounce && !this.classList.contains('active')) {
        debounce = true;
        this.parentElement.querySelectorAll('button').forEach(value => {
          value.classList.remove('active');
        });
        this.classList.add('active');
        func().then(() => {
          debounce = false;
        }).catch(err => {
          debounce = false;
        });
      }
    }
    const btnShowJs = document.querySelector('#show-code');
    btnShowJs.addEventListener('click', function () {
      action.call(btnShowJs, showCode);
    });
    const btnShowHTML = document.querySelector('#show-html');
    btnShowHTML.addEventListener('click', function () {
      action.call(btnShowHTML, showHtml);
    });
    const btnShowLiveDemo = document.querySelector('#live-demo');
    btnShowLiveDemo.addEventListener('click', function () {
      action.call(btnShowLiveDemo, showLiveDemo);
    });
    action.call(btnShowLiveDemo, showLiveDemo);
  }
};
