// "use client";

// import { useState } from "react";
// import ContentInput from "@/components/ContentInput";
// import AnalysisResults from "@/components/AnalysisResults";
// import ProgressIndicator from "@/components/ProgressIndicator";
// import { useAnalysis } from "@/hooks/useAnalysis";

// export default function Home() {
//   const { state, analyzeContent } = useAnalysis();

//   return (
//     <div className="space-y-8">
//       <ContentInput
//         onAnalyze={analyzeContent}
//         disabled={state.status !== "idle"}
//       />

//       {state.status !== "idle" && (
//         <ProgressIndicator
//           status={state.status}
//           progress={state.progress}
//           message={state.message}
//         />
//       )}

//       {state.result && <AnalysisResults result={state.result} />}

//       {state.error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <h3 className="text-red-800 font-medium">Analysis Error</h3>
//           <p className="text-red-600">{state.error}</p>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import ContentInput from "@/components/ContentInput";
import AnalysisResults from "@/components/AnalysisResults";
import ProgressIndicator from "@/components/ProgressIndicator";
import { useAnalysis } from "@/hooks/useAnalysis";

// Define source input type
interface SourceInput {
  id: string;
  type: "url" | "text" | "pdf";
  content: string;
  file?: File;
}

export default function Home() {
  const { state, analyzeContent } = useAnalysis();

  // Update analyzeContent to handle multiple sources
  const handleAnalyze = async (sources: SourceInput[]) => {
    try {
      // First, extract content from all sources
      const extractPromises = sources.map((source) =>
        fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: source.content,
            type: source.type,
          }),
        })
      );

      const extractResponses = await Promise.all(extractPromises);
      const extractData = await Promise.all(
        extractResponses.map((response) => response.json())
      );

      // Generate embeddings for all chunks
      const allChunks = extractData.flatMap((data) => data.chunks);
      const embeddingsResponse = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks: allChunks }),
      });

      const embeddingsData = await embeddingsResponse.json();

      // Prepare source documents for analysis
      const sourceDocuments = extractData.map((data, index) => ({
        id: sources[index].id,
        title: data.metadata.title || `Source ${index + 1}`,
        url: data.metadata.url,
        source: data.metadata.source || "Unknown",
        chunks: embeddingsData.chunks.filter((chunk: any) =>
          data.chunks.some(
            (originalChunk: any) => originalChunk.id === chunk.id
          )
        ),
        metadata: data.metadata,
      }));

      // Analyze with multi-source comparison
      await analyzeContent(sourceDocuments);
    } catch (error) {
      console.error("Analysis error:", error);
    }
  };

  return (
    <div className="space-y-8">
      <ContentInput
        onAnalyze={handleAnalyze}
        disabled={state.status !== "idle"}
      />

      {state.status !== "idle" && (
        <ProgressIndicator
          status={state.status}
          progress={state.progress}
          message={state.message}
        />
      )}

      {state.result && <AnalysisResults result={state.result} />}

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Analysis Error</h3>
          <p className="text-red-600">{state.error}</p>
        </div>
      )}
    </div>
  );
}
