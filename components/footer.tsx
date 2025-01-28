import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900">Nametica</h3>
            </div>
            <p className="text-sm text-gray-600">
              AI-Powered Name Generation for Every Occasion
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Generators</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/baby-names"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Baby Names
                </Link>
              </li>
              <li>
                <Link
                  href="/fantasy-football"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Fantasy Football
                </Link>
              </li>
              <li>
                <Link
                  href="/dnd-names"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  D&D Names
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Nametica. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
