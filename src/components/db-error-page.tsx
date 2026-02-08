"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DbErrorPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRetry = () => {
    setIsRefreshing(true);

    startTransition(() => {
      router.refresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 border border-slate-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Database Connection Failed
          </h1>
          <p className="text-slate-600 mb-8">
            We couldn&apos;t establish a connection to the database. Please
            ensure your database is running and your{" "}
            <code className="bg-slate-100 px-1 rounded text-red-500 text-sm">
              DATABASE_URL
            </code>{" "}
            is correct
          </p>

          <button
            onClick={handleRetry}
            disabled={isRefreshing || isPending}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2  cursor-pointer
              ${
                isRefreshing || isPending
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200"
              }`}
          >
            {isRefreshing || isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                Checking Connection...
              </>
            ) : (
              "Try Again"
            )}
          </button>

          <p className="mt-6 text-xs text-slate-400 uppercase tracking-widest font-medium">
            System Status: Offline
          </p>
        </div>
      </div>
    </div>
  );
}
