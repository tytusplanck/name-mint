'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import { getUserCredits, decrementCredits } from '@/lib/credits';

const PremiumFeatureOverlay = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
      <div className="text-center p-4 bg-white/80 rounded-xl shadow-lg border border-[#63BCA5]/20">
        <div className="bg-[#63BCA5]/10 rounded-full p-3 w-fit mx-auto mb-3">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="font-semibold text-lg mb-2">Premium Features</h3>
        <p className="text-sm text-gray-600 mb-3">
          Unlock advanced name customization with style and length controls!
        </p>
        <Link href="/auth/signup">
          <Button className="bg-[#63BCA5] hover:bg-[#52AB94]">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export default function BabyNamesPage() {
  const [gender, setGender] = useState<string>('neutral');
  const [style, setStyle] = useState<string>('');
  const [length, setLength] = useState<number>(50);
  const [count, setCount] = useState<number>(5);
  const [popularity, setPopularity] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);
  const [remainingCredits, setRemainingCredits] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(true);

  useEffect(() => {
    const fetchCredits = async () => {
      setIsLoadingCredits(true);
      const { credits, isAuthenticated: isAuth } = await getUserCredits();
      setRemainingCredits(credits);
      setIsAuthenticated(isAuth);
      setIsLoadingCredits(false);
    };
    fetchCredits();
  }, []);

  const getPopularityLabel = (value: number) => {
    if (value === 0) return 'Super Unique 🦄';
    if (value <= 25) return 'Rare ⭐';
    if (value <= 50) return 'Balanced 🎯';
    if (value <= 75) return 'Popular 🌟';
    return 'Trending 🔥';
  };

  const getLengthLabel = (value: number) => {
    if (value === 0) return 'Tiny 🐣';
    if (value <= 25) return 'Short 🌱';
    if (value <= 50) return 'Medium 🌿';
    if (value <= 75) return 'Long 🌳';
    return 'Extra Long 🌲';
  };

  const getLengthValue = (value: number) => {
    if (value === 0) return 3;
    if (value <= 25) return 4;
    if (value <= 50) return 5;
    if (value <= 75) return 6;
    return 7;
  };

  const handleGenerate = async () => {
    if (remainingCredits <= 0) {
      if (!isAuthenticated) {
        if (
          confirm(
            'Create an account to get more credits. Would you like to sign up now?'
          )
        ) {
          window.location.href = '/auth/signup';
        }
      } else {
        alert(
          'You have no credits remaining. Please purchase more credits to continue.'
        );
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'baby-names',
          gender,
          style,
          length: getLengthValue(length),
          count,
          popularity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNames(data.names);
        const success = await decrementCredits();
        if (success) {
          setRemainingCredits((prev) => Math.max(0, prev - 1));
        }
      } else {
        if (response.status === 401) {
          if (
            confirm(
              'Please create an account to continue generating names. Would you like to sign up now?'
            )
          ) {
            window.location.href = '/auth/signup';
          }
        } else {
          console.error('Failed to generate names:', data.error);
          alert(data.error);
        }
      }
    } catch (error) {
      console.error('Failed to generate names:', error);
      alert('Failed to generate names. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showPremiumOverlay =
    !isLoadingCredits && (!isAuthenticated || remainingCredits < 5);

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8 bg-white min-h-screen space-y-6 sm:space-y-8">
      <Link href="/">
        <Button variant="ghost" className="text-sm sm:text-base">
          ← Back to Home
        </Button>
      </Link>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold font-montserrat text-[#333333]">
          Generate Baby Names
        </h1>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <div className="text-sm text-gray-600">
            {isLoadingCredits ? (
              <span>Loading...</span>
            ) : remainingCredits > 0 ? (
              <span>
                {remainingCredits} free generation
                {remainingCredits !== 1 ? 's' : ''} remaining
              </span>
            ) : (
              <span className="text-red-600">No generations remaining</span>
            )}
          </div>
          {!isLoadingCredits && !isAuthenticated && (
            <Link
              href="/auth/signup"
              className="text-xs text-[#63BCA5] hover:text-[#52AB94]"
            >
              Create account for more credits →
            </Link>
          )}
        </div>
      </div>

      <form className="space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-base sm:text-lg font-semibold block">
            Gender
          </Label>
          <RadioGroup
            value={gender}
            onValueChange={setGender}
            className="flex flex-wrap gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="boy" id="boy" />
              <Label htmlFor="boy">Boy</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="girl" id="girl" />
              <Label htmlFor="girl">Girl</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="neutral" id="neutral" />
              <Label htmlFor="neutral">Neutral</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Label
            htmlFor="popularity"
            className="text-base sm:text-lg font-semibold block"
          >
            Popularity: {getPopularityLabel(popularity)}
          </Label>
          <Slider
            id="popularity"
            min={0}
            max={100}
            step={25}
            value={[popularity]}
            onValueChange={(value) => setPopularity(value[0])}
            className="w-full max-w-xs"
          />
          <div className="flex justify-between text-sm text-gray-500 max-w-xs">
            <span>🦄</span>
            <span>⭐</span>
            <span>🎯</span>
            <span>🌟</span>
            <span>🔥</span>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Label
            htmlFor="count"
            className="text-base sm:text-lg font-semibold block"
          >
            Number of Names: {count}
          </Label>
          <Slider
            id="count"
            min={1}
            max={10}
            step={1}
            value={[count]}
            onValueChange={(value) => setCount(value[0])}
            className="w-full max-w-xs"
          />
        </div>

        <div className="pt-8 border-t space-y-8">
          <h2 className="text-xl font-semibold text-[#333333]">
            Advanced Customization
          </h2>
          {isLoadingCredits ? (
            <div className="space-y-8 opacity-50">
              <div className="space-y-4">
                <Label htmlFor="style" className="text-lg font-semibold block">
                  Name Style
                </Label>
                <Input
                  id="style"
                  placeholder="e.g., Modern, Classic, Unique"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="length" className="text-lg font-semibold block">
                  Name Length: {getLengthLabel(length)}
                </Label>
                <Slider
                  id="length"
                  min={0}
                  max={100}
                  step={25}
                  value={[length]}
                  onValueChange={(value) => setLength(value[0])}
                  className="max-w-xs"
                  disabled
                />
                <div className="flex justify-between text-sm text-gray-500 max-w-xs">
                  <span>🐣</span>
                  <span>🌱</span>
                  <span>🌿</span>
                  <span>🌳</span>
                  <span>🌲</span>
                </div>
              </div>
            </div>
          ) : showPremiumOverlay ? (
            <PremiumFeatureOverlay>
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label
                    htmlFor="style"
                    className="text-lg font-semibold block"
                  >
                    Name Style
                  </Label>
                  <Input
                    id="style"
                    placeholder="e.g., Modern, Classic, Unique"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled
                  />
                </div>

                <div className="space-y-4">
                  <Label
                    htmlFor="length"
                    className="text-lg font-semibold block"
                  >
                    Name Length: {getLengthLabel(length)}
                  </Label>
                  <Slider
                    id="length"
                    min={0}
                    max={100}
                    step={25}
                    value={[length]}
                    onValueChange={(value) => setLength(value[0])}
                    className="max-w-xs"
                    disabled
                  />
                  <div className="flex justify-between text-sm text-gray-500 max-w-xs">
                    <span>🐣</span>
                    <span>🌱</span>
                    <span>🌿</span>
                    <span>🌳</span>
                    <span>🌲</span>
                  </div>
                </div>
              </div>
            </PremiumFeatureOverlay>
          ) : (
            <>
              <div className="space-y-4">
                <Label htmlFor="style" className="text-lg font-semibold block">
                  Name Style
                </Label>
                <Input
                  id="style"
                  placeholder="e.g., Modern, Classic, Unique"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="length" className="text-lg font-semibold block">
                  Name Length: {getLengthLabel(length)}
                </Label>
                <Slider
                  id="length"
                  min={0}
                  max={100}
                  step={25}
                  value={[length]}
                  onValueChange={(value) => setLength(value[0])}
                  className="max-w-xs"
                />
                <div className="flex justify-between text-sm text-gray-500 max-w-xs">
                  <span>🐣</span>
                  <span>🌱</span>
                  <span>🌿</span>
                  <span>🌳</span>
                  <span>🌲</span>
                </div>
              </div>
            </>
          )}
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          className="bg-[#63BCA5] text-white font-inter py-3 px-6 text-lg hover:bg-[#52AB94] transition-colors mt-8"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Names'}
        </Button>
      </form>

      {names.length > 0 && (
        <div className="pt-8 border-t space-y-4">
          <h2 className="text-xl font-semibold text-[#333333]">
            Generated Names
          </h2>
          <div className="grid gap-3">
            {names.map((name, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-purple-50 to-red-50 rounded-lg border border-purple-100/50 hover:border-purple-200/50 transition-colors"
              >
                <p className="text-gray-800 font-medium">{name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
