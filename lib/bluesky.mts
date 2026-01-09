import { getStore } from "@netlify/blobs";
import { AtpAgent } from "@atproto/api";
import { DidResolver } from "@atproto/identity";
import {
  AtprotoIdentityDidMethods,
  DidDocument,
  extractPdsUrl,
} from "@atproto/did";
import { Jimp } from "jimp";

import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import type { Embed, ImagesEmbed } from "@atproto/bsky/src/views/types";

import type { SocialSource } from "./entries.mts";
import { toArrayBuffer } from "./helpers.mts";

type BlueskySource = SocialSource & { type: "bluesky" };

type PostViewWithImagesEmbed = PostView & { record: { embed: ImagesEmbed } };

const agent = new AtpAgent({
  service: "https://public.api.bsky.app",
});
const didres = new DidResolver({});

export async function fetchBlueskyLatest(source: BlueskySource) {
  const {
    data: { feed },
  } = await agent.getAuthorFeed({ actor: source.handle, limit: 1 });

  const post = feed[0]?.post;

  const showImage = source.image && postHasImages(post);
  let imagePath: string | undefined = undefined;
  if (showImage) {
    const blobId = post.record.embed.images[0].image.ref;

    const images = getStore("images");
    const cached = await images.getMetadata(source.id);

    if (!cached || cached.metadata.blobId !== blobId) {
      if (cached) await images.delete(source.id);
      const image = await fetchBlueskyBlob(post.author.did, blobId);
      await images.set(source.id, image, { metadata: { blobId } });
    }

    imagePath = `/image/${source.id}.png?${blobId}`;
  }

  return {
    result: post,
    image: imagePath,
  };
}

function postHasImages(post: PostView): post is PostViewWithImagesEmbed {
  if (!("embed" in post.record)) return false;
  const embed = post.record.embed as Embed;
  return embed.$type === "app.bsky.embed.images";
}

async function fetchBlueskyBlob(did: string, blobId: string) {
  const identity = await didres.resolve(did);
  if (!identity) throw new Error(`no identity resolved for ${did}`);
  const pds = extractPdsUrl(identity as DidDocument<AtprotoIdentityDidMethods>);

  const blobUrl = new URL("/xrpc/com.atproto.sync.getBlob", pds);
  blobUrl.searchParams.append("did", did);
  blobUrl.searchParams.append("cid", blobId);
  console.log(blobUrl);
  const blobResponse = await fetch(blobUrl.toString());

  const image = await Jimp.fromBuffer(await blobResponse.arrayBuffer());
  image.resize({ w: 384 }); // TODO constant

  const buffer = await image.getBuffer("image/png");
  return toArrayBuffer(buffer);
}
