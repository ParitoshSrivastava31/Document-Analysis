"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Claim, EvidenceSnippet } from "@/lib/types";
import { ExternalLink, X, FileText } from "lucide-react";

interface EvidencePanelProps {
  claim: Claim;
  evidence: Record<string, EvidenceSnippet>;
  onClose: () => void;
}

export default function EvidencePanel({
  claim,
  evidence,
  onClose,
}: EvidencePanelProps) {
  const supportingEvidence = claim.supportingChunks
    .map((chunkId) => evidence[chunkId])
    .filter(Boolean);

  return (
    <Card className="p-6 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Evidence Analysis
          </h3>
          <p className="text-gray-700 mb-3">{claim.text}</p>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                claim.confidence > 0.8
                  ? "default"
                  : claim.confidence > 0.6
                  ? "secondary"
                  : "destructive"
              }
            >
              {Math.round(claim.confidence * 100)}% Confidence
            </Badge>
            <Badge variant="outline">
              {claim.supportCount} Supporting Sources
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Supporting Evidence:</h4>

        {supportingEvidence.map((evidence, index) => (
          <div key={evidence.chunkId} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{evidence.source}</span>
                {evidence.page && <span>• Page {evidence.page}</span>}
                <span>
                  • chars {evidence.charStart}–{evidence.charEnd}
                </span>
              </div>
              {evidence.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={evidence.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </a>
                </Button>
              )}
            </div>

            <blockquote className="border-l-3 border-gray-300 pl-4 text-gray-700 italic">
              "{evidence.text}"
            </blockquote>

            <div className="mt-2 text-xs text-gray-500">
              Chunk ID: {evidence.chunkId}
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            🔍 Challenge Claim
          </Button>
          <Button variant="outline" size="sm">
            🔄 Regenerate Evidence
          </Button>
          <Button variant="outline" size="sm">
            📋 Copy Citations
          </Button>
        </div>
      </div>
    </Card>
  );
}
