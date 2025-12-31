import LocalCache from "node-localcache";
import jsonld from "jsonld";
import { AtpAgent } from "@atproto/api";
import { tenPrintChr, tinyStarField } from "./generators.ts";

const bsky = new AtpAgent({
  service: "https://public.api.bsky.app",
});

const cache = LocalCache("tmp/.cache.json", false);

type Source =
  | {
      type: "twitter" | "bluesky" | "activitypub";
      id: string;
      url: string;
      handle: string;
      label?: string;
      credit?: string;
    }
  | {
      type: "generator";
      id: string;
      fn: () => string;
      name: string;
      label?: string;
      credit?: string;
    };

const sources: Source[] = [
  {
    type: "generator",
    id: "tinyStarField",
    fn: tinyStarField,
    name: "tiny star field",
    credit:
      "[tiny star field](https://elmcip.net/node/11678) by [everest pipkin](https://everest-pipkin.com/)",
  },
  // {
  //   screenName: "spacetravelbot",
  //   partialName: "spaceTraveler",
  //   defaultEnabled: true,
  // },
  // {
  //   screenName: "thelastdeck",
  //   partialName: "theLastDeck",
  //   // title: 'The Pictorial Bot To The Tarot',
  //   defaultEnabled: true,
  // },
  {
    type: "bluesky",
    id: "aStrangeVoyage",
    url: "https://bsky.app/profile/strangevoyage.bsky.social",
    handle: "strangevoyage.bsky.social",
    label: "a strange voyage",
    credit:
      "[a strange voyage](https://bsky.app/profile/strangevoyage.bsky.social) by joe baxter-webb",
  },
  {
    type: "activitypub",
    id: "smoothUnicode",
    url: "https://mas.to/@SmoothUnicode",
    handle: "SmoothUnicode@mas.to",
    credit:
      "[smooth unicode]() by [leonard richardson](https://www.crummy.com/)",
  },
  {
    type: "activitypub",
    id: "infiniteDeserts",
    url: "https://mastodon.social/@infinitedeserts",
    handle: "infinitedeserts@mastodon.social",
    label: "infinite deserts",
  },
  // {
  //   screenName: "phantomfunhouse",
  //   partialName: "phantomFunhouse",
  // },
  {
    type: "generator",
    id: "tenPrintChr",
    fn: tenPrintChr,
    name: "10 PRINT CHR$",
  },
  // {
  //   screenName: "pomological",
  //   partialName: "fruitPictures",
  // },
  {
    type: "bluesky",
    id: "boschBot",
    url: "https://bsky.app/profile/boschbot.bsky.social",
    handle: "boschbot.bsky.social",
    label: "Bits of Bosch",
  },
];

async function fetchJsonLD(url, headers) {
  const response = await fetch(url, {
    headers,
  });
  const document = await response.json();
  return await jsonld.compact(document, document["@context"]);
}

async function fetchActivityPub(source: Source & { type: "activitypub" }) {
  const headers = {
    "User-Agent": "DeepWebTransmissions/2.0",
    Accept: "application/activity+json",
  };
  // TODO cache outbox url
  const profile = await fetchJsonLD(source.url, headers);
  const outbox = await fetchJsonLD(profile.outbox, headers);

  const url = outbox.first;
  const posts = await fetchJsonLD(url, headers);
  return posts.orderedItems;
}

async function getEntry(source: Source) {
  switch (source.type) {
    case "activitypub": {
      const posts = await fetchActivityPub(
        source as Source & { type: "activitypub" }
      );
      return {
        ...source,
        object: posts[0].object,
      };
    }
    case "bluesky": {
      const {
        data: { feed },
      } = await bsky.getAuthorFeed({
        actor: source.handle,
        limit: 5,
      });
      return {
        ...source,
        object: feed[1].post,
      };
    }
    case "generator": {
      return {
        ...source,
        fn: null,
        object: source.fn(),
      };
    }
    default:
      return { ...source };
  }
}

export async function getEntries() {
  // const cachedEntries = cache.getItem("entries");
  // const cacheTime = cache.getItem("timestamp");
  // if (cachedEntries && Date.now() - cacheTime < 60 * 1000) {
  //   console.log("entries:cache:hit");
  //   return cachedEntries;
  // }

  const entries = await Promise.all(sources.map(getEntry));
  // console.log("entries:cache:miss");
  // cache.setItem("entries", entries);
  // cache.setItem("timestamp", Date.now());
  return entries;
}
