declare module "https://esm.sh/html-to-image" {
  export * from "html-to-image";
}

declare module "https://esm.sh/sortablejs" {
  export { default } from "sortablejs";
  export * from "sortablejs";
}

declare module "https://esm.sh/canvas-dither" {
  class CanvasDither {
    grayscale(image: ImageData): ImageData;
    threshold(image: ImageData, threshold: number): ImageData;
    bayer(image: ImageData, threshold: number): ImageData;
    floydsteinberg(image: ImageData): ImageData;
    atkinson(image: ImageData): ImageData;
  }
  export = new CanvasDither();
}
