import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NameGeneratorLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function NameGeneratorLayout({
  title,
  children,
}: NameGeneratorLayoutProps) {
  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8 bg-white min-h-screen space-y-6 sm:space-y-8">
      <Link href="/">
        <Button variant="ghost" className="text-sm sm:text-base">
          ← Back to Home
        </Button>
      </Link>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold font-montserrat text-[#333333]">
          {title}
        </h1>
      </div>
      {children}
    </main>
  );
}
