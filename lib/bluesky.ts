// import { AtpAgent } from "@atproto/api";

import type { SocialSource } from "./entries.ts";

// const agent = new AtpAgent({
//   service: "https://public.api.bsky.app",
// });

type BlueskySource = SocialSource & { type: "bluesky" };

const PUBLIC_API_BASE = "https://public.api.bsky.app";

export async function fetchBlueskyLatest(source: BlueskySource) {
  // const {
  //   data: { feed },
  // } = await agent.getAuthorFeed({
  //   actor: source.handle,
  //   limit: 1,
  // });

  // @atproto/api breaks in production deno build so do it manually for now
  const url = new URL("/xrpc/app.bsky.feed.getAuthorFeed", PUBLIC_API_BASE);
  url.searchParams.append("actor", source.handle);
  url.searchParams.append("limit", "1");
  const response = await fetch(url.toString());

  const feed = await response.json();

  return feed[0]?.post;
}
