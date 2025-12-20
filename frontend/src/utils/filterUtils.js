// utils/filterUtils.js

/**
 * 生成 canvas filter 字符串
 */
export function buildCanvasFilter({
  brightness = 100,
  contrast = 100,
  saturate = 100,
  grayscale = 0,
}) {
  return `
    brightness(${brightness}%)
    contrast(${contrast}%)
    saturate(${saturate}%)
    grayscale(${grayscale}%)
  `;
}
