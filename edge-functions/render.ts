// @ts-expect-error
if (typeof global === undefined) {
  // @ts-expect-error
  globalThis.global = globalThis;
}

import type { Config, Context } from "@netlify/edge-functions";
import path from "node:path";
import { Eta } from "eta";
import { format } from "date-fns";

import { getEntries } from "../lib/entries.ts";
import { sanitize, markdownToHtml } from "../lib/helpers.ts";

export default async (request: Request, context: Context) => {
  const entries = await getEntries();

  const eta = new Eta({
    views: path.resolve(process.cwd(), "views"),
    defaultExtension: ".eta.html",
    useWith: true,
  });

  const html = await eta.renderAsync("index", {
    timestamp: format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
    entries,
    sanitize,
    markdownToHtml,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, s-maxage=300",
    },
  });
};

export const config: Config = {
  cache: "manual",
  path: "/",
};
