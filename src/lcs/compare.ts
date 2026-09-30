import type { Token, DiffRow, DiffResult, LcsOp, LcsGroupEntry } from "../types";

function lcsDiff(a: string[], b: string[]): LcsOp[] {
  const n = a.length, m = b.length;
  const dp: Int32Array[] = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: LcsOp[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push(["same", a[i]]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push(["del", a[i]]); i++; }
    else { ops.push(["add", b[j]]); j++; }
  }
  while (i < n) { ops.push(["del", a[i]]); i++; }
  while (j < m) { ops.push(["add", b[j]]); j++; }
  return ops;
}

function wordTokens(line: string): string[] {
  return line.match(/\s+|[^\s]+/g) || [""];
}

function wordDiffTokens(oldLine: string, newLine: string): [Token[], Token[]] {
  const wa = wordTokens(oldLine), wb = wordTokens(newLine);
  const ops = lcsDiff(wa, wb);
  const left: Token[] = [], right: Token[] = [];
  ops.forEach(([type, tok]) => {
    if (type === "same") { left.push({ type: "same", text: tok }); right.push({ type: "same", text: tok }); }
    else if (type === "del") { left.push({ type: "del", text: tok }); }
    else { right.push({ type: "add", text: tok }); }
  });
  return [left, right];
}

function computeGroupedDiff(textA: string, textB: string): LcsGroupEntry[] {
  const la = textA.split("\n");
  const lb = textB.split("\n");
  const raw = lcsDiff(la, lb);
  const groups: LcsGroupEntry[] = [];
  let i = 0;
  while (i < raw.length) {
    const [type] = raw[i];
    if (type === "same") { groups.push([raw[i]]); i++; continue; }
    const dels: string[] = [], adds: string[] = [];
    while (i < raw.length && raw[i][0] === "del") { dels.push(raw[i][1]); i++; }
    while (i < raw.length && raw[i][0] === "add") { adds.push(raw[i][1]); i++; }
    groups.push({ dels, adds });
  }
  return groups;
}

export function buildRows(textA: string, textB: string): DiffResult {
  const groups = computeGroupedDiff(textA, textB);
  const rows: DiffRow[] = [];
  let lnA = 1, lnB = 1, addCount = 0, delCount = 0;

  groups.forEach((g) => {
    if (Array.isArray(g)) {
      const [, line] = g[0];
      rows.push({ type: "same", a: [{ type: "same", text: line }], b: [{ type: "same", text: line }], lnA: lnA++, lnB: lnB++ });
      return;
    }
    const { dels, adds } = g;
    const pairCount = Math.min(dels.length, adds.length);
    for (let k = 0; k < pairCount; k++) {
      const [l, r] = wordDiffTokens(dels[k], adds[k]);
      rows.push({ type: "mod", a: l, b: r, lnA: lnA++, lnB: lnB++ });
      delCount++; addCount++;
    }
    for (let k = pairCount; k < dels.length; k++) {
      rows.push({ type: "del", a: [{ type: "same", text: dels[k] }], b: null, lnA: lnA++, lnB: null });
      delCount++;
    }
    for (let k = pairCount; k < adds.length; k++) {
      rows.push({ type: "add", a: null, b: [{ type: "same", text: adds[k] }], lnA: null, lnB: lnB++ });
      addCount++;
    }
  });

  return { rows, addCount, delCount };
}
