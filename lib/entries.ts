import { fetchBlueskyLatest } from "./bluesky.ts";
import { fetchActivityPubLatest } from "./activitypub.ts";
import { tenPrintChr, tinyStarField } from "./generators.ts";

export interface SocialSource {
  id: string;
  url: string;
  handle: string;
  label?: string;
  credit?: string;
}

export type Source =
  | (SocialSource & { type: "bluesky" })
  | (SocialSource & { type: "activitypub" })
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

async function getEntry(source: Source) {
  switch (source.type) {
    case "activitypub": {
      const result = await fetchActivityPubLatest(source);
      console.log(result);
      return {
        ...source,
        result,
      };
    }
    case "bluesky": {
      const result = await fetchBlueskyLatest(source);
      return {
        ...source,
        result,
      };
    }
    case "generator": {
      return {
        ...source,
        fn: null,
        result: source.fn(),
      };
    }
    default:
      throw new Error("Exhaustive switch");
  }
}

export async function getEntries() {
  return await Promise.all(sources.map(getEntry));
}
