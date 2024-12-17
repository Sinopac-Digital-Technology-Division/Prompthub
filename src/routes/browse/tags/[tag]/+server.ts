import type { RequestHandler } from "@sveltejs/kit";

import db from "$lib/server/db";

export let GET: RequestHandler = async ({ params, url }) => {
  const res = db.getChatIds(null, [params.tag as string]);
  return new Response(JSON.stringify(res), { status: 200 });
};
