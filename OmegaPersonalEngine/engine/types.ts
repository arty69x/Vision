export type CursorZone =
  | "ROOT_LAYOUT"
  | "SECTION_CONTAINER"
  | "COMPONENT_WRAPPER"
  | "CLASSNAME_STRING"
  | "BREAKPOINT_ZONE"
  | "FLEX_ZONE"
  | "GRID_ZONE"
  | "TYPOGRAPHY_ZONE"
  | "INTERACTION_ZONE"
  | "FORM_FIELD"
  | "DATA_DISPLAY";

export interface CursorContext {
  zone: CursorZone;
  offset: number;
  line: number;
  col: number;
  inClassName: boolean;
  currentToken: string;
  surrounding: string;
}

export interface AstPatchResult {
  ok: boolean;
  parseTimeMs: number;
  nodeCount: number;
  reason: string;
}

export interface SuggestionResult {
  suggestion: string;
  replacementStart: number;
  replacementEnd: number;
  confidence: number;
}

export interface LayoutCandidate {
  id: string;
  code: string;
  layoutIoU: number;
  driftPx: number;
  entropyScore: number;
  classIntegrity: number;
  semanticClarity: number;
  performance: number;
  totalScore: number;
}

export interface VerificationReport {
  iou: number;
  driftMobilePx: number;
  driftDesktopPx: number;
  pass: boolean;
  heatmap: Array<{ x: number; y: number; intensity: number }>;
}

export interface ConfidenceReport {
  verify: number;
  drift: number;
  entropy: number;
  classIntegrity: number;
  performance: number;
  security: number;
  score: number;
}
