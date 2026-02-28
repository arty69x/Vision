export interface AgentContext {
  prompt: string;
  memoryInjection: { lastFailures: string[]; promotedPatterns: string[] };
}

export interface AgentResponse<T> {
  agent: string;
  confidenceDelta: number;
  result: T;
}

export abstract class BaseAgent<T> {
  abstract name: string;
  abstract run(ctx: AgentContext): Promise<AgentResponse<T>>;
}
