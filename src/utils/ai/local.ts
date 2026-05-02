import { pipeline, env } from "@xenova/transformers";

// Skip local model checks; we'll use remote hub
env.allowLocalModels = false;
env.useBrowserCache = false;

let generator: any = null;

async function getGenerator() {
  if (!generator) {
    console.log("Loading AI model (first run will download ~300MB)...");
    generator = await pipeline("text2text-generation", "Xenova/flan-t5-small", {
      progress_callback: (data: any) => {
        if (data.status === "progress") {
          const file = data.file?.split("/").pop() || "";
          const progress = data.progress?.toFixed(2) || 0;
          console.log(`Downloading model file: ${file} (${progress}%)`);
        }
      },
    });
    console.log("AI model loaded successfully.");
  }
  return generator;
}

export async function generateAIResponse(prompt: string): Promise<string> {
  try {
    const gen = await getGenerator();
    const output = await gen(prompt, {
      max_new_tokens: 256,
      temperature: 0.7,
      top_k: 50,
      do_sample: true,
    });
    const text = output[0]?.generated_text?.trim();
    return text || "";
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export function generateEchoPrompt(memoryContent: string): string {
  return `Given the following memory, generate a brief, insightful reflection or follow-up thought (1-2 sentences):\n\nMemory: "${memoryContent}"\n\nInsight:`;
}

export function generateSynthesisPrompt(memories: string[]): string {
  const memoriesText = memories
    .map((m, i) => `Memory ${i + 1}: "${m}"`)
    .join("\n\n");
  return `Given the following memories, synthesize a unified insight connecting them (2-3 sentences):\n\n${memoriesText}\n\nSynthesis:`;
}
