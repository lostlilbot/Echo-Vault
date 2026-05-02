import { NextResponse } from "next/server";
import { db } from "@/db";
import { memories, echoes } from "@/db/schema";
import { createPaste } from "@/utils/pastebin";
import { verifyToken } from "@/utils/auth";
import { createMemorySchema } from "@/utils/validation";
import { eq, desc } from "drizzle-orm";
import { generateAIResponse, generateEchoPrompt } from "@/utils/ai/local";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { userId } = verifyToken(token);

    // Fetch memories for user
    const userMemories = await db
      .select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.createdAt));

    return NextResponse.json({ memories: userMemories });
  } catch (error) {
    console.error("GET /api/memories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { userId } = verifyToken(token);

    const body = await request.json();
    const result = createMemorySchema.safeParse(body);
    if (!result.success) {
      const issue = result.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Invalid input" }, { status: 400 });
    }

    const { title, content } = result.data;

    // Create paste on Pastebin
    const paste = await createPaste(title, content);

    // Insert memory
    const [memory] = await db.insert(memories).values({
      userId,
      pastebinUrl: paste.url,
      pastebinKey: paste.key,
      title,
      content,
    }).returning();

    // Generate echo asynchronously (fire and forget)
    generateEchoAndStore(memory.id, content).catch(console.error);

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error("POST /api/memories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateEchoAndStore(memoryId: number, content: string) {
  try {
    const prompt = generateEchoPrompt(content);
    const insight = await generateAIResponse(prompt);
    if (insight) {
      await db.insert(echoes).values({
        memoryId,
        insight,
      });
    }
  } catch (error) {
    console.error("Echo generation failed:", error);
  }
}
