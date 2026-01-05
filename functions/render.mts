import path from "node:path";
import type { Config, Context } from "@netlify/functions";
import { Eta } from "eta";

import { getEntries } from "../lib/entries.mts";
import { markdownToHtml } from "../lib/helpers.mts";

export default async (request: Request, context: Context) => {
  const entries = await getEntries();

  const eta = new Eta({
    views: path.resolve(process.cwd(), "views"),
    defaultExtension: ".eta.html",
  });

  const html = await eta.renderAsync("index", {
    entries,
    markdownToHtml,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, s-maxage=60",
      // TODO use durable caching, but it has to sync with the expiresAt metadata on the entries blob cache https://docs.netlify.com/build/caching/caching-overview/#durable-directive
    },
  });
};

export const config: Config = {
  path: "/",
};
