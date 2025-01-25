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

export default function BabyNamesPage() {
  const [gender, setGender] = useState<string>('neutral');
  const [style, setStyle] = useState<string>('');
  const [length, setLength] = useState<number>(50);
  const [count, setCount] = useState<number>(5);
  const [popularity, setPopularity] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);

  const { user, credits, isLoading } = useAuthStore();

  const getPopularityLabel = useCallback((value: number) => {
    if (value === 0) return 'Super Unique 🦄';
    if (value <= 25) return 'Rare ⭐';
    if (value <= 50) return 'Balanced 🎯';
    if (value <= 75) return 'Popular 🌟';
    return 'Trending 🔥';
  }, []);

  const getLengthLabel = useCallback((value: number) => {
    if (value === 0) return 'Tiny 🐣';
    if (value <= 25) return 'Short 🌱';
    if (value <= 50) return 'Medium 🌿';
    if (value <= 75) return 'Long 🌳';
    return 'Extra Long 🌲';
  }, []);

  const getLengthValue = useCallback((value: number) => {
    if (value === 0) return 3;
    if (value <= 25) return 4;
    if (value <= 50) return 5;
    if (value <= 75) return 6;
    return 7;
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
          type: 'baby-names',
          gender,
          style,
          length: getLengthValue(length),
          count,
          popularity,
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
  }, [credits, user, gender, style, length, count, popularity, getLengthValue]);

  const showPremiumOverlay = !user || credits < 20;

  return (
    <NameGeneratorLayout title="Generate Baby Names">
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
          {showPremiumOverlay ? (
            <PremiumFeatureOverlay message="Unlock advanced name customization with style and length controls!">
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

      <NameResults names={names} />
    </NameGeneratorLayout>
  );
}
