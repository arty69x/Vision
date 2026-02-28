import { AgentContext, AgentResponse, BaseAgent } from "@/agents/BaseAgent";

export class CoderAgentB extends BaseAgent<{ id: string; code: string }> {
  name = "CoderAgentB";
  async run(ctx: AgentContext): Promise<AgentResponse<{ id: string; code: string }>> {
    return {
      agent: this.name,
      confidenceDelta: 0.01,
      result: {
        id: "candidate-b",
        code: `export default function CandidateB(){return <main><section><div className=\"container mx-auto px-4 py-6\"><div className=\"flex flex-col gap-3 md:flex-row\"><button className=\"min-h-11 w-full rounded-xl bg-slate-900 px-4 py-2 text-white md:w-auto\">B ${ctx.prompt.slice(0,20)}</button></div></div></section></main>;}`
      }
    };
  }
}
