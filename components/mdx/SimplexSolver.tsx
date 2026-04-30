"use client";
import { useState, useCallback } from "react";

// ========================
// TYPES
// ========================
type Mode = "primal" | "dual";

type TableState = {
  tableau: number[][];
  basis: string[];
};

type SetupState = {
  numVars: number;
  numConstraints: number;
  varNames: string[];
  basisNames: string[];
  tableau: string[][];
};

// ========================
// MATH HELPERS
// ========================
function fractionStr(n: number): string {
  if (Math.abs(n - Math.round(n)) < 1e-9) return Math.round(n).toString();
  // Try simple fractions
  for (let d = 2; d <= 20; d++) {
    const num = Math.round(n * d);
    if (Math.abs(num / d - n) < 1e-9) return `${num}/${d}`;
  }
  return n.toFixed(3);
}

function doPivot(state: TableState, pRow: number, pCol: number, vars: string[]): TableState {
  const tableau = state.tableau.map((r) => [...r]);
  const el = tableau[pRow][pCol];
  tableau[pRow] = tableau[pRow].map((v) => v / el);
  for (let r = 0; r < tableau.length; r++) {
    if (r === pRow) continue;
    const f = tableau[r][pCol];
    tableau[r] = tableau[r].map((v, c) => v - f * tableau[pRow][c]);
  }
  const newBasis = [...state.basis];
  newBasis[pRow] = vars[pCol];
  return { tableau, basis: newBasis };
}

// PRIMAL: optimal when all obj row <= 0
function isPrimalOptimal(tableau: number[][]): boolean {
  return tableau[tableau.length - 1].slice(0, -1).every((v) => v <= 1e-9);
}

// DUAL: optimal when all b >= 0
function isDualOptimal(tableau: number[][]): boolean {
  const rows = tableau.length - 1;
  return Array.from({ length: rows }, (_, i) => tableau[i][tableau[i].length - 1]).every((v) => v >= -1e-9);
}

function getPrimalEnteringCol(tableau: number[][]): number {
  const obj = tableau[tableau.length - 1];
  let max = 1e-9, col = -1;
  obj.slice(0, -1).forEach((v, i) => { if (v > max) { max = v; col = i; } });
  return col;
}

function getPrimalLeavingRow(tableau: number[][], col: number): number {
  const rows = tableau.length - 1;
  let minR = Infinity, row = -1;
  for (let r = 0; r < rows; r++) {
    const a = tableau[r][col];
    if (a > 1e-9) {
      const ratio = tableau[r][tableau[r].length - 1] / a;
      if (ratio < minR) { minR = ratio; row = r; }
    }
  }
  return row;
}

function getDualLeavingRow(tableau: number[][]): number {
  const rows = tableau.length - 1;
  let minB = -1e-9, row = -1;
  for (let r = 0; r < rows; r++) {
    const b = tableau[r][tableau[r].length - 1];
    if (b < minB) { minB = b; row = r; }
  }
  return row;
}

function getDualEnteringCol(tableau: number[][], pivRow: number): number {
  const obj = tableau[tableau.length - 1];
  const row = tableau[pivRow];
  let minRatio = Infinity, col = -1;
  for (let c = 0; c < row.length - 1; c++) {
    if (row[c] < -1e-9) {
      const ratio = obj[c] / row[c];
      if (ratio < minRatio) { minRatio = ratio; col = c; }
    }
  }
  return col;
}

