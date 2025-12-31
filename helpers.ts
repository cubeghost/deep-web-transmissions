import { marked } from "marked";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function sanitize(str: string) {
  return purify.sanitize(str);
}

export function markdownToHtml(str: string) {
  return sanitize(marked.parse(str, { async: false }));
}
