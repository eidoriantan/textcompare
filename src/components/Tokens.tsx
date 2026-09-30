import type { Token } from "../types";

export default function Tokens({ tokens }: { tokens: Token[] | null }) {
  if (!tokens) return null;
  return (
    <>
      {tokens.map((t, idx) => {
        if (t.type === "same") return <span key={idx}>{t.text}</span>;
        if (t.type === "del")
          return (
            <mark key={idx} className="bg-rose-800/50 text-rose-200 rounded-[2px] line-through decoration-rose-300/70">
              {t.text}
            </mark>
          );
        return (
          <mark key={idx} className="bg-emerald-800/50 text-emerald-200 rounded-[2px]">
            {t.text}
          </mark>
        );
      })}
    </>
  );
}
