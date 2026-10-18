import { useEffect, useRef } from "react";

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      const t = e.target as Element | null;
      ref.current?.classList.toggle("h", !!t?.closest("a,button,.chip,.step,.svc,.bc"));
      // magnetic pill buttons
      document.querySelectorAll<HTMLElement>(".pill").forEach((p) => {
        const b = p.getBoundingClientRect();
        const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
        p.style.transform = Math.hypot(dx, dy) < 140 ? `translate(${dx * 0.25}px,${dy * 0.25}px)` : "";
      });
    };
    addEventListener("pointermove", move);
    const loop = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      if (ref.current) ref.current.style.transform = `translate(${x}px,${y}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", move); };
  }, []);
  return <div id="dot" ref={ref} />;
}
