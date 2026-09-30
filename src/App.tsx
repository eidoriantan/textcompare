import { useState, useRef, useCallback } from "react";
import type { ChangeEvent, DragEvent, JSX } from "react";
import {
  ClipboardPaste,
  Upload,
  GitCompare,
  RotateCcw,
  Rows3,
  AlignJustify,
  FileText,
} from "lucide-react";

import { buildRows } from "./lcs/compare";
import Tokens from "./components/Tokens";
import type { InputMode, ViewMode, DiffResult } from "./types";

const currentYear = new Date().getFullYear().toString();

interface InputPaneProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fileName: string;
  onFile: (content: string, name: string) => void;
}

function InputPane({ label, value, onChange, fileName, onFile }: InputPaneProps) {
  const [mode, setMode] = useState<InputMode>("paste");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => onFile((e.target?.result as string) ?? "", file.name);
    reader.readAsText(file);
  }, [onFile]);

  return (
    <div className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-800">
        <h2 className="text-[0.72rem] font-semibold tracking-wide text-neutral-400 uppercase">{label}</h2>
        <div className="flex rounded-md border border-neutral-800 bg-neutral-950 overflow-hidden">
          <button
            onClick={() => setMode("paste")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs transition-colors ${mode === "paste" ? "bg-emerald-700/80 text-emerald-50" : "text-neutral-400 hover:text-neutral-200"}`}
          >
            <ClipboardPaste size={13} /> Paste
          </button>
          <button
            onClick={() => setMode("file")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs transition-colors ${mode === "file" ? "bg-emerald-700/80 text-emerald-50" : "text-neutral-400 hover:text-neutral-200"}`}
          >
            <Upload size={13} /> Upload
          </button>
        </div>
      </div>

      {mode === "paste" ? (
        <textarea
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={`Paste the ${label.toLowerCase()} text here…`}
          className="min-h-[220px] w-full resize-y bg-transparent p-3.5 font-mono text-[0.85rem] leading-relaxed text-neutral-200 outline-none placeholder:text-neutral-600"
        />
      ) : (
        <label
          onDragOver={(e: DragEvent<HTMLLabelElement>) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: DragEvent<HTMLLabelElement>) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className={`m-3 flex min-h-[196px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed text-center text-sm transition-colors ${dragOver ? "border-emerald-600 bg-emerald-950/30" : "border-neutral-800 text-neutral-500"}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv,.json,.js,.py,.html,.css,text/*"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          />
          <FileText size={20} className="text-neutral-600" />
          <strong className="text-neutral-300 font-medium">Drop a file here</strong>
          <span>or click to browse</span>
          {fileName && (
            <span className="mt-1 rounded-md bg-emerald-950/50 px-2 py-0.5 font-mono text-[0.72rem] text-emerald-400">{fileName}</span>
          )}
        </label>
      )}
    </div>
  );
}

export default function App() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [fileNameA, setFileNameA] = useState("");
  const [fileNameB, setFileNameB] = useState("");
  const [view, setView] = useState<ViewMode>("split");
  const [result, setResult] = useState<DiffResult | null>(null);

  const compare = () => {
    setResult(buildRows(textA.replace(/\r\n/g, "\n"), textB.replace(/\r\n/g, "\n")));
  };

  const clearAll = () => {
    setTextA(""); setTextB("");
    setFileNameA(""); setFileNameB("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-neutral-800 px-6 py-7 sm:px-10">
        <div className="flex items-baseline gap-2.5">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-neutral-50">Text Compare</h1>
          <span className="text-sm text-neutral-500">line &amp; word level diff</span>
        </div>
        {result && (
          <div className="flex gap-4 font-mono text-[0.82rem] text-neutral-500">
            <span><b className="text-emerald-400">+{result.addCount}</b> added</span>
            <span><b className="text-rose-400">-{result.delCount}</b> removed</span>
          </div>
        )}
      </header>

      <main className="px-6 py-6 pb-16 sm:px-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <InputPane
            label="Original"
            value={textA}
            onChange={setTextA}
            fileName={fileNameA}
            onFile={(content, name) => { setTextA(content); setFileNameA(name); }}
          />
          <InputPane
            label="Revised"
            value={textB}
            onChange={setTextB}
            fileName={fileNameB}
            onFile={(content, name) => { setTextB(content); setFileNameB(name); }}
          />
        </div>

        <div className="my-7 flex items-center justify-center gap-3.5">
          <button
            onClick={compare}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-[0.92rem] font-medium text-emerald-50 hover:bg-emerald-600 transition-colors"
          >
            <GitCompare size={16} /> Compare texts
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 px-4 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
          >
            <RotateCcw size={14} /> Clear all
          </button>
        </div>

        {result && (
          <div>
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2.5">
              <h2 className="font-serif text-lg font-semibold text-neutral-100">Differences</h2>
              <div className="flex rounded-md border border-neutral-800 bg-neutral-900 overflow-hidden">
                <button
                  onClick={() => setView("split")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${view === "split" ? "bg-emerald-700/80 text-emerald-50" : "text-neutral-400 hover:text-neutral-200"}`}
                >
                  <Rows3 size={13} /> Side by side
                </button>
                <button
                  onClick={() => setView("unified")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${view === "unified" ? "bg-emerald-700/80 text-emerald-50" : "text-neutral-400 hover:text-neutral-200"}`}
                >
                  <AlignJustify size={13} /> Unified
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl border border-neutral-800 bg-neutral-900">
              {result.addCount === 0 && result.delCount === 0 ? (
                <p className="py-10 text-center font-serif text-[1.05rem] text-neutral-500">The two texts are identical.</p>
              ) : (
                <table className="w-full border-collapse font-mono text-[0.82rem]">
                  <tbody>
                    {view === "split"
                      ? result.rows.map((r, idx) => (
                          <tr key={idx}>
                            <td className="w-px whitespace-nowrap border-r border-neutral-800 px-2.5 py-0.5 text-right text-neutral-600 select-none">{r.lnA ?? ""}</td>
                            <td className={`px-2.5 py-0.5 align-top whitespace-pre-wrap break-words ${r.a === null ? "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,#1c1c1c_6px,#1c1c1c_7px)]" : r.type === "del" || r.type === "mod" ? "bg-rose-950/40" : ""}`}>
                              <Tokens tokens={r.a} />
                            </td>
                            <td className="w-px whitespace-nowrap border-r border-l border-neutral-800 px-2.5 py-0.5 text-right text-neutral-600 select-none">{r.lnB ?? ""}</td>
                            <td className={`px-2.5 py-0.5 align-top whitespace-pre-wrap break-words ${r.b === null ? "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,#1c1c1c_6px,#1c1c1c_7px)]" : r.type === "add" || r.type === "mod" ? "bg-emerald-950/40" : ""}`}>
                              <Tokens tokens={r.b} />
                            </td>
                          </tr>
                        ))
                      : result.rows.flatMap((r, idx): JSX.Element[] => {
                          if (r.type === "same") {
                            return [
                              <tr key={idx}>
                                <td className="w-px whitespace-nowrap border-r border-neutral-800 px-2.5 py-0.5 text-right text-neutral-600 select-none">{r.lnA}</td>
                                <td className="px-2.5 py-0.5 whitespace-pre-wrap break-words"><Tokens tokens={r.a} /></td>
                              </tr>,
                            ];
                          }
                          const out: JSX.Element[] = [];
                          if (r.a) out.push(
                            <tr key={idx + "-a"} className="bg-rose-950/40">
                              <td className="w-px whitespace-nowrap border-r border-neutral-800 px-2.5 py-0.5 text-right text-neutral-600 select-none">{r.lnA ?? ""}</td>
                              <td className="px-2.5 py-0.5 whitespace-pre-wrap break-words">− <Tokens tokens={r.a} /></td>
                            </tr>
                          );
                          if (r.b) out.push(
                            <tr key={idx + "-b"} className="bg-emerald-950/40">
                              <td className="w-px whitespace-nowrap border-r border-neutral-800 px-2.5 py-0.5 text-right text-neutral-600 select-none">{r.lnB ?? ""}</td>
                              <td className="px-2.5 py-0.5 whitespace-pre-wrap break-words">+ <Tokens tokens={r.b} /></td>
                            </tr>
                          );
                          return out;
                        })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="px-6 pb-8 text-center text-xs text-neutral-500">
        <p className="mb-1.5">Everything runs in your browser — no text is uploaded anywhere.</p>
        <p>
          &copy; {currentYear}{" "}
          <a href="https://eidoriantan.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">
            @eidoriantan
          </a>
        </p>
      </footer>
    </div>
  );
}
