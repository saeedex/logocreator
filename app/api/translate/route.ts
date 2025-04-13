import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

export async function POST(req: Request, companyName: boolean) {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();

    const schema = z.object({
      text: z.string(),
      userAPIKey: z.string().optional(), // Optional BYOK support
    });

    const { text, userAPIKey } = schema.parse(body);

    const openai_model = process.env.OPENAI_MODEL;
    const openai_key = userAPIKey || process.env.OPENAI_API_KEY;

    if (!openai_key || !openai_model) {
      console.error("Missing OpenAI credentials.");
      return new Response("OpenAI credentials not found.", { status: 500 });
    }

    const systemPrompt = "You are a helpful assistant that translates text to English. Your response should only contain translated text.";
    const userPrompt = companyName 
      ? `Translate this company name to English:\n\n${text}, make sure to translit correctly, be creative` 
      : `Translate this text to English:\n\n${text}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openai_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openai_model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      console.error("OpenAI API error:", err);
      return new Response(`OpenAI Error: ${err}`, { status: openaiRes.status });
    }

    const json = await openaiRes.json();
    const translatedText = json.choices?.[0]?.message?.content?.trim() ?? "";
    //console.log("Translated text:", translatedText);
    return Response.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return new Response("Translation failed.", { status: 500 });
  }
}
