import { marked } from "marked";

function debounce(fn: Function, delayMs: number = 300) {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

function throttle(fn: Function, delayMs = 300) {
  let timer: any;
  return (...args: any) => {
    if (timer) return;
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delayMs);
  };
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownToHTML(markdown: string) {
  let rawTokens = marked.lexer(markdown);

  const updatedTokens = rawTokens.map((token) => {
    if (token.type === "code") {
      token.escaped = true;
    } else {
      token.raw = escapeHtml(token.raw);
    }
    return token;
  });

  const updateMarkdown = updatedTokens.map((token) => token.raw).join("");

  return marked.parse(updateMarkdown);
}

export { debounce, throttle, escapeHtml, markdownToHTML };
