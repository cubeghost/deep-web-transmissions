import fs from "node:fs/promises";
import { Eta } from "eta";

import { sources } from "./lib/entries.ts";
import { ETA_OPTIONS } from "./lib/eta.ts";

// compile partials
const partialEta = new Eta(ETA_OPTIONS);

const partialFunctions = sources
  .map((source) => {
    const partialPath = partialEta.resolvePath(`partials/${source.id}`);
    const partialString = partialEta.readFile(partialPath);
    const partialFn = partialEta.compile(partialString);
    return partialFn
      .toString()
      .replace("function anonymous", `function ${source.id}`);
  })
  .join("\n");

// register partials inside index
const functionHeader = sources
  .map((source) => `this.loadTemplate("@${source.id}", ${source.id});`)
  .join("\n");

const eta = new Eta({ ...ETA_OPTIONS, functionHeader });

// compile index
const indexPath = eta.resolvePath("index");
const templateString = eta.readFile(indexPath);
const templateFn = eta.compile(templateString);

const output =
  partialFunctions +
  "export default " +
  templateFn.toString().replace("`partials/${entry.id}`", "`@${entry.id}`");

await fs.writeFile("compiledTemplate.js", output);
