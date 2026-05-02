import { NextResponse } from "next/server";
import { db } from "@/db";
import { memories } from "@/db/schema";
import { verifyToken } from "@/utils/auth";
import { synthesisSchema } from "@/utils/validation";
import { eq, inArray, and } from "drizzle-orm";
import { generateAIResponse, generateSynthesisPrompt } from "@/utils/ai/local";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { userId } = verifyToken(token);

    const body = await request.json();
    const result = synthesisSchema.safeParse(body);
    if (!result.success) {
      const issue = result.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Invalid input" }, { status: 400 });
    }

    const { memoryIds } = result.data;

    // Fetch memories belonging to user
    const memoriesData = await db
      .select({ content: memories.content })
      .from(memories)
      .where(
        and(
          eq(memories.userId, userId),
          inArray(memories.id, memoryIds)
        )
      );

    if (memoriesData.length === 0) {
      return NextResponse.json({ error: "No memories found" }, { status: 404 });
    }

    const contents = memoriesData.map((m: { content: string }) => m.content);

    // Generate synthesis
    const prompt = generateSynthesisPrompt(contents);
    const synthesis = await generateAIResponse(prompt);

    if (!synthesis) {
      return NextResponse.json({ error: "Failed to generate synthesis" }, { status: 500 });
    }

    return NextResponse.json({ synthesis, memoryCount: memoriesData.length });
  } catch (error) {
    console.error("POST /api/synthesis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
