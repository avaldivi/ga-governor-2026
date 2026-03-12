export function buildPrompt(candidateName: string, party: string): string {
  const partyLabel = party === "dem" ? "Democrat" : "Republican";
  return [
    `You are a campaign finance research assistant. Provide the most recent publicly available campaign fundraising data for ${candidateName}, who is running for Georgia Governor in 2026 as a ${partyLabel}.`,
    `Include:`,
    `1. Total raised (most recent filing period available)`,
    `2. Cash on hand`,
    `3. Key funding sources (self-funded, PACs, small donors, dark money, leadership committee, etc.)`,
    `4. Any notable funding developments or controversies`,
    `Be specific with dollar amounts where known. If exact figures aren't available, say so clearly. Keep response to 3-4 sentences max. Do not use markdown formatting.`,
  ].join("\n");
}

export async function callAnthropic(apiKey: string, model: string, candidateName: string, party: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: buildPrompt(candidateName, party) }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? "Anthropic API error");
  return data.content
    ?.filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join(" ")
    .trim() || "Unable to retrieve funding data.";
}