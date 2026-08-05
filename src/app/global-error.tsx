"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased bg-gray-50 dark:bg-gray-950">
        <div className="min-h-screen flex items-center justify-center px-5">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-2xl border border-royal-gold/20 text-center shadow-sm">
            <h1 className="font-heading text-2xl font-bold text-royal-maroon dark:text-royal-gold mb-2">
              Fatal error
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              The application hit a critical error and could not recover automatically.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-6 py-3 bg-gradient-to-r from-royal-maroon to-royal-maroon-dark text-white font-bold rounded-xl hover:from-royal-maroon-light hover:to-royal-maroon transition-all"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
