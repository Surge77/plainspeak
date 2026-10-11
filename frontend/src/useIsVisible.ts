import { useEffect, useState } from "react";

// True while `element` is on screen. Without an element (or without IntersectionObserver)
// it reports visible, so anything shown "when X scrolls away" stays hidden.
export function useIsVisible(element: Element | null): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!element || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return isVisible;
}
