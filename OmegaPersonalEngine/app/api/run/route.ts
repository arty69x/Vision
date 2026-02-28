import { NextResponse } from "next/server";
import { z } from "zod";
import { executeKernel } from "@/core/kernel";

const schema = z.object({ prompt: z.string().min(1).max(5000) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid prompt" }, { status: 400 });
    }
    const result = await executeKernel(parsed.data.prompt);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "run failed" }, { status: 500 });
  }
}
