import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class CompileAgent extends BaseAgent<{ ok: boolean; issues: string[] }> {
  name = "CompileAgent";
  async run(ctx: AgentContext): Promise<AgentResponse<{ ok: boolean; issues: string[] }>> {
    const fail = ctx.prompt.toLowerCase().includes("induce error");
    return { agent: this.name, confidenceDelta: fail ? -0.1 : 0.02, result: { ok: !fail, issues: fail ? ["Induced compile failure"] : [] } };
  }
}
