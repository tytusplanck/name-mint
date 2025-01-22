'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';

export default function BabyNamesPage() {
  const [gender, setGender] = useState<string>('neutral');
  const [style, setStyle] = useState<string>('');
  const [length, setLength] = useState<number>(5);
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender, style, length, count }),
      });
      const data = await response.json();
      setNames(data.names);
    } catch (error) {
      console.error('Failed to generate names:', error);
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
      <h1 className="text-4xl font-bold font-montserrat text-[#333333] mb-8">
        Generate Baby Names
      </h1>

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
            Name Length: {length} letters
          </Label>
          <Slider
            id="length"
            min={2}
            max={12}
            step={1}
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            className="max-w-xs"
          />
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
