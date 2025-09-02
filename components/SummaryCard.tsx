"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Claim } from "@/lib/types";

interface SummaryCardProps {
  summary: string[];
  claims: Claim[];
  onClaimSelect: (claimId: string) => void;
  selectedClaimId: string | null;
}

export default function SummaryCard({
  summary,
  claims,
  onClaimSelect,
  selectedClaimId,
}: SummaryCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
      <div className="space-y-3">
        {summary.map((sentence, index) => {
          const claim = claims[index];
          const isSelected = selectedClaimId === claim?.id;

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50 hover:bg-gray-100 border-gray-200"
              }`}
              onClick={() => claim && onClaimSelect(claim.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-gray-900 flex-1">{sentence}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {claim && (
                    <>
                      <Badge
                        variant={
                          claim.confidence > 0.8
                            ? "default"
                            : claim.confidence > 0.6
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {Math.round(claim.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {claim.supportCount} sources
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                      >
                        Explain →
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
