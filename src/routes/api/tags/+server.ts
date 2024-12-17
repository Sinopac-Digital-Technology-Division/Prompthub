import type { RequestHandler } from "@sveltejs/kit";

import db from "$lib/server/db";

export let GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get("q");
  if (!q) {
    const res = db.searchAllTags();
    return new Response(JSON.stringify(res), { status: 200 });
  }

  const res = db.searchTags(q);
  return new Response(JSON.stringify(res), { status: 200 });
};

export let PUT: RequestHandler = async ({ request }) => {
  const data = await request.json();
  db.addTag(data.tag);
  return new Response(null, { status: 204 });
};
