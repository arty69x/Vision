import { NextResponse } from "next/server";
import { readWorkspaceData } from "@/core/kernel";

export async function GET() {
  try {
    const workspace = await readWorkspaceData();
    return NextResponse.json({ ok: true, workspace });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "workspace failed" }, { status: 500 });
  }
}
