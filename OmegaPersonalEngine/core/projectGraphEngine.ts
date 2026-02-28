export interface ProjectGraph {
  imports: Record<string, string[]>;
  jsxTree: string[];
  tailwindUsage: Record<string, number>;
  circular: string[];
  unusedExports: string[];
}

export function buildProjectGraph(files: Record<string, string>): ProjectGraph {
  const imports: Record<string, string[]> = {};
  const tailwindUsage: Record<string, number> = {};
  const jsxTree: string[] = [];

  for (const [file, code] of Object.entries(files)) {
    const im = [...code.matchAll(/import\s+.+?from\s+["']([^"']+)["']/g)].map((m) => m[1]);
    imports[file] = im;
    const tags = [...code.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]);
    jsxTree.push(...tags);
    const classes = [...code.matchAll(/className\s*=\s*["']([^"']+)["']/g)].flatMap((m) => m[1].split(/\s+/));
    for (const c of classes.filter(Boolean)) tailwindUsage[c] = (tailwindUsage[c] ?? 0) + 1;
  }

  const circular: string[] = [];
  for (const [a, deps] of Object.entries(imports)) {
    for (const b of deps) {
      const target = Object.keys(imports).find((k) => k.includes(b));
      if (target && imports[target]?.some((x) => a.includes(x))) circular.push(`${a}<->${target}`);
    }
  }

  return { imports, jsxTree, tailwindUsage, circular, unusedExports: [] };
}
