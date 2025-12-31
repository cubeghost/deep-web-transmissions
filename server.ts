import "dotenv/config.js";

import path from "node:path";
import express from "express";
import { Eta } from "eta";
import { format } from "date-fns";

import { getEntries } from "./entries.ts";
import { sanitize, markdownToHtml } from "./helpers.ts";

const eta = new Eta({
  views: path.resolve(process.cwd(), "views"),
  defaultExtension: ".eta.html",
  useWith: true,
});

const app = express();

app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const entries = await getEntries();
    const html = await eta.renderAsync("index", {
      timestamp: format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
      entries,
      sanitize,
      markdownToHtml,
    });
    res.send(html);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

const server = app.listen(+(process.env.PORT ?? 3000), () => {
  console.log("Your app is listening on port " + server.address().port);
});
