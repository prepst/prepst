"use client";

import { useEffect, useState } from "react";

export function useCompactLayout(maxWidth = 1024) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [maxWidth]);

  return compact;
}
