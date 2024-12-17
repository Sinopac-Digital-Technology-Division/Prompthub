import type { RequestHandler } from "@sveltejs/kit";

import db from "$lib/server/db";

export let GET: RequestHandler = async ({ params, url }) => {
  if (!params.id)
    return new Response(JSON.stringify({ error: "missing 'id' parameter" }), {
      status: 400,
    });

  const preview = url.searchParams.get("preview") === "1";
  const res = db.getChatItem(params.id, preview);
  if (!preview) db.increaseChatViewCount(params.id);

  return new Response(JSON.stringify(res), { status: 200 });
};

export let DELETE: RequestHandler = async ({ params }) => {
  if (!params.id)
    return new Response(JSON.stringify({ error: "missing 'id' parameter" }), {
      status: 400,
    });

  db.deleteChatItem(params.id);
  return new Response(null, { status: 204 });
};

export let PUT: RequestHandler = async ({ request }) => {
  const data = await request.json();
  db.updateChatItem(data.id, data.data);
  return new Response(null, { status: 204 });
};
