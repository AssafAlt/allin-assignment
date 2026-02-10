"use client";

import { StreetResponse } from "@/types/street";
import BaseSelector from "./base-selector";
import { useAutocomplete } from "@/hooks/use-autocomplete";
import { useState } from "react";
import { fetchStreets } from "@/services/client/street-api";

interface StreetSelectorProps {
  citySymbol: number | null;
  onSelect: (street: StreetResponse | null) => void;
}

export default function StreetSelector({
  citySymbol,
  onSelect,
}: StreetSelectorProps) {
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  const { selectSearchTerm, setIsOpen, setSearchTerm, ...autocompleteProps } =
    useAutocomplete({
      enabled: !!citySymbol,
      onFetch: async (term, page) => {
        if (term === lastSelected) return { items: [], hasMore: false };
        return fetchStreets({ citySymbol, term, page });
      },
    });
  const handleSelect = (street: StreetResponse) => {
    setLastSelected(street.streetName);
    selectSearchTerm(street.streetName);
    onSelect(street);
  };

  const handleClear = () => {
    setLastSelected(null);
    setSearchTerm("");
    setIsOpen(false);
    onSelect(null);
  };

  return (
    <BaseSelector
      label="רחוב"
      placeholder={
        citySymbol ? "תתחיל לחפש את שם הרחוב..." : "קודם כל תבחר עיר"
      }
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
