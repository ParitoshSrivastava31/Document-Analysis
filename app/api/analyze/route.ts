// // Updated src/app/api/analyze/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { AnalysisResult, Claim, EvidenceSnippet } from "@/lib/types";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// export async function POST(request: NextRequest) {
//   try {
//     const { chunks, metadata } = await request.json();
//     if (!chunks || chunks.length === 0) {
//       throw new Error("No chunks provided for analysis");
//     }

//     // Check if Google API key is configured
//     const googleApiKey = process.env.GOOGLE_API_KEY;

//     if (!googleApiKey) {
//       console.warn(
//         "Google API key not configured, using intelligent mock analysis"
//       );
//       return generateIntelligentMockAnalysis(chunks, metadata);
//     }

//     try {
//       // Initialize Gemini with free tier model
//       const genAI = new GoogleGenerativeAI(googleApiKey);
//       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Changed to free tier model

//       // Prepare chunks data for analysis - limit to 8 chunks for free tier
//       const chunksForAnalysis = chunks.slice(0, 8);

//       const prompt = `Analyze this document and create a 3-line summary with evidence mapping.
// Document: ${metadata.title || "Unknown"}
// Source: ${metadata.source || "Unknown"}
// Text chunks:
// ${chunksForAnalysis
//   .map(
//     (chunk: any) =>
//       `${chunk.id}: "${chunk.text.substring(0, 300)}${
//         chunk.text.length > 300 ? "..." : ""
//       }"`
//   )
//   .join("\n\n")}
// Return ONLY a JSON object with this structure:
// {
//   "summary": ["sentence1", "sentence2", "sentence3"],
//   "claims": [
//     {
//       "id": "claim_1",
//       "text": "sentence1",
//       "supportingChunks": ["chunk_0"],
//       "confidence": 0.85,
//       "supportCount": 1
//     }
//   ]
// }
// Rules:
// - Exactly 3 summary sentences (15-25 words each)
// - Each claim must reference existing chunk IDs: ${chunksForAnalysis
//         .map((c: any) => c.id)
//         .join(", ")}
// - Confidence 0.6-1.0 based on evidence strength
// - supportCount = length of supportingChunks array`;

//       const result = await model.generateContent(prompt);
//       const response = await result.response;
//       const text = response.text();

//       // Parse Gemini response
//       let analysisData;
//       try {
//         // Clean the response and extract JSON
//         const cleanText = text
//           .replace(/```json\n?/g, "")
//           .replace(/```\n?/g, "")
//           .trim();
//         const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

//         if (jsonMatch) {
//           analysisData = JSON.parse(jsonMatch[0]);
//         } else {
//           throw new Error("No valid JSON found in Gemini response");
//         }
//       } catch (parseError) {
//         console.error("Failed to parse Gemini response:", text);
//         console.warn("Falling back to intelligent mock analysis");
//         return generateIntelligentMockAnalysis(chunks, metadata);
//       }

//       return processAnalysisResult(analysisData, chunks, metadata);
//     } catch (geminiError) {
//       console.error("Gemini API error:", geminiError);
//       console.warn("Falling back to intelligent mock analysis");
//       return generateIntelligentMockAnalysis(chunks, metadata);
//     }
//   } catch (error) {
//     console.error("Analysis error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to analyze content",
//         details: error instanceof Error ? error.message : "Unknown error",
//         timestamp: new Date().toISOString(),
//       },
//       { status: 500 }
//     );
//   }
// }

// // Intelligent mock analysis for development/fallback
// function generateIntelligentMockAnalysis(chunks: any[], metadata: any) {
//   const firstChunk = chunks[0]?.text || "";
//   const source = metadata.source || "document";

//   // Generate contextual summary based on actual content
//   const summary = [
//     `The ${source} discusses ${firstChunk
//       .substring(0, 50)
//       .toLowerCase()}... and related key concepts.`,
//     `Analysis reveals significant findings about ${
//       metadata.title?.split(" ").slice(0, 3).join(" ").toLowerCase() ||
//       "the subject matter"
//     } across multiple sections.`,
//     `The document presents evidence-based conclusions and recommendations for further consideration.`,
//   ];

