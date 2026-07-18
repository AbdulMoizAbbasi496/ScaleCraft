"use client";

import { useMemo } from "react";
import { AlertTriangle, FileCode2, FolderTree, RotateCcw } from "lucide-react";

function organizeFiles(files) {
  const root = { children: {}, files: [] };

  files.forEach((file) => {
    const parts = file.filename.replace(/\\/g, "/").split("/");
    const fileName = parts.pop();
    let branch = root;

    parts.forEach((part) => {
      branch.children[part] ||= { children: {}, files: [] };
      branch = branch.children[part];
    });
    branch.files.push({ ...file, displayName: fileName });
  });

  return root;
}

function TreeBranch({ branch, depth, activeFile, flawedFiles, onSelect }) {
  return (
    <>
      {Object.entries(branch.children)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([name, child]) => (
          <div key={name}>
            <div className="flex items-center gap-2 py-1.5 text-sm font-medium text-slate-600" style={{ paddingLeft: `${depth * 14}px` }}>
              <FolderTree size={16} className="text-sky" aria-hidden="true" />
              <span className="truncate">{name}</span>
            </div>
            <TreeBranch branch={child} depth={depth + 1} activeFile={activeFile} flawedFiles={flawedFiles} onSelect={onSelect} />
          </div>
        ))}
      {branch.files
        .sort((left, right) => left.displayName.localeCompare(right.displayName))
        .map((file) => {
          const hasFlaw = flawedFiles.has(file.filename);
          const isActive = activeFile === file.filename;
          return (
            <button
              type="button"
              key={file.filename}
              title={file.filename}
              onClick={() => onSelect(file.filename)}
              className={`flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left text-sm transition ${
                isActive ? "bg-sky/10 text-ink" : "text-slate-600 hover:bg-slate-100"
              } ${hasFlaw ? "font-semibold" : ""}`}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
            >
              <FileCode2 size={16} className={hasFlaw ? "text-coral" : "text-slate-400"} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{file.displayName}</span>
              {hasFlaw && <AlertTriangle size={15} className="shrink-0 text-coral" aria-label="Has insight" />}
            </button>
          );
        })}
    </>
  );
}

export default function FileTree({ files, insights, activeFile, onSelect, onStartOver }) {
  const tree = useMemo(() => organizeFiles(files), [files]);
  const flawedFiles = useMemo(() => new Set(insights.map((insight) => insight.file)), [insights]);

  return (
    <aside className="flex h-full flex-col bg-white px-4 py-5">
      <div className="mb-5 flex items-center justify-between px-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Project files</p>
          <p className="mt-1 text-sm text-slate-600">{files.length} files analyzed</p>
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-ink"
          title="Analyze another project"
          aria-label="Analyze another project"
        >
          <RotateCcw size={17} aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <TreeBranch branch={tree} depth={0} activeFile={activeFile} flawedFiles={flawedFiles} onSelect={onSelect} />
      </div>
      <div className="mt-4 border-t border-slate-200 px-2 pt-4 text-xs leading-5 text-slate-500">
        <span className="font-semibold text-coral">Orange markers</span> show areas worth improving.
      </div>
    </aside>
  );
}
