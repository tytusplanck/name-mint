import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let freeUsageCount = 0;
    // Check free usage for unauthenticated users
    if (!session) {
      freeUsageCount = parseInt(
        req.cookies.get('name_generator_usage')?.value || '0'
      );
      if (freeUsageCount >= 3) {
        return NextResponse.json(
          { error: 'Please create an account to continue generating names.' },
          { status: 401 }
        );
      }
    }

    const { gender, style, length, count, popularity } = await req.json();

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

    // For unauthenticated users, update the cookie
    if (!session) {
      const response = NextResponse.json({ names: generatedNames });
      response.cookies.set(
        'name_generator_usage',
        (freeUsageCount + 1).toString()
      );
      return response;
    }

    return NextResponse.json({
      names: generatedNames,
    });
  } catch (error) {
    console.error('Error generating names:', error);
    return NextResponse.json(
      { error: 'Failed to generate names' },
      { status: 500 }
    );
  }
}
