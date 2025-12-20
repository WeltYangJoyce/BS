// utils/cropUtils.js
import { transformImage } from "./transformUtils";

/**
 * 限制裁剪框在图片边界内
 */
export function clampCropBox(cropBox, imgWidth, imgHeight) {
  return {
    x: Math.max(0, Math.min(cropBox.x, imgWidth - cropBox.width)),
    y: Math.max(0, Math.min(cropBox.y, imgHeight - cropBox.height)),
    width: cropBox.width,
    height: cropBox.height,
  };
}

/**
 * 移动裁剪框
 */
export function moveCropBox(cropBox, dx, dy, imgWidth, imgHeight) {
  return clampCropBox(
    { ...cropBox, x: cropBox.x + dx, y: cropBox.y + dy },
    imgWidth,
    imgHeight
  );
}

/**
 * 调整裁剪框大小
 */
export function resizeCropBox(cropBox, handle, dx, dy, imgWidth, imgHeight, minSize = 50) {
  let box = { ...cropBox };

  switch (handle) {
    case "top-left":
      box.x = Math.min(box.x + dx, box.x + box.width - minSize);
      box.y = Math.min(box.y + dy, box.y + box.height - minSize);
      box.width -= dx;
      box.height -= dy;
      break;
    case "top-right":
      box.y = Math.min(box.y + dy, box.y + box.height - minSize);
      box.width += dx;
      box.height -= dy;
      break;
    case "bottom-left":
      box.x = Math.min(box.x + dx, box.x + box.width - minSize);
      box.width -= dx;
      box.height += dy;
      break;
    case "bottom-right":
      box.width += dx;
      box.height += dy;
      break;
    case "top":
      box.y += dy;
      box.height -= dy;
      break;
    case "bottom":
      box.height += dy;
      break;
    case "left":
      box.x += dx;
      box.width -= dx;
      break;
    case "right":
      box.width += dx;
      break;
  }

  box.width = Math.max(minSize, box.width);
  box.height = Math.max(minSize, box.height);

  return clampCropBox(box, imgWidth, imgHeight);
}

/**
 * 裁剪图片（支持旋转 / 翻转）
 */


/**
 * 兼容老版本的裁剪函数
 * @param imageSrc
 * @param cropBox
 * @param transformOptions 可选 { rotate, flipX, flipY }
 */
// utils/cropUtils.js

import { buildCanvasFilter } from "./filterUtils";

export function cropImageFree(imageSrc, cropBox, transformOptions, filterOptions) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      // 1️⃣ 旋转 / 翻转
      const source = transformOptions
        ? transformImage(image, transformOptions)
        : image;

      const canvas = document.createElement("canvas");
      canvas.width = cropBox.width;
      canvas.height = cropBox.height;
      const ctx = canvas.getContext("2d");

      // 2️⃣ 滤镜（兼容老版本）
      if (filterOptions) {
        ctx.filter = buildCanvasFilter(filterOptions);
      }

      // 3️⃣ 裁剪
      ctx.drawImage(
        source,
        cropBox.x,
        cropBox.y,
        cropBox.width,
        cropBox.height,
        0,
        0,
        cropBox.width,
        cropBox.height
      );

      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    };

    image.onerror = () => reject("Failed to load image");
  });
}
