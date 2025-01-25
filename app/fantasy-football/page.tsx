'use client';

import { useState, useEffect } from 'react';
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

export default function FantasyFootballPage() {
  const [style, setStyle] = useState<string>('funny');
  const [theme, setTheme] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(50);
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);

  const { user, credits, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const getIntensityLabel = (value: number) => {
    if (value === 0) return 'Mild 😊';
    if (value <= 25) return 'Playful 😄';
    if (value <= 50) return 'Competitive 💪';
    if (value <= 75) return 'Fierce 🔥';
    return 'Savage 😈';
  };

  const handleGenerate = async () => {
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
          type: 'fantasy-football',
          style,
          theme,
          intensity,
          count,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNames(data.names);
      } else {
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

  const showPremiumOverlay = !isLoading && (!user || credits < 20);

  return (
    <NameGeneratorLayout title="Generate Fantasy Football Team Names">
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
            Style
          </Label>
          <RadioGroup
            value={style}
            onValueChange={setStyle}
            className="flex flex-wrap gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="funny" id="funny" />
              <Label htmlFor="funny">Funny</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="clever" id="clever" />
              <Label htmlFor="clever">Clever</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="intimidating" id="intimidating" />
              <Label htmlFor="intimidating">Intimidating</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Label
            htmlFor="intensity"
            className="text-base sm:text-lg font-semibold block"
          >
            Intensity: {getIntensityLabel(intensity)}
          </Label>
          <Slider
            id="intensity"
            min={0}
            max={100}
            step={25}
            value={[intensity]}
            onValueChange={(value) => setIntensity(value[0])}
            className="w-full max-w-xs"
          />
          <div className="flex justify-between text-sm text-gray-500 max-w-xs">
            <span>😊</span>
            <span>😄</span>
            <span>💪</span>
            <span>🔥</span>
            <span>😈</span>
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
          {isLoading ? (
            <div className="space-y-4 opacity-50">
              <Label htmlFor="theme" className="text-lg font-semibold block">
                Team Theme
              </Label>
              <Input
                id="theme"
                placeholder="e.g., Movie references, Pop culture, Sports legends"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                disabled
              />
            </div>
          ) : showPremiumOverlay ? (
            <PremiumFeatureOverlay message="Unlock advanced team customization with themed names!">
              <div className="space-y-4">
                <Label htmlFor="theme" className="text-lg font-semibold block">
                  Team Theme
                </Label>
                <Input
                  id="theme"
                  placeholder="e.g., Movie references, Pop culture, Sports legends"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  disabled
                />
              </div>
            </PremiumFeatureOverlay>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="theme" className="text-lg font-semibold block">
                Team Theme
              </Label>
              <Input
                id="theme"
                placeholder="e.g., Movie references, Pop culture, Sports legends"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
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
