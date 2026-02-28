import "./globals.css";
import Link from "next/link";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const nav = [
  ["/", "Dashboard"],
  ["/run", "Execute"],
  ["/timeline", "Logs"],
  ["/healing", "Healing"],
  ["/memory", "Memory"],
  ["/workspace", "Workspace"]
] as const;

export const metadata = {
  title: "Omega Ultra Frontend OS",
  description: "Local deterministic AI IDE platform",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-base font-bold">OmegaPersonalEngine</p>
              <nav className="flex flex-col gap-2 md:flex-row">
                {nav.map(([href, label]) => (
                  <Link key={href} href={href} className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
