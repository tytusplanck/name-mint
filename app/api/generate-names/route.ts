import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { gender, style, length, count } = await req.json()

    const prompt = `Generate ${count} unique ${gender} baby names that are ${length} letters long. 
    The style should be ${style || "any"}. 
    Each name should be on a new line.
    Only return the names, no additional text.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    const generatedNames = completion.choices[0].message.content?.trim().split("\n") || []

    return NextResponse.json({ names: generatedNames })
  } catch (error) {
    console.error("Error generating names:", error)
    return NextResponse.json({ error: "Failed to generate names" }, { status: 500 })
  }
}

