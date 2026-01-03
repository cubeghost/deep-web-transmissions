import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const id = context.params.id;
  const images = getStore("images");
  const blob = await images.get(id, {
    type: "stream",
  });

  if (blob) {
    return new Response(blob);
  } else {
    return new Response("Not found", {
      status: 404,
    });
  }
};

export const config: Config = {
  cache: "manual",
  path: "/image/:id.png",
};
