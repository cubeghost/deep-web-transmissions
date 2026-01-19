import jsonld from "jsonld";
import type {
  APPerson,
  APOrderedCollection,
  APOrderedCollectionPage,
  APObject,
  APActivity,
  AnyAPObject,
  AttachmentField,
} from "activitypub-types";

import type { SocialSource } from "./entries.mts";
import { getStore } from "@netlify/blobs";
import { Jimp } from "jimp";
import { toArrayBuffer } from "./helpers.mts";

type ActivityPubSource = SocialSource & { type: "activitypub" };

function isAPActivity(object: APObject): object is APActivity {
  return "object" in object && "actor" in object;
}

function getUrlHref(url: APObject["url"]) {
  if (typeof url === "string") return url;
  if (Array.isArray(url)) return getUrlHref(url[0]);
  if (url && "href" in url) return url.href;
}

function getAttachmentUrl(attachment: APObject["attachment"]) {
  if (typeof attachment === "string") return attachment;
  if (Array.isArray(attachment)) return getAttachmentUrl(attachment[0]);
  if (attachment && "url" in attachment) return attachment.url;
}

async function fetchJsonLD<T>(url: string, headers: Record<string, string>) {
  const response = await fetch(url, {
    headers,
  });
  const document = await response.json();
  return (await jsonld.compact(document, document["@context"])) as unknown as T;
}

async function fetchActivity(source: ActivityPubSource) {
  const headers = {
    "User-Agent": "DeepWebTransmissions/2.0",
    Accept: "application/activity+json",
  };

  // TODO maybe cache outbox url, seems unlikely to change? check spec though
  const profile = await fetchJsonLD<APPerson>(source.url, headers);
  if (typeof profile.outbox !== "string") {
    console.log(profile);
    throw new Error(`expected Person "outbox" field to be a string`);
  }
  const outbox = await fetchJsonLD<APOrderedCollection>(
    profile.outbox,
    headers
  );
  if (typeof outbox.first !== "string") {
    console.log(outbox);
    throw new Error(`expected OrderedCollection "first" field to be a string`);
  }

  const posts = await fetchJsonLD<APOrderedCollectionPage>(
    outbox.first,
    headers
  );

  return posts.orderedItems
    ?.filter((item) => typeof item !== "string")
    .filter(isAPActivity);
}

async function fetchActivityPubImage(url: string) {
  const blobResponse = await fetch(url);
  console.log(blobResponse.headers);

  const image = await Jimp.fromBuffer(await blobResponse.arrayBuffer());
  image.resize({ w: 384 }); // TODO constant

  const buffer = await image.getBuffer("image/jpeg");
  return toArrayBuffer(buffer);
}

export async function fetchActivityPubLatest(source: ActivityPubSource) {
  const activity = await fetchActivity(source);
  const post = activity?.[0]?.object as AnyAPObject;

  const imageUrl = getUrlHref(getAttachmentUrl(post?.attachment));
  const showImage = source.image && imageUrl;
  let imagePath: string | undefined = undefined;
  if (showImage) {
    const localPostId = post.id!.split("/").slice(-1)[0];

    const images = getStore("images");
    const cached = await images.getMetadata(source.id);

    if (!cached || cached.metadata.url !== imageUrl) {
      if (cached) await images.delete(source.id);
      const image = await fetchActivityPubImage(imageUrl);
      await images.set(source.id, image, { metadata: { url: imageUrl } });
    }

    imagePath = `/image/${source.id}?${localPostId}`;
  }

  return {
    result: post,
    image: imagePath,
  };
}
