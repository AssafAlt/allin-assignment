"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { StreetResponse } from "@/types/street";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface StreetSelectorProps {
  citySymbol: number | null;
  onSelect: (street: StreetResponse | null) => void;
}

export default function StreetSelector({
  citySymbol,
  onSelect,
}: StreetSelectorProps) {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [streets, setStreets] = useState<StreetResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // --- The Core Fetch Logic ---
  const fetchData = useCallback(
    async (pageNum: number, isNew: boolean, currentTerm: string) => {
      if (!citySymbol) return;

      setLoading(true);

      // Abort previous request if starting a fresh search
      if (isNew && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(
          `/api/streets?citySymbol=${citySymbol}&search=${encodeURIComponent(currentTerm)}&page=${pageNum}`,
          { signal: controller.signal },
        );

        if (!res.ok) throw new Error("Fetch failed");
        const data: StreetResponse[] = await res.json();

        setStreets((prev) => (isNew ? data : [...prev, ...data]));
        setHasMore(data.length === 20); // Adjust based on your API limit
        setPage(pageNum);
      } catch (err: any) {
        if (err.name !== "AbortError")
          console.error("Street fetch error:", err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [citySymbol],
  );

  // --- 1. Effect: Debounced Search & City Change ---
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(0, true, searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchTerm, citySymbol, fetchData]);

  // --- 2. Trigger: Infinite Scroll ---
  const loadMoreRef = useIntersectionObserver(
    () => {
      if (!loading && hasMore) {
        fetchData(page + 1, false, searchTerm);
      }
    },
    hasMore && !loading && isOpen,
  );

  const handleSelect = (street: StreetResponse) => {
    setSearchTerm(street.streetName);
    setIsOpen(false);
    onSelect(street);
  };

  return (
    <div
      className={`relative w-full max-w-md space-y-2 transition-all ${!citySymbol ? "opacity-40 grayscale pointer-events-none" : ""}`}
    >
      <label className="block text-sm font-semibold text-gray-700">
        Street
      </label>

      <div className="relative">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
          placeholder={
            citySymbol ? "Start typing a street..." : "Select a city first"
          }
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            onSelect(null); // Reset selection on type
          }}
          onFocus={() => setIsOpen(true)}
          disabled={!citySymbol}
        />

        {loading && (
          <div className="absolute right-3 top-3.5">
            <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && citySymbol && (searchTerm !== "" || streets.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
          {streets.map((street) => (
            <button
              key={`${street.streetSymbol}-${street.streetName}`}
              onClick={() => handleSelect(street)}
              className="w-full text-right px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 flex justify-between items-center"
              dir="rtl"
            >
              <span className="font-medium">{street.streetName}</span>
              <span className="text-xs text-gray-400">
                #{street.streetSymbol}
              </span>
            </button>
          ))}

          {streets.length === 0 && !loading && (
            <div className="p-4 text-center text-red-500 font-medium">
              No results found
            </div>
          )}

          {/* Observer Trigger */}
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
