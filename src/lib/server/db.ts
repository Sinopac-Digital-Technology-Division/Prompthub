import Database from "better-sqlite3";
import fs from "node:fs";

import type { ChatItemData, ChatPreview } from "$lib/type";

// Create new DB if not exists
if (!fs.existsSync("db")) {
  fs.mkdirSync("db");
}
const db = new Database("db/main.db", { verbose: console.log });
db.pragma("journal_mode = WAL");

function addChatItem(
  id: string,
  source: string,
  format: string,
  title: string,
  description: string,
  tags: string[],
  content: string,
  username: string = "Anonymous"
) {
  const query = db.prepare(
    `INSERT INTO chats (id, source, format, title, description, content, username, addedTime)
    VALUES (?, ?, ?, ?, ?, ?, ?, DATETIME('now'))`
  );
  query.run(id, source, format, title, description, content, username);
  updateChatItem(id, { tags: JSON.stringify(tags) });
}

function updateChatItem(id: string, data: { [key: string]: any }) {
  // 'tags' field is handled separately
  if (data.hasOwnProperty("tags")) {
    updateChatTags(id, data["tags"]);
    delete data["tags"];
  }
  if (Object.keys(data).length === 0) return;

  let keyVals = [];
  let values = [];
  for (const key in data) {
    keyVals.push(`${key} = ?`);
    values.push(data[key]);
  }
  const query = db.prepare(
    `UPDATE chats SET ${keyVals.join(",")} WHERE id = ?`
  );
  query.run(...values, id);
}

function updateChatTags(id: string, tags: string[] = []) {
  db.prepare(`DELETE FROM chatTags WHERE chatId = ?`).run(id);
  for (const tag of tags) {
    // insert tag to tags
    addTag(tag);
    // update chat tags
    db.prepare(`INSERT INTO chatTags (tag, chatId) VALUES (?, ?)`).run(tag, id);
  }
}

function getChatItem(
  id: string,
  preview: boolean = false
): ChatItemData | ChatPreview {
  // if preview, content is not returned
  const query = preview
    ? `SELECT id, source, title, description, addedTime, viewCount, likeCount, username FROM chats WHERE id = ?`
    : `SELECT * FROM chats WHERE id = ?`;
  const chatItem = db.prepare(query).get(id) as ChatItemData;
  const tags = db
    .prepare(`SELECT tag FROM chatTags WHERE chatId = ?`)
    .all(id) as { tag: string }[];

  chatItem.tags = tags.map((t) => t.tag);
  return chatItem;
}

function deleteChatItem(id: string) {
  const query = db.prepare(`DELETE FROM chats WHERE id = ?`);
  query.run(id);
}

function increaseChatViewCount(id: string) {
  const query = db.prepare(
    `UPDATE chats SET viewCount = viewCount + 1 WHERE id = ?`
  );
  query.run(id);
}

function increaseChatLikeCount(id: string) {
  const query = db.prepare(
    `UPDATE chats SET likeCount = likeCount + 1 WHERE id = ?`
  );
  query.run(id);
}

function parseSearchInput(input: string): { tags: string[]; others: string[] } {
  input = decodeURI(input);
  const splitInputs = input.split(" ");
  const tags: string[] = [];
  const others: string[] = [];

  splitInputs.forEach((input) => {
    if (input.startsWith("#")) {
      tags.push(input.replace("#", ""));
    } else {
      others.push(input);
    }
  });

  return { tags, others };
}

function getChatIds(
  searchStr: string | null = null,
  tags: string[] = [],
  sortby: string = "time",
  ascending: number = 0,
  page: number = 0,
  pageSize: number = 20
): string[] {
  const params = [];
  let whereConditions = [];

  // search string
  if (searchStr !== null) {
    const splitSearch = parseSearchInput(searchStr);

    splitSearch["others"].forEach((searchStr) => {
      whereConditions.push("(title LIKE ? OR description LIKE ?)");
      params.push(`%${searchStr}%`, `%${searchStr}%`);
    });

    splitSearch["tags"].forEach((tag) => {
      whereConditions.push(
        "(id IN (SELECT chatId FROM chatTags WHERE tag IN (?)))"
      );
      params.push(tag);
    });
  }
  const descStatement = ascending === 1 ? "ASC" : "DESC";

  // tags
  if (tags.length > 0) {
    whereConditions.push(
      "id IN (SELECT chatId FROM chatTags WHERE tag IN (?))"
    );
    params.push(tags);
  }
  const whereStatement =
    whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

  let orderby = "";
  switch (sortby) {
    case "title":
      orderby = "title";
      break;
    case "time":
      orderby = "addedTime";
      break;
    case "likes":
      orderby = "likeCount";
      break;
    case "views":
    default:
      orderby = "viewCount";
      break;
  }

  const query = db.prepare(
    `SELECT id FROM chats
    ${whereStatement}
    ORDER BY ${orderby} ${descStatement}
    LIMIT ?
    OFFSET ?`
  );
  params.push(pageSize, (page - 1) * pageSize);
  return (query.all(...params) as { id: string }[]).map(({ id }) => id);
}

function getChatItemTotalAmount() {
  const query = db.prepare(`SELECT COUNT(*) AS amount FROM chats`);
  return query.get();
}

function searchTags(searchStr: string) {
  const query = db.prepare(
    `SELECT DISTINCT tag FROM tags WHERE tag LIKE ? LIMIT 5`
  );
  return query.all(`%${searchStr}%`) as string[];
}

function searchAllTags() {
  const query = db.prepare(`SELECT DISTINCT tag FROM tags`);
  return query.all() as string[];
}

function addTag(tag: string) {
  const query = db.prepare(`INSERT OR IGNORE INTO tags (tag) VALUES (?)`);
  query.run(tag);
}

export default {
  _db: db,
  addChatItem,
  getChatItem,
  updateChatItem,
  deleteChatItem,
  getChatIds,
  getChatItemTotalAmount,
  increaseChatViewCount,
  increaseChatLikeCount,
  searchTags,
  addTag,
  searchAllTags,
};
