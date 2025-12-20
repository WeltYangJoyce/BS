import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TagSelector from "../components/TagSelector";
import api from "../api/api";
import {
  moveCropBox,
  resizeCropBox,
  cropImageFree,
} from "../utils/cropUtils";

export default function EditImagePage() {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const PREVIEW_SIZE = 300;

  const cropBoxRef = useRef(null);

  const [originalUrl, setOriginalUrl] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);

  /** 裁剪框（preview 坐标） */
  const [cropBox, setCropBox] = useState({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
  });

  /** 原图真实尺寸 */
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });

  /** 旋转 / 翻转（可选） */
  const [rotate, setRotate] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  /** 滤镜（可选） */
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
  });

  /* ========================
     加载图片信息
  ======================== */
  useEffect(() => {
    api.get(`/images?image_id=${imageId}`).then((res) => {
      const img = res.data.images[0];
      if (!img) {
        alert("Image not found");
        navigate("/user");
        return;
      }
      const url = `http://localhost:5000${img.url}`;
      setOriginalUrl(url);
      setCurrentImageUrl(url);
      setTags(img.tags.join(","));
    });
  }, [imageId, navigate]);

  /* ========================
     读取原图尺寸 & GIF 提示
  ======================== */
  useEffect(() => {
    if (!currentImageUrl) return;

    const img = new Image();
    img.src = currentImageUrl;
    img.onload = () =>
      setImageNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

    if (currentImageUrl.toLowerCase().endsWith(".gif")) {
      alert("注意：裁剪 GIF 时，只会保留第一帧。");
    }

    setLoading(false);
  }, [currentImageUrl]);

  /* ========================
     上传新文件
  ======================== */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type === "image/gif") {
      alert("注意：裁剪 GIF 时，只会保留第一帧。");
    }

    setFile(selected);
    setCurrentImageUrl(URL.createObjectURL(selected));
    setLoading(true);
  };

  /* ========================
     拖动裁剪框（增量位移，防打滑）
  ======================== */
  const startMove = (e) => {
    e.preventDefault();
    let lastX = e.clientX;
    let lastY = e.clientY;

    const onMouseMove = (ev) => {
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      lastX = ev.clientX;
      lastY = ev.clientY;

      setCropBox((prev) =>
        moveCropBox(prev, dx, dy, PREVIEW_SIZE, PREVIEW_SIZE)
      );
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  /* ========================
     调整裁剪框大小（增量）
  ======================== */
  const startResize = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    let lastX = e.clientX;
    let lastY = e.clientY;

    const onMouseMove = (ev) => {
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      lastX = ev.clientX;
      lastY = ev.clientY;

      setCropBox((prev) =>
        resizeCropBox(prev, handle, dx, dy, PREVIEW_SIZE, PREVIEW_SIZE)
      );
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  /* ========================
     提交保存
  ======================== */
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const scaleX = imageNaturalSize.width / PREVIEW_SIZE;
      const scaleY = imageNaturalSize.height / PREVIEW_SIZE;

      const cropX = cropBox.x * scaleX;
      const cropY = cropBox.y * scaleY;
      const cropWidth = cropBox.width * scaleX;
      const cropHeight = cropBox.height * scaleY;

      const transformOptions =
        rotate || flipX || flipY ? { rotate, flipX, flipY } : undefined;

      const hasFilter =
        filters.brightness !== 100 ||
        filters.contrast !== 100 ||
        filters.saturate !== 100 ||
        filters.grayscale !== 0;

      const croppedBlob = await cropImageFree(
        currentImageUrl,
        { x: cropX, y: cropY, width: cropWidth, height: cropHeight },
        transformOptions,
        hasFilter ? filters : undefined
      );

      const blobFile = file
        ? new File([croppedBlob], file.name, { type: file.type })
        : new File([croppedBlob], "edited.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("tags", tags);
      formData.append("file", blobFile);

      await api.patch(`/images/${imageId}`, formData);
      alert("Edit success");
      navigate("/user");
    } catch (err) {
      console.error(err);
      alert("Edit failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40, maxWidth: 900 }}>
      <h2>Advanced Edit</h2>

      {/* 旋转 / 翻转 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => setRotate((r) => (r + 90) % 360)}>↻ Rotate</button>
        <button onClick={() => setFlipX((v) => !v)}>⇋ Flip X</button>
        <button onClick={() => setFlipY((v) => !v)}>⇅ Flip Y</button>
      </div>

      {/* 滤镜 */}
      <div style={{ marginBottom: 16 }}>
        {["brightness", "contrast", "saturate", "grayscale"].map((key) => (
          <label key={key} style={{ display: "block" }}>
            {key}: {filters[key]}%
            <input
              type="range"
              min={key === "grayscale" ? 0 : 0}
              max={key === "grayscale" ? 100 : 200}
              value={filters[key]}
              onChange={(e) =>
                setFilters({ ...filters, [key]: +e.target.value })
              }
            />
          </label>
        ))}
      </div>

      {/* 预览 */}
      <div style={{ display: "flex", gap: 20 }}>
        <img
          src={originalUrl}
          alt="Original"
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            objectFit: "contain",
            border: "1px solid #ccc",
          }}
        />

        <div
          style={{
            position: "relative",
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            border: "1px solid #ccc",
            overflow: "hidden",
          }}
        >
          <img
            src={currentImageUrl}
            alt="Preview"
            style={{
              width: PREVIEW_SIZE,
              height: PREVIEW_SIZE,
              objectFit: "contain",
              transform: `
                rotate(${rotate}deg)
                scaleX(${flipX ? -1 : 1})
                scaleY(${flipY ? -1 : 1})
              `,
              filter: `
                brightness(${filters.brightness}%)
                contrast(${filters.contrast}%)
                saturate(${filters.saturate}%)
                grayscale(${filters.grayscale}%)
              `,
              pointerEvents: "none",
            }}
          />

          {/* 裁剪框 */}
          <div
            ref={cropBoxRef}
            onMouseDown={startMove}
            style={{
              position: "absolute",
              top: cropBox.y,
              left: cropBox.x,
              width: cropBox.width,
              height: cropBox.height,
              border: "2px dashed #fff",
              background: "rgba(255,255,255,0.2)",
              cursor: "move",
            }}
          >
            {["top-left", "top-right", "bottom-left", "bottom-right"].map(
              (corner) => (
                <div
                  key={corner}
                  onMouseDown={(e) => startResize(e, corner)}
                  style={{
                    position: "absolute",
                    width: 12,
                    height: 12,
                    background: "#fff",
                    ...(corner.includes("top") ? { top: -6 } : { bottom: -6 }),
                    ...(corner.includes("left")
                      ? { left: -6 }
                      : { right: -6 }),
                    cursor: "nwse-resize",
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <input type="file" onChange={handleFileChange} />
      </div>

      <div style={{ marginTop: 20 }}>
        <TagSelector value={tags} onChange={setTags} />
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <button onClick={handleSubmit}>Save Changes</button>
        <button
          onClick={() => navigate("/user")}
          style={{ background: "#ccc", color: "#000" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
