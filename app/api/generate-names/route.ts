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

    // Require authentication for all requests
    if (!session) {
      return NextResponse.json(
        { error: 'Please create an account to generate names.' },
        { status: 401 }
      );
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
