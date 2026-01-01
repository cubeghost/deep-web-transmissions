import { marked } from "marked";

export function markdownToHtml(str: string, inline = true) {
  const parsed = inline
    ? marked.parseInline(str, { async: false })
    : marked.parse(str, { async: false });
  return parsed;
}
