import { BaseGeneratorParams, Generator } from './types';

export interface FantasyFootballParams extends BaseGeneratorParams {
  theme?: 'funny' | 'intimidating' | 'classic';
  style?: string;
  playerName?: string;
  cleverness: number;
}

const getClevernessLevel = (cleverness: number): string => {
  if (cleverness === 0) return 'simple and straightforward';
  if (cleverness <= 25) return 'casual and fun';
  if (cleverness <= 50) return 'clever and witty';
  if (cleverness <= 75) return 'very witty with wordplay';
  return 'extremely clever with complex references';
};

const EXAMPLE_NAMES = [
  'The Touchdown Tyrants',
  'Gridiron Guardians',
  'Fourth and Twenty',
  'Run CMC',
  'Stafford Infection',
];

export const fantasyFootballGenerator: Generator<FantasyFootballParams> = {
  config: {
    title: 'Fantasy Football',
    description: 'Create clever and competitive team names for your league',
    icon: '🏈',
    gradient: 'from-[#4F46E5] to-[#3730A3]',
  },
  systemPrompt:
    'You are a creative assistant that specializes in generating clever and engaging fantasy football team names. You excel at wordplay, sports references, and pop culture integration.',
  temperature: 0.9,
  examples: EXAMPLE_NAMES,
  generatePrompt: ({ count, theme, style, playerName, cleverness }) => {
    const clevernessLevel = getClevernessLevel(cleverness);

    return `Generate ${count} unique fantasy football team names that are ${clevernessLevel}.
    ${
      theme
        ? `The theme should be "${theme}" (funny, intimidating, or classic).`
        : ''
    }
    ${
      style
        ? `Incorporate elements of ${style} (e.g., pop culture, movie references).`
        : ''
    }
    ${
      playerName
        ? `Try to incorporate the player name "${playerName}" where appropriate.`
        : ''
    }
    The names should be creative and engaging, suitable for a fantasy football league.
    Focus on pop culture references, sports puns, and player-based wordplay.
    Each name should be on a new line.
    Only return the names, no additional text.
    Examples of good names: ${EXAMPLE_NAMES.join(', ')}`;
  },
};
