import { useState, useRef, useMemo } from "react";
import type { JSX } from "react";
import {
  GitCompare,
  RotateCcw,
  Rows3,
  AlignJustify,
  ChevronUp,
  ChevronDown,
  ArrowLeftRight,
} from "lucide-react";

import { buildRows } from "./lcs/compare";
import Tokens from "./components/Tokens";
import InputPane from "./components/InputPane";
import type { ViewMode, DiffResult } from "./types";

const currentYear = new Date().getFullYear().toString();

export default function App() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [fileNameA, setFileNameA] = useState("");
  const [fileNameB, setFileNameB] = useState("");
  const [view, setView] = useState<ViewMode>("split");
  const [result, setResult] = useState<DiffResult | null>(null);
  const diffRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(-1);

  const blocks = useMemo(() => {
    if (!result) return [];
    const out: { start: number; end: number }[] = [];
    let start = -1;
    result.rows.forEach((r, i) => {
      if (r.type !== "same") {
        if (start === -1) start = i;
      } else if (start !== -1) {
        out.push({ start, end: i });
        start = -1;
      }
    });
    if (start !== -1) out.push({ start, end: result.rows.length });
    return out;
  }, [result]);

  const goTo = (n: number) => {
    if (blocks.length === 0) return;
    const idx = (n + blocks.length) % blocks.length; // wraps around
    setCurrent(idx);

    const container = diffRef.current;
    const el = container?.querySelector<HTMLElement>(`[data-row="${blocks[idx].start}"]`);
    if (!container || !el) return;

    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop -
      container.clientHeight / 2 +
      el.offsetHeight / 2;
    container.scrollTo({ top, behavior: "smooth" });
  };

  const goNext = () => goTo(current + 1);
  const goPrev = () => goTo(current === -1 ? blocks.length - 1 : current - 1);

  const swap = () => {
    setTextA(textB);
    setTextB(textA);
    setFileNameA(fileNameB);
    setFileNameB(fileNameA);

    if (result) {
      setResult(buildRows(textB.replace(/\r\n/g, "\n"), textA.replace(/\r\n/g, "\n")));
      setCurrent(-1);
    }
  };

  const compare = () => {
    setResult(buildRows(textA.replace(/\r\n/g, "\n"), textB.replace(/\r\n/g, "\n")));
    setCurrent(-1);
  };

  const clearAll = () => {
    setTextA(""); setTextB("");
    setFileNameA(""); setFileNameB("");
    setResult(null);
    setCurrent(-1);
  };

  const activeBlock = current >= 0 ? blocks[current] : null;
  const isActive = (idx: number) => !!activeBlock && idx >= activeBlock.start && idx < activeBlock.end;
  const activeCls = (idx: number) => (isActive(idx) ? "outline outline-1 -outline-offset-1 outline-amber-400/60" : "");

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
            onClick={swap}
            className="flex items-center gap-2 rounded-lg border border-neutral-800 px-4 py-2.5 text-sm text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
          >
            <ArrowLeftRight size={14} /> Swap
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
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-neutral-500">
                    {blocks.length === 0 ? "0 changes" : `${current + 1} / ${blocks.length}`}
                  </span>
                  <button
                    onClick={goPrev}
                    disabled={blocks.length === 0}
                    aria-label="Previous difference"
                    className="rounded-md border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 transition-colors hover:text-neutral-200 disabled:opacity-40 disabled:hover:text-neutral-400"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={blocks.length === 0}
                    aria-label="Next difference"
                    className="rounded-md border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 transition-colors hover:text-neutral-200 disabled:opacity-40 disabled:hover:text-neutral-400"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

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
            </div>

            <div ref={diffRef} className="max-h-[70vh] overflow-auto rounded-xl border border-neutral-800 bg-neutral-900">
              {result.addCount === 0 && result.delCount === 0 ? (
                <p className="py-10 text-center font-serif text-[1.05rem] text-neutral-500">The two texts are identical.</p>
              ) : (
                <table className="w-full border-collapse font-mono text-[0.82rem]">
                  <tbody>
                    {view === "split"
                      ? result.rows.map((r, idx) => (
                          <tr key={idx} data-row={idx} className={activeCls(idx)}>
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
                              <tr key={idx} data-row={idx}>
                                <td className="w-px whitespace-nowrap border-r border-neutral-800 px-2.5 py-0.5 text-right text-neutral-600 select-none">{r.lnA}</td>
                                <td className="px-2.5 py-0.5 whitespace-pre-wrap break-words"><Tokens tokens={r.a} /></td>
                              </tr>,
                            ];
                          }
                          const out: JSX.Element[] = [];
                          if (r.a) out.push(
                            <tr key={idx + "-a"} data-row={idx} className={`bg-rose-950/40 ${activeCls(idx)}`}>
                              <td className="w-px whitespace-nowrap border-r border-neutral-800 px-2.5 py-0.5 text-right text-neutral-600 select-none">{r.lnA ?? ""}</td>
                              <td className="px-2.5 py-0.5 whitespace-pre-wrap break-words">− <Tokens tokens={r.a} /></td>
                            </tr>
                          );
                          if (r.b) out.push(
                            <tr key={idx + "-b"} data-row={idx} className={`bg-emerald-950/40 ${activeCls(idx)}`}>
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
