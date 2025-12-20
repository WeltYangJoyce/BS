// utils/transformUtils.js

/**
 * 对 image 进行旋转 / 翻转并返回 canvas
 */
export function transformImage(image, options = {}) {
  const {
    rotate = 0,      // 0 / 90 / 180 / 270
    flipX = false,   // 水平翻转
    flipY = false,   // 垂直翻转
  } = options;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const rad = (rotate * Math.PI) / 180;
  const swapSize = rotate % 180 !== 0;

  canvas.width = swapSize ? image.height : image.width;
  canvas.height = swapSize ? image.width : image.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

  ctx.drawImage(
    image,
    -image.width / 2,
    -image.height / 2
  );

  return canvas;
}
