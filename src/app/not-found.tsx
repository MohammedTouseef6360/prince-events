import Link from "next/link";
import { HiHome } from "react-icons/hi";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-heading font-bold text-royal-gold/30 mb-4">404</div>
        <h1 className="font-heading text-4xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" aria-label="Back to home" className="royal-btn inline-flex items-center gap-2">
          <HiHome size={18} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
