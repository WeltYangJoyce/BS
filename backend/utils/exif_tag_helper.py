# backend/utils/exif_tag_helper.py
from datetime import datetime

def generate_exif_tags(
    exif_time: str | None,
    width: int,
    height: int,
    gps_info: dict | None = None,
    device_info: dict | None = None,
    ai_labels: list[str] | None = None,   # 新增参数，AI 标签
):
    """
    根据 EXIF 信息 + AI 标签生成推荐标签（不入库）
    """
    tags = []

    # =============================
    # 📅 时间相关标签
    # =============================
    if exif_time:
        try:
            dt = datetime.strptime(exif_time, "%Y:%m:%d %H:%M:%S")
            tags.append(str(dt.year))           # 2024
            tags.append(dt.strftime("%Y-%m"))   # 2024-03

            hour = dt.hour
            if 6 <= hour < 12:
                tags.append("morning")
            elif 12 <= hour < 18:
                tags.append("afternoon")
            elif 18 <= hour < 24:
                tags.append("night")
            else:
                tags.append("midnight")
        except Exception:
            pass

    # =============================
    # 📐 分辨率 & 构图
    # =============================
    if width and height:
        if width >= 3840:
            tags.append("4K")
        elif width >= 1920:
            tags.append("HD")

        if width > height:
            tags.append("landscape")
        elif height > width:
            tags.append("portrait")
        else:
            tags.append("square")

    # =============================
    # 📍 GPS 规则型标签
    # =============================
    if gps_info:
        tags.append("location")
        tags.append("has_gps")
        lat = gps_info.get("lat")
        if lat is not None:
            if lat >= 0:
                tags.append("north_hemisphere")
            else:
                tags.append("south_hemisphere")

    # =============================
    # 📷 设备相关 Tag
    # =============================
    if device_info:
        make = device_info.get("make")
        model = device_info.get("model")

        if make:
            tags.append(make.lower())
        if model:
            tags.append(model.lower().replace(" ", "_"))
        if make or model:
            tags.append("device")

    # =============================
    # 🤖 AI 标签合并
    # =============================
    if ai_labels:
        tags.extend(ai_labels)

    return list(set(tags))  # 去重后返回
