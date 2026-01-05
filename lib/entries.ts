import { getStore } from "@netlify/blobs";

import { fetchBlueskyLatest } from "./bluesky.ts";
import { fetchActivityPubLatest } from "./activitypub.ts";
import { tenPrintChr, tinyStarField } from "./generators.ts";
import { phantomFunhouse } from "./private.ts";

export interface SocialSource {
  id: string;
  url: string;
  handle: string;
  image?: boolean;
  label?: string;
  credit?: string;
}

type GeneratorReturnType = string | Record<string, unknown>;

export type Source =
  | (SocialSource & { type: "bluesky" })
  | (SocialSource & { type: "activitypub" })
  | {
      type: "generator";
      id: string;
      fn: () => GeneratorReturnType | Promise<GeneratorReturnType>;
      name: string;
      label?: string;
      credit?: string;
    };

export const sources: Source[] = [
  {
    type: "generator",
    id: "tinyStarField",
    fn: tinyStarField,
    name: "tiny star field",
    credit:
      "[tiny star field](https://elmcip.net/node/11678) by [everest pipkin](https://everest-pipkin.com/)",
  },
  {
    type: "generator",
    id: "phantomFunhouse",
    fn: phantomFunhouse,
    name: "Uncle Buddy's Phantom Funhouse Oracle",
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
      "[smooth unicode](https://mas.to/@SmoothUnicode) by [leonard richardson](https://www.crummy.com/)",
  },
  {
    type: "activitypub",
    id: "infiniteDeserts",
    url: "https://mastodon.social/@infinitedeserts",
    handle: "infinitedeserts@mastodon.social",
    label: "infinite deserts",
    credit:
      "[infinite deserts](https://mastodon.social/@infinitedeserts) by [@getdizzzy]()",
  },
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
    image: true,
    url: "https://bsky.app/profile/boschbot.bsky.social",
    handle: "boschbot.bsky.social",
    label: "Bits of Bosch",
    credit: "[boschbot](https://bsky.app/profile/boschbot.bsky.social) by ",
  },
];

async function getEntry(source: Source) {
  switch (source.type) {
    case "activitypub": {
      const result = await fetchActivityPubLatest(source);
      return {
        ...source,
        result,
      };
    }
    case "bluesky": {
      const { result, image } = await fetchBlueskyLatest(source);
      return {
        ...source,
        result,
        image,
      };
    }
    case "generator": {
      const result = await source.fn();
      return {
        ...source,
        fn: null,
        result,
      };
    }
    default:
      throw new Error("Exhaustive switch");
  }
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export async function getEntries() {
  const store = getStore("entries");
  const cached = await store.getWithMetadata("index", {
    type: "json",
  });
  const expiresAt = cached?.metadata.expiresAt as number;

  if (!cached || Date.now() >= expiresAt) {
    const entries = await Promise.all(sources.map(getEntry));
    await store.setJSON("index", entries, {
      metadata: { expiresAt: Date.now() + FIVE_MINUTES_MS },
    });
    return entries;
  } else {
    return cached.data;
  }
}
