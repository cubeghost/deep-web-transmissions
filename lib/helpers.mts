import { marked } from "marked";

export function markdownToHtml(str: string, inline = true) {
  const parsed = inline
    ? marked.parseInline(str, { async: false })
    : marked.parse(str, { async: false });
  return parsed;
}

export async function blobToBase64(blob: Blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function toArrayBuffer(input: Buffer | Uint8Array) {
  return input.buffer.slice(
    input.byteOffset,
    input.byteOffset + input.byteLength
  ) as ArrayBuffer;
}
