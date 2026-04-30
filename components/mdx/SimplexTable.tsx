"use client";
import { useState, useCallback } from "react";

type Props = {
  vars: string; // JSON array of variable names e.g. '["x1","x2","x3","s1","s2","s3"]'
  basis: string; // JSON array of basic variable names e.g. '["s1","s2","s3"]'
  data: string; // JSON 2D array, last row = objective row
  pivotColSeparator?: number; // column index after which to draw thick border (b column separator)
};

type TableState = {
  tableau: number[][];
  basis: string[];
};

function fractionToFixed(n: number) {
  if (Math.abs(n - Math.round(n)) < 1e-9) return Math.round(n).toString();
  return n.toFixed(2);
}

function pivot(
  state: TableState,
  pivotRow: number,
  pivotCol: number,
  vars: string[],
): TableState {
  const tableau = state.tableau.map((r) => [...r]);
  const pivotEl = tableau[pivotRow][pivotCol];

  // normalize pivot row
  tableau[pivotRow] = tableau[pivotRow].map((v) => v / pivotEl);

  // eliminate pivot column from other rows
  for (let r = 0; r < tableau.length; r++) {
    if (r === pivotRow) continue;
    const factor = tableau[r][pivotCol];
    tableau[r] = tableau[r].map((v, c) => v - factor * tableau[pivotRow][c]);
  }

  // update basis
  const newBasis = [...state.basis];
  newBasis[pivotRow] = vars[pivotCol];

  return { tableau, basis: newBasis };
}

function isOptimal(tableau: number[][]): boolean {
  const objRow = tableau[tableau.length - 1];
  // optimal when all coefficients in objective row <= 0 (maximization, stored as positive = entering)
  return objRow.slice(0, -1).every((v) => v <= 1e-9);
}

function getEnteringCol(tableau: number[][]): number {
  const objRow = tableau[tableau.length - 1];
  let maxVal = 1e-9;
  let col = -1;
  objRow.slice(0, -1).forEach((v, i) => {
    if (v > maxVal) {
      maxVal = v;
      col = i;
    }
  });
  return col;
}

function getLeavingRow(tableau: number[][], col: number): number {
  const rows = tableau.length - 1; // exclude objective row
  let minRatio = Infinity;
  let row = -1;
  for (let r = 0; r < rows; r++) {
    if (tableau[r][col] > 1e-9) {
      const ratio = tableau[r][tableau[r].length - 1] / tableau[r][col];
      if (ratio < minRatio) {
        minRatio = ratio;
        row = r;
      }
    }
  }
  return row;
}

