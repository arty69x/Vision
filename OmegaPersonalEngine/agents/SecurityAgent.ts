import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";
import { sanitizePreview } from "@/services/sanitizer";

export class SecurityAgent extends BaseAgent<{ severity: "LOW" | "MEDIUM" | "HIGH"; score: number; findings: string[] }> {
  name = "SecurityAgent";
  async run(ctx: AgentContext): Promise<AgentResponse<{ severity: "LOW" | "MEDIUM" | "HIGH"; score: number; findings: string[] }>> {
    const scan = sanitizePreview(ctx.prompt);
    if (!scan.ok) return { agent: this.name, confidenceDelta: -0.2, result: { severity: "HIGH", score: 10, findings: [scan.reason] } };
    return { agent: this.name, confidenceDelta: 0.01, result: { severity: "LOW", score: 95, findings: [] } };
  }
}
