import { ArchitectureAgent } from "@/agents/ArchitectureAgent";
import { CoderAgentA } from "@/agents/CoderAgentA";
import { CoderAgentB } from "@/agents/CoderAgentB";
import { CompileAgent } from "@/agents/CompileAgent";
import { ConfidenceAgent } from "@/agents/ConfidenceAgent";
import { DebugAgent } from "@/agents/DebugAgent";
import { HealingAgent } from "@/agents/HealingAgent";
import { MemoryAgent } from "@/agents/MemoryAgent";
import { PatchAgent } from "@/agents/PatchAgent";
import { PlannerAgent } from "@/agents/PlannerAgent";
import { ReviewerAgent } from "@/agents/ReviewerAgent";
import { SecurityAgent } from "@/agents/SecurityAgent";
import { ValidatorAgent } from "@/agents/ValidatorAgent";

export const AgentRegistry = {
  planner: new PlannerAgent(),
  architecture: new ArchitectureAgent(),
  coderA: new CoderAgentA(),
  coderB: new CoderAgentB(),
  reviewer: new ReviewerAgent(),
  validator: new ValidatorAgent(),
  compile: new CompileAgent(),
  security: new SecurityAgent(),
  healing: new HealingAgent(),
  debug: new DebugAgent(),
  patch: new PatchAgent(),
  memory: new MemoryAgent(),
  confidence: (base: number, delta: number) => new ConfidenceAgent(base, delta)
} as const;
