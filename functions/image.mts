import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  if (!checkOrigin(request, context)) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

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
  path: "/image/:id.png",
};

function checkOrigin(request: Request, context: Context) {
  const referer = request.headers.get("referer");
  if (!referer) return true;

  const refererOrigin = new URL(referer).origin;
  return refererOrigin === context.url.origin;
}
