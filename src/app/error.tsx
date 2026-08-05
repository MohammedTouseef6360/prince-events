"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full royal-card p-8 sm:p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold text-royal-maroon dark:text-royal-gold mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-6 py-3 bg-gradient-to-r from-royal-maroon to-royal-maroon-dark text-white font-bold rounded-xl hover:from-royal-maroon-light hover:to-royal-maroon transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
