"use client";

import { useMemo, useState } from "react";
import FileDropzone from "../components/FileDropzone";
import FileTree from "../components/FileTree";
import InsightsPanel from "../components/InsightsPanel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [insights, setInsights] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSource = useMemo(
    () => files.find((file) => file.filename === selectedFile)?.content || "",
    [files, selectedFile]
  );

  async function analyzeFiles(uploadedFiles) {
    setFiles(uploadedFiles);
    setInsights([]);
    setSelectedFile("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: uploadedFiles })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "ScaleCraft could not analyze this project.");
      }

      const receivedInsights = Array.isArray(payload.insights) ? payload.insights : [];
      setInsights(receivedInsights);
      setSelectedFile(receivedInsights[0]?.file || uploadedFiles[0]?.filename || "");
    } catch (requestError) {
      setError(requestError.message || "ScaleCraft could not analyze this project.");
      setSelectedFile(uploadedFiles[0]?.filename || "");
    } finally {
      setIsLoading(false);
    }
  }

  function startOver() {
    setFiles([]);
    setInsights([]);
    setSelectedFile("");
    setError("");
  }

  const hasProject = files.length > 0;

  return (
    <div className="min-h-screen bg-mist text-ink">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          {hasProject ? (
            <FileTree files={files} insights={insights} activeFile={selectedFile} onSelect={setSelectedFile} onStartOver={startOver} />
          ) : (
            <FileDropzone onFilesReady={analyzeFiles} disabled={isLoading} />
          )}
        </div>
        <div className="min-h-[620px] bg-mist">
          <InsightsPanel
            isLoading={isLoading}
            error={error}
            selectedFile={selectedFile}
            insights={insights}
            sourceCode={selectedSource}
          />
        </div>
      </div>
    </div>
  );
}
