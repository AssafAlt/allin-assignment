"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { BaseSelectorProps } from "@/types/selector";

export default function BaseSelector<T>({
  label,
  placeholder,
  searchTerm,
  setSearchTerm,
  isOpen,
  setIsOpen,
  items,
  loading,
  hasMore,
  onClear,
  onSelect,
  displayKeys,
  loadMoreRef,
  activeIndex,
  onKeyDown,
  disabled = false,
}: BaseSelectorProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  useLayoutEffect(() => {
    if (activeIndex !== -1 && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [activeIndex, items]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-md space-y-2 transition-all ${disabled ? "opacity-40 grayscale pointer-events-none" : ""}`}
    >
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 text-right"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => onKeyDown(e, onSelect)}
          disabled={disabled}
        />

        <div className="absolute left-3 top-3.5 flex items-center gap-2">
          {searchTerm && !loading && (
            <button
              onClick={onClear}
              type="button"
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isOpen && (searchTerm !== "" || items.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto custom-scrollbar text-right">
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={String(item[displayKeys.symbol])}
                ref={isActive ? activeItemRef : null}
                onClick={() => onSelect(item)}
                className="cursor-pointer"
              >
                <div
                  className={`w-full px-4 py-3 transition-colors border-b border-gray-50 flex justify-between items-center ${
                    isActive ? "bg-blue-200" : "hover:bg-green-50"
                  }`}
                >
                  <span className="font-medium">
                    {String(item[displayKeys.name])}
                  </span>
                  <span className="text-xs text-gray-400">
                    #{String(item[displayKeys.symbol])}
                  </span>
                </div>
              </div>
            );
          })}

          {items.length === 0 && !loading && searchTerm !== "" && (
            <div className="p-4 text-center text-red-500 font-medium">
              לא נמצאו תוצאות
            </div>
          )}

          <div
            ref={loadMoreRef as any}
            className="h-10 flex items-center justify-center"
          >
            {hasMore && !loading && (
              <span className="text-xs text-gray-400 italic">טוען עוד...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
