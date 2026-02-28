import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class DebugAgent extends BaseAgent<{ cause: string }> {
  name = "DebugAgent";
  async run(ctx: AgentContext): Promise<AgentResponse<{ cause: string }>> {
    return { agent: this.name, confidenceDelta: -0.02, result: { cause: ctx.memoryInjection.lastFailures[0] ?? "compile failure" } };
  }
}
