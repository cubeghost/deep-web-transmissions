import crypto from "node:crypto";
import type { Config } from "@netlify/functions";
import { getPrivateKeyPem } from "../lib/activitypub.mts";

export default async (request: Request) => {
  const url = Netlify.env.get("URL");

  const publicKeyObject = crypto.createPublicKey({
    key: getPrivateKeyPem(),
    format: "pem",
  });
  const publicKeyPem = publicKeyObject.export({ type: "spki", format: "pem" });

  return Response.json(
    {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      id: `${url}/actor`,
      type: "Application",
      preferredUsername: "deep-web-transmissions",
      inbox: `${url}/inbox`,
      publicKey: {
        id: `${url}/actor#main-key`,
        owner: `${url}/actor`,
        publicKeyPem: publicKeyPem,
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": `application/ld+json; profile="https://www.w3.org/ns/activitystreams"`,
        "Cache-Control": "public, s-maxage=60",
        // "Netlify-CDN-Cache-Control": "public, durable, max-age=86400",
      },
    },
  );
};

export const config: Config = {
  path: "/actor",
};
