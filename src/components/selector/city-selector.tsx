"use client";

import { CityResponse } from "@/types/city";
import BaseSelector from "./base-selector"; // Adjust path as needed
import { useAutocomplete } from "@/hooks/use-autocomplete";

interface CitySelectorProps {
  onSelect: (city: CityResponse | null) => void;
}

export default function CitySelector({ onSelect }: CitySelectorProps) {
  const {
    searchTerm,
    setSearchTerm,
    items,
    loading,
    hasMore,
    isOpen,
    setIsOpen,
    loadMoreRef,
    activeIndex,
    onKeyDown,
  } = useAutocomplete<CityResponse>({
    fetchUrl: (term, page) =>
      `/api/cities?search=${encodeURIComponent(term)}&page=${page}`,
    deps: [],
  });

  const handleSelect = (city: CityResponse) => {
    setSearchTerm(city.cityName);
    setIsOpen(false);
    onSelect(city);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSelect(null);
    setIsOpen(false);
  };

  return (
    <BaseSelector<CityResponse>
      label="עיר"
      placeholder="תתחיל לחפש את שם העיר..."
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      items={items}
      loading={loading}
      hasMore={hasMore}
      onClear={handleClear}
      onSelect={handleSelect}
      loadMoreRef={loadMoreRef}
      displayKeys={{ name: "cityName", symbol: "citySymbol" }}
      activeIndex={activeIndex}
      onKeyDown={onKeyDown}
    />
  );
}
