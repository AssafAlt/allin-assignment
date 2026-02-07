"use client";

import { useState } from "react";
import CitySelector from "./selector/city-selector";
import StreetSelector from "./selector/street-selector";
import SelectionDisplay from "./selection-display";
import { CityResponse } from "@/types/city";
import { StreetResponse } from "@/types/street";

export default function AddressSearchContainer() {
  const [selectedCity, setSelectedCity] = useState<CityResponse | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<StreetResponse | null>(
    null,
  );

  const handleCitySelect = (city: CityResponse | null) => {
    if (city?.citySymbol !== selectedCity?.citySymbol) {
      setSelectedCity(city);
      setSelectedStreet(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto" dir="rtl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
          חיפוש כתובת
        </h1>
        <p className="text-slate-500 text-sm">אנא בחר עיר ורחוב כדי להמשיך</p>
      </div>

      <div className="bg-white p-8 rounded-4xl shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-slate-100 space-y-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="group transition-all duration-300">
            <CitySelector onSelect={handleCitySelect} />
          </div>

          <div
            className={`transition-all duration-500 transform ${!selectedCity ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
          >
            <StreetSelector
              key={selectedCity?.citySymbol ?? "empty"}
              citySymbol={selectedCity?.citySymbol ?? null}
              onSelect={setSelectedStreet}
            />
          </div>
        </div>

        <SelectionDisplay city={selectedCity} street={selectedStreet} />
      </div>
    </div>
  );
}
