"use client";

import { CityResponse } from "@/types/city";
import BaseSelector from "./base-selector";
import { useAutocomplete } from "@/hooks/use-autocomplete";

interface CitySelectorProps {
  onSelect: (city: CityResponse | null) => void;
}

export default function CitySelector({ onSelect }: CitySelectorProps) {
  const { selectSearchTerm, setIsOpen, setSearchTerm, ...autocompleteProps } =
    useAutocomplete<CityResponse>({
      fetchUrl: (term, page) =>
        `/api/cities?search=${encodeURIComponent(term)}&page=${page}`,
      deps: [],
    });

  const handleSelect = (city: CityResponse) => {
    selectSearchTerm(city.cityName);
    setIsOpen(false);
    onSelect(city);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSelect(null);
    setIsOpen(false);
  };

  return (
    <BaseSelector
      label="עיר"
      placeholder="תתחיל לחפש את שם העיר..."
      setSearchTerm={setSearchTerm}
      setIsOpen={setIsOpen}
      onClear={handleClear}
      onSelect={handleSelect}
      displayKeys={{ name: "cityName", symbol: "citySymbol" }}
      {...autocompleteProps}
    />
  );
}
