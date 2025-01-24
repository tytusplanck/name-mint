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
      <div className="text-center p-4 bg-white/80 rounded-xl shadow-lg border border-[#4F46E5]/20">
        <div className="bg-[#4F46E5]/10 rounded-full p-3 w-fit mx-auto mb-3">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="font-semibold text-lg mb-2">Premium Features</h3>
        <p className="text-sm text-gray-600 mb-3">
          Unlock advanced team name customization with style and theme controls!
        </p>
        <Link href="/auth/signup">
          <Button className="bg-[#4F46E5] hover:bg-[#3730A3]">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export default function FantasyFootballPage() {
  const [style, setStyle] = useState<string>('');
  const [theme, setTheme] = useState<string>('funny');
  const [playerName, setPlayerName] = useState<string>('');
  const [count, setCount] = useState<number>(5);
  const [cleverness, setCleverness] = useState<number>(50);
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

  const getClevernessLabel = (value: number) => {
    if (value === 0) return 'Simple 🎯';
    if (value <= 25) return 'Casual 😊';
    if (value <= 50) return 'Clever 🧠';
    if (value <= 75) return 'Witty 😎';
    return 'Epic 🔥';
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
          type: 'fantasy-football',
          theme,
          style,
          playerName,
          count,
          cleverness,
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
    !isLoadingCredits && (!isAuthenticated || remainingCredits <= 1);

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8 bg-white min-h-screen space-y-6 sm:space-y-8">
      <Link href="/">
        <Button variant="ghost" className="text-sm sm:text-base">
          ← Back to Home
        </Button>
      </Link>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold font-montserrat text-[#333333]">
          Fantasy Football Team Names
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
              className="text-xs text-[#4F46E5] hover:text-[#3730A3]"
            >
              Create account for more credits →
            </Link>
          )}
        </div>
      </div>

      <form className="space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-base sm:text-lg font-semibold block">
            Theme
          </Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="flex flex-wrap gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="funny" id="funny" />
              <Label htmlFor="funny">Funny</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="intimidating" id="intimidating" />
              <Label htmlFor="intimidating">Intimidating</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="classic" id="classic" />
              <Label htmlFor="classic">Classic</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Label
            htmlFor="cleverness"
            className="text-base sm:text-lg font-semibold block"
          >
            Cleverness: {getClevernessLabel(cleverness)}
          </Label>
          <Slider
            id="cleverness"
            min={0}
            max={100}
            step={25}
            value={[cleverness]}
            onValueChange={(value) => setCleverness(value[0])}
            className="w-full max-w-xs"
          />
          <div className="flex justify-between text-sm text-gray-500 max-w-xs">
            <span>🎯</span>
            <span>😊</span>
            <span>🧠</span>
            <span>😎</span>
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
                  Style Preferences
                </Label>
                <Input
                  id="style"
                  placeholder="e.g., Pop Culture, Movie References, Sports Puns"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-4">
                <Label
                  htmlFor="playerName"
                  className="text-lg font-semibold block"
                >
                  Player Name
                </Label>
                <Input
                  id="playerName"
                  placeholder="Enter a player name to incorporate (optional)"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  disabled
                />
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
                    Style Preferences
                  </Label>
                  <Input
                    id="style"
                    placeholder="e.g., Pop Culture, Movie References, Sports Puns"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled
                  />
                </div>

                <div className="space-y-4">
                  <Label
                    htmlFor="playerName"
                    className="text-lg font-semibold block"
                  >
                    Player Name
                  </Label>
                  <Input
                    id="playerName"
                    placeholder="Enter a player name to incorporate (optional)"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </PremiumFeatureOverlay>
          ) : (
            <>
              <div className="space-y-4">
                <Label htmlFor="style" className="text-lg font-semibold block">
                  Style Preferences
                </Label>
                <Input
                  id="style"
                  placeholder="e.g., Pop Culture, Movie References, Sports Puns"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label
                  htmlFor="playerName"
                  className="text-lg font-semibold block"
                >
                  Player Name
                </Label>
                <Input
                  id="playerName"
                  placeholder="Enter a player name to incorporate (optional)"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          className="bg-[#4F46E5] text-white font-inter py-3 px-6 text-lg hover:bg-[#3730A3] transition-colors mt-8"
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
