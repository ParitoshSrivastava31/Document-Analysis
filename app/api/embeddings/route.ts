// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// export async function POST(request: NextRequest) {
//   try {
//     const { chunks } = await request.json();

//     if (!chunks || chunks.length === 0) {
//       throw new Error("No chunks provided for embedding generation");
//     }

//     // Use Gemini's embedding model
//     const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

//     const chunksWithEmbeddings = await Promise.all(
//       chunks.map(async (chunk: any) => {
//         try {
//           const result = await model.embedContent(chunk.text);
//           return {
//             ...chunk,
//             embedding: result.embedding.values || [],
//           };
//         } catch (embeddingError) {
//           console.warn(`Failed to embed chunk ${chunk.id}:`, embeddingError);
//           // Return chunk with null embedding as fallback
//           return {
//             ...chunk,
//             embedding: null,
//           };
//         }
//       })
//     );

//     return NextResponse.json({
//       chunks: chunksWithEmbeddings,
//       embeddingModel: "text-embedding-004",
//       dimensions: 768, // Gemini embedding dimension
//       processedCount: chunksWithEmbeddings.filter((c) => c.embedding !== null)
//         .length,
//     });
//   } catch (error) {
//     console.error("Embeddings error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to generate embeddings",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// Updated src/app/api/embeddings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { chunks } = await request.json();
    if (!chunks || chunks.length === 0) {
      throw new Error("No chunks provided for embedding generation");
    }

    // Check if Google API key is configured
    const googleApiKey = process.env.GOOGLE_API_KEY;

    if (!googleApiKey) {
      console.warn("Google API key not configured, using mock embeddings");
      return generateMockEmbeddings(chunks);
    }

    try {
      // Initialize Gemini with free tier embedding model
      const genAI = new GoogleGenerativeAI(googleApiKey);
      const model = genAI.getGenerativeModel({ model: "embedding-001" }); // Free tier embedding model

      // Process chunks in batches to avoid rate limits
      const batchSize = 5; // Reduced batch size for free tier
      const chunksWithEmbeddings: any[] = [];

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        const batchResults = await Promise.all(
          batch.map(async (chunk: any) => {
            try {
              const result = await model.embedContent(chunk.text);
              return {
                ...chunk,
                embedding: result.embedding.values || [],
              };
            } catch (embeddingError) {
              console.warn(
                `Failed to embed chunk ${chunk.id}:`,
                embeddingError
              );
              // Return chunk with null embedding as fallback
              return {
                ...chunk,
                embedding: null,
              };
            }
          })
        );

        chunksWithEmbeddings.push(...batchResults);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < chunks.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return NextResponse.json({
        chunks: chunksWithEmbeddings,
        embeddingModel: "embedding-001",
        dimensions: 768, // Gemini embedding dimension
        processedCount: chunksWithEmbeddings.filter((c) => c.embedding !== null)
          .length,
      });
    } catch (geminiError) {
      console.error("Gemini embedding error:", geminiError);
      console.warn("Falling back to mock embeddings");
      return generateMockEmbeddings(chunks);
    }
  } catch (error) {
    console.error("Embeddings error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate embeddings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Generate mock embeddings for fallback
function generateMockEmbeddings(chunks: any[]) {
  const chunksWithEmbeddings = chunks.map((chunk: any) => ({
    ...chunk,
    embedding: Array.from({ length: 768 }, () => Math.random() * 2 - 1), // Mock 768-dim embedding
  }));

  return NextResponse.json({
    chunks: chunksWithEmbeddings,
    embeddingModel: "mock-embeddings-v1",
    dimensions: 768,
    processedCount: chunks.length,
  });
}
