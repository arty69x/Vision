import { appendFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface EngineLogEvent {
  runId: string;
  type: string;
  payload: unknown;
  at: number;
}

const runsDir = path.join(process.cwd(), ".runs");
const logFile = path.join(runsDir, "events.jsonl");

export async function ensureRuntimeDirs() {
  await Promise.all([
    mkdir(path.join(process.cwd(), "workspace"), { recursive: true }),
    mkdir(path.join(process.cwd(), ".local_memory"), { recursive: true }),
    mkdir(runsDir, { recursive: true })
  ]);
}

export async function logEvent(event: EngineLogEvent) {
  await ensureRuntimeDirs();
  await appendFile(logFile, `${JSON.stringify(event)}\n`, "utf8");
}

export async function readEvents(): Promise<EngineLogEvent[]> {
  await ensureRuntimeDirs();
  try {
    const raw = await readFile(logFile, "utf8");
    return raw.split("\n").filter(Boolean).map((line) => {
      try {
        return JSON.parse(line) as EngineLogEvent;
      } catch {
        return null;
      }
    }).filter((v): v is EngineLogEvent => v !== null);
  } catch {
    return [];
  }
}

export async function writeJsonFile(filePath: string, value: unknown) {
  await ensureRuntimeDirs();
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}
