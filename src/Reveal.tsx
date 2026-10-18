import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = { children: ReactNode; className?: string; style?: CSSProperties };

export default function Reveal({ children, className = "", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rv${on ? " in" : ""} ${className}`.trim()} style={style}>{children}</div>;
}
