require("dotenv").config();

const cors = require("cors");
const express = require("express");

const { analyzeArchitectureSummary } = require("./utils/geminiClient");
const { buildArchitectureSummary } = require("./utils/parser");

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_FILES = 100;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001"
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ScaleCraft API" });
});

function validateAnalyzePayload(req, res, next) {
  const { files } = req.body || {};

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({
      error: "Invalid request body. Expected { files: [{ filename: string, content: string }] }."
    });
  }

  if (files.length > MAX_FILES) {
    return res.status(400).json({
      error: `Please upload no more than ${MAX_FILES} text files at once.`
    });
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
    return res.status(400).json({
      error: "Each file needs a name, text content, and must be smaller than 500 KB."
    });
  }

  next();
}

app.post("/api/analyze", validateAnalyzePayload, async (req, res) => {
  try {
    const summary = buildArchitectureSummary(req.body.files);
    const insights = await analyzeArchitectureSummary(summary);

    res.json({
      summary,
      insights
    });
  } catch (error) {
    console.error("Analysis failed:", error);

    if (error.message === "GEMINI_API_KEY is not configured") {
      return res.status(500).json({
        error: "Gemini API key is not configured on the server."
      });
    }

    if (
      error instanceof SyntaxError ||
      error.message.includes("Gemini response") ||
      error.message.includes("JSON")
    ) {
      return res.status(502).json({
        error: "Gemini returned a malformed response. Please retry the analysis."
      });
    }

    res.status(500).json({
      error: "Unable to analyze the uploaded files right now."
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`ScaleCraft API listening on http://localhost:${PORT}`);
});
