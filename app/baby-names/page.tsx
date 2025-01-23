'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import { getUsageCount, incrementUsage, getRemainingUsage } from '@/lib/usage';

export default function BabyNamesPage() {
  const [gender, setGender] = useState<string>('neutral');
  const [style, setStyle] = useState<string>('');
  const [length, setLength] = useState<number>(50);
  const [count, setCount] = useState<number>(5);
  const [popularity, setPopularity] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);
  const [remainingUsage, setRemainingUsage] = useState<number>(3);

  useEffect(() => {
    setRemainingUsage(getRemainingUsage());
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
    if (getUsageCount() >= 3) {
      alert(
        'You have reached your free usage limit. Please purchase credits to continue.'
      );
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
          gender,
          style,
          length: getLengthValue(length),
          count,
          popularity,
          currentUsage: getUsageCount(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNames(data.names);
        incrementUsage();
        setRemainingUsage(getRemainingUsage());
      } else {
        console.error('Failed to generate names:', data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to generate names:', error);
      alert('Failed to generate names. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl p-6 bg-white min-h-screen">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          ← Back to Home
        </Button>
      </Link>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-montserrat text-[#333333]">
          Generate Baby Names
        </h1>
        <div className="text-sm text-gray-600">
          {remainingUsage > 0 ? (
            <span>{remainingUsage} free generations remaining</span>
          ) : (
            <span className="text-red-600">Free limit reached</span>
          )}
        </div>
      </div>

      <form className="space-y-6 mb-8">
        <div>
          <Label className="text-lg font-semibold mb-2 block">Gender</Label>
          <RadioGroup
            value={gender}
            onValueChange={setGender}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="boy" id="boy" />
              <Label htmlFor="boy">Boy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="girl" id="girl" />
              <Label htmlFor="girl">Girl</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="neutral" id="neutral" />
              <Label htmlFor="neutral">Neutral</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="style" className="text-lg font-semibold mb-2 block">
            Name Style
          </Label>
          <Input
            id="style"
            placeholder="e.g., Modern, Classic, Unique"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="length" className="text-lg font-semibold mb-2 block">
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
          <div className="flex justify-between text-sm text-gray-500 mt-1 max-w-xs">
            <span>🐣</span>
            <span>🌱</span>
            <span>🌿</span>
            <span>🌳</span>
            <span>🌲</span>
          </div>
        </div>

        <div>
          <Label
            htmlFor="popularity"
            className="text-lg font-semibold mb-2 block"
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
            className="max-w-xs"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1 max-w-xs">
            <span>🦄</span>
            <span>⭐</span>
            <span>🎯</span>
            <span>🌟</span>
            <span>🔥</span>
          </div>
        </div>

        <div>
          <Label htmlFor="count" className="text-lg font-semibold mb-2 block">
            Number of Names: {count}
          </Label>
          <Slider
            id="count"
            min={1}
            max={10}
            step={1}
            value={[count]}
            onValueChange={(value) => setCount(value[0])}
            className="max-w-xs"
          />
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          className="bg-[#63BCA5] text-white font-inter py-3 px-6 text-lg hover:bg-[#52AB94] transition-colors"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Names'}
        </Button>
      </form>

      {names.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold font-montserrat text-[#333333] mb-4">
            Generated Names
          </h2>
          <ul className="space-y-2">
            {names.map((name, index) => (
              <li key={index} className="text-lg font-inter">
                {name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
