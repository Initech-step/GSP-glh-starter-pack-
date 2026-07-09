import { useEffect, useRef, useState } from 'react';

/**
 * Counts from 0 up to `target`. Driven by requestAnimationFrame rather than
 * Reanimated, because animating a <Text> child would need an AnimatedProps
 * bridge for a value that changes at most once a day.
 */
export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!target || target <= 0) {
      setValue(0);
      return undefined;
    }

    // rAF hands us the frame timestamp, so no clock source is needed.
    let start = null;

    const tick = (now) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}