//   const claims: Claim[] = summary.map((text, index) => ({
//     id: `claim_${index + 1}`,
//     text,
//     supportingChunks: chunks.slice(index, index + 2).map((c: any) => c.id),
//     confidence: 0.75 + Math.random() * 0.2, // 0.75-0.95
//     supportCount: Math.min(2, chunks.length - index),
//   }));

//   return processAnalysisResult({ summary, claims }, chunks, metadata);
// }

// // Process and validate analysis result
// function processAnalysisResult(
//   analysisData: any,
//   chunks: any[],
//   metadata: any
// ) {
//   // Validate response structure
//   if (
//     !analysisData.summary ||
//     !Array.isArray(analysisData.summary) ||
//     analysisData.summary.length !== 3
//   ) {
//     throw new Error("Invalid summary format - must be exactly 3 sentences");
//   }

//   if (!analysisData.claims || !Array.isArray(analysisData.claims)) {
//     throw new Error("Invalid claims format");
//   }

//   // Process claims and ensure valid chunk references
//   const processedClaims: Claim[] = analysisData.claims.map(
//     (claim: any, index: number) => {
//       const validChunks = (claim.supportingChunks || []).filter(
//         (chunkId: string) => chunks.some((chunk: any) => chunk.id === chunkId)
//       );

//       return {
//         id: claim.id || `claim_${index + 1}`,
//         text: claim.text || analysisData.summary[index] || `Claim ${index + 1}`,
//         supportingChunks:
//           validChunks.length > 0
//             ? validChunks
//             : [chunks[0]?.id].filter(Boolean),
//         confidence: Math.max(0.6, Math.min(1.0, claim.confidence || 0.75)),
//         supportCount: validChunks.length || 1,
//       };
//     }
//   );

//   // Generate evidence snippets
//   const evidence: Record<string, EvidenceSnippet> = {};
//   const allReferencedChunks = new Set(
//     processedClaims.flatMap((claim) => claim.supportingChunks)
//   );

//   allReferencedChunks.forEach((chunkId) => {
//     const chunk = chunks.find((c: any) => c.id === chunkId);
//     if (chunk) {
//       evidence[chunkId] = {
//         chunkId: chunk.id,
//         text: chunk.text,
//         source: chunk.metadata.source || "Unknown",
//         charStart: chunk.charStart,
//         charEnd: chunk.charEnd,
//         url: chunk.metadata.url,
//         title: chunk.metadata.title,
//         page: chunk.pageNumber,
//         favicon: chunk.metadata.url
//           ? `https://www.google.com/s2/favicons?domain=${extractDomain(
//               chunk.metadata.url
//             )}`
//           : undefined,
//       };
//     }
//   });

//   const finalResult: AnalysisResult = {
//     summary: analysisData.summary,
//     claims: processedClaims,
//     evidence,
//     chunks,
//     metadata: {
//       ...metadata,
//       analyzedAt: new Date().toISOString(),
//       model: process.env.GOOGLE_API_KEY ? "gemini-1.5-flash" : "mock-analysis",
//       chunksAnalyzed: Math.min(8, chunks.length), // Updated to match free tier limit
//     },
//   };

//   return NextResponse.json(finalResult);
// }

// function extractDomain(url: string): string {
//   try {
//     return new URL(url).hostname.replace("www.", "");
//   } catch {
//     return "unknown";
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import {
  AnalysisResult,
  Claim,
  EvidenceSnippet,
  SourceDocument,
  SourceComparison,
  MultiSourceAnalysisResult,
} from "@/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { sourceDocuments } = await request.json();

    if (!sourceDocuments || sourceDocuments.length === 0) {
      throw new Error("No sources provided for analysis");
    }

    // Check if Google API key is configured
    const googleApiKey = process.env.GOOGLE_API_KEY;

    if (!googleApiKey) {
      console.warn(
        "Google API key not configured, using intelligent mock analysis"
      );
      return generateIntelligentMockAnalysis(sourceDocuments);
    }

    try {
      // Initialize Gemini with free tier model
      const genAI = new GoogleGenerativeAI(googleApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Prepare data for analysis - limit chunks per source
      const maxChunksPerSource = 5;
      const sourcesForAnalysis = sourceDocuments.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        source: doc.source,
        chunks: doc.chunks.slice(0, maxChunksPerSource).map((chunk: any) => ({
          id: chunk.id,
          text:
            chunk.text.substring(0, 300) +
            (chunk.text.length > 300 ? "..." : ""),
        })),
      }));

      const prompt = `Compare these ${
        sourceDocuments.length
      } sources and identify consistent claims, contradictions, and unique perspectives.

Sources:
${sourcesForAnalysis
  .map(
    (doc: any) => `
