import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getGenerator, GeneratorType, GeneratorParams } from '@/lib/generators';

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

    const { type, ...params } = await req.json();
    const generatorType = type as GeneratorType;
    const generator = getGenerator(generatorType);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: generator.systemPrompt,
        },
        {
          role: 'user',
          content: generator.generatePrompt(
            params as GeneratorParams[typeof generatorType]
          ),
        },
      ],
      temperature: generator.temperature,
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
