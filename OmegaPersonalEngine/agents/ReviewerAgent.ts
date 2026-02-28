import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class ReviewerAgent extends BaseAgent<{ severity: "LOW" | "MEDIUM" | "HIGH"; score: number }> {
  name = "ReviewerAgent";
  async run(_ctx: AgentContext): Promise<AgentResponse<{ severity: "LOW" | "MEDIUM" | "HIGH"; score: number }>> {
    return { agent: this.name, confidenceDelta: 0.02, result: { severity: "LOW", score: 90 } };
  }
}
