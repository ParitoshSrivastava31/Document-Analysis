// lib/types.ts

export interface DocumentChunk {
  id: string;
  text: string;
  pageNumber?: number;
  charStart: number;
  charEnd: number;
  embedding?: number[];
  metadata: {
    title?: string;
    author?: string;
    source?: string;
    url?: string;
    [key: string]: any; // 👈 allow extra properties
  };
}

export interface Claim {
  id: string;
  text: string;
  supportingChunks: string[];
  confidence: number;
  supportCount: number;
}

export interface EvidenceSnippet {
  chunkId: string;
  text: string;
  source: string;
  page?: number;
  charStart: number;
  charEnd: number;
  url?: string;
  title?: string;
  favicon?: string;
}

export interface AnalysisResult {
  summary: string[];
  claims: Claim[];
  evidence: Record<string, EvidenceSnippet>;
  chunks: DocumentChunk[];
  metadata: {
    title?: string;
    author?: string;
    date?: string;
    source?: string;
    url?: string;
    analyzedAt?: string;
    model?: string;
    sourcesAnalyzed?: number;
    totalChunks?: number;
  };
}

export interface AnalysisState {
  status:
    | "idle"
    | "extracting"
    | "indexing"
    | "analyzing"
    | "complete"
    | "error";
  progress: number;
  message: string;
  result?: AnalysisResult;
  error?: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  url?: string;
  source: string;
  chunks: DocumentChunk[];
  metadata: any;
}

export interface SourceComparison {
  claimId: string;
  claimText: string;
  sources: {
    [sourceId: string]: {
      supports: boolean;
      confidence: number;
      evidence: string;
      chunkId: string;
    };
  };
  consensusLevel: "high" | "medium" | "low" | "contradictory";
  supportCount: number;
  contradictionCount: number;
}

export interface MultiSourceAnalysisResult extends AnalysisResult {
  sourceDocuments: SourceDocument[];
  sourceComparisons: SourceComparison[];
  consensusScore: number; // 0-100
  uniquePerspectives: string[];
}
