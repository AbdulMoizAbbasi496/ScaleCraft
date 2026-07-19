import { GoogleGenerativeAI } from "@google/generative-ai";

const RESPONSE_SCHEMA_EXAMPLE =
  '[{"file":"filename.js","concept":"Name of missing system design concept","explanation":"Educational explanation of why this limits scalability","refactoredCode":"Snippet showing the fix"}]';

const SYSTEM_INSTRUCTION = `
You are ScaleCraft, a strict but encouraging System Design Mentor for beginner developers.

Evaluate the provided architectural summary only. Do not assume access to full source files.
Find missing or weak system design concepts such as caching, N+1 query risks, rate limiting,
pagination, database indexing, background jobs, retries/timeouts, idempotency, and observability.

Return ONLY valid JSON. Do not wrap it in Markdown. Do not include commentary before or after it.
The response must be a JSON array with this exact schema:
${RESPONSE_SCHEMA_EXAMPLE}

Rules:
- "file" must reference one filename from the summary.
- "concept" must be concise and educational.
- "explanation" must explain why the issue limits scalability or reliability.
- "refactoredCode" must be a practical snippet showing how the beginner could improve the code.
- If no meaningful flaws are found, return [].
`;

function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION
  });
}

function extractJsonArray(text) {
  const trimmed = text.trim();

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed;
  }

  const firstArrayCharacter = trimmed.indexOf("[");
  const lastArrayCharacter = trimmed.lastIndexOf("]");

  if (firstArrayCharacter === -1 || lastArrayCharacter === -1 || lastArrayCharacter <= firstArrayCharacter) {
    throw new Error("Gemini response did not contain a JSON array");
  }

  return trimmed.slice(firstArrayCharacter, lastArrayCharacter + 1);
}

function validateInsight(insight) {
  return (
    insight &&
    typeof insight === "object" &&
    typeof insight.file === "string" &&
    typeof insight.concept === "string" &&
    typeof insight.explanation === "string" &&
    typeof insight.refactoredCode === "string"
  );
}

export function parseInsights(text) {
  const parsed = JSON.parse(extractJsonArray(text));

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response JSON must be an array");
  }

  const invalidIndex = parsed.findIndex((insight) => !validateInsight(insight));

  if (invalidIndex !== -1) {
    throw new Error(`Gemini response item at index ${invalidIndex} does not match the required schema`);
  }

  return parsed;
}

export async function analyzeArchitectureSummary(summary) {
  const model = getGeminiModel();

  const result = await model.generateContent(`
Analyze this lightweight architecture summary and return the required JSON array.

Architecture Summary:
${summary}
`);

  return parseInsights(result.response.text());
}
