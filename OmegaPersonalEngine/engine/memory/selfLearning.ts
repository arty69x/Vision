import { promises as fs } from "fs";
import path from "path";

interface MemoryEntry {
  problem: string;
  fix: string;
  snippet: string;
  combo: string;
  layoutPattern: string;
  hits: number;
  confidence: number;
}

const file = path.join(process.cwd(), ".local_memory", "frontend_os_memory.json");

async function readAll(): Promise<MemoryEntry[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as MemoryEntry[];
  } catch {
    return [];
  }
}

async function writeAll(data: MemoryEntry[]) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data.slice(-200), null, 2), "utf8");
}

export async function learn(entry: Omit<MemoryEntry, "hits" | "confidence">) {
  const all = await readAll();
  const idx = all.findIndex((m) => m.problem === entry.problem && m.fix === entry.fix);
  if (idx >= 0) {
    all[idx].hits += 1;
    all[idx].confidence = Number(Math.min(1, all[idx].confidence + 0.05).toFixed(3));
  } else {
    all.push({ ...entry, hits: 1, confidence: 0.35 });
  }
  await writeAll(all);
}

export async function promotedPatterns() {
  const all = await readAll();
  return all.filter((m) => m.hits >= 5 && m.confidence >= 0.6).map((m) => m.layoutPattern);
}

export async function memoryGraph() {
  const all = await readAll();
  return all.map((m, i) => ({ id: i + 1, label: m.problem, value: m.confidence, hits: m.hits }));
}
