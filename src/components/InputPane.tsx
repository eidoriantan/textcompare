import { useState, useRef, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";
import {
  ClipboardPaste,
  Upload,
  FileText,
} from "lucide-react";

import type { InputMode } from "../types";

interface InputPaneProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fileName: string;
  onFile: (content: string, name: string) => void;
}

export default function InputPane({ label, value, onChange, fileName, onFile }: InputPaneProps) {
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
