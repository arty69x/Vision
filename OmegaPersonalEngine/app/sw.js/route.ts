import { NextResponse } from "next/server";

export async function GET() {
  const script = `self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',(e)=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',()=>{});`;
  return new NextResponse(script, { headers: { "Content-Type": "application/javascript", "Cache-Control": "no-store" } });
}