export function SimplexTable({
  vars: varsProp,
  basis: basisProp,
  data,
  pivotColSeparator,
}: Props) {
  const vars: string[] = JSON.parse(varsProp);
  const initialBasis: string[] = JSON.parse(basisProp);
  const initialTableau: number[][] = JSON.parse(data);

  const [history, setHistory] = useState<TableState[]>([
    { tableau: initialTableau, basis: initialBasis },
  ]);
  const [step, setStep] = useState(0);
  const [shaking, setShaking] = useState<{ row: number; col: number } | null>(
    null,
  );
  const [selectedPivot, setSelectedPivot] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const current = history[step];
  const { tableau, basis } = current;
  const objRow = tableau[tableau.length - 1];
  const dataRows = tableau.slice(0, -1);
  const optimal = isOptimal(tableau);
  const autoEntering = getEnteringCol(tableau);
  const autoLeaving =
    autoEntering >= 0 ? getLeavingRow(tableau, autoEntering) : -1;

  // ratio test for selected col
  const ratioCol = selectedPivot?.col ?? autoEntering;
  const ratios = dataRows.map((row) => {
    const b = row[row.length - 1];
    const a = row[ratioCol];
    if (a <= 1e-9 || b < 0) return null;
    return b / a;
  });
  const minRatio = ratios.reduce<number | null>((min, r) => {
    if (r === null) return min;
    if (min === null) return r;
    return r < min ? r : min;
  }, null);

  const handleCellClick = (row: number, col: number) => {
    if (row === dataRows.length) return;
    if (col === vars.length) return;
    const bestRow = getLeavingRow(tableau, col);
    if (bestRow < 0) {
      setShaking({ row, col });
      setTimeout(() => setShaking(null), 500);
      return;
    }
    setSelectedPivot({ row: bestRow, col });
  };

  const handleNext = useCallback(() => {
    const pRow = selectedPivot?.row ?? autoLeaving;
    const pCol = selectedPivot?.col ?? autoEntering;
    if (pRow < 0 || pCol < 0) return;

    const next = pivot(current, pRow, pCol, vars);
    const newHistory = history.slice(0, step + 1);
    newHistory.push(next);
    setHistory(newHistory);
    setStep(step + 1);
    setSelectedPivot(null);
  }, [selectedPivot, autoLeaving, autoEntering, current, history, step, vars]);

  const handleBack = () => {
    if (step === 0) return;
    setStep(step - 1);
    setSelectedPivot(null);
  };

  const handleReset = () => {
    setHistory([{ tableau: initialTableau, basis: initialBasis }]);
    setStep(0);
    setSelectedPivot(null);
  };

  const pivotRow = selectedPivot?.row ?? (optimal ? -1 : autoLeaving);
  const pivotCol = selectedPivot?.col ?? (optimal ? -1 : autoEntering);

  const basisSet = new Set(basis);

  const canNext =
    !optimal &&
    ((selectedPivot !== null &&
      tableau[selectedPivot.row][selectedPivot.col] > 1e-9) ||
      (autoLeaving >= 0 && autoEntering >= 0));

  return (
    <div className="my-8 overflow-x-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-primary/40 uppercase tracking-widest">
            Bước
          </span>
          <span className="text-xl font-bold text-accent">{step}</span>
          {optimal && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 text-xs font-semibold">
              Tối ưu ✓
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="px-3 py-1.5 rounded-lg border border-primary/20 text-sm text-primary/60 hover:border-accent/40 hover:text-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Trước
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="px-3 py-1.5 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Tiếp →
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-primary/20 text-sm text-primary/50 hover:border-primary/40 transition"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Main table */}
        <div>
          <table className="border-collapse text-sm font-mono">
            <thead>
              <tr>
                {/* basis column header */}
                <th className="min-w-12 h-9 text-center text-xs text-primary/40 font-semibold border border-primary/20 bg-primary/5">
                  Cơ sở
                </th>
                {/* variable headers */}
                {vars.map((v, i) => {
                  const isInBasis = basisSet.has(v);
                  const isEntering = i === pivotCol;
                  return (
                    <th
                      key={i}
                      style={
                        pivotColSeparator !== undefined &&
                        i === pivotColSeparator
                          ? {
                              borderRight:
                                "3px solid var(--color-primary, #333)",
                            }
                          : undefined
                      }
                      className={[
                        "min-w-12 h-9 text-center text-xs font-semibold border border-primary/20 transition-all",
                        isEntering
                          ? "bg-yellow-200 text-yellow-800"
                          : isInBasis
                            ? "bg-accent/10 text-accent"
                            : "bg-primary/5 text-primary/60",
                      ].join(" ")}
                    >
                      {v}
                    </th>
                  );
                })}
                {/* b column */}
                <th className="min-w-12 h-9 text-center text-xs font-semibold border border-primary/20 bg-primary/5 text-primary/60">
                  b
                </th>
                {/* ratio header */}
                <th className="min-w-16 h-9 text-center text-xs font-semibold text-primary/40 pl-3">
                  Ratio
                </th>
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => {
                const isLeaving = rIdx === pivotRow;
                const bVal = row[row.length - 1];
                const ratio = ratios[rIdx];
                const isMinRatio =
                  ratio !== null &&
                  Math.abs(ratio - (minRatio ?? Infinity)) < 1e-9;

                return (
                  <tr key={rIdx}>
                    {/* basis variable */}
                    <td
                      className={[
                        "w-10 h-10 text-center text-xs font-bold border border-primary/20 transition-all",
                        isLeaving
                          ? "bg-orange-200 text-orange-800"
                          : basisSet.has(basis[rIdx])
                            ? "bg-accent/10 text-accent"
                            : "bg-primary/5 text-primary/50",
                      ].join(" ")}
                    >
                      {basis[rIdx]}
                    </td>

                    {/* data cells */}
                    {row.slice(0, -1).map((val, cIdx) => {
                      const isPivotCell =
                        rIdx === pivotRow && cIdx === pivotCol;
                      const isPivotColCell = cIdx === pivotCol;
                      const isPivotRowCell = rIdx === pivotRow;

                      return (
                        <td
                          key={cIdx}
                          onClick={() => handleCellClick(rIdx, cIdx)}
                          style={
                            pivotColSeparator !== undefined &&
                            cIdx === pivotColSeparator
                              ? {
                                  borderRight:
                                    "3px solid var(--color-primary, #333)",
                                }
                              : undefined
                          }
                          className={[
                            "w-12 h-10 text-center border border-primary/20 cursor-pointer transition-all duration-150 select-none",
                            isPivotCell
                              ? "bg-amber-600 text-white font-bold scale-105 shadow-md z-10 relative"
                              : isPivotColCell && isPivotRowCell
                                ? ""
                                : isPivotColCell
                                  ? "bg-yellow-100"
                                  : isPivotRowCell
                                    ? "bg-orange-100"
                                    : "hover:bg-primary/5",
                          ].join(" ")}
                        >
                          {fractionToFixed(val)}
                        </td>
                      );
                    })}

                    {/* b column */}
                    <td
                      className={[
                        "w-12 h-10 text-center border border-primary/20 font-semibold",
                        isLeaving ? "bg-orange-100" : "",
                      ].join(" ")}
                    >
                      {fractionToFixed(bVal)}
                    </td>

                    {/* ratio */}
                    <td className="w-16 h-10 text-center pl-3 text-sm">
                      {ratio !== null && !Number.isNaN(ratio) ? (
                        <span
                          className={[
                            "px-1.5 py-0.5 rounded font-mono text-xs",
                            isMinRatio
                              ? "bg-green-500/20 text-green-700 font-bold"
                              : "text-primary/40",
                          ].join(" ")}
                        >
                          {fractionToFixed(ratio)}
                        </span>
                      ) : (
                        <span className="text-primary/20 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* Objective row */}
              <tr className="border-t-2 border-primary/40">
                <td className="w-10 h-10 text-center text-xs font-bold border border-primary/20 bg-primary/5 text-primary/40">
                  -z
                </td>
                {objRow.slice(0, -1).map((val, cIdx) => (
                  <td
                    key={cIdx}
                    style={
                      pivotColSeparator !== undefined &&
                      cIdx === pivotColSeparator
                        ? {
                            borderRight: "3px solid var(--color-primary, #333)",
                          }
                        : undefined
                    }
                    className={[
                      "w-12 h-10 text-center border border-primary/20 text-primary/70",
                      cIdx === pivotCol ? "bg-yellow-50" : "",
                    ].join(" ")}
                  >
                    {fractionToFixed(val)}
                  </td>
                ))}
                <td className="w-12 h-10 text-center border border-primary/20 font-bold text-accent">
                  {fractionToFixed(objRow[objRow.length - 1])}
                </td>
                <td />
              </tr>
            </tbody>
          </table>

          {/* Legend */}
          <div className="flex gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-primary/50">
              <span className="w-3 h-3 rounded-sm bg-yellow-200 inline-block" />
              Cột xoay (biến vào cơ sở)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary/50">
              <span className="w-3 h-3 rounded-sm bg-orange-100 inline-block" />
              Hàng xoay (biến rời cơ sở)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary/50">
              <span className="w-3 h-3 rounded-sm bg-amber-600 inline-block" />
              Phần tử xoay (pivot)
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary/50">
              <span className="w-3 h-3 rounded-sm bg-accent/20 inline-block" />
              Biến cơ sở
            </div>
          </div>
        </div>

        {/* Side info */}
        {!optimal && (
          <div className="min-w-35 text-xs text-primary/60 space-y-3 pt-9">
            <div className="p-2 rounded-lg border border-yellow-300/60 bg-yellow-50/50">
              <div className="font-semibold text-yellow-700 mb-1">
                Cột vào (biến vào cơ sở)
              </div>
              <div className="font-mono text-yellow-800">
                {pivotCol >= 0 ? vars[pivotCol] : "—"}
              </div>
              <div className="text-yellow-600/70 mt-1">
                Hệ số dương lớn nhất trong hàng z
              </div>
            </div>
            <div className="p-2 rounded-lg border border-orange-300/60 bg-orange-50/50">
              <div className="font-semibold text-orange-700 mb-1">
                Hàng ra (biến rời cơ sở)
              </div>
              <div className="font-mono text-orange-800">
                {pivotRow >= 0 ? basis[pivotRow] : "—"}
              </div>
              <div className="text-orange-600/70 mt-1">
                Ratio dương nhỏ nhất
              </div>
            </div>
          </div>
        )}

        {optimal && (
          <div className="min-w-35 text-xs pt-9">
            <div className="p-3 rounded-lg border border-green-400/40 bg-green-50/50 space-y-1">
              <div className="font-semibold text-green-700 mb-2">
                Nghiệm tối ưu
              </div>
              {basis.map((b, i) => (
                <div key={i} className="font-mono text-green-800">
                  {b} = {fractionToFixed(tableau[i][tableau[i].length - 1])}
                </div>
              ))}
              {vars
                .filter((v) => !basisSet.has(v))
                .map((v) => (
                  <div key={v} className="font-mono text-green-600/60">
                    {v} = 0
                  </div>
                ))}
              <div className="border-t border-green-300/50 mt-2 pt-2 font-bold text-green-800">
                z* ={" "}
                {fractionToFixed(
                  -tableau[tableau.length - 1][tableau[0].length - 1],
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instruction */}
      {!optimal && (
        <p className="mt-3 text-xs text-primary/30">
          Bấm vào ô trong bảng để chọn phần tử xoay thủ công, hoặc nhấn{" "}
          <strong>Tiếp</strong> để thuật toán tự chọn.
        </p>
      )}
    </div>
  );
}
