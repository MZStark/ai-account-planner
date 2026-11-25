// Vercel serverless function: POST /api/plan  { company }
// Calls the OpenAI Responses API (web search + structured output) with plain fetch,
// so the project has zero npm dependencies.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, "schema.json"), "utf8"));
const SYSTEM_PROMPT = fs.readFileSync(path.join(ROOT, "prompts", "system.md"), "utf8");
const MODEL = process.env.OPENAI_MODEL || "gpt-6.2-sol";

// Light abuse protection for a public demo: per-IP limit and a small cache.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = Number(process.env.RATE_LIMIT_PER_HOUR || 5);
const hits = new Map();
const cache = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function extractText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  for (const item of data.output || []) {
    for (const part of item.content || []) {
      if (part.type === "output_text" && part.text) return part.text;
    }
  }
  throw new Error("No text in model response");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST" });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "Live generation is not configured on this deployment." });
  }

  // Fail closed: live generation always requires ACCESS_CODE to be set and matched.
  if (!process.env.ACCESS_CODE || req.headers["x-access-code"] !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: "Live generation needs an access code." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const company = String(body.company || "").trim().slice(0, 80);
  if (company.length < 2) return res.status(400).json({ error: "Company name is required." });

  const key = company.toLowerCase();
  if (cache.has(key)) return res.status(200).json({ plan: cache.get(key), cached: true });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "Demo limit reached. Try again in an hour." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        tools: [{ type: "web_search" }],
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Company: ${company}\nSearch the web first, then build the account strategy.`,
          },
        ],
        text: { format: { type: "json_schema", name: "account_plan", schema: SCHEMA, strict: true } },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const message = (data && data.error && data.error.message) || `OpenAI error ${response.status}`;
      return res.status(502).json({ error: message });
    }

    const plan = JSON.parse(extractText(data));
    cache.set(key, plan);
    return res.status(200).json({ plan });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
};
