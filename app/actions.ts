'use server';

import { generateNames, NameGenerationParams } from '@/lib/openai';

export async function generateBabyNames(params: NameGenerationParams) {
  try {
    const names = await generateNames(params);
    return { success: true, data: names };
  } catch (error) {
    console.error('Error generating names:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to generate names',
    };
  }
}
