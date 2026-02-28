import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class ConfidenceAgent extends BaseAgent<{ score: number }> {
  name = "ConfidenceAgent";
  constructor(private readonly base: number, private readonly delta: number) { super(); }

  async run(_ctx: AgentContext): Promise<AgentResponse<{ score: number }>> {
    const score = Math.max(0, Math.min(1, this.base + this.delta));
    return { agent: this.name, confidenceDelta: 0, result: { score } };
  }
}
