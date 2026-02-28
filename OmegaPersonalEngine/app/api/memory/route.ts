import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { memoryFilePath } from "@/core/kernel";

const files = ["failures.jsonl", "accepted.jsonl", "model_health.json", "user_profile.json", "performance_trends.json", "frontend_os_memory.json"];

export async function GET() {
  try {
    const data: Record<string, string> = {};
    for (const file of files) {
      try {
        data[file] = await readFile(memoryFilePath(file), "utf8");
      } catch {
        data[file] = "";
      }
    }
    return NextResponse.json({ ok: true, files: data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "memory failed" }, { status: 500 });
  }
}
