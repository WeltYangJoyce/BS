from PIL import Image, ImageSequence

def create_thumbnail(
    src_path: str,
    dst_path: str,
    max_size: int = 256,
    quality: int = 80
):
    """
    创建缩略图：
    - GIF：只取第一帧
    - PNG / JPG：正常处理
    - 输出 JPEG
    - 保持比例
    """
    img = Image.open(src_path)

    # === GIF：只取第一帧 ===
    if getattr(img, "is_animated", False):
        img = next(ImageSequence.Iterator(img))

    # === 转 RGB（防止 PNG / GIF 的透明问题） ===
    img = img.convert("RGB")

    width, height = img.size
    ratio = min(max_size / width, max_size / height, 1.0)

    new_size = (
        int(width * ratio),
        int(height * ratio)
    )

    thumb = img.resize(new_size, Image.LANCZOS)
    thumb.save(dst_path, format="JPEG", quality=quality, optimize=True)
