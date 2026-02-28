import { SuggestionResult } from "@/engine/types";

export interface GhostState {
  active: boolean;
  text: string;
  start: number;
  end: number;
  opacity: number;
}

export function createGhost(s: SuggestionResult): GhostState {
  return {
    active: s.suggestion.length > 0,
    text: s.suggestion,
    start: s.replacementStart,
    end: s.replacementEnd,
    opacity: 0.45
  };
}

export function applyGhost(source: string, ghost: GhostState) {
  if (!ghost.active) return source;
  return `${source.slice(0, ghost.start)}${ghost.text}${source.slice(ghost.end)}`;
}

export function cancelGhost(): GhostState {
  return { active: false, text: "", start: 0, end: 0, opacity: 0.45 };
}
