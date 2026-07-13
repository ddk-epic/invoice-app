import { useCallback, useEffect, useMemo, useState } from "react";

import { filterMatches } from "@/lib/list-search";

const PAGE_SIZE = 40;

export function useSearchableList<T>(
  items: T[],
  matches: (item: T, query: string) => boolean
) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setLimit(PAGE_SIZE);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(
    () => filterMatches(items, matches, debouncedQuery),
    [items, matches, debouncedQuery]
  );

  const loadMoreRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setLimit((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      });
      observer.observe(el);
      return () => observer.disconnect();
    },
    [filtered.length]
  );

  const reset = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setLimit(PAGE_SIZE);
  }, []);

  const visible = useMemo(() => filtered.slice(0, limit), [filtered, limit]);

  return {
    query,
    setQuery,
    reset,
    visible,
    total: filtered.length,
    noMatches: filtered.length === 0,
    loadMoreRef,
  };
}
