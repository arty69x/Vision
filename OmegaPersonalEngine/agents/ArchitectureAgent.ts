import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class ArchitectureAgent extends BaseAgent<{ architecture: string[] }> {
  name = "ArchitectureAgent";

  async run(ctx: AgentContext): Promise<AgentResponse<{ architecture: string[] }>> {
    return {
      agent: this.name,
      confidenceDelta: 0.02,
      result: {
        architecture: [
          "enforce-main-section-container",
          "mobile-first-tailwind-v4",
          "static-agent-pipeline",
          ...ctx.memoryInjection.promotedPatterns.slice(0, 2)
        ]
      }
    };
  }
}
