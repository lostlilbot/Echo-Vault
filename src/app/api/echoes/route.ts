import { NextResponse } from "next/server";
import { db } from "@/db";
import { memories, echoes } from "@/db/schema";
import { verifyToken } from "@/utils/auth";
import { echoSchema } from "@/utils/validation";
import { eq } from "drizzle-orm";
import { generateAIResponse, generateEchoPrompt } from "@/utils/ai/local";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { userId } = verifyToken(token);

    const body = await request.json();
    const result = echoSchema.safeParse(body);
    if (!result.success) {
      const issue = result.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Invalid input" }, { status: 400 });
    }

    const { memoryId } = result.data;

    // Verify memory exists and belongs to user
    const [memory] = await db
      .select()
      .from(memories)
      .where(eq(memories.id, memoryId))
      .limit(1);

    if (!memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    if (memory.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if echo already exists
    const existing = await db
      .select()
      .from(echoes)
      .where(eq(echoes.memoryId, memoryId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ insight: existing[0].insight });
    }

    // Generate echo
    const prompt = generateEchoPrompt(memory.content);
    const insight = await generateAIResponse(prompt);

    if (!insight) {
      return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
    }

    // Save echo
    const [echo] = await db.insert(echoes).values({
      memoryId,
      insight,
    }).returning();

    return NextResponse.json(echo, { status: 201 });
  } catch (error) {
    console.error("POST /api/echoes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
