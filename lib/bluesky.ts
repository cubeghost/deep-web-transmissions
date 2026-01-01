import { AtpAgent } from "@atproto/api";

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
