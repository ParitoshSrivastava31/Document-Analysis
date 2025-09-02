// // components/AnalysisResults.tsx

// "use client";

// import { useState } from "react";
// import { AnalysisResult } from "@/lib/types";
// import SummaryCard from "@/components/SummaryCard";
// import EvidencePanel from "@/components/EvidencePanel";
// import EvidenceGraph from "@/components/EvidenceGraph";
// import { Button } from "@/components/ui/button";

// interface AnalysisResultsProps {
//   result: AnalysisResult;
// }

// export default function AnalysisResults({ result }: AnalysisResultsProps) {
//   const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
//   const [showRawData, setShowRawData] = useState(false);

//   const selectedClaim = selectedClaimId
//     ? result.claims.find((c) => c.id === selectedClaimId)
//     : null;

//   const handleExportJson = () => {
//     const dataStr = JSON.stringify(result, null, 2);
//     const dataBlob = new Blob([dataStr], { type: "application/json" });
//     const url = URL.createObjectURL(dataBlob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "evidence-analysis.json";
//     link.click();
//   };

//   const handleExportMarkdown = () => {
//     let markdown = `# Analysis Summary\n\n`;
//     markdown += `**Source:** ${result.metadata.title || "Unknown"}\n`;
//     if (result.metadata.author)
//       markdown += `**Author:** ${result.metadata.author}\n`;
//     if (result.metadata.date) markdown += `**Date:** ${result.metadata.date}\n`;
//     markdown += `\n## Summary\n\n`;

//     result.summary.forEach((sentence, i) => {
//       markdown += `${i + 1}. ${sentence}\n`;
//     });

//     markdown += `\n## Evidence\n\n`;
//     result.claims.forEach((claim, i) => {
//       markdown += `### Claim ${i + 1}: ${claim.text}\n`;
//       markdown += `**Confidence:** ${Math.round(claim.confidence * 100)}%\n`;
//       markdown += `**Supporting Sources:** ${claim.supportCount}\n\n`;

//       claim.supportingChunks.forEach((chunkId) => {
//         const evidence = result.evidence[chunkId];
//         if (evidence) {
//           markdown += `- "${evidence.text.substring(0, 200)}..."\n`;
//           markdown += `  *Source: ${evidence.source}*\n\n`;
//         }
//       });
//     });

//     const dataBlob = new Blob([markdown], { type: "text/markdown" });
//     const url = URL.createObjectURL(dataBlob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "analysis-summary.md";
//     link.click();
//   };

//   return (
//     <div className="space-y-6">
//       {/* Summary Section */}
//       <SummaryCard
//         summary={result.summary}
//         claims={result.claims}
//         onClaimSelect={setSelectedClaimId}
//         selectedClaimId={selectedClaimId}
//       />

//       {/* Evidence Graph */}
//       <EvidenceGraph
//         claims={result.claims}
//         evidence={result.evidence}
//         selectedClaimId={selectedClaimId}
//         onClaimSelect={setSelectedClaimId}
//       />

//       {/* Evidence Panel */}
//       {selectedClaim && (
//         <EvidencePanel
//           claim={selectedClaim}
//           evidence={result.evidence}
//           onClose={() => setSelectedClaimId(null)}
//         />
//       )}

//       {/* Export Controls */}
//       <div className="flex flex-wrap gap-4 pt-4 border-t">
//         <Button onClick={handleExportJson} variant="outline">
//           📄 Download Evidence JSON
//         </Button>
//         <Button onClick={handleExportMarkdown} variant="outline">
//           📝 Export Summary (Markdown)
//         </Button>
//         <Button onClick={() => setShowRawData(!showRawData)} variant="outline">
//           {showRawData ? "🔒 Hide Raw Data" : "🔍 Show Raw Evidence JSON"}
//         </Button>
//       </div>

//       {/* Raw Data Display */}
//       {showRawData && (
//         <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
//           <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
//         </div>
//       )}

//       {/* Privacy Notice */}
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
//         <h4 className="font-medium text-yellow-800">
//           Privacy & Reproducibility
//         </h4>
//         <p className="text-yellow-700 mt-1">
//           Document text was sent to LLM API for analysis. The exported JSON
//           contains chunk IDs and offsets for reproducible results.
//         </p>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { AnalysisResult, MultiSourceAnalysisResult } from "@/lib/types";
import SummaryCard from "@/components/SummaryCard";
import EvidencePanel from "@/components/EvidencePanel";
import EvidenceGraph from "@/components/EvidenceGraph";
import SourceComparisonPanel from "@/components/SourceComparisonPanel";
import { Button } from "@/components/ui/button";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "comparison">(
    "summary"
  );

  const isMultiSource = "sourceComparisons" in result;
  const multiSourceResult = result as MultiSourceAnalysisResult;

  const selectedClaim = selectedClaimId
    ? result.claims.find((c) => c.id === selectedClaimId)
    : null;

  const handleExportJson = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = isMultiSource
      ? "multi-source-analysis.json"
      : "evidence-analysis.json";
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation for Multi-Source */}
      {isMultiSource && (
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "summary"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "comparison"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Source Comparison
          </button>
        </div>
      )}

      {/* Summary Section */}
      {activeTab === "summary" && (
        <SummaryCard
          summary={result.summary}
          claims={result.claims}
          onClaimSelect={setSelectedClaimId}
          selectedClaimId={selectedClaimId}
        />
      )}

      {/* Source Comparison Section */}
      {isMultiSource && activeTab === "comparison" && (
        <SourceComparisonPanel
          sourceComparisons={multiSourceResult.sourceComparisons}
          sourceDocuments={multiSourceResult.sourceDocuments}
          consensusScore={multiSourceResult.consensusScore}
          uniquePerspectives={multiSourceResult.uniquePerspectives}
        />
      )}

      {/* Evidence Graph */}
      <EvidenceGraph
        claims={result.claims}
        evidence={result.evidence}
        selectedClaimId={selectedClaimId}
        onClaimSelect={setSelectedClaimId}
      />

      {/* Evidence Panel */}
      {selectedClaim && (
        <EvidencePanel
          claim={selectedClaim}
          evidence={result.evidence}
          onClose={() => setSelectedClaimId(null)}
        />
      )}

      {/* Export Controls */}
      <div className="flex flex-wrap gap-4 pt-4 border-t">
        <Button onClick={handleExportJson} variant="outline">
          📄 Download Analysis JSON
        </Button>
        <Button onClick={() => setShowRawData(!showRawData)} variant="outline">
          {showRawData ? "🔒 Hide Raw Data" : "🔍 Show Raw Data"}
        </Button>
      </div>

      {/* Raw Data Display */}
      {showRawData && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <h4 className="font-medium text-yellow-800">
          Privacy & Reproducibility
        </h4>
        <p className="text-yellow-700 mt-1">
          Document text was sent to LLM API for analysis. The exported JSON
          contains chunk IDs and offsets for reproducible results.
        </p>
      </div>
    </div>
  );
}
