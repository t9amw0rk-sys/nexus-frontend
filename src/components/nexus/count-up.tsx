import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type CountUpProps = {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  triggerOnView?: boolean;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({
  to,
  duration = 1.2,
  decimals = 0,
  suffix = "",
  triggerOnView = false,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (triggerOnView && !inView) return;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      setN(easeOut(p) * to);
      if (p < 1) raf = requestAnimationFrame(step);
      else { setN(to); setDone(true); }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, inView, triggerOnView]);

  const formatted = decimals > 0
    ? n.toFixed(decimals)
    : Math.floor(n).toLocaleString();

  return (
    <span ref={ref}>
      {formatted}
      {suffix && (triggerOnView ? done : true) ? suffix : ""}
    </span>
  );
}
