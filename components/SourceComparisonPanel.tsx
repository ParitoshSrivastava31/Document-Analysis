"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SourceComparison, SourceDocument } from "@/lib/types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
} from "lucide-react";

interface SourceComparisonPanelProps {
  sourceComparisons: SourceComparison[];
  sourceDocuments: SourceDocument[];
  consensusScore: number;
  uniquePerspectives: string[];
}

export default function SourceComparisonPanel({
  sourceComparisons,
  sourceDocuments,
  consensusScore,
  uniquePerspectives,
}: SourceComparisonPanelProps) {
  const getSourceById = (id: string) =>
    sourceDocuments.find((doc) => doc.id === id);

  const getConsensusIcon = (level: string) => {
    switch (level) {
      case "high":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "medium":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "low":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "contradictory":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConsensusColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "contradictory":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Consensus Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Source Consensus Analysis</h3>
          <Badge variant="outline" className="text-sm">
            {sourceDocuments.length} Sources Compared
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                Overall Consensus Score
              </span>
              <span className="text-sm">{consensusScore}%</span>
            </div>
            <Progress value={consensusScore} className="w-full" />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">
              Unique Perspectives Identified
            </h4>
            <div className="flex flex-wrap gap-2">
              {uniquePerspectives.map((perspective, index) => (
                <Badge key={index} variant="secondary">
                  {perspective}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Comparisons */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Claim-by-Claim Analysis</h3>

        <div className="space-y-6">
          {sourceComparisons.map((comparison) => (
            <div key={comparison.claimId} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {getConsensusIcon(comparison.consensusLevel)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {comparison.claimText}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={getConsensusColor(comparison.consensusLevel)}
                      >
                        {comparison.consensusLevel === "contradictory"
                          ? "Contradictory"
                          : `${
                              comparison.consensusLevel
                                .charAt(0)
                                .toUpperCase() +
                              comparison.consensusLevel.slice(1)
                            } Consensus`}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {comparison.supportCount} support •{" "}
                        {comparison.contradictionCount} contradict
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {Object.entries(comparison.sources).map(
                  ([sourceId, sourceData]) => {
                    const source = getSourceById(sourceId);
                    return (
                      <div
                        key={sourceId}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`mt-1 ${
                            sourceData.supports
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {sourceData.supports ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {source?.title || "Unknown Source"}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(sourceData.confidence * 100)}%
                              confidence
                            </Badge>
                            {source?.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-6 px-2"
                              >
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 italic">
                            "{sourceData.evidence}"
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <FileText className="h-3 w-3" />
                            <span>Source: {source?.source || "Unknown"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
