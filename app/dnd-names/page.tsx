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
          Unlock advanced name customization with alignment and background
          options!
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

export default function DnDNamesPage() {
  const [race, setRace] = useState<string>('human');
  const [characterClass, setCharacterClass] = useState<string>('fighter');
  const [alignment, setAlignment] = useState<string>('neutral');
  const [background, setBackground] = useState<string>('');
  const [epicness, setEpicness] = useState<number>(50);
  const [count, setCount] = useState<number>(5);
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

  const getEpicnessLabel = (value: number) => {
    if (value === 0) return 'Common Folk 🏠';
    if (value <= 25) return 'Adventurer 🗡️';
    if (value <= 50) return 'Hero ⚔️';
    if (value <= 75) return 'Legend 👑';
    return 'Mythical ✨';
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
          type: 'dnd-names',
          race,
          characterClass,
          alignment,
          background,
          epicness,
          count,
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
          D&D Character Names
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
            Race
          </Label>
          <RadioGroup
            value={race}
            onValueChange={setRace}
            className="flex flex-wrap gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="human" id="human" />
              <Label htmlFor="human">Human</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="elf" id="elf" />
              <Label htmlFor="elf">Elf</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dwarf" id="dwarf" />
              <Label htmlFor="dwarf">Dwarf</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="halfling" id="halfling" />
              <Label htmlFor="halfling">Halfling</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dragonborn" id="dragonborn" />
              <Label htmlFor="dragonborn">Dragonborn</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="tiefling" id="tiefling" />
              <Label htmlFor="tiefling">Tiefling</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="orc" id="orc" />
              <Label htmlFor="orc">Half-Orc</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="gnome" id="gnome" />
              <Label htmlFor="gnome">Gnome</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Label className="text-base sm:text-lg font-semibold block">
            Class
          </Label>
          <RadioGroup
            value={characterClass}
            onValueChange={setCharacterClass}
            className="flex flex-wrap gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="fighter" id="fighter" />
              <Label htmlFor="fighter">Fighter</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="wizard" id="wizard" />
              <Label htmlFor="wizard">Wizard</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="rogue" id="rogue" />
              <Label htmlFor="rogue">Rogue</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="cleric" id="cleric" />
              <Label htmlFor="cleric">Cleric</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="paladin" id="paladin" />
              <Label htmlFor="paladin">Paladin</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ranger" id="ranger" />
              <Label htmlFor="ranger">Ranger</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="barbarian" id="barbarian" />
              <Label htmlFor="barbarian">Barbarian</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="bard" id="bard" />
              <Label htmlFor="bard">Bard</Label>
            </div>
          </RadioGroup>
        </div>

        {!showPremiumOverlay ? (
          <>
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-base sm:text-lg font-semibold block">
                Alignment
              </Label>
              <RadioGroup
                value={alignment}
                onValueChange={setAlignment}
                className="flex flex-wrap gap-4 sm:gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="lawful-good" id="lawful-good" />
                  <Label htmlFor="lawful-good">Lawful Good</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="neutral-good" id="neutral-good" />
                  <Label htmlFor="neutral-good">Neutral Good</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="chaotic-good" id="chaotic-good" />
                  <Label htmlFor="chaotic-good">Chaotic Good</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="lawful-neutral" id="lawful-neutral" />
                  <Label htmlFor="lawful-neutral">Lawful Neutral</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label htmlFor="neutral">True Neutral</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="chaotic-neutral"
                    id="chaotic-neutral"
                  />
                  <Label htmlFor="chaotic-neutral">Chaotic Neutral</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="lawful-evil" id="lawful-evil" />
                  <Label htmlFor="lawful-evil">Lawful Evil</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="neutral-evil" id="neutral-evil" />
                  <Label htmlFor="neutral-evil">Neutral Evil</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="chaotic-evil" id="chaotic-evil" />
                  <Label htmlFor="chaotic-evil">Chaotic Evil</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Label className="text-base sm:text-lg font-semibold block">
                Background
              </Label>
              <Input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Enter character background or theme..."
                className="max-w-xs"
              />
            </div>
          </>
        ) : (
          <PremiumFeatureOverlay>
            <div className="space-y-6 sm:space-y-8 opacity-50">
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-base sm:text-lg font-semibold block">
                  Alignment
                </Label>
                <RadioGroup
                  value={alignment}
                  onValueChange={setAlignment}
                  className="flex flex-wrap gap-4 sm:gap-6"
                  disabled
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="neutral" id="neutral" disabled />
                    <Label htmlFor="neutral">True Neutral</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Label className="text-base sm:text-lg font-semibold block">
                  Background
                </Label>
                <Input
                  type="text"
                  disabled
                  placeholder="Enter character background or theme..."
                  className="max-w-xs"
                />
              </div>
            </div>
          </PremiumFeatureOverlay>
        )}

        <div className="space-y-3 sm:space-y-4">
          <Label
            htmlFor="epicness"
            className="text-base sm:text-lg font-semibold block"
          >
            Epicness Level: {getEpicnessLabel(epicness)}
          </Label>
          <Slider
            id="epicness"
            min={0}
            max={100}
            step={25}
            value={[epicness]}
            onValueChange={(value) => setEpicness(value[0])}
            className="w-full max-w-xs"
          />
          <div className="flex justify-between text-sm text-gray-500 max-w-xs">
            <span>🏠</span>
            <span>🗡️</span>
            <span>⚔️</span>
            <span>👑</span>
            <span>✨</span>
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

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full sm:w-auto bg-[#63BCA5] hover:bg-[#52AB94]"
          type="button"
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
