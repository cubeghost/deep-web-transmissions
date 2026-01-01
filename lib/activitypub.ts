import jsonld from "jsonld";
import type { Options as JLDOptions } from "jsonld";
import type {
  APPerson,
  APOrderedCollection,
  APOrderedCollectionPage,
  APObject,
  APActivity,
} from "activitypub-types";
import type { SocialSource } from "./entries.ts";

type ActivityPubSource = SocialSource & { type: "activitypub" };

export function isAPActivity(object: APObject): object is APActivity {
  return "object" in object && "actor" in object;
}

const customDocumentLoader: JLDOptions.DocLoader["documentLoader"] =
  async function customDocumentLoader(url, callback) {
    const response = await fetch(url, {
      headers: {
        accept: "application/ld+json, application/json",
      },
    });
    if (!response.ok)
      throw new Error(`jsonld document fetch error ${response.status}`);
    const document = {
      contextUrl: undefined,
      documentUrl: url,
      document: await response.json(),
    };
    // todo handle redirects, alternates etc https://github.com/digitalbazaar/jsonld.js/blob/main/lib/documentLoaders/node.js
    return document;
  };

async function fetchJsonLD<T>(url: string, headers: Record<string, string>) {
  const response = await fetch(url, {
    headers,
  });
  const document = await response.json();
  return (await jsonld.compact(document, document["@context"], {
    documentLoader: customDocumentLoader,
  })) as unknown as T;
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

export async function fetchActivityPubLatest(source: ActivityPubSource) {
  const activity = await fetchActivity(source);
  return activity?.[0]?.object;
}
