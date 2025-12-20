import { useEffect, useState, useRef } from "react";
import "../style/image-carousel.css";

export default function ImageCarousel({ images = [] }) {
  const [index, setIndex] = useState(1);
  const [dragStartX, setDragStartX] = useState(null);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);
  const backendUrl = "http://localhost:5000";

  const loopImages = images.length > 1 
    ? [images[images.length - 1], ...images, images[0]] 
    : images;

  // 自动轮播
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => goTo(index + 1), 3000);
    return () => clearInterval(timer);
  }, [index, images]);

  const goTo = (newIndex) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = "transform 0.5s ease-in-out";
    setIndex(newIndex);
  };

  // 无缝循环处理
  useEffect(() => {
    if (!trackRef.current || images.length <= 1) return;

    const handleTransitionEnd = () => {
      let newIndex = index;
      if (index === 0) newIndex = images.length;
      else if (index === images.length + 1) newIndex = 1;

      if (newIndex !== index) {
        trackRef.current.style.transition = "none";
        setIndex(newIndex);
        trackRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
      }
    };

    const track = trackRef.current;
    track.addEventListener("transitionend", handleTransitionEnd);
    return () => track.removeEventListener("transitionend", handleTransitionEnd);
  }, [index, images.length]);

  // 统一处理拖拽/滑动
  const startDrag = (clientX) => {
    setDragStartX(clientX);
    setDragging(true);
    trackRef.current.style.transition = "none";
  };

  const moveDrag = (clientX) => {
    if (!dragging || dragStartX === null) return;
    const diff = clientX - dragStartX;
    trackRef.current.style.transform = `translateX(${-index * 100 + diff / trackRef.current.offsetWidth * 100}%)`;
  };

  const endDrag = (clientX) => {
    if (!dragging || dragStartX === null) return;
    const diff = dragStartX - clientX;
    const threshold = 50;
    if (diff > threshold) goTo(index + 1);
    else if (diff < -threshold) goTo(index - 1);
    else trackRef.current.style.transition = "transform 0.5s ease-in-out";
    setDragStartX(null);
    setDragging(false);
  };

  if (!images.length) return null;

  return (
    <div
      className="carousel-container"
      onTouchStart={e => startDrag(e.touches[0].clientX)}
      onTouchMove={e => moveDrag(e.touches[0].clientX)}
      onTouchEnd={e => endDrag(e.changedTouches[0].clientX)}
      onMouseDown={e => startDrag(e.clientX)}
      onMouseMove={e => dragging && moveDrag(e.clientX)}
      onMouseUp={e => endDrag(e.clientX)}
      onMouseLeave={e => dragging && endDrag(e.clientX)}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      <div
        className="carousel-track"
        ref={trackRef}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {loopImages.map((img, i) => (
          <img
            key={i}
            src={`${backendUrl}${img.url}`}
            alt=""
            className="carousel-image"
          />
        ))}
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
