import type { RequestHandler } from "@sveltejs/kit";
import * as crypto from "crypto";

import { getChatContentParser } from "$lib/chatContentParsers";
import db from "$lib/server/db";

export let POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  try {
    if (!data.content) throw new Error("Missing field content");
    let source = data.source ?? "custom";
    let format = data.format ?? "md";
    let title = data.title ?? "New chat";
    let description = data.description ?? "No description";
    let username = data.username ?? "Anonymous";
    let tags = data.tags ?? [];

    const parser = getChatContentParser(source, format);
    const chatContent = JSON.stringify(parser(data.content));
    const hashableContent = source + format + title + description + chatContent;
    const id = crypto
      .createHash("sha256")
      .update(hashableContent)
      .digest("hex");
    db.addChatItem(
      id,
      source,
      format,
      title,
      description,
      tags,
      chatContent,
      username
    );

    return new Response(JSON.stringify({ id }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
};
