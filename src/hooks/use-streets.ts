import { useState, useEffect, useCallback, useRef } from "react";
import { StreetResponse } from "@/types/street";

export function useStreets(citySymbol: number | null, searchTerm: string) {
  const [streets, setStreets] = useState<StreetResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStreets = useCallback(
    async (pageNum: number, isNewSearch: boolean) => {
      // If no city is selected, we don't fetch anything
      if (!citySymbol) return;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);

      try {
        const res = await fetch(
          `/api/streets?citySymbol=${citySymbol}&search=${encodeURIComponent(searchTerm)}&page=${pageNum}`,
          { signal: abortControllerRef.current.signal },
        );

        if (!res.ok) throw new Error("Failed to fetch");

        const data: StreetResponse[] = await res.json();

        setStreets((prev) => (isNewSearch ? data : [...prev, ...data]));
        setHasMore(data.length === 20);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch streets", error);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, citySymbol],
  );

  // 1. Reset everything when City changes
  useEffect(() => {
    setStreets([]);
    setPage(0);
    setHasMore(true);

    if (citySymbol) {
      fetchStreets(0, true);
    }
  }, [citySymbol, searchTerm, fetchStreets]);

  // 2. Handle Infinite Scroll pagination
  useEffect(() => {
    if (page > 0) {
      fetchStreets(page, false);
    }
  }, [page, fetchStreets]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  return { streets, loading, hasMore, loadMore };
}
