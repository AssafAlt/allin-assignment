"use client";

import { CityResponse } from "@/types/city";
import BaseSelector from "./base-selector";
import { useAutocomplete } from "@/hooks/use-autocomplete";
import { useState } from "react";
import { fetchCities } from "@/services/client/city-api";

interface CitySelectorProps {
  onSelect: (city: CityResponse | null) => void;
}

export default function CitySelector({ onSelect }: CitySelectorProps) {
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  const { selectSearchTerm, setIsOpen, setSearchTerm, ...autocompleteProps } =
    useAutocomplete({
      onFetch: async (term, page) => {
        if (term === lastSelected) return { items: [], hasMore: false };
        return fetchCities({ term, page });
      },
    });

  const handleSelect = (city: CityResponse) => {
    setLastSelected(city.cityName);
    selectSearchTerm(city.cityName);
    onSelect(city);
  };

  const handleClear = () => {
    setLastSelected(null);
    setSearchTerm("");
    setIsOpen(false);
    onSelect(null);
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
