export type ChatSource = "aoai" | "openai" | "claude" | "perplexity" | "custom";

export type ChatFormat = "text" | "md" | "html";

export interface ChatItemData {
  id: string;
  source: ChatSource;
  format: ChatFormat;
  title: string;
  description: string;
  content: string;
  addedTime?: string;
  viewCount: number;
  likeCount: number;
  username: string;
  tags: string[];
}

export type ChatMessageRole = "user" | "ai" | "system";

export type ChatMessage = { role: ChatMessageRole; content: string };

export type ChatContent = ChatMessage[];

export type ChatContentParser = (chatData: string) => ChatContent;

export interface ChatPreview {
  id: string;
  source: ChatSource;
  title: string;
  description: string;
  addedTime?: string;
  viewCount: number;
  likeCount: number;
  username: string;
  tags: string[];
}
