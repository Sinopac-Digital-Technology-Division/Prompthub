import fs from "fs";

import type { PageServerLoad } from "../../$types";

export let load: PageServerLoad = ({ params }) => {
  const script = fs.readFileSync("src/data/shareAOAI.js", "utf8");
  return {
    shareAoaiScript: "javascript:" + script,
  };
};
