// lib/analyzer.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, Claim } from "./types";
import { searchEvidence } from "./retriever";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function analyzeDocument(
  fullText: string,
  chunks: any[],
  metadata: any
): Promise<AnalysisResult> {
  const prompt = `
You are an AI assistant. Analyze the following text and output JSON with:
- "summary": array of 3-5 key findings
- "claims": each with id, text, confidence (0-1)

TEXT:
${fullText}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("Gemini returned invalid JSON: " + responseText);
  }

  // Retrieve evidence for each claim
  const claims: Claim[] = [];
  const evidence: any = {};

  for (const [i, claim] of parsed.claims.entries()) {
    const evidenceSnippets = await searchEvidence(claim.text, 5);
    claims.push({
      ...claim,
      id: claim.id || `claim_${i}`,
      supportingChunks: evidenceSnippets.map((e) => e.chunkId),
      supportCount: evidenceSnippets.length,
    });

    evidenceSnippets.forEach((e) => {
      evidence[e.chunkId] = e;
    });
  }

  return {
    summary: parsed.summary,
    claims,
    evidence,
    chunks,
    metadata,
  };
}