// ========================
// SETUP FORM
// ========================
function SetupForm({ onStart }: { onStart: (s: SetupState) => void }) {
  const [step, setStep] = useState<"dims" | "names" | "tableau">("dims");
  const [numVars, setNumVars] = useState(3);
  const [numConstraints, setNumConstraints] = useState(3);
  const [varNames, setVarNames] = useState<string[]>([]);
  const [basisNames, setBasisNames] = useState<string[]>([]);
  const [tableau, setTableau] = useState<string[][]>([]);

  const initNames = () => {
    const vars = Array.from({ length: numVars }, (_, i) => `x${i + 1}`);
    const basis = Array.from({ length: numConstraints }, (_, i) => `s${i + 1}`);
    setVarNames(vars);
    setBasisNames(basis);
    setStep("names");
  };

  const initTableau = () => {
    const totalCols = numVars + numConstraints + 1; // vars + slack + b
    const totalRows = numConstraints + 1; // constraints + obj
    const t = Array.from({ length: totalRows }, () =>
      Array.from({ length: totalCols }, () => "0")
    );
    setTableau(t);
    setStep("tableau");
  };

  const allVarNames = [...varNames, ...basisNames];
  const totalCols = numVars + numConstraints + 1;

  if (step === "dims") return (
    <div className="space-y-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
      <div className="text-sm font-semibold text-primary/60 uppercase tracking-widest">Thiết lập bảng đơn hình</div>
      <div className="flex gap-6 flex-wrap">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-primary/50">Số biến quyết định</span>
          <input
            type="number" min={1} max={10} value={numVars}
            onChange={e => setNumVars(Math.max(1, Math.min(10, +e.target.value)))}
            className="w-20 px-3 py-1.5 rounded-lg border border-primary/20 bg-transparent text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-primary/50">Số ràng buộc</span>
          <input
            type="number" min={1} max={10} value={numConstraints}
            onChange={e => setNumConstraints(Math.max(1, Math.min(10, +e.target.value)))}
            className="w-20 px-3 py-1.5 rounded-lg border border-primary/20 bg-transparent text-sm outline-none focus:border-accent"
          />
        </label>
      </div>
      <button onClick={initNames} className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition">
        Tiếp theo →
      </button>
    </div>
  );

  if (step === "names") return (
    <div className="space-y-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
      <div className="text-sm font-semibold text-primary/60 uppercase tracking-widest">Tên biến</div>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-primary/50 mb-2">Biến quyết định</div>
          <div className="flex gap-2 flex-wrap">
            {varNames.map((v, i) => (
              <input key={i} value={v}
                onChange={e => setVarNames(n => n.map((x, j) => j === i ? e.target.value : x))}
                className="w-16 px-2 py-1 rounded border border-primary/20 bg-transparent text-sm outline-none focus:border-accent text-center font-mono"
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-primary/50 mb-2">Biến cơ sở ban đầu (slack/nhân tạo)</div>
          <div className="flex gap-2 flex-wrap">
            {basisNames.map((v, i) => (
              <input key={i} value={v}
                onChange={e => setBasisNames(n => n.map((x, j) => j === i ? e.target.value : x))}
                className="w-16 px-2 py-1 rounded border border-primary/20 bg-transparent text-sm outline-none focus:border-accent text-center font-mono"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep("dims")} className="px-4 py-2 rounded-lg border border-primary/20 text-sm text-primary/60 hover:border-accent/40 transition">← Quay lại</button>
        <button onClick={initTableau} className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition">Tiếp theo →</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
      <div className="text-sm font-semibold text-primary/60 uppercase tracking-widest">Nhập bảng đơn hình</div>
      <div className="text-xs text-primary/40">Hàng cuối là hàng hàm mục tiêu (-z). Cột cuối là cột b.</div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs font-mono">
          <thead>
            <tr>
              <th className="w-10 h-8 border border-primary/20 bg-primary/5 text-primary/40 text-center px-2">Cơ sở</th>
              {allVarNames.map((v, i) => (
                <th key={i} className="w-14 h-8 border border-primary/20 bg-primary/5 text-center text-primary/60">{v}</th>
              ))}
              <th className="w-14 h-8 border border-primary/20 bg-primary/5 text-center text-primary/60">b</th>
            </tr>
          </thead>
          <tbody>
            {tableau.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx === numConstraints ? "border-t-2 border-primary/30" : ""}>
                <td className="w-10 border border-primary/20 text-center text-primary/40 text-xs">
                  {rIdx < numConstraints ? basisNames[rIdx] : "-z"}
                </td>
                {row.map((val, cIdx) => (
                  <td key={cIdx} className="border border-primary/20 p-0">
                    <input
                      value={val}
                      onChange={e => setTableau(t => t.map((r, ri) => ri === rIdx ? r.map((c, ci) => ci === cIdx ? e.target.value : c) : r))}
                      className="w-14 h-9 text-center bg-transparent outline-none focus:bg-accent/10 text-sm font-mono"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep("names")} className="px-4 py-2 rounded-lg border border-primary/20 text-sm text-primary/60 hover:border-accent/40 transition">← Quay lại</button>
        <button
          onClick={() => {
            const parsed = tableau.map(row => row.map(v => parseFloat(v) || 0));
            onStart({ numVars, numConstraints, varNames, basisNames, tableau: tableau });
            onStart({
              numVars, numConstraints, varNames, basisNames,
              tableau: tableau.map(r => r.map(v => String(parseFloat(v) || 0)))
            });
          }}
          className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition"
        >
          Bắt đầu →
        </button>
      </div>
    </div>
  );
}

// ========================
// SOLVER TABLE
// ========================
function SolverTable({
  mode, vars, history, step, selectedPivot, onCellClick, onNext, onBack, onReset
}: {
  mode: Mode;
  vars: string[];
  history: TableState[];
  step: number;
  selectedPivot: { row: number; col: number } | null;
  onCellClick: (r: number, c: number) => void;
  onNext: () => void;
  onBack: () => void;
  onReset: () => void;
}) {
  const current = history[step];
  const { tableau, basis } = current;
  const dataRows = tableau.slice(0, -1);
  const objRow = tableau[tableau.length - 1];
  const basisSet = new Set(basis);

  const primalOptimal = isPrimalOptimal(tableau);
  const dualOptimal = isDualOptimal(tableau);
  const isOptimal = mode === "primal" ? primalOptimal : (primalOptimal && dualOptimal);

  // Auto pivot detection
  const autoPivotRow = mode === "primal"
    ? (selectedPivot ? -1 : getPrimalLeavingRow(tableau, getPrimalEnteringCol(tableau)))
    : getDualLeavingRow(tableau);
  const autoPivotCol = mode === "primal"
    ? getPrimalEnteringCol(tableau)
    : (selectedPivot ? -1 : getDualEnteringCol(tableau, getDualLeavingRow(tableau)));

  const pivotRow = selectedPivot?.row ?? (isOptimal ? -1 : autoPivotRow);
  const pivotCol = selectedPivot?.col ?? (isOptimal ? -1 : autoPivotCol);

  // Ratios
  const ratioCol = mode === "primal" ? pivotCol : -1;
  const ratioRow = mode === "dual" ? pivotRow : -1;

  const colRatios = ratioCol >= 0 ? dataRows.map(row => {
    const a = row[ratioCol];
    const b = row[row.length - 1];
    if (a <= 1e-9 || b < 0) return null;
    return b / a;
  }) : [];

  const rowRatios = ratioRow >= 0 ? dataRows[ratioRow]?.slice(0, -1).map((a, c) => {
    if (a >= -1e-9) return null;
    return objRow[c] / a;
  }) ?? [] : [];

  const minColRatio = colRatios.reduce<number | null>((m, r) => r === null ? m : m === null ? r : Math.min(m, r), null);
  const minRowRatio = rowRatios.reduce<number | null>((m, r) => r === null ? m : m === null ? r : Math.min(m, r), null);

  const canNext = !isOptimal;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-primary/40 uppercase tracking-widest">Bước</span>
          <span className="text-xl font-bold text-accent">{step}</span>
          {isOptimal && <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 text-xs font-semibold">Tối ưu ✓</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} disabled={step === 0} className="px-3 py-1.5 rounded-lg border border-primary/20 text-sm text-primary/60 hover:border-accent/40 hover:text-accent transition disabled:opacity-30 disabled:cursor-not-allowed">← Trước</button>
          <button onClick={onNext} disabled={!canNext} className="px-3 py-1.5 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition disabled:opacity-30 disabled:cursor-not-allowed">Tiếp →</button>
          <button onClick={onReset} className="px-3 py-1.5 rounded-lg border border-primary/20 text-sm text-primary/50 hover:border-primary/40 transition">Reset</button>
        </div>
      </div>

      <div className="flex gap-6 items-start flex-wrap">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm font-mono">
            <thead>
              <tr>
                <th className="min-w-12 h-9 text-center text-xs text-primary/40 font-semibold border border-primary/20 bg-primary/5">Cơ sở</th>
                {vars.map((v, i) => {
                  const isEntering = i === pivotCol;
                  const inBasis = basisSet.has(v);
                  return (
                    <th key={i} className={[
                      "min-w-12 h-9 text-center text-xs font-semibold border border-primary/20 transition-all",
                      isEntering ? "bg-yellow-200 text-yellow-800" : inBasis ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary/60"
                    ].join(" ")}>{v}</th>
                  );
                })}
                <th className="min-w-12 h-9 text-center text-xs font-semibold border border-primary/20 bg-primary/5 text-primary/60">b</th>
                {mode === "primal" && <th className="min-w-14 h-9 text-center text-xs font-semibold text-primary/40 pl-2">Ratio</th>}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => {
                const isLeavingRow = rIdx === pivotRow;
                const bVal = row[row.length - 1];
                const isNegB = bVal < -1e-9;

                return (
                  <tr key={rIdx}>
                    <td className={[
                      "w-12 h-10 text-center text-xs font-bold border border-primary/20 transition-all",
                      isLeavingRow ? "bg-orange-200 text-orange-800" : basisSet.has(basis[rIdx]) ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary/50"
                    ].join(" ")}>{basis[rIdx]}</td>

                    {row.slice(0, -1).map((val, cIdx) => {
                      const isPivotCell = rIdx === pivotRow && cIdx === pivotCol;
                      const isPivotCol = cIdx === pivotCol;
                      const isPivotRow = rIdx === pivotRow;
                      return (
                        <td key={cIdx}
                          onClick={() => onCellClick(rIdx, cIdx)}
                          className={[
                            "w-12 h-10 text-center border border-primary/20 cursor-pointer transition-all duration-150 select-none",
                            isPivotCell ? "bg-amber-600 text-white font-bold" :
                              isPivotCol ? "bg-yellow-100" :
                                isPivotRow ? "bg-orange-100" :
                                  "hover:bg-primary/5"
                          ].join(" ")}
                        >{fractionStr(val)}</td>
                      );
                    })}

                    <td className={["w-12 h-10 text-center border border-primary/20 font-semibold", isLeavingRow ? "bg-orange-100" : isNegB ? "text-red-500" : ""].join(" ")}>
                      {fractionStr(bVal)}
                    </td>

                    {mode === "primal" && (
                      <td className="w-14 h-10 text-center pl-2 text-sm">
                        {colRatios[rIdx] !== null && colRatios[rIdx] !== undefined ? (
                          <span className={["px-1.5 py-0.5 rounded font-mono text-xs",
                            Math.abs((colRatios[rIdx] ?? 0) - (minColRatio ?? Infinity)) < 1e-9
                              ? "bg-green-500/20 text-green-700 font-bold" : "text-primary/40"
                          ].join(" ")}>{fractionStr(colRatios[rIdx]!)}</span>
                        ) : <span className="text-primary/20 text-xs">—</span>}
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Obj row */}
              <tr className="border-t-2 border-primary/40">
                <td className="w-12 h-10 text-center text-xs font-bold border border-primary/20 bg-primary/5 text-primary/40">-z</td>
                {objRow.slice(0, -1).map((val, cIdx) => (
                  <td key={cIdx} className={["w-12 h-10 text-center border border-primary/20 text-primary/70", cIdx === pivotCol ? "bg-yellow-50" : ""].join(" ")}>
                    {fractionStr(val)}
                  </td>
                ))}
                <td className="w-12 h-10 text-center border border-primary/20 font-bold text-accent">
                  {fractionStr(objRow[objRow.length - 1])}
                </td>
                {mode === "primal" && <td />}
              </tr>

              {/* Dual ratio row */}
              {mode === "dual" && pivotRow >= 0 && (
                <tr>
                  <td className="w-12 h-8 text-center text-xs border border-primary/10 text-primary/30 italic">Ratio</td>
                  {rowRatios.map((r, cIdx) => (
                    <td key={cIdx} className="w-12 h-8 text-center border border-primary/10 text-xs">
                      {r !== null ? (
                        <span className={["px-1 py-0.5 rounded font-mono text-xs",
                          Math.abs((r ?? 0) - (minRowRatio ?? Infinity)) < 1e-9 && cIdx === pivotCol
                            ? "bg-green-500/20 text-green-700 font-bold" : "text-primary/40"
                        ].join(" ")}>{fractionStr(r)}</span>
                      ) : <span className="text-primary/20">—</span>}
                    </td>
                  ))}
                  <td /><td />
                </tr>
              )}
            </tbody>
          </table>

          {/* Legend */}
          <div className="flex gap-3 mt-2 flex-wrap">
            {[
              { color: "bg-yellow-200", label: "Cột vào" },
              { color: "bg-orange-100", label: "Hàng ra" },
              { color: "bg-amber-600", label: "Phần tử xoay" },
              { color: "bg-accent/20", label: "Biến cơ sở" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-primary/40">
                <span className={`w-3 h-3 rounded-sm ${color} inline-block`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Side info */}
        {!isOptimal && (
          <div className="min-w-36 text-xs space-y-3 pt-9">
            {mode === "primal" ? (
              <>
                <div className="p-2 rounded-lg border border-yellow-300/60 bg-yellow-50/50">
                  <div className="font-semibold text-yellow-700 mb-1">Cột vào</div>
                  <div className="font-mono text-yellow-800">{pivotCol >= 0 ? vars[pivotCol] : "—"}</div>
                  <div className="text-yellow-600/60 mt-1 text-xs">Hệ số dương lớn nhất hàng z</div>
                </div>
                <div className="p-2 rounded-lg border border-orange-300/60 bg-orange-50/50">
                  <div className="font-semibold text-orange-700 mb-1">Hàng ra</div>
                  <div className="font-mono text-orange-800">{pivotRow >= 0 ? basis[pivotRow] : "—"}</div>
                  <div className="text-orange-600/60 mt-1 text-xs">Ratio dương nhỏ nhất</div>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg border border-orange-300/60 bg-orange-50/50">
                  <div className="font-semibold text-orange-700 mb-1">Hàng ra (b âm nhất)</div>
                  <div className="font-mono text-orange-800">{pivotRow >= 0 ? basis[pivotRow] : "—"}</div>
                  <div className="text-orange-600/60 mt-1 text-xs">$b_i$ âm nhỏ nhất</div>
                </div>
                <div className="p-2 rounded-lg border border-yellow-300/60 bg-yellow-50/50">
                  <div className="font-semibold text-yellow-700 mb-1">Cột vào</div>
                  <div className="font-mono text-yellow-800">{pivotCol >= 0 ? vars[pivotCol] : "—"}</div>
                  <div className="text-yellow-600/60 mt-1 text-xs">Ratio $c_j/a_ij$ nhỏ nhất</div>
                </div>
              </>
            )}
          </div>
        )}

        {isOptimal && (
          <div className="min-w-36 text-xs pt-9">
            <div className="p-3 rounded-lg border border-green-400/40 bg-green-50/50 space-y-1">
              <div className="font-semibold text-green-700 mb-2">Nghiệm tối ưu</div>
              {basis.map((b, i) => (
                <div key={i} className="font-mono text-green-800">
                  {b} = {fractionStr(tableau[i][tableau[i].length - 1])}
                </div>
              ))}
              {vars.filter(v => !basisSet.has(v)).map(v => (
                <div key={v} className="font-mono text-green-600/50">{v} = 0</div>
              ))}
              <div className="border-t border-green-300/50 mt-2 pt-2 font-bold text-green-800">
                z* = {fractionStr(-tableau[tableau.length - 1][tableau[0].length - 1])}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-primary/30">
        {mode === "primal"
          ? "Bấm vào cột để chọn cột xoay thủ công · Nhấn Tiếp để thuật toán tự chọn"
          : "Bấm vào hàng để chọn hàng xoay thủ công · Nhấn Tiếp để thuật toán tự chọn"}
      </p>
    </div>
  );
}

// ========================
// MAIN COMPONENT
// ========================
export function SimplexSolver() {
  const [mode, setMode] = useState<Mode>("primal");
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [history, setHistory] = useState<TableState[]>([]);
  const [step, setStep] = useState(0);
  const [selectedPivot, setSelectedPivot] = useState<{ row: number; col: number } | null>(null);
  const [started, setStarted] = useState(false);

  const handleStart = (s: SetupState) => {
    if (started) return; // prevent double call
    const allVars = [...s.varNames, ...s.basisNames];
    const parsed = s.tableau.map(row => row.map(v => parseFloat(v) || 0));
    setHistory([{ tableau: parsed, basis: [...s.basisNames] }]);
    setStep(0);
    setSelectedPivot(null);
    setSetup(s);
    setStarted(true);
  };

  const vars = setup ? [...setup.varNames, ...setup.basisNames] : [];

  const current = history[step] ?? null;
  const tableau = current?.tableau ?? [];

  const handleCellClick = (row: number, col: number) => {
    if (!current) return;
    const dataRows = tableau.slice(0, -1);
    if (row >= dataRows.length) return;
    if (col >= vars.length) return;

    if (mode === "primal") {
      const bestRow = getPrimalLeavingRow(tableau, col);
      if (bestRow < 0) return;
      setSelectedPivot({ row: bestRow, col });
    } else {
      const bestCol = getDualEnteringCol(tableau, row);
      if (bestCol < 0) return;
      setSelectedPivot({ row, col: bestCol });
    }
  };

  const handleNext = useCallback(() => {
    if (!current) return;
    let pRow: number, pCol: number;
    if (selectedPivot) {
      pRow = selectedPivot.row; pCol = selectedPivot.col;
    } else if (mode === "primal") {
      pCol = getPrimalEnteringCol(tableau);
      pRow = getPrimalLeavingRow(tableau, pCol);
    } else {
      pRow = getDualLeavingRow(tableau);
      pCol = getDualEnteringCol(tableau, pRow);
    }
    if (pRow < 0 || pCol < 0) return;
    const next = doPivot(current, pRow, pCol, vars);
    const newHist = history.slice(0, step + 1);
    newHist.push(next);
    setHistory(newHist);
    setStep(step + 1);
    setSelectedPivot(null);
  }, [current, selectedPivot, mode, tableau, vars, history, step]);

  const handleBack = () => { if (step > 0) { setStep(step - 1); setSelectedPivot(null); } };
  const handleReset = () => {
    if (!setup) return;
    const parsed = setup.tableau.map(row => row.map(v => parseFloat(v) || 0));
    setHistory([{ tableau: parsed, basis: [...setup.basisNames] }]);
    setStep(0);
    setSelectedPivot(null);
  };

  return (
    <div className="my-8 space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-primary/40 self-center">Loại thuật toán:</span>
        {([["primal", "Đơn hình (1 pha)"]] as [Mode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setStarted(false); setSetup(null); setHistory([]); }}
            className={["px-3 py-1.5 rounded-lg text-sm transition",
              mode === m ? "bg-accent text-background font-medium" : "border border-primary/20 text-primary/60 hover:border-accent/40"
            ].join(" ")}>{label}</button>
        ))}
      </div>

      {!started ? (
        <SetupForm onStart={handleStart} key={mode} />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-primary/40">
              {mode === "primal" ? "Thuật toán đơn hình 1 pha" : "Thuật toán đơn hình đối ngẫu"}
            </span>
            <button onClick={() => { setStarted(false); setSetup(null); setHistory([]); }}
              className="text-xs text-primary/40 hover:text-accent transition underline underline-offset-2">
              Nhập lại
            </button>
          </div>
          <SolverTable
            mode={mode} vars={vars} history={history} step={step}
            selectedPivot={selectedPivot}
            onCellClick={handleCellClick}
            onNext={handleNext} onBack={handleBack} onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}