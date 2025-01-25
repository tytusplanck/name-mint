'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { NameGeneratorLayout } from '@/components/name-generator/NameGeneratorLayout';
import { CreditStatus } from '@/components/name-generator/CreditStatus';
import { PremiumFeatureOverlay } from '@/components/name-generator/PremiumFeatureOverlay';
import { NameResults } from '@/components/name-generator/NameResults';
import { useAuthStore } from '@/lib/store/auth';

export default function DnDNamesPage() {
  const [race, setRace] = useState<string>('human');
  const [characterClass, setCharacterClass] = useState<string>('fighter');
  const [alignment, setAlignment] = useState<string>('neutral');
  const [background, setBackground] = useState<string>('');
  const [epicness, setEpicness] = useState<number>(50);
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);

  const { user, credits, isLoading } = useAuthStore();

  const getEpicnessLabel = useCallback((value: number) => {
    if (value === 0) return 'Common Folk 🏠';
    if (value <= 25) return 'Adventurer 🗡️';
    if (value <= 50) return 'Hero ⚔️';
    if (value <= 75) return 'Legend 👑';
    return 'Mythical ✨';
  }, []);

  const handleGenerate = useCallback(async () => {
    if (credits <= 0) {
      if (!user) {
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

      if (!response.ok) {
        if (response.status === 401) {
          if (
            confirm(
              'Please create an account to continue generating names. Would you like to sign up now?'
            )
          ) {
            window.location.href = '/auth/signup';
          }
        } else if (response.status === 403) {
          alert(
            'You have no credits remaining. Please purchase more credits to continue.'
          );
        } else {
          const data = await response.json();
          console.error('Failed to generate names:', data.error);
          alert(data.error);
        }
        return;
      }

      const data = await response.json();
      setNames(data.names);
    } catch (error) {
      console.error('Failed to generate names:', error);
      alert('Failed to generate names. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    credits,
    user,
    race,
    characterClass,
    alignment,
    background,
    epicness,
    count,
  ]);

  const showPremiumOverlay = !user || credits < 20;

  return (
    <NameGeneratorLayout title="Generate D&D Character Names">
      <div className="flex justify-end">
        <CreditStatus
          isLoadingCredits={isLoading}
          remainingCredits={credits}
          isAuthenticated={!!user}
        />
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
              <RadioGroupItem value="chaotic-neutral" id="chaotic-neutral" />
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
          <Label
            htmlFor="epicness"
            className="text-base sm:text-lg font-semibold block"
          >
            Epicness: {getEpicnessLabel(epicness)}
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

        <div className="pt-8 border-t space-y-8">
          <h2 className="text-xl font-semibold text-[#333333]">
            Advanced Customization
          </h2>
          {loading ? (
            <div className="space-y-4 opacity-50">
              <Label
                htmlFor="background"
                className="text-lg font-semibold block"
              >
                Character Background
              </Label>
              <Input
                id="background"
                placeholder="e.g., Noble, Soldier, Scholar"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                disabled
              />
            </div>
          ) : showPremiumOverlay ? (
            <PremiumFeatureOverlay message="Unlock advanced character customization with background details!">
              <div className="space-y-4">
                <Label
                  htmlFor="background"
                  className="text-lg font-semibold block"
                >
                  Character Background
                </Label>
                <Input
                  id="background"
                  placeholder="e.g., Noble, Soldier, Scholar"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  disabled
                />
              </div>
            </PremiumFeatureOverlay>
          ) : (
            <div className="space-y-4">
              <Label
                htmlFor="background"
                className="text-lg font-semibold block"
              >
                Character Background
              </Label>
              <Input
                id="background"
                placeholder="e.g., Noble, Soldier, Scholar"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              />
            </div>
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

      <NameResults names={names} />
    </NameGeneratorLayout>
  );
}
