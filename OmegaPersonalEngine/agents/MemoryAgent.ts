import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class MemoryAgent extends BaseAgent<{ persisted: boolean }> {
  name = "MemoryAgent";
  async run(_ctx: AgentContext): Promise<AgentResponse<{ persisted: boolean }>> {
    return { agent: this.name, confidenceDelta: 0.01, result: { persisted: true } };
  }
}
