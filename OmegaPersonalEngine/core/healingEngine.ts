import { AgentRegistry } from "@/agents/registry";
import { rollbackSnapshot } from "@/core/snapshotManager";

export async function runHealing(prompt: string, memoryInjection: { lastFailures: string[]; promotedPatterns: string[] }, snapshotPath: string, maxRounds: number) {
  let rounds = 0;
  let resolved = false;
  const notes: string[] = [];

  while (rounds < maxRounds) {
    rounds += 1;
    const debug = await AgentRegistry.debug.run({ prompt, memoryInjection });
    const patch = await AgentRegistry.patch.run({ prompt, memoryInjection });
    notes.push(`round:${rounds} cause:${debug.result.cause} patch:${patch.result.patch}`);
    if (!prompt.toLowerCase().includes("induce error")) {
      resolved = true;
      break;
    }
    if (rounds === maxRounds) {
      await rollbackSnapshot(snapshotPath);
    }
  }

  return { rounds, resolved, notes };
}
