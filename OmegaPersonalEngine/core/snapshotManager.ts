import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const snapshotDir = path.join(process.cwd(), ".runs", "snapshots");
const workspaceFile = path.join(process.cwd(), "workspace", "current.json");

export async function createSnapshot(runId: string) {
  await mkdir(snapshotDir, { recursive: true });
  let current = "{}";
  try { current = await readFile(workspaceFile, "utf8"); } catch {}
  const snap = path.join(snapshotDir, `${runId}.json`);
  await writeFile(snap, current, "utf8");
  return snap;
}

export async function rollbackSnapshot(snapshotPath: string) {
  const content = await readFile(snapshotPath, "utf8");
  await writeFile(workspaceFile, content, "utf8");
}

export async function writeWorkspace(content: unknown) {
  await mkdir(path.join(process.cwd(), "workspace"), { recursive: true });
  await writeFile(workspaceFile, JSON.stringify(content, null, 2), "utf8");
}

export async function readWorkspace() {
  try { return JSON.parse(await readFile(workspaceFile, "utf8")); } catch { return { files: {} }; }
}
