import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class PlannerAgent extends BaseAgent<{ plan: string[] }> {
  name = "PlannerAgent";

  async run(ctx: AgentContext): Promise<AgentResponse<{ plan: string[] }>> {
    return {
      agent: this.name,
      confidenceDelta: 0.02,
      result: {
        plan: [
          "Analyze constraints",
          "Generate 2 deterministic candidates",
          "Review+Validate+Compile",
          "Heal if needed",
          ...ctx.memoryInjection.promotedPatterns.slice(0, 2)
        ]
      }
    };
  }
}
