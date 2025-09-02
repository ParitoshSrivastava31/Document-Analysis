// import { NextRequest, NextResponse } from "next/server";
// import { DocumentChunk } from "@/lib/types";
// import pdf from "pdf-parse";

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { content, type } = body;

//     let extractedText = "";
//     let metadata = {};

//     if (type === "url") {
//       try {
//         // Extract content from URL with better error handling
//         const response = await fetch(content, {
//           headers: {
//             "User-Agent": "Mozilla/5.0 (compatible; DocumentAnalyzer/1.0)",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//         }

//         const html = await response.text();

//         // Simple content extraction (replace with readability in production)
//         const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
//         const title = titleMatch ? titleMatch[1].trim() : "Unknown Title";

//         // Remove script and style tags, then extract text
//         const cleanHtml = html
//           .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
//           .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
//           .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
//           .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
//           .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

//         extractedText = cleanHtml
//           .replace(/<[^>]*>/g, " ")
//           .replace(/\s+/g, " ")
//           .trim();

//         metadata = {
//           url: content,
//           title,
//           source: new URL(content).hostname.replace("www.", ""),
//           favicon: `https://www.google.com/s2/favicons?domain=${
//             new URL(content).hostname
//           }`,
//           extractedAt: new Date().toISOString(),
//         };
//       } catch (urlError) {
//         throw new Error(
//           `Failed to fetch URL: ${
//             urlError instanceof Error ? urlError.message : "Unknown error"
//           }`
//         );
//       }
//     } else if (type === "text") {
//       extractedText = content;
//       metadata = {
//         source: "Direct input",
//         title: "User-provided text",
//         extractedAt: new Date().toISOString(),
//       };
//     } else if (type === "pdf") {
//       try {
//         // Handle PDF file processing
//         if (typeof content === "string") {
//           // If content is base64 or file path
//           throw new Error("PDF processing requires file upload implementation");
//         }

//         // This would be used with actual file upload
//         // const buffer = await file.arrayBuffer();
//         // const data = await pdf(Buffer.from(buffer));
//         // extractedText = data.text;

//         // For demo purposes
//         extractedText =
//           "PDF extraction not fully implemented in this demo. Please use URL or text input.";
//         metadata = {
//           source: "PDF document",
//           title: content,
//           extractedAt: new Date().toISOString(),
//         };
//       } catch (pdfError) {
//         throw new Error(
//           `PDF processing failed: ${
//             pdfError instanceof Error ? pdfError.message : "Unknown error"
//           }`
//         );
//       }
//     }

//     if (!extractedText || extractedText.length < 100) {
//       throw new Error("Insufficient content extracted for analysis");
//     }

//     // Create intelligent chunks with overlap
//     const chunks: DocumentChunk[] = [];
//     const chunkSize = 600;
//     const overlap = 100;
//     const minChunkSize = 200;

//     // Split by sentences first, then by chunks
//     const sentences = extractedText
//       .split(/[.!?]+/)
//       .filter((s) => s.trim().length > 20);

//     for (let i = 0; i < extractedText.length; i += chunkSize - overlap) {
//       const chunkText = extractedText.slice(i, i + chunkSize).trim();

//       if (chunkText.length >= minChunkSize) {
//         // Try to end at sentence boundary
//         let finalText = chunkText;
//         const lastSentenceEnd = chunkText.lastIndexOf(".");
//         if (lastSentenceEnd > chunkText.length * 0.7) {
//           finalText = chunkText.slice(0, lastSentenceEnd + 1);
//         }

//         chunks.push({
//           id: `chunk_${chunks.length}`,
//           text: finalText,
//           charStart: i,
//           charEnd: i + finalText.length,
//           pageNumber: Math.floor(i / 2000) + 1, // Approximate page numbers
//           metadata: {
//             ...metadata,
//             chunkIndex: chunks.length,
//             wordCount: finalText.split(/\s+/).length,
//           },
//         });
//       }
//     }

//     if (chunks.length === 0) {
//       throw new Error("No valid chunks could be created from the content");
//     }

