import Link from "next/link";
import { HiWifi } from "react-icons/hi";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <HiWifi className="mx-auto text-6xl text-royal-gold mb-6" />
        <h1 className="font-heading text-4xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please check your internet connection and try again.
        </p>
        <Link href="/" className="royal-btn inline-flex items-center gap-2">
          Try Again
        </Link>
      </div>
    </div>
  );
}
