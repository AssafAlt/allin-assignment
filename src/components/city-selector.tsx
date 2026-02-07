"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { CityResponse } from "@/types/city";

interface CitySelectorProps {
  onSelect: (city: CityResponse | null) => void;
}

export default function CitySelector({ onSelect }: CitySelectorProps) {
  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Data State ---
  const [cities, setCities] = useState<CityResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. The Core Fetch Engine (Consolidated)
  const fetchData = useCallback(
    async (pageNum: number, isNew: boolean, term: string) => {
      setLoading(true);

      if (isNew && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(
          `/api/cities?search=${encodeURIComponent(term)}&page=${pageNum}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error("Fetch failed");
        const data: CityResponse[] = await res.json();

        setCities((prev) => (isNew ? data : [...prev, ...data]));
        setHasMore(data.length === 20); // Your API page size
        setPage(pageNum);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("City fetch error:", err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [],
  );

  // 3. Debounced Search Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(0, true, searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchTerm, fetchData]);

  // 4. Infinite Scroll Trigger (Calls fetchData directly for next page)
  const loadMoreRef = useIntersectionObserver(
    () => {
      if (!loading && hasMore) {
        fetchData(page + 1, false, searchTerm);
      }
    },
    hasMore && !loading && isOpen,
  );

  const handleSelect = (city: CityResponse) => {
    setSearchTerm(city.cityName);
    setIsOpen(false);
    onSelect(city);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSelect(null);
    setIsOpen(false);
    // Note: we keep the cities array for "Smart Clear" latency
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md space-y-2">
      <label className="block text-sm font-semibold text-gray-700">City</label>

      <div className="relative">
        <input
          type="text"
          className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Start typing a city name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        <div className="absolute right-3 top-3.5 flex items-center gap-2">
          {searchTerm && !loading && (
            <button
              onClick={handleClear}
              type="button"
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          {loading && (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
        </div>
      </div>

      {isOpen && (searchTerm !== "" || cities.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
          {cities.map((city) => (
            <button
              key={city.citySymbol}
              onClick={() => handleSelect(city)}
              className="w-full text-right px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 flex justify-between items-center"
              dir="rtl"
            >
              <span className="font-medium">{city.cityName}</span>
              <span className="text-xs text-gray-400">#{city.citySymbol}</span>
            </button>
          ))}

          {cities.length === 0 && !loading && searchTerm !== "" && (
            <div className="p-4 text-center text-red-500 font-medium">
              No results found
            </div>
          )}

          <div
            ref={loadMoreRef}
            className="h-10 flex items-center justify-center"
          >
            {hasMore && !loading && (
              <span className="text-xs text-gray-400 italic">
                Loading more...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
