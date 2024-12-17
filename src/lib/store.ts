import { persisted } from "svelte-persisted-store";

export const userInfo = persisted<{ username: string }>("userInfo", {
  username: "Anonymous",
});

export const browsePagePref = persisted<{ sortby: string }>(
  "browsePagePreferences",
  {
    sortby: "views",
  }
);

export const isPinned = persisted<{ [id: string]: true }>("isPinned", {});