Source ID: ${doc.id}
Title: ${doc.title}
Source: ${doc.source}
Content:
${doc.chunks.map((chunk: any) => `${chunk.id}: "${chunk.text}"`).join("\n")}
`
  )
  .join("\n")}

Return ONLY a JSON object with this structure:
{
  "summary": ["sentence1", "sentence2", "sentence3"],
  "claims": [
    {
      "id": "claim_1",
      "text": "claim text",
      "sourceId": "source_id",
      "supportingChunks": ["chunk_id"],
      "confidence": 0.85,
      "supportCount": 1
    }
  ],
  "sourceComparisons": [
    {
      "claimId": "claim_1",
      "claimText": "claim text",
      "sources": {
        "source_id_1": {
          "supports": true,
          "confidence": 0.9,
          "evidence": "supporting quote",
          "chunkId": "chunk_id"
        },
        "source_id_2": {
          "supports": false,
          "confidence": 0.8,
          "evidence": "contradictory quote",
          "chunkId": "chunk_id"
        }
      },
      "consensusLevel": "contradictory",
      "supportCount": 1,
      "contradictionCount": 1
    }
  ],
  "consensusScore": 65,
  "uniquePerspectives": ["perspective1", "perspective2"]
}

Rules:
- Exactly 3 summary sentences (15-25 words each)
- Identify claims that appear in multiple sources
- For each claim, check all sources for support or contradiction
- consensusLevel: "high" (all sources agree), "medium" (most agree), "low" (split), "contradictory" (direct contradiction)
- consensusScore: 0-100 based on overall agreement
- uniquePerspectives: 2-3 unique viewpoints found`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse Gemini response
      let analysisData;
      try {
        const cleanText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON found in Gemini response");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text);
        console.warn("Falling back to intelligent mock analysis");
        return generateIntelligentMockAnalysis(sourceDocuments);
      }

      return processMultiSourceAnalysisResult(analysisData, sourceDocuments);
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      console.warn("Falling back to intelligent mock analysis");
      return generateIntelligentMockAnalysis(sourceDocuments);
    }
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze content",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Process multi-source analysis result
function processMultiSourceAnalysisResult(
  analysisData: any,
  sourceDocuments: any[]
) {
  // Create flattened chunks and evidence
  const allChunks = sourceDocuments.flatMap((doc: any) =>
    doc.chunks.map((chunk: any) => ({
      ...chunk,
      sourceId: doc.id,
      sourceTitle: doc.title,
      sourceUrl: doc.url,
      source: doc.source,
    }))
  );

  // Generate evidence snippets
  const evidence: Record<string, EvidenceSnippet> = {};
  allChunks.forEach((chunk: any) => {
    evidence[chunk.id] = {
      chunkId: chunk.id,
      text: chunk.text,
      source: chunk.source,
      charStart: chunk.charStart,
      charEnd: chunk.charEnd,
      url: chunk.sourceUrl,
      title: chunk.sourceTitle,
      favicon: chunk.sourceUrl
        ? `https://www.google.com/s2/favicons?domain=${extractDomain(
            chunk.sourceUrl
          )}`
        : undefined,
    };
  });

  // Process claims
  const processedClaims = analysisData.claims.map((claim: any) => ({
    id: claim.id,
    text: claim.text,
    supportingChunks: claim.supportingChunks || [],
    confidence: claim.confidence || 0.75,
    supportCount: claim.supportCount || 1,
  }));

  // Process source comparisons
  const processedComparisons = analysisData.sourceComparisons.map(
    (comp: any) => ({
      claimId: comp.claimId,
      claimText: comp.claimText,
      sources: comp.sources,
      consensusLevel: comp.consensusLevel,
      supportCount: comp.supportCount,
      contradictionCount: comp.contradictionCount,
    })
  );

  const finalResult: MultiSourceAnalysisResult = {
    summary: analysisData.summary,
    claims: processedClaims,
    evidence,
    chunks: allChunks,
    metadata: {
      analyzedAt: new Date().toISOString(),
      model: "gemini-1.5-flash",
      sourcesAnalyzed: sourceDocuments.length,
      totalChunks: allChunks.length,
    },
    sourceDocuments: sourceDocuments.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      url: doc.url,
      source: doc.source,
      chunks: doc.chunks,
      metadata: doc.metadata,
    })),
    sourceComparisons: processedComparisons,
    consensusScore: analysisData.consensusScore || 50,
    uniquePerspectives: analysisData.uniquePerspectives || [],
  };

  return NextResponse.json(finalResult);
}

