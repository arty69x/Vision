export async function callOllamaLocal(prompt: string, model: string) {
  const endpoint = "http://localhost:11434";
  try {
    const res = await fetch(`${endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false })
    });
    if (!res.ok) return { ok: false, output: `${model}:unavailable` };
    const json = await res.json().catch(() => ({ response: "" }));
    return { ok: true, output: String(json.response ?? `${model}:ok`).slice(0, 200) };
  } catch {
    return { ok: false, output: `${model}:connection-failed` };
  }
}
