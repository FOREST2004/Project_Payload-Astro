import { useState, useEffect } from "react";
import type { MediaFile } from "../lib/payload";

type Props = {
  images: MediaFile[];
};

export default function ImageGallery({ images }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images.length) return null;

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 12, background: "#000" }}>
      <img
        src={images[current].url}
        alt={images[current].alt ?? ""}
        style={{ width: "100%", height: 420, objectFit: "cover", display: "block", transition: "opacity 0.4s" }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Ảnh trước"
            style={btnStyle("left")}
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Ảnh tiếp"
            style={btnStyle("right")}
          >
            ›
          </button>

          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Ảnh ${i + 1}`}
                style={{
                  width: i === current ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === current ? "white" : "rgba(255,255,255,0.5)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width 0.3s, background 0.3s",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function btnStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: 12,
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.4)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    fontSize: "1.4rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };
}
