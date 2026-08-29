import { DEFAULT_MODELS, Provider, getAnthropic, getOpenAI } from "./providers.js";

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
  const chosenModel = model || DEFAULT_MODELS[provider];

  if (provider === "openai") {
    const client = getOpenAI();
    const response = await client.chat.completions.create({
      model: chosenModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    const content = response.choices[0]?.message?.content ?? "{}";
    return JSON.parse(content) as T;
  }

  const client = getAnthropic();
  const message = await client.messages.create({
    model: chosenModel,
    max_tokens: 1024,
    system: `${systemPrompt}\n\nRespond with JSON only. Do not include any explanation or markdown formatting outside the JSON.`,
    messages: [{ role: "user", content: userPrompt }],
  });
  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
  return JSON.parse(extractJson(raw)) as T;
}
