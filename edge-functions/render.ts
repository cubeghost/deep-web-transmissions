import type { Config, Context } from "@netlify/edge-functions";
import path from "node:path";
import { Eta, TemplateFunction } from "eta";
import { format } from "date-fns";

import { getEntries } from "../lib/entries.ts";
import { markdownToHtml } from "../lib/helpers.ts";
import { ETA_OPTIONS } from "../lib/eta.ts";

async function loadCompiledTemplate() {
  const { default: template } = await import("../compiledTemplate.js");
  return template as unknown as TemplateFunction;
}

export default async (request: Request, context: Context) => {
  const entries = await getEntries();

  const eta = new Eta(ETA_OPTIONS);
  const template =
    context.deploy.context === "dev" ? "index" : await loadCompiledTemplate();

  const html = await eta.renderAsync(template, {
    timestamp: format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
    entries,
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
