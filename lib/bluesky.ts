import { getStore } from "@netlify/blobs";
import { Jimp } from "jimp";

import type {
  FeedViewPost,
  PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import type { Embed, ImagesEmbed } from "@atproto/bsky/src/views/types";
import type { DidDocument } from "@atproto/identity";

import type { SocialSource } from "./entries.ts";

type BlueskySource = SocialSource & { type: "bluesky" };

type PostViewWithImagesEmbed = PostView & { record: { embed: ImagesEmbed } };

const PUBLIC_API_BASE = "https://public.api.bsky.app";
const PLC_DIRECTORY = "https://plc.directory";

export async function fetchBlueskyLatest(source: BlueskySource) {
  // @atproto/api breaks in production deno build so do it manually for now
  const url = new URL("/xrpc/app.bsky.feed.getAuthorFeed", PUBLIC_API_BASE);
  url.searchParams.append("actor", source.handle);
  url.searchParams.append("limit", "1");
  const response = await fetch(url.toString());

  const { feed } = (await response.json()) as { feed: FeedViewPost[] };

  const post = feed[0]?.post;

  const showImage = source.image && postHasImages(post);
  if (showImage) {
    const blobId = post.record.embed.images[0].image.ref.$link;

    const images = getStore("images");
    const cached = await images.getWithMetadata(source.id);

    if (!cached || cached.metadata.blobId !== blobId) {
      if (cached) await images.delete(source.id);

      const image = await fetchBlueskyBlob(post.author.did, blobId);
      await images.set(source.id, image, { metadata: { blobId } });
    }
  }

  return {
    result: post,
    image: showImage ? `/image/${source.id}.png` : undefined,
  };
}

function postHasImages(post: PostView): post is PostViewWithImagesEmbed {
  if (!("embed" in post.record)) return false;
  const embed = post.record.embed as Embed;
  return embed.$type === "app.bsky.embed.images";
}

async function fetchBlueskyBlob(did: string, blobId: string) {
  const idResponse = await fetch(new URL(`/${did}`, PLC_DIRECTORY).toString());
  const identity = (await idResponse.json()) as DidDocument;
  // https://github.com/bluesky-social/atproto/blob/9af7a2d12240e91248610ce4fe7d93387733c59c/packages/did/src/atproto.ts#L186-L198
  const pds = identity.service?.find(
    (service) => service.id === "#atproto_pds"
  );
  if (!pds) throw new Error(`no #atproto_pds found for ${did}`);
  if (typeof pds.serviceEndpoint !== "string")
    throw new Error("unhandled serviceEndpoint value");

  const blobUrl = new URL(
    "/xrpc/com.atproto.sync.getBlob",
    pds.serviceEndpoint
  );
  blobUrl.searchParams.append("did", did);
  blobUrl.searchParams.append("cid", blobId);
  const blobResponse = await fetch(blobUrl.toString());

  const image = await Jimp.fromBuffer(await blobResponse.arrayBuffer());
  image.resize({ w: 384 }); // TODO constant

  const buffer = await image.getBuffer("image/png");
  // convert Buffer to ArrayBuffer
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}
