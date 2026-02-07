import { useState, useEffect, useCallback, useRef } from "react";
import { CityResponse } from "@/types/city";

export function useCities(searchTerm: string) {
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Use a ref to track the latest fetch to prevent "race conditions"
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCities = useCallback(
    async (pageNum: number, isNewSearch: boolean) => {
      // Abort previous request if it's still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);

      try {
        const res = await fetch(
          `/api/cities?search=${encodeURIComponent(searchTerm)}&page=${pageNum}`,
          { signal: abortControllerRef.current.signal },
        );
        const data: CityResponse[] = await res.json();

        setCities((prev) => (isNewSearch ? data : [...prev, ...data]));
        setHasMore(data.length === 20);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch cities", error);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchTerm], // page is removed from dependencies to avoid infinite loops
  );

  // Triggered when searchTerm changes
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchCities(0, true);
  }, [searchTerm, fetchCities]);

  // Triggered when page changes (only for infinite scroll)
  useEffect(() => {
    if (page > 0) {
      fetchCities(page, false);
    }
  }, [page, fetchCities]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  return { cities, loading, hasMore, loadMore };
}
