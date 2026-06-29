// AETHON — shared domain types. Must match API_CONTRACT.md exactly.
// If P2 changes a response shape, update this file in the same PR.

export type DocType =
  | "regulation"
  | "procedure"
  | "manual"
  | "incident"
  | "drawing"
  | "document";

export type DocStatus =
  | "queued"
  | "parsing"
  | "embedding"
  | "indexed"
  | "failed";

export interface Document {
  id: string;
  name: string;
  type: DocType;
  status: DocStatus;
  pages: number;
  ingested_at: string; // ISO 8601
}

export interface Source {
  doc_name: string;
  page: number;
  snippet: string;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  confidence: number; // 0–100
}

export type NodeType =
  | "equipment"
  | "regulation"
  | "procedure"
  | "incident"
  | "document";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  // Optional layout hints. If absent, the frontend computes positions.
  x?: number;
  y?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Gap {
  clause: string;
  issue: string;
}

export interface ComplianceResult {
  standard: string;
  score: number; // 0–100
  gaps: Gap[];
}

export interface ComplianceAudit {
  overall_score: number;
  standards: ComplianceResult[];
}

export interface Conflict {
  doc_a: string;
  doc_b: string;
  field: string;
  value_a: string;
  value_b: string;
}

export interface FeedItem {
  text: string;
  tag: string;
  time: string;
}

export interface DashboardStats {
  docs_indexed: number;
  relationships: number;
  compliance_score: number;
  open_conflicts: number;
  feed: FeedItem[];
}

export interface Scoreboard {
  answer_accuracy: number;
  citation_precision: number;
  avg_answer_seconds: number;
  keyword_baseline_seconds: number;
  questions_evaluated: number;
}

export interface HealthStatus {
  status: string;
  model: string;
  corpus_docs: number;
}

// Ingestion progress pushed over the /ws/ingest WebSocket.
export interface IngestProgress {
  id: string;
  stage: DocStatus;
  progress: number; // 0–100
}
