import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { gender, style, length, count, currentUsage, popularity } =
      await req.json();

    // Check if user has exceeded free limit
    if (currentUsage >= 3) {
      return NextResponse.json(
        {
          error:
            'Free usage limit exceeded. Please purchase credits to continue.',
        },
        { status: 403 }
      );
    }

    const popularityPrompt =
      popularity === 100
        ? 'very common and popular'
        : popularity === 0
        ? 'extremely unique and rare'
        : popularity < 30
        ? 'unique and uncommon'
        : popularity < 70
        ? 'moderately common'
        : 'fairly popular';

    const lengthDescription =
      length === 3
        ? 'very short (around 3 letters)'
        : length === 4
        ? 'short (around 4 letters)'
        : length === 5
        ? 'medium length (around 5 letters)'
        : length === 6
        ? 'somewhat long (around 6 letters)'
        : 'long (around 7 letters)';

    const prompt = `Generate ${count} unique ${gender} baby names that are ${lengthDescription}. 
    The style should be ${style || 'any'}. 
    The names should be ${popularityPrompt}.
    Each name should be on a new line.
    Only return the names, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const generatedNames =
      completion.choices[0].message.content?.trim().split('\n') || [];

    return NextResponse.json({
      names: generatedNames,
      remainingUsage: 3 - (currentUsage + 1),
    });
  } catch (error) {
    console.error('Error generating names:', error);
    return NextResponse.json(
      { error: 'Failed to generate names' },
      { status: 500 }
    );
  }
}
