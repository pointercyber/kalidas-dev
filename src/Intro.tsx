import { useEffect, useState } from "react";

const NAMES = ["காளிதாஸ்","कालिदास","കാളിദാസ്","కాళిదాస్","ಕಾಳಿದಾಸ","كاليداس","カーリダース","칼리다스","Калидас","Καλιδάς","卡利达斯","Kalidas"];

export default function Intro() {
  const [i, setI] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    const fast = matchMedia("(prefers-reduced-motion:reduce)").matches;
    let t: number;
    const go = (k: number) => {
      setI(k);
      if (k < NAMES.length - 1) t = window.setTimeout(() => go(k + 1), k >= NAMES.length - 2 ? 500 : fast ? 80 : 240);
      else t = window.setTimeout(() => setOut(true), fast ? 100 : 900);
    };
    go(0);
    return () => clearTimeout(t);
  }, []);
  return (
    <div id="intro" className={out ? "out" : ""}>
      <div id="word">{NAMES[i]}</div>
      <div id="cnt">{String(i + 1).padStart(2, "0")} / {NAMES.length}</div>
    </div>
  );
}
