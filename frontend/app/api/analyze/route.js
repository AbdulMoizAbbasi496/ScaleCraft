import { analyzeArchitectureSummary } from "../../../lib/geminiClient";
import { buildArchitectureSummary } from "../../../lib/parser";

const MAX_FILES = 100;

export const runtime = "nodejs";

function validateFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return "Invalid request body. Expected { files: [{ filename: string, content: string }] }.";
  }

  if (files.length > MAX_FILES) {
    return `Please upload no more than ${MAX_FILES} text files at once.`;
  }

  const invalidFile = files.find(
    (file) =>
      !file ||
      typeof file.filename !== "string" ||
      typeof file.content !== "string" ||
      file.filename.trim() === "" ||
      file.content.length > 500_000
  );

  if (invalidFile) {
    return "Each file needs a name, text content, and must be smaller than 500 KB.";
  }

  return "";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validationError = validateFiles(body.files);

    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const summary = buildArchitectureSummary(body.files);
    const insights = await analyzeArchitectureSummary(summary);

    return Response.json({ summary, insights });
  } catch (error) {
    console.error("Analysis failed:", error);

    if (error.message === "GEMINI_API_KEY is not configured") {
      return Response.json({ error: "Gemini API key is not configured on the server." }, { status: 500 });
    }

    if (
      error instanceof SyntaxError ||
      error.message.includes("Gemini response") ||
      error.message.includes("JSON")
    ) {
      return Response.json({ error: "Gemini returned a malformed response. Please retry the analysis." }, { status: 502 });
    }

    return Response.json({ error: "Unable to analyze the uploaded files right now." }, { status: 500 });
  }
}
