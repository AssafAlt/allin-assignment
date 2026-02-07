"use client";

import { useState, useEffect } from "react";
import { useCities } from "@/hooks/use-cities";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { CityResponse } from "@/types/city";

interface CitySelectorProps {
  onSelect: (city: CityResponse | null) => void;
}

export default function CitySelector({ onSelect }: CitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Debounce logic to prevent API spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { cities, loading, hasMore, loadMore } = useCities(debouncedTerm);

  // 2. Infinite Scroll Trigger
  const loadMoreRef = useIntersectionObserver(loadMore, hasMore && !loading);

  const handleSelect = (city: CityResponse) => {
    setSelectedCity(city);
    setSearchTerm(city.cityName);
    setIsOpen(false);
    onSelect(city);
  };

  return (
    <div className="relative w-full max-w-md space-y-2">
      <label className="block text-sm font-semibold text-gray-700">City</label>

      <div className="relative">
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Start typing a city name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {loading && (
          <div className="absolute right-3 top-3.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (debouncedTerm || cities.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
          {cities.map((city) => (
            <button
              key={city.citySymbol}
              onClick={() => handleSelect(city)}
              className="w-full text-right px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center"
              dir="rtl"
            >
              <span className="font-medium">{city.cityName}</span>
              <span className="text-xs text-gray-400">#{city.citySymbol}</span>
            </button>
          ))}

          {/* No Results State */}
          {cities.length === 0 && !loading && debouncedTerm !== "" && (
            <div className="p-4 text-center">
              <p className="text-red-500 font-medium">
                No search results found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try a different spelling or city name.
              </p>
            </div>
          )}

          {/* Observer Element */}
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
