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
    <div className="w-full mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 backdrop-blur-sm transition-all duration-500 hover:border-blue-200">
      <div className="bg-white px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          סיכום בחירה
        </h3>
      </div>

      <div className="p-6 space-y-4" dir="rtl">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${city ? "bg-blue-500 animate-pulse" : "bg-slate-300"}`}
            />
            <span className="text-sm font-medium text-slate-600">עיר</span>
          </div>
          <span
            className={`text-lg font-semibold transition-all duration-300 ${city ? "text-slate-900" : "text-slate-400 italic font-normal text-sm"}`}
          >
            {city ? city.cityName : "טרם נבחרה עיר"}
          </span>
        </div>

        <div className="h-px bg-slate-200 w-full" />

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${street ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
            />
            <span className="text-sm font-medium text-slate-600">רחוב</span>
          </div>
          <span
            className={`text-lg font-semibold transition-all duration-300 ${street ? "text-slate-900" : "text-slate-400 italic font-normal text-sm"}`}
          >
            {street ? street.streetName : "טרם נבחר רחוב"}
          </span>
        </div>
      </div>
    </div>
  );
}
