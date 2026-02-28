import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class HealingAgent extends BaseAgent<{ patchPlan: string[] }> {
  name = "HealingAgent";

  async run(ctx: AgentContext): Promise<AgentResponse<{ patchPlan: string[] }>> {
    return {
      agent: this.name,
      confidenceDelta: -0.01,
      result: {
        patchPlan: [
          "snapshot-workspace",
          "apply-minimal-patch",
          `last-failure:${ctx.memoryInjection.lastFailures[0] ?? "none"}`,
          "revalidate-bounded"
        ]
      }
    };
  }
}
