/**
 * implement 10 PRINT CHR$(205.5+RND(1)); : GOTO 10 (https://10print.org/)
 * in a 10x10 grid like https://twitter.com/10_print_chr
 */
const SLASHES = ["╲", "╱"]; // box drawing characters
export function tenPrintChr() {
  let str = "";
  for (let i = 1; i <= 100; i++) {
    const charIndex = Math.random() >= 0.5 ? 1 : 0;
    str += SLASHES[charIndex];
    if (i % 10 === 0 && i < 100) str += "\n";
  }
  return str;
}

/**
 * tiny star field, based on everest pipkin's original source code
 * https://elmcip.net/creative-work/tiny-star-fields
 * https://collection.eliterature.org/3/files/tiny-star-fields/tiny-star-fields.js
 */
const STAR_ARRAY = ["* ", " . ", " . ", ". ", " + ", " * ", "✵  ", "✷  ", "* ", " . ", "* ", ".", " . ", "    ", " ˚ ", " ·", " · ", "· ", " ˚ ", " · ", " ·", "·  ", ".", ". ", " ✧", " ✫ ", " ⊹ ", " *", " ⋆ ", " ✺ ", " ✹ ", " ✵ ", " ˚ ", " ✦ ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " 　", " ", "", " ", " ", " ", "　  　", " ", " ", " ", " ", " ", "　", "　", " 　", "　", " 　　", "　", "  　", "　", " 　", "　", "　　", "　", "　", "　　", "　", "　", "　 ", "　　", "　", "　　", "　　　", "　", "　", "　　", "　", "　", "　　　", "　", "　", "　　", "　", "　　　　", "　", "　　　　　", "　　 ", "　　 ", "　 ", " ", "　　　　", "  ", " ", "     ", "   ", "     ", "   ", " "]; // prettier-ignore
export function tinyStarField() {
  const lineCount = Math.floor(Math.random() * 4) + 4;
  const lines: string[] = [];
  for (let i = 0; i < lineCount; i++) {
    const choices = Math.floor(Math.random() * 5) + 5;
    let line = "";
    for (let j = 0; j < choices; j++) {
      line += STAR_ARRAY[Math.floor(Math.random() * STAR_ARRAY.length)];
    }
    lines.push(line);
  }
  return lines.join("\n").trimEnd();
}
