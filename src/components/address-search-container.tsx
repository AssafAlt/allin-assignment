"use client";

import { useState } from "react";
import CitySelector from "./city-selector";
import StreetSelector from "./street-selector";
import SelectionDisplay from "./selection-display";
import { CityResponse } from "@/types/city";
import { StreetResponse } from "@/types/street";

export default function AddressSearchContainer() {
  const [selectedCity, setSelectedCity] = useState<CityResponse | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<StreetResponse | null>(
    null,
  );

  const handleCitySelect = (city: CityResponse | null) => {
    // Only reset if the city actually changed or was cleared
    if (city?.citySymbol !== selectedCity?.citySymbol) {
      setSelectedCity(city);
      setSelectedStreet(null); // The street resets only here!
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl space-y-10 border border-gray-100">
      <div className="flex flex-col gap-8">
        <CitySelector onSelect={handleCitySelect} />

        <StreetSelector
          key={selectedCity?.citySymbol ?? "empty"}
          citySymbol={selectedCity?.citySymbol ?? null}
          onSelect={setSelectedStreet}
        />
      </div>

      <SelectionDisplay city={selectedCity} street={selectedStreet} />
    </div>
  );
}
