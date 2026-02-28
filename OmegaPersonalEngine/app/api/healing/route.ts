import { NextResponse } from "next/server";
import { logsForApi } from "@/core/kernel";

export async function GET() {
  try {
    const logs = await logsForApi();
    const healing = logs.filter((l) => l.type === "healing" || l.type === "transition");
    return NextResponse.json({ ok: true, healing });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "healing failed" }, { status: 500 });
  }
}
