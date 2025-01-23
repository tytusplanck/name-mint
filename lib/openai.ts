import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NameGenerationParams {
  gender?: 'boy' | 'girl' | 'neutral';
  style?: string[];
  origin?: string[];
  startsWith?: string;
  endsWith?: string;
  syllables?: number;
  count?: number;
}

export async function generateNames(
  params: NameGenerationParams
): Promise<string[]> {
  const {
    gender = 'neutral',
    style = [],
    origin = [],
    startsWith = '',
    endsWith = '',
    syllables,
    count = 10,
  } = params;

  let prompt = `Generate ${count} unique baby names`;

  if (gender !== 'neutral') {
    prompt += ` for a ${gender}`;
  }

  if (style.length > 0) {
    prompt += ` that are ${style.join(' and ')}`;
  }

  if (origin.length > 0) {
    prompt += ` with ${origin.join(' or ')} origin`;
  }

  if (startsWith) {
    prompt += ` starting with "${startsWith}"`;
  }

  if (endsWith) {
    prompt += ` ending with "${endsWith}"`;
  }

  if (syllables) {
    prompt += ` with ${syllables} syllables`;
  }

  prompt += `. Return only the names as a comma-separated list, nothing else.`;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that generates baby names based on specific criteria. Always return names that are appropriate and respectful.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 150,
  });

  const response = completion.choices[0]?.message?.content || '';
  return response
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}
