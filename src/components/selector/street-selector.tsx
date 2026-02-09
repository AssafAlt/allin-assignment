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
  const { selectSearchTerm, setIsOpen, setSearchTerm, ...autocompleteProps } =
    useAutocomplete<StreetResponse>({
      fetchUrl: (term, page) =>
        `/api/streets?citySymbol=${citySymbol}&search=${encodeURIComponent(term)}&page=${page}`,
      enabled: !!citySymbol,
      deps: [citySymbol],
    });

  const handleSelect = (street: StreetResponse) => {
    selectSearchTerm(street.streetName);
    setIsOpen(false);
    onSelect(street);
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsOpen(false);
    onSelect(null);
  };

  return (
    <BaseSelector
      label="רחוב"
      placeholder={citySymbol ? "תתחיל לחפש את העיר..." : "קודם כל תבחר עיר"}
      setSearchTerm={setSearchTerm}
      setIsOpen={setIsOpen}
      onClear={handleClear}
      onSelect={handleSelect}
      disabled={!citySymbol}
      displayKeys={{ name: "streetName", symbol: "streetSymbol" }}
      {...autocompleteProps}
    />
  );
}