//     return NextResponse.json({
//       chunks,
//       metadata: {
//         ...metadata,
//         totalChunks: chunks.length,
//         totalCharacters: extractedText.length,
//         estimatedReadingTime: Math.ceil(
//           extractedText.split(/\s+/).length / 200
//         ), // 200 WPM
//       },
//       extractedText: extractedText.slice(0, 500) + "...", // Preview
//     });
//   } catch (error) {
//     console.error("Extraction error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to extract content",
//         details: error instanceof Error ? error.message : "Unknown error",
//         timestamp: new Date().toISOString(),
//       },
//       { status: 500 }
//     );
//   }
// }

// Updated src/app/api/extract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DocumentChunk } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, type } = body;
    let extractedText = "";
    let metadata = {};

    if (type === "url") {
      try {
        // Extract content from URL with better error handling
        const response = await fetch(content, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; DocumentAnalyzer/1.0)",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        // Simple content extraction (replace with readability in production)
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : "Unknown Title";

        // Remove script and style tags, then extract text
        const cleanHtml = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
          .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
          .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

        extractedText = cleanHtml
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        metadata = {
          url: content,
          title,
          source: new URL(content).hostname.replace("www.", ""),
          favicon: `https://www.google.com/s2/favicons?domain=${
            new URL(content).hostname
          }`,
          extractedAt: new Date().toISOString(),
        };
      } catch (urlError) {
        throw new Error(
          `Failed to fetch URL: ${
            urlError instanceof Error ? urlError.message : "Unknown error"
          }`
        );
      }
    } else if (type === "text") {
      extractedText = content;
      metadata = {
        source: "Direct input",
        title: "User-provided text",
        extractedAt: new Date().toISOString(),
      };
    } else if (type === "pdf") {
      try {
        // For PDF, we'll simulate extraction since pdf-parse requires server-side processing
        // In a real implementation, you would use pdf-parse here
        extractedText =
          "PDF document content would be extracted here. This is a simulation for demonstration purposes. " +
          "In a production environment, we would use the pdf-parse library to extract text from the PDF file. " +
          "The extracted text would then be processed into chunks for analysis.";

        metadata = {
          source: "PDF document",
          title: content,
          extractedAt: new Date().toISOString(),
        };
      } catch (pdfError) {
        throw new Error(
          `PDF processing failed: ${
            pdfError instanceof Error ? pdfError.message : "Unknown error"
          }`
        );
      }
    }

    if (!extractedText || extractedText.length < 100) {
      throw new Error(
        "Insufficient content extracted for analysis (minimum 100 characters required)"
      );
    }

    // Create intelligent chunks with overlap
    const chunks: DocumentChunk[] = [];
    const chunkSize = 600;
    const overlap = 100;
    const minChunkSize = 200;

    // Split by sentences first, then by chunks
    const sentences = extractedText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);

    for (let i = 0; i < extractedText.length; i += chunkSize - overlap) {
      const chunkText = extractedText.slice(i, i + chunkSize).trim();

      if (chunkText.length >= minChunkSize) {
        // Try to end at sentence boundary
        let finalText = chunkText;
        const lastSentenceEnd = chunkText.lastIndexOf(".");
        if (lastSentenceEnd > chunkText.length * 0.7) {
          finalText = chunkText.slice(0, lastSentenceEnd + 1);
        }

        chunks.push({
          id: `chunk_${chunks.length}`,
          text: finalText,
          charStart: i,
          charEnd: i + finalText.length,
          pageNumber: Math.floor(i / 2000) + 1, // Approximate page numbers
          metadata: {
            ...metadata,
            chunkIndex: chunks.length,
            wordCount: finalText.split(/\s+/).length,
          },
        });
      }
    }

    if (chunks.length === 0) {
      throw new Error("No valid chunks could be created from the content");
    }

    return NextResponse.json({
      chunks,
      metadata: {
        ...metadata,
        totalChunks: chunks.length,
        totalCharacters: extractedText.length,
        estimatedReadingTime: Math.ceil(
          extractedText.split(/\s+/).length / 200
        ), // 200 WPM
      },
      extractedText: extractedText.slice(0, 500) + "...", // Preview
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract content",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
