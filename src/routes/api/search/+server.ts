import type { RequestHandler } from "@sveltejs/kit";

import db from "$lib/server/db";

export let GET: RequestHandler = async ({ url }) => {
  // get by id
  const id = url.searchParams.get("id");
  if (id) {
    const res = db.getChatItem(id, true);
    return new Response(JSON.stringify(res), { status: 200 });
  }

  // get by complicated conditions
  const pageData = url.searchParams.get("p");
  let page: number = 1;
  if (pageData) page = parseInt(pageData);

  const res = db.getChatIds(
    url.searchParams.get("q"),
    [],
    url.searchParams.get("sortby") ?? "time",
    parseInt(url.searchParams.get("ascending") ?? "0"),
    page
  );
  return new Response(JSON.stringify(res), { status: 200 });
};
