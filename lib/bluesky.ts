import atproto from "@atproto/api";
const { AtpAgent } = atproto;
// console.log(Object.getOwnPropertyNames(atproto));
console.log(AtpAgent);
// import { Agent } from "@atproto/api";
// console.log(Agent);

import { SocialSource } from "./entries.ts";

const agent = new AtpAgent({
  service: "https://public.api.bsky.app",
});

type BlueskySource = SocialSource & { type: "bluesky" };

export async function fetchBlueskyLatest(source: BlueskySource) {
  const {
    data: { feed },
  } = await agent.getAuthorFeed({
    actor: source.handle,
    limit: 1,
  });

  return feed[0]?.post;
}
