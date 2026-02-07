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
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Click Outside Logic ---
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

  // --- The Core Fetch Logic ---
  const fetchData = useCallback(
    async (pageNum: number, isNew: boolean, currentTerm: string) => {
      if (!citySymbol) return;

      setLoading(true);

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
        setHasMore(data.length === 20);
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

  // --- Effect: Debounced Search & City Change ---
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(0, true, searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [searchTerm, citySymbol, fetchData]);

  // --- Trigger: Infinite Scroll ---
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

  const handleClear = () => {
    setSearchTerm("");
    setIsOpen(false);
    onSelect(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-md space-y-2 transition-all ${!citySymbol ? "opacity-40 grayscale pointer-events-none" : ""}`}
    >
      <label className="block text-sm font-semibold text-gray-700">
        Street
      </label>

      <div className="relative">
        <input
          type="text"
          className="w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
          placeholder={
            citySymbol ? "Start typing a street..." : "Select a city first"
          }
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            // Note: We are keeping the display logic stable
            // by not calling onSelect(null) here yet.
          }}
          onFocus={() => setIsOpen(true)}
          disabled={!citySymbol}
        />

        {/* Action Icons (Clear or Loading) */}
        <div className="absolute right-3 top-3.5 flex items-center gap-2">
          {searchTerm && !loading && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
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
            <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full"></div>
          )}
        </div>
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
