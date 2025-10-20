"use client";

import { useEffect, useRef, useState } from "react";

export default function RevealOnScroll({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        io.unobserve(entry.target); // 애니메이션 1회만 실행
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{
        transition: "transform 800ms cubic-bezier(.21,.61,.35,1) " + (delay ? `${delay}ms` : ", ") +
                   `, opacity 800ms cubic-bezier(.21,.61,.35,1) ${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}


