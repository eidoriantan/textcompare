export type TokenType = "same" | "add" | "del";

export interface Token {
  type: TokenType;
  text: string;
}

export type RowType = "same" | "mod" | "add" | "del";

export interface DiffRow {
  type: RowType;
  a: Token[] | null;
  b: Token[] | null;
  lnA: number | null;
  lnB: number | null;
}

export interface DiffResult {
  rows: DiffRow[];
  addCount: number;
  delCount: number;
}

export type LcsOp = ["same" | "add" | "del", string];
export type LcsGroupEntry = [LcsOp] | { dels: string[]; adds: string[] };

export type ViewMode = "split" | "unified";
export type InputMode = "paste" | "file";
