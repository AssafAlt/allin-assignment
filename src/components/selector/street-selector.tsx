"use client";

import { StreetResponse } from "@/types/street";
import BaseSelector from "./base-selector";
import { useAutocomplete } from "@/hooks/use-autocomplete";

interface StreetSelectorProps {
  citySymbol: number | null;
  onSelect: (street: StreetResponse | null) => void;
}

export default function StreetSelector({
  citySymbol,
  onSelect,
}: StreetSelectorProps) {
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
  } = useAutocomplete<StreetResponse>({
    fetchUrl: (term, page) =>
      `/api/streets?citySymbol=${citySymbol}&search=${encodeURIComponent(term)}&page=${page}`,
    enabled: !!citySymbol,
    deps: [citySymbol],
  });

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
    <BaseSelector<StreetResponse>
      label="רחוב"
      placeholder={citySymbol ? "תתחיל לחפש את העיר..." : "קודם כל תבחר עיר"}
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
      disabled={!citySymbol}
      displayKeys={{ name: "streetName", symbol: "streetSymbol" }}
      activeIndex={activeIndex}
      onKeyDown={onKeyDown}
    />
  );
}
