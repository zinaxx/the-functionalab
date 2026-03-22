export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-16">
      <div className="text-center px-6">
        <p className="font-display text-8xl font-light text-stone-800 mb-4">404</p>
        <h1 className="font-display text-3xl font-light text-white mb-2">Page not found</h1>
        <p className="font-body text-stone-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