// Generate intelligent mock analysis for fallback
function generateIntelligentMockAnalysis(sourceDocuments: any[]) {
  // Create mock comparisons based on source count
  const comparisons: SourceComparison[] = [];

  if (sourceDocuments.length >= 2) {
    // Create a sample comparison
    comparisons.push({
      claimId: "claim_1",
      claimText: "The topic has significant implications for policy decisions",
      sources: {
        [sourceDocuments[0].id]: {
          supports: true,
          confidence: 0.85,
          evidence: "The research shows clear policy implications...",
          chunkId: sourceDocuments[0].chunks[0]?.id || "chunk_0",
        },
        [sourceDocuments[1].id]: {
          supports: true,
          confidence: 0.75,
          evidence: "Policy makers should consider these findings...",
          chunkId: sourceDocuments[1].chunks[0]?.id || "chunk_0",
        },
      },
      consensusLevel: "high",
      supportCount: 2,
      contradictionCount: 0,
    });

    if (sourceDocuments.length > 2) {
      comparisons.push({
        claimId: "claim_2",
        claimText: "Economic impacts remain uncertain",
        sources: {
          [sourceDocuments[0].id]: {
            supports: true,
            confidence: 0.8,
            evidence: "Economic forecasts show high variability...",
            chunkId: sourceDocuments[0].chunks[1]?.id || "chunk_1",
          },
          [sourceDocuments[2].id]: {
            supports: false,
            confidence: 0.7,
            evidence: "Economic impacts are clearly positive...",
            chunkId: sourceDocuments[2].chunks[1]?.id || "chunk_1",
          },
        },
        consensusLevel: "contradictory",
        supportCount: 1,
        contradictionCount: 1,
      });
    }
  }

  // Create flattened chunks
  const allChunks = sourceDocuments.flatMap((doc: any) =>
    doc.chunks.map((chunk: any) => ({
      ...chunk,
      sourceId: doc.id,
      sourceTitle: doc.title,
      sourceUrl: doc.url,
      source: doc.source,
    }))
  );

  // Generate evidence
  const evidence: Record<string, EvidenceSnippet> = {};
  allChunks.forEach((chunk: any) => {
    evidence[chunk.id] = {
      chunkId: chunk.id,
      text: chunk.text,
      source: chunk.source,
      charStart: chunk.charStart,
      charEnd: chunk.charEnd,
      url: chunk.sourceUrl,
      title: chunk.sourceTitle,
      favicon: chunk.sourceUrl
        ? `https://www.google.com/s2/favicons?domain=${extractDomain(
            chunk.sourceUrl
          )}`
        : undefined,
    };
  });

  const result: MultiSourceAnalysisResult = {
    summary: [
      "Multiple sources provide insights on this complex topic.",
      "While there is consensus on some aspects, significant disagreements exist.",
      "Further research is needed to resolve conflicting perspectives.",
    ],
    claims: comparisons.map((comp) => ({
      id: comp.claimId,
      text: comp.claimText,
      supportingChunks: Object.values(comp.sources).map((s: any) => s.chunkId),
      confidence: 0.75,
      supportCount: 1,
    })),
    evidence,
    chunks: allChunks,
    metadata: {
      analyzedAt: new Date().toISOString(),
      model: "mock-analysis",
      sourcesAnalyzed: sourceDocuments.length,
      totalChunks: allChunks.length,
    },
    sourceDocuments: sourceDocuments.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      url: doc.url,
      source: doc.source,
      chunks: doc.chunks,
      metadata: doc.metadata,
    })),
    sourceComparisons: comparisons,
    consensusScore: 65,
    uniquePerspectives: [
      "Economic perspective",
      "Social impact perspective",
      "Policy implementation perspective",
    ],
  };

  return NextResponse.json(result);
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}
