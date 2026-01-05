/**
 * Private datasets stored in S3-compatible object store
 */

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getStore } from "@netlify/blobs";

import { toArrayBuffer } from "./helpers.mts";

function getS3Client() {
  return new S3Client({
    endpoint: Netlify.env.get("S3_ENDPOINT")!,
    region: Netlify.env.get("S3_REGION")!,
    credentials: {
      accessKeyId: Netlify.env.get("S3_ACCESS_KEY_ID")!,
      secretAccessKey: Netlify.env.get("S3_SECRET_ACCESS_KEY")!,
    },
  });
}

async function getDefinition<T>(path: string) {
  const store = getStore("definitions");
  const cached = await store.getWithMetadata(path, {
    type: "json",
  });

  if (!cached || (cached.metadata.expiresAt as number) <= Date.now()) {
    if (cached) await store.delete(path);

    const client = getS3Client();
    const definition = await client.send(
      new GetObjectCommand({
        Bucket: Netlify.env.get("S3_BUCKET")!,
        Key: path,
      })
    );
    if (!definition.Body) throw new Error("todo");
    const json = await definition.Body.transformToString();
    const data = JSON.parse(json);
    await store.setJSON(path, data, {
      metadata: { expiresAt: Date.now() + 60 * 60 * 1000 },
    });

    return data as T;
  } else {
    return cached.data as T;
  }
}

const SUITS = ["self", "tech", "cosmos", "gravity"] as const;
interface Card {
  filename: string;
  suit: typeof SUITS | null;
  text: {
    [K in (typeof SUITS)[number]]: string;
  };
}

export async function phantomFunhouse() {
  const { cards } = await getDefinition<{ cards: Card[] }>(
    "phantom_funhouse/oracle.json"
  );

  const card = cards[Math.floor(Math.random() * cards.length)];
  const { filename, text } = card;

  const textSuit = SUITS[Math.floor(Math.random() * 4)];

  const images = getStore("images");
  const cached = await images.getMetadata("phantomFunhouse");

  if (!cached || cached.metadata.filename !== filename) {
    const client = getS3Client();
    const imageObject = await client.send(
      new GetObjectCommand({
        Bucket: Netlify.env.get("S3_BUCKET")!,
        Key: `phantom_funhouse/${filename}`,
      })
    );
    if (!imageObject.Body) throw new Error("");
    const buffer = await imageObject.Body.transformToByteArray();
    const image = toArrayBuffer(buffer);

    await images.set("phantomFunhouse", image, { metadata: { filename } });
  }

  return {
    text: text[textSuit],
    image: `/image/phantomFunhouse.png?${filename.replace(".png", "")}`,
  };
}
