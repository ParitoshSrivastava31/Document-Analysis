// "use client";

// import { useState, useCallback } from "react";
// import { AnalysisState, AnalysisResult } from "@/lib/types";

// export function useAnalysis() {
//   const [state, setState] = useState<AnalysisState>({
//     status: "idle",
//     progress: 0,
//     message: "Ready to analyze",
//   });

//   const analyzeContent = useCallback(
//     async (content: string, type: "url" | "text" | "pdf") => {
//       try {
//         setState({
//           status: "extracting",
//           progress: 10,
//           message: "Extracting content...",
//         });

//         // Step 1: Extract content
//         const extractResponse = await fetch("/api/extract", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ content, type }),
//         });

//         if (!extractResponse.ok) {
//           throw new Error("Failed to extract content");
//         }

//         const extractData = await extractResponse.json();

//         setState({
//           status: "indexing",
//           progress: 40,
//           message: `Building evidence index... (${
//             extractData.chunks?.length || 0
//           } chunks)`,
//         });

//         // Step 2: Generate embeddings
//         const embeddingsResponse = await fetch("/api/embeddings", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ chunks: extractData.chunks }),
//         });

//         if (!embeddingsResponse.ok) {
//           throw new Error("Failed to generate embeddings");
//         }

//         const embeddingsData = await embeddingsResponse.json();

//         setState({
//           status: "analyzing",
//           progress: 70,
//           message: "Generating summary + evidence trail...",
//         });

//         // Step 3: Analyze and generate summary
//         const analysisResponse = await fetch("/api/analyze", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             chunks: embeddingsData.chunks,
//             metadata: extractData.metadata,
//           }),
//         });

//         if (!analysisResponse.ok) {
//           throw new Error("Failed to analyze content");
//         }

//         const result: AnalysisResult = await analysisResponse.json();

//         setState({
//           status: "complete",
//           progress: 100,
//           message: "Analysis complete!",
//           result,
//         });
//       } catch (error) {
//         setState({
//           status: "error",
//           progress: 0,
//           message: "Analysis failed",
//           error: error instanceof Error ? error.message : "Unknown error",
//         });
//       }
//     },
//     []
//   );

//   return { state, analyzeContent };
// }

"use client";

import { useState, useCallback } from "react";
import { AnalysisState, AnalysisResult, SourceDocument } from "@/lib/types";

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    status: "idle",
    progress: 0,
    message: "Ready to analyze",
  });

  const analyzeContent = useCallback(
    async (sourceDocuments: SourceDocument[]) => {
      try {
        setState({
          status: "extracting",
          progress: 10,
          message: `Extracting content from ${sourceDocuments.length} sources...`,
        });

        setState({
          status: "indexing",
          progress: 40,
          message: `Building evidence index... (${sourceDocuments.reduce(
            (acc, doc) => acc + doc.chunks.length,
            0
          )} chunks)`,
        });

        setState({
          status: "analyzing",
          progress: 70,
          message: "Comparing sources and generating analysis...",
        });

        // Analyze and generate summary with comparison
        const analysisResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceDocuments }),
        });

        if (!analysisResponse.ok) {
          throw new Error("Failed to analyze content");
        }

        const result: AnalysisResult = await analysisResponse.json();

        setState({
          status: "complete",
          progress: 100,
          message: "Analysis complete!",
          result,
        });
      } catch (error) {
        setState({
          status: "error",
          progress: 0,
          message: "Analysis failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    []
  );

  return { state, analyzeContent };
}
