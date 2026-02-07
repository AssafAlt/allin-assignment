"use client";

import { CityResponse } from "@/types/city";
import { StreetResponse } from "@/types/street";

interface SelectionDisplayProps {
  city: CityResponse | null;
  street: StreetResponse | null;
}

export default function SelectionDisplay({
  city,
  street,
}: SelectionDisplayProps) {
  return (
    <div className="w-full max-w-md mt-8 p-6 bg-white border border-blue-100 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        הבחירה שלך
      </h3>

      <div className="space-y-4" dir="rtl">
        {city ? (
          <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
            <span className="text-sm text-gray-500">עיר :</span>
            <span className="font-bold text-blue-700">{city.cityName}</span>
          </div>
        ) : (
          <div className="text-center py-2 text-sm text-amber-600 italic">
            בבקשה תבחר עיר...
          </div>
        )}

        {street ? (
          <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
            <span className="text-sm text-gray-500">רחוב :</span>
            <span className="font-bold text-green-700">
              {street.streetName}
            </span>
          </div>
        ) : (
          <div className="text-center py-2 text-sm text-amber-600 italic">
            בבקשה תבחר רחוב...
          </div>
        )}
      </div>
    </div>
  );
}
