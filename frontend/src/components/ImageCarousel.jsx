import { useEffect, useState, useRef } from "react";
import "../style/image-carousel.css";

export default function ImageCarousel({ images = [] }) {
  const [index, setIndex] = useState(1); // 当前显示的真实图片索引
  const [dragStartX, setDragStartX] = useState(null);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);
  const backendUrl = "http://localhost:5000";

  if (!images.length) return null;

  // 构建循环数组：首尾补位实现无缝循环
  const loopImages = images.length > 1
    ? [images[images.length - 1], ...images, images[0]]
    : images;

  // 自动轮播
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => goTo(index + 1), 3000);
    return () => clearInterval(timer);
  }, [index, images]);

  // 统一更新 transform
  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = dragging ? "none" : "transform 0.5s ease-in-out";
    trackRef.current.style.transform = `translateX(-${index * 100}%)`;
  }, [index, dragging]);

  // 无缝循环处理（首尾补位特判）
  useEffect(() => {
    if (!trackRef.current || images.length <= 1) return;

    const handleTransitionEnd = () => {
      if (!trackRef.current) return;
      let newIndex = index;

      // 特判：到首尾补位，立即跳转到真实图片
      if (index === 0) newIndex = images.length;          // 从首补位滑动到真实最后一张
      else if (index >= images.length + 1) newIndex = 1; // 从尾补位滑动到真实第一张

      if (newIndex !== index) {
        trackRef.current.style.transition = "none"; // 关闭动画
        setIndex(newIndex);                         // 仅更新 index，transform 由 useEffect 更新
      }
    };

    const track = trackRef.current;
    track.addEventListener("transitionend", handleTransitionEnd);
    return () => track.removeEventListener("transitionend", handleTransitionEnd);
  }, [index, images.length]);

  // 切换到指定图片
  const goTo = (newIndex) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = "transform 0.5s ease-in-out";
    setIndex(newIndex);
  };

  // 拖拽逻辑
  const startDrag = (clientX) => {
    setDragStartX(clientX);
    setDragging(true);
    if (trackRef.current) trackRef.current.style.transition = "none";
  };

  const moveDrag = (clientX) => {
    if (!dragging || dragStartX === null || !trackRef.current) return;
    const diff = clientX - dragStartX;
    trackRef.current.style.transform = `translateX(${-index * 100 + (diff / trackRef.current.offsetWidth) * 100}%)`;
  };

  const endDrag = (clientX) => {
    if (!dragging || dragStartX === null) return;
    const diff = dragStartX - clientX;
    const threshold = 50; // 拖拽阈值
    if (diff > threshold) goTo(index + 1);
    else if (diff < -threshold) goTo(index - 1);
    else goTo(index); // 回弹
    setDragStartX(null);
    setDragging(false);
  };

  return (
    <div
      className="carousel-container"
      onTouchStart={e => startDrag(e.touches[0].clientX)}
      onTouchMove={e => moveDrag(e.touches[0].clientX)}
      onTouchEnd={e => endDrag(e.changedTouches[0].clientX)}
      onMouseDown={e => startDrag(e.clientX)}
      onMouseMove={e => dragging && moveDrag(e.clientX)}
      onMouseUp={e => dragging && endDrag(e.clientX)}
      onMouseLeave={e => dragging && endDrag(dragStartX)} // 拖出容器也结束
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      <div className="carousel-track" ref={trackRef}>
        {loopImages.map((img, i) => {
          // 映射到真实 images 索引
          let realIndex;
          if (i === 0) realIndex = images.length - 1;           // 前置补位
          else if (i === loopImages.length - 1) realIndex = 0;  // 后置补位
          else realIndex = i - 1;

          return (
            <img
              key={i}
              src={`${backendUrl}${img.url}`}
              alt=""
              className="carousel-image"
              onClick={() => {
                // 越界保护
                if (realIndex < 0 || realIndex >= images.length) return;
                console.log("点击图片信息:", images[realIndex]);
              }}
            />
          );
        })}
      </div>

      {/* Dots */}
      <div className="carousel-dots">
        {images.map((_, i) => (
          <span
            key={i}
            onClick={() => goTo(i + 1)}
            className={`dot ${index === i + 1 ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
