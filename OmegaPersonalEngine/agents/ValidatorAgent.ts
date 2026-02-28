import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";
import { validateCandidate } from "@/services/validator";

export class ValidatorAgent extends BaseAgent<{ ok: boolean; score: number; issues: string[] }> {
  name = "ValidatorAgent";

  async run(ctx: AgentContext): Promise<AgentResponse<{ ok: boolean; score: number; issues: string[] }>> {
    const candidate = `export default function X(){return <main><section><div className=\"container mx-auto px-4\">${ctx.prompt.slice(0, 16)}</div></section></main>;}`;
    const v = validateCandidate(candidate);
    return { agent: this.name, confidenceDelta: v.ok ? 0.02 : -0.05, result: { ok: v.ok, score: v.score, issues: v.issues } };
  }
}
