"use client";

import { useCallback, useRef } from "react";

export function useIntersectionObserver<T extends HTMLElement>(
  callback: () => void,
  enabled: boolean,
) {
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }

      if (enabled && node) {
        observer.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              callback();
            }
          },
          { threshold: 0.1, rootMargin: "100px" },
        );
        observer.current.observe(node);
      }
    },
    [callback, enabled],
  );

  return ref;
}
