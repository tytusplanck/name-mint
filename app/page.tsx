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
    {
      title: 'Fantasy Football',
      description: 'Create clever and competitive team names for your league',
      href: '/fantasy-football',
      gradient: 'from-[#4F46E5] to-[#3730A3]',
      icon: '🏈',
    },
    {
      title: 'D&D Characters',
      description:
        'Generate fantasy names for your D&D characters with race and class options',
      href: '/dnd-names',
      gradient: 'from-purple-500 to-red-500',
      icon: '🧙',
    },
    // More generators can be added here in the future
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 pb-24 sm:pb-32">
        <div className="py-8 sm:py-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8 text-center">
            Choose a Name Generator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {generators.map((generator) => (
              <Link
                key={generator.title}
                href={generator.href}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 opacity-0 bg-gradient-to-r ${generator.gradient} group-hover:opacity-5 transition-opacity duration-300`}
                />
                <div className="space-y-3 sm:space-y-4">
                  <span className="text-3xl sm:text-4xl">{generator.icon}</span>
                  <h2 className="text-xl sm:text-2xl font-bold font-montserrat text-gray-800">
                    {generator.title}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 font-inter">
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

      <footer className="fixed bottom-0 w-full border-t bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6 sm:py-3 flex flex-col items-center space-y-0.5 sm:space-y-1">
          <p className="text-sm sm:text-base font-inter text-gray-600 text-center">
            AI-Powered Name Generation for Every Occasion
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 font-inter">
            &copy; 2025 NameMint. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
