import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class PatchAgent extends BaseAgent<{ patch: string }> {
  name = "PatchAgent";
  async run(_ctx: AgentContext): Promise<AgentResponse<{ patch: string }>> {
    return { agent: this.name, confidenceDelta: 0.04, result: { patch: "// patch: remove compile blocker" } };
  }
}
