"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import { FileArchive, FileCode2, UploadCloud } from "lucide-react";

const MAX_FILE_SIZE = 500_000;
const IGNORED_EXTENSIONS = /\.(png|jpe?g|gif|webp|ico|pdf|woff2?|ttf|eot|mp3|mp4|mov|zip)$/i;

function isUsableTextFile(file) {
  return !file.dir && !IGNORED_EXTENSIONS.test(file.name) && file._data.uncompressedSize <= MAX_FILE_SIZE;
}

async function readZipArchive(zipFile) {
  const zip = await JSZip.loadAsync(zipFile);
  const entries = Object.values(zip.files).filter(isUsableTextFile);
  const extracted = await Promise.all(
    entries.map(async (entry) => ({
      filename: entry.name,
      content: await entry.async("string")
    }))
  );

  return extracted;
}

async function readUploads(fileList) {
  const selectedFiles = Array.from(fileList);
  const normalFiles = selectedFiles.filter((file) => !file.name.toLowerCase().endsWith(".zip"));
  const archives = selectedFiles.filter((file) => file.name.toLowerCase().endsWith(".zip"));

  const textFiles = await Promise.all(
    normalFiles
      .filter((file) => !IGNORED_EXTENSIONS.test(file.name) && file.size <= MAX_FILE_SIZE)
      .map(async (file) => ({ filename: file.name, content: await file.text() }))
  );

  const archiveFiles = (await Promise.all(archives.map(readZipArchive))).flat();
  return [...textFiles, ...archiveFiles].slice(0, 100);
}

export default function FileDropzone({ onFilesReady, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");

  async function processFiles(fileList) {
    if (!fileList?.length || disabled) return;

    try {
      setMessage("");
      const files = await readUploads(fileList);

      if (!files.length) {
        setMessage("No readable code files found. Try source files or a ZIP archive.");
        return;
      }

      onFilesReady(files);
    } catch {
      setMessage("That archive could not be read. Please try another file.");
    }
  }

  return (
    <div className="flex h-full flex-col px-6 py-7">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
          <span className="text-lg font-bold">S</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-normal text-ink">ScaleCraft</h1>
          <p className="text-sm text-slate-500">System Design Mentor</p>
        </div>
      </div>

      <div
        className={`flex min-h-[330px] flex-1 flex-col items-center justify-center border-2 border-dashed px-7 text-center transition ${
          isDragging ? "border-sky bg-sky/5" : "border-slate-300 bg-white"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          processFiles(event.dataTransfer.files);
        }}
      >
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-lg bg-sky/10 text-sky">
          <UploadCloud size={28} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-ink">Bring in your project</h2>
        <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
          Drop code files or a ZIP archive here. ScaleCraft reads the structure, then looks for ways it could grow more gracefully.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <FileCode2 size={17} aria-hidden="true" />
          Choose files
        </button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          multiple
          accept=".js,.jsx,.ts,.tsx,.json,.py,.java,.go,.rb,.php,.cs,.sql,.html,.css,.md,.zip"
          onChange={(event) => processFiles(event.target.files)}
        />
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <FileArchive size={15} aria-hidden="true" />
          <span>Up to 100 files, 500 KB each</span>
        </div>
        {message && <p className="mt-4 text-sm text-coral">{message}</p>}
      </div>
    </div>
  );
}
