import { parse } from "node-html-parser";

import type {
  ChatContent,
  ChatContentParser,
  ChatFormat,
  ChatSource,
} from "$lib/type";

export function isHtml(content: string) {
  return content.startsWith("<!DOCTYPE html>");
}

export const aoaiChatContentParser: ChatContentParser = (chatData: string) => {
  const result: ChatContent = [];
  try {
    const parsed = JSON.parse(chatData);
    if (parsed["systemPrompt"]) {
      result.push({
        role: "system",
        content: parsed["systemPrompt"],
      });
    }

    const items = parsed["chatTranscript"];
    for (let item of items) {
      const role = item["isAI"] ? "ai" : "user";
      result.push({
        role: role,
        content: item["text"],
      });
    }
  } catch (e) {
    console.error("Cannot parse chat content.", e);
  }

  return result;
};

export const openaiHtmlChatContentParser: ChatContentParser = (
  chatData: string
) => {
  const html = parse(chatData);
  const items = html.querySelectorAll(".conversation-item");
  const result = [];
  for (let item of items) {
    const authorNode = item.querySelector(".author");
    const contentNode = item.querySelector(".conversation-content");
    let role: "ai" | "user" = "ai";
    if (authorNode?.classList.contains("user")) role = "user";
    result.push({
      role: role,
      content: contentNode?.innerHTML.trim() ?? "",
    });
  }
  return result;
};

export const openaiMdChatContentParser: ChatContentParser = (
  chatData: string
) => {
  const splitStrings = chatData.split(
    /(#### You:\r?\n|#### ChatGPT:\r?\n|#### Plugin.*\r?\n)/
  ); // the split strings will include the pattern if the regex include groups
  const result = [];
  // skip splitStrings[0] because it's the title
  for (let i = 1; i < splitStrings.length; i += 2) {
    const roleString = splitStrings[i];
    let role: "ai" | "user" = "ai";
    if (/#### You:\r?\n/.test(roleString)) role = "user";
    const message = splitStrings[i + 1].trim();
    result.push({
      role: role,
      content: message.trim(),
    });
  }
  return result;
};

export const customChatContentParser: ChatContentParser = (
  chatData: string
) => {
  return JSON.parse(chatData);
};

export const claudeMdChatContentParser: ChatContentParser = (
  chatData: string
) => {
  const splitStrings = chatData.split(/(## Prompt:\r?\n|## Response:\r?\n)/); // the split strings will include the pattern if the regex include groups
  const result = [];
  // skip splitStrings[0] because it is empty string
  for (let i = 1; i < splitStrings.length; i += 2) {
    const roleString = splitStrings[i];
    let role: "ai" | "user" = "ai";
    if (/## Prompt:\r?\n/.test(roleString)) role = "user";
    const message = splitStrings[i + 1].trim();
    if (message === "") continue;
    result.push({
      role: role,
      content: message.trim(),
    });
  }
  return result;
};

export const perplexityMdChatContentParser: ChatContentParser = (
  chatData: string
) => {
  const splitStrings = chatData.split(/(## User\r?\n|## AI answer\r?\n)/); // the split strings will include the pattern if the regex include groups
  const result = [];
  // skip splitStrings[0], which is "# Perplexity" title
  for (let i = 1; i < splitStrings.length; i += 2) {
    const roleString = splitStrings[i];
    let role: "ai" | "user" = "ai";
    if (/## User\r?\n/.test(roleString)) role = "user";
    const message = splitStrings[i + 1].trim();
    if (message === "") continue;
    result.push({
      role: role,
      content: message.trim(),
    });
  }
  return result;
};

export function getChatContentParser(source: ChatSource, format: ChatFormat) {
  if (source === "aoai") {
    return aoaiChatContentParser;
  } else if (source === "openai") {
    if (format === "html") return openaiHtmlChatContentParser;
    return openaiMdChatContentParser;
  } else if (source === "claude") {
    return claudeMdChatContentParser;
  } else if (source === "perplexity") {
    return perplexityMdChatContentParser;
  }
  return customChatContentParser;
}
