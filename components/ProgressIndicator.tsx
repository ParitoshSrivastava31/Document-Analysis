"use client";

import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface ProgressIndicatorProps {
  status: string;
  progress: number;
  message: string;
}

const statusMessages = {
  extracting: "Extracting content...",
  indexing: "Building evidence index...",
  analyzing: "Generating summary + evidence trail...",
};

export default function ProgressIndicator({
  status,
  progress,
  message,
}: ProgressIndicatorProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {statusMessages[status as keyof typeof statusMessages] || message}
          </h3>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>

        <Progress value={progress} className="w-full" />

        <p className="text-sm text-gray-600">{message}</p>

        {status === "indexing" && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Processing document chunks...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
