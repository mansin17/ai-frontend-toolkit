import { Provider, defaultModel, getClient } from "./providers.js";

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

export async function completeJSON<T>(
  provider: Provider,
  model: string | undefined,
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const client = getClient(provider);
  const response = await client.chat.completions.create({
    model: model || defaultModel(provider),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${systemPrompt}\n\nRespond with JSON only. Do not include any explanation or markdown formatting outside the JSON.`,
      },
      { role: "user", content: userPrompt },
    ],
  });
  // Not every free model honours response_format, so tolerate fenced output too.
  const raw = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(extractJson(raw)) as T;
}
