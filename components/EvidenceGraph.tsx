"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Claim, EvidenceSnippet } from "@/lib/types";

interface EvidenceGraphProps {
  claims: Claim[];
  evidence: Record<string, EvidenceSnippet>;
  selectedClaimId: string | null;
  onClaimSelect: (claimId: string) => void;
}

export default function EvidenceGraph({
  claims,
  evidence,
  selectedClaimId,
  onClaimSelect,
}: EvidenceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Simple timeline/graph visualization
    const padding = 40;
    const nodeRadius = 20;
    const timelineY = canvas.height / 2;

    // Draw timeline
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, timelineY);
    ctx.lineTo(canvas.width - padding, timelineY);
    ctx.stroke();

    // Draw claim nodes
    claims.forEach((claim, index) => {
      const x =
        padding + (index * (canvas.width - 2 * padding)) / (claims.length - 1);
      const isSelected = selectedClaimId === claim.id;

      // Node circle
      ctx.fillStyle = isSelected ? "#3b82f6" : "#6b7280";
      ctx.beginPath();
      ctx.arc(x, timelineY, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Confidence indicator
      ctx.strokeStyle = isSelected ? "#1d4ed8" : "#374151";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, timelineY, nodeRadius + 5, 0, 2 * Math.PI * claim.confidence);
      ctx.stroke();

      // Support count
      ctx.fillStyle = "white";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(claim.supportCount.toString(), x, timelineY + 4);

      // Evidence connections
      claim.supportingChunks.forEach((chunkId, evidenceIndex) => {
        const evidenceY = timelineY + (evidenceIndex % 2 === 0 ? -80 : 80);

        // Draw connection line
        ctx.strokeStyle = isSelected ? "#3b82f6" : "#d1d5db";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, timelineY - nodeRadius);
        ctx.lineTo(x, evidenceY);
        ctx.stroke();

        // Evidence node
        ctx.fillStyle = isSelected ? "#dbeafe" : "#f3f4f6";
        ctx.fillRect(x - 30, evidenceY - 10, 60, 20);

        ctx.fillStyle = isSelected ? "#1d4ed8" : "#6b7280";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`E${evidenceIndex + 1}`, x, evidenceY + 3);
      });
    });

    // Add click handler
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      claims.forEach((claim, index) => {
        const nodeX =
          padding +
          (index * (canvas.width - 2 * padding)) / (claims.length - 1);
        const distance = Math.sqrt((x - nodeX) ** 2 + (y - timelineY) ** 2);

        if (distance <= nodeRadius + 10) {
          onClaimSelect(claim.id);
        }
      });
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [claims, evidence, selectedClaimId, onClaimSelect]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Evidence Timeline
      </h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-48 border border-gray-200 rounded cursor-pointer"
          style={{ minHeight: "200px" }}
        />
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <span>📊 Nodes = Claims</span>
          <span>🔗 Lines = Supporting Evidence</span>
          <span>⭕ Ring = Confidence Level</span>
          <span>💡 Click to explore</span>
        </div>
      </div>
    </Card>
  );
}
