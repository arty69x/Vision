import { createAstCache, patchAst } from "@/engine/ast/incrementalParser";

let cache = createAstCache("");

self.onmessage = (event: MessageEvent<{ source: string }>) => {
  const { source } = event.data;
  const patched = patchAst(cache, source);
  cache = patched.cache;
  self.postMessage(patched.result);
};
