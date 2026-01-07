import CanvasDither from "https://esm.sh/canvas-dither";

/**
 * @param {HTMLImageElement} img 
 */
async function ditherImage(img) {
  if (!img.complete) {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  }
  const canvas = document.createElement("canvas");
  canvas.classList.add("dither");
  canvas.width = img.width;
  canvas.height = img.height;
  img.parentElement.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  const data = ctx.getImageData(0, 0, img.width, img.height);
  const dithered = CanvasDither.atkinson(data);
  ctx.putImageData(dithered, 0, 0);
}

export const ditherCheckbox = /** @type {HTMLInputElement} */ (document.getElementById('toggle-preview-dither'));

/** @typedef {InputEvent & { target: HTMLInputElement }} InputTargetEvent */
export function setupDitherCheckbox() {
  ditherCheckbox.addEventListener('change', async (/** @type {InputTargetEvent} */ event) => {
    if (event.target.checked) {
      await previewDither();
    } else {
      removeDither();
    }
  });
}

export async function previewDither() {
  const targets = document.querySelectorAll(".preview-dither");

  return await Promise.all(Array.from(targets, ditherImage));
}

export function removeDither() {
  document.querySelectorAll("canvas.dither").forEach((canvas) => {
    canvas.parentElement.removeChild(canvas);
  });
}

