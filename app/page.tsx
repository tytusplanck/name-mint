import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LandingPage() {
  const generators = [
    {
      title: 'Baby Names',
      description: 'Generate unique and meaningful names for your little one',
      href: '/baby-names',
      gradient: 'from-[#63BCA5] to-[#52AB94]',
      icon: '👶',
    },
    // More generators can be added here in the future
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <main className="w-full max-w-6xl mx-auto p-6 pb-32">
        <div className="py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            Choose a Name Generator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generators.map((generator) => (
              <Link
                key={generator.title}
                href={generator.href}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 opacity-0 bg-gradient-to-r ${generator.gradient} group-hover:opacity-5 transition-opacity duration-300`}
                />
                <div className="space-y-4">
                  <span className="text-4xl">{generator.icon}</span>
                  <h2 className="text-2xl font-bold font-montserrat text-gray-800">
                    {generator.title}
                  </h2>
                  <p className="text-gray-600 font-inter">
                    {generator.description}
                  </p>
                  <Button
                    className={`w-full bg-gradient-to-r ${generator.gradient} text-white hover:opacity-90 transition-opacity`}
                  >
                    Generate Names
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full border-t bg-white">
        <div className="mx-auto max-w-6xl p-6 flex flex-col items-center space-y-2">
          <p className="text-lg font-inter text-gray-600">
            AI-Powered Name Generation for Every Occasion
          </p>
          <p className="text-sm text-gray-500 font-inter">
            &copy; 2025 NameMint. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
