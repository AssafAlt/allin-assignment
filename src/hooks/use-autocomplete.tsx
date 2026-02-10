"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useIntersectionObserver } from "./use-intersection-observer";
import { PaginatedResponse } from "@/types/service";

interface UseAutocompleteProps<T> {
  onFetch: (searchTerm: string, page: number) => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
}

interface UseAutocompleteReturn<T> {
  searchTerm: string;
  items: T[];
  loading: boolean;
  hasMore: boolean;
  isOpen: boolean;
  activeIndex: number;

  setSearchTerm: (value: string) => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  setIsOpen: (open: boolean) => void;
  selectSearchTerm: (newTerm: string) => void;

  loadMoreRef: (node: HTMLElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent, onSelectItem: (item: T) => void) => void;
}

export function useAutocomplete<T>({
  onFetch,
  enabled = true,
}: UseAutocompleteProps<T>): UseAutocompleteReturn<T> {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const prevItemsLength = useRef(items.length);

  const abortControllerRef = useRef<AbortController | null>(null);

  const onFetchRef = useRef(onFetch);
  onFetchRef.current = onFetch;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const fetchData = useCallback(
    async (pageNum: number, isNew: boolean, currentTerm: string) => {
      if (!enabledRef.current) return;

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);

      try {
        const data = await onFetchRef.current(currentTerm, pageNum);

        if (!controller.signal.aborted) {
          setItems((prev) => (isNew ? data.items : [...prev, ...data.items]));
          setHasMore(data.hasMore);
          setPage(pageNum);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Autocomplete Error:", err.message);
        } else {
          console.error("An unexpected error occurred:", err);
        }
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const selectSearchTerm = useCallback((newTerm: string) => {
    setSearchTerm(newTerm);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handler = setTimeout(() => {
      fetchData(0, true, searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, fetchData, enabled]);

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
    if (!isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (items.length > prevItemsLength.current && activeIndex >= 0) {
      if (activeIndex === prevItemsLength.current - 1) {
        setActiveIndex(prevItemsLength.current);
      }
    }
    prevItemsLength.current = items.length;
  }, [items.length, activeIndex]);

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
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
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
