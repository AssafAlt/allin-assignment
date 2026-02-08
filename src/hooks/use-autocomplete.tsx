"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  DependencyList,
} from "react";
import { useIntersectionObserver } from "./use-intersection-observer";
import { PaginatedResponse } from "@/types/service";

interface UseAutocompleteProps {
  fetchUrl: (searchTerm: string, page: number) => string;
  enabled?: boolean;
  deps?: DependencyList;
}

export function useAutocomplete<T>({
  fetchUrl,
  enabled = true,
  deps = [],
}: UseAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isChangeBySelect = useRef(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const stableFetchUrl = useCallback(fetchUrl, deps);

  const fetchData = useCallback(
    async (pageNum: number, isNew: boolean, currentTerm: string) => {
      if (!enabled) return;
      setLoading(true);

      if (isNew && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const url = stableFetchUrl(currentTerm, pageNum);
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        const {
          items: newItems,
          hasMore: paginatedHasMore,
        }: PaginatedResponse<T> = data;
        setItems((prev) => (isNew ? newItems : [...prev, ...newItems]));
        setHasMore(paginatedHasMore);

        setPage(pageNum);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Autocomplete Error:", err.message);
        } else {
          console.error("An unexpected error occurred:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [stableFetchUrl, enabled],
  );

  const selectSearchTerm = useCallback((newTerm: string) => {
    isChangeBySelect.current = true;
    setSearchTerm(newTerm);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isChangeBySelect.current) {
      isChangeBySelect.current = false;
      return;
    }
    const handler = setTimeout(() => {
      fetchData(0, true, searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchTerm, fetchData]);

  const loadMoreRef = useIntersectionObserver(
    () => {
      if (!loading && hasMore) {
        fetchData(page + 1, false, searchTerm);
      }
    },
    hasMore && !loading && isOpen,
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [items]);

  useEffect(() => {
    if (activeIndex >= 0 && activeIndex === items.length - 21) {
      setActiveIndex(activeIndex + 1);
    }
  }, [items.length]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, onSelectItem: (item: T) => void) => {
      if (!isOpen || items.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (activeIndex < items.length - 1) {
            setActiveIndex((prev) => prev + 1);
          } else if (hasMore && !loading) {
            fetchData(page + 1, false, searchTerm);
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;

        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && items[activeIndex]) {
            onSelectItem(items[activeIndex]);
          }
          break;

        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, items, activeIndex, hasMore, loading, page, searchTerm, fetchData],
  );

  return {
    searchTerm,
    setSearchTerm,
    selectSearchTerm,
    items,
    setItems,
    loading,
    hasMore,
    isOpen,
    setIsOpen,
    loadMoreRef,
    activeIndex,
    onKeyDown,
  };
}
