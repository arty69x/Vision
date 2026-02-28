export type EngineState = "IDLE" | "PLANNING" | "ARCHITECTING" | "CODING_PARALLEL" | "REVIEWING" | "VALIDATING" | "HEALING" | "FINALIZED" | "FAILED";

const map: Record<EngineState, EngineState[]> = {
  IDLE: ["PLANNING"],
  PLANNING: ["ARCHITECTING", "FAILED"],
  ARCHITECTING: ["CODING_PARALLEL", "FAILED"],
  CODING_PARALLEL: ["REVIEWING", "FAILED"],
  REVIEWING: ["VALIDATING", "HEALING", "FAILED"],
  VALIDATING: ["FINALIZED", "HEALING", "FAILED"],
  HEALING: ["REVIEWING", "FAILED"],
  FINALIZED: [],
  FAILED: []
};

export class StateMachine {
  public state: EngineState = "IDLE";

  transition(next: EngineState) {
    if (!map[this.state].includes(next)) throw new Error(`Illegal transition ${this.state} -> ${next}`);
    const prev = this.state;
    this.state = next;
    return { from: prev, to: next, at: Date.now() };
  }
}
