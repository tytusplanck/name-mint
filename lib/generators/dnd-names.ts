import { Generator } from './types';

export interface DnDNamesParams {
  race: string;
  characterClass: string;
  alignment?: string;
  background?: string;
  epicness: number;
  count: number;
}

export const dndNamesGenerator: Generator<DnDNamesParams> = {
  config: {
    title: 'D&D Character Names',
    description:
      'Generate fantasy names for your D&D characters with race, class, and alignment options',
    icon: '🐉',
    gradient: 'from-purple-500 to-red-500',
  },
  systemPrompt: `You are a creative D&D name generator. You will generate names that fit the specified race, class, alignment, and background.
Follow these rules:
1. Names should be lore-appropriate for the race and setting
2. Names should reflect the character's class and alignment if specified
3. Names should incorporate elements from the background if provided
4. Names should match the epicness level (0-100):
   - 0-25: Simple, common names
   - 26-50: Distinctive but not overly fancy
   - 51-75: Noble or heroic sounding
   - 76-100: Legendary or mythical names
5. Each name should be on a new line
6. Do not include any additional text or explanations`,

  generatePrompt: (params: DnDNamesParams) => {
    const epicnessLevel =
      params.epicness <= 25
        ? 'common'
        : params.epicness <= 50
        ? 'distinctive'
        : params.epicness <= 75
        ? 'heroic'
        : 'legendary';

    let prompt = `Generate ${params.count} unique D&D character names for a ${params.race} ${params.characterClass}`;

    if (params.alignment) {
      prompt += ` with ${params.alignment} alignment`;
    }

    if (params.background) {
      prompt += ` and background as ${params.background}`;
    }

    prompt += `.\nThe names should be ${epicnessLevel} in style.`;

    return prompt;
  },

  temperature: 0.8,
};
