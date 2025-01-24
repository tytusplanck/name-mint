import { BaseGeneratorParams, Generator } from './types';

export interface BabyNameParams extends BaseGeneratorParams {
  gender: 'boy' | 'girl' | 'neutral';
  style?: string;
  length: number;
  popularity: number;
}

const getPopularityDescription = (popularity: number): string => {
  if (popularity === 100) return 'very common and popular';
  if (popularity === 0) return 'extremely unique and rare';
  if (popularity < 30) return 'unique and uncommon';
  if (popularity < 70) return 'moderately common';
  return 'fairly popular';
};

const getLengthDescription = (length: number): string => {
  if (length === 3) return 'very short (around 3 letters)';
  if (length === 4) return 'short (around 4 letters)';
  if (length === 5) return 'medium length (around 5 letters)';
  if (length === 6) return 'somewhat long (around 6 letters)';
  return 'long (around 7 letters)';
};

export const babyNameGenerator: Generator<BabyNameParams> = {
  config: {
    title: 'Baby Names',
    description: 'Generate unique and meaningful names for your little one',
    icon: '👶',
    gradient: 'from-[#63BCA5] to-[#52AB94]',
  },
  systemPrompt:
    'You are a helpful assistant that generates baby names based on specific criteria. Always return names that are appropriate and respectful.',
  temperature: 0.7,
  generatePrompt: ({ count, gender, style, length, popularity }) => {
    const popularityDesc = getPopularityDescription(popularity);
    const lengthDesc = getLengthDescription(length);

    return `Generate ${count} unique ${gender} baby names that are ${lengthDesc}. 
    The style should be ${style || 'any'}. 
    The names should be ${popularityDesc}.
    Each name should be on a new line.
    Only return the names, no additional text.`;
  },
};
