import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export function sanitize(str: string) {
  return sanitizeHtml(str);
}

export function markdownToHtml(str: string, inline = true) {
  const parsed = inline
    ? marked.parseInline(str, { async: false })
    : marked.parse(str, { async: false });
  return sanitize(parsed);
}
