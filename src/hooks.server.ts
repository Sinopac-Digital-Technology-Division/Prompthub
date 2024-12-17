import Database from "better-sqlite3";
import fs from "node:fs";

// Create new DB if not exists
if (!fs.existsSync("db")) {
  fs.mkdirSync("db");
}
const db = new Database("db/main.db", { verbose: console.log });
db.pragma("journal_mode = WAL");

console.log("Init DB...");

// Create tables
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT NOT NULL PRIMARY KEY,
    source TEXT,
    format TEXT,
    title TEXT,
    description TEXT,
    content TEXT,
    addedTime DATETIME,
    username TEXT DEFAULT 'Anonymous',
    viewCount INTEGER DEFAULT 0,
    likeCount INTEGER DEFAULT 0
  )
`
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS chatTags (
    tag TEXT NOT NULL,
    chatId TEXT NOT NULL
  )
`
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS tags (
    tag TEXT UNIQUE NOT NULL
  )
`
).run();
