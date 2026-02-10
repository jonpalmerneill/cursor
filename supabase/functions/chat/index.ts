const SYSTEM_PROMPT = `You are a helpful assistant representing the portfolio owner. Answer questions about their work, projects, and background based on the following context. If asked something outside this context, say you don't have that information and suggest they reach out via the contact section.

Context:
- Name: Your Name (replace with actual name in production)
- Tagline: Frontend developer crafting clean, user-friendly experiences.
- Projects: Project One (HTML, CSS, JavaScript), Project Two (HTML, CSS), Project Three (HTML, CSS, React), Project Four (HTML, CSS, Node.js). Each has a brief description on the portfolio.
- About: The person enjoys building clean, accessible interfaces, solving real problems with simple solutions, and collaborating with designers and engineers. They are open to opportunities.
- Contact: Twitter and LinkedIn links are on the portfolio.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 500) {
    return new Response(
      JSON.stringify({ error: "message must be a non-empty string (max 500 chars)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI error:", res.status, errText);
      let errMessage = "AI service error";
      try {
        const errJson = JSON.parse(errText);
        const msg = errJson?.error?.message || errJson?.message;
        if (msg && typeof msg === "string") errMessage = msg;
      } catch {
        if (errText.length < 200) errMessage = errText;
      }
      return new Response(
        JSON.stringify({ error: errMessage, status: res.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() || "I couldn't generate a reply.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
