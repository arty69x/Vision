const blockedFiles = new Set(["agent.config.json", "package.json", "next.config.js"]);

export function assertSafeWrite(targetPath: string) {
  if (targetPath.includes("..")) throw new Error("Path traversal blocked");
  if (targetPath.startsWith("/") || /^[a-zA-Z]:\\/.test(targetPath)) throw new Error("Absolute path blocked");
  const name = targetPath.split("/").at(-1) ?? "";
  if (blockedFiles.has(name)) throw new Error(`Overwrite blocked for ${name}`);
}
