"use client";
import { useState, useCallback } from "react";

// ========================
// TYPES
// ========================
type TwoPhaseMode = "standard" | "canonical";
type Phase = 1 | 2;

type TableState = {
  tableau: number[][];
  basis: string[];
  phase: Phase;
  numDataRows: number; // số hàng dữ liệu thực tế (canonical pha 2 có thể ít hơn)
};

// ========================
// MATH HELPERS
// ========================
function fractionStr(n: number): string {
  if (Math.abs(n - Math.round(n)) < 1e-9) return Math.round(n).toString();
  for (let d = 2; d <= 40; d++) {
    const num = Math.round(n * d);
    if (Math.abs(num / d - n) < 1e-9) return `${num}/${d}`;
  }
  return n.toFixed(3);
}

function doPivot(tableau: number[][], pRow: number, pCol: number): number[][] {
  const t = tableau.map((r) => [...r]);
  const el = t[pRow][pCol];
  t[pRow] = t[pRow].map((v) => v / el);
  for (let r = 0; r < t.length; r++) {
    if (r === pRow) continue;
    const f = t[r][pCol];
    t[r] = t[r].map((v, c) => v - f * t[pRow][c]);
  }
  return t;
}

function getEnteringCol(objRow: number[]): number {
  let max = 1e-9,
    col = -1;
  objRow.slice(0, -1).forEach((v, i) => {
    if (v > max) {
      max = v;
      col = i;
    }
  });
  return col;
}

function getLeavingRow(
  tableau: number[][],
  col: number,
  dataRowCount: number,
): number {
  let minR = Infinity,
    row = -1;
  for (let r = 0; r < dataRowCount; r++) {
    const a = tableau[r][col];
    if (a > 1e-9) {
      const ratio = tableau[r][tableau[r].length - 1] / a;
      if (ratio < minR) {
        minR = ratio;
        row = r;
      }
    }
  }
  return row;
}

// Pha 1 chuẩn tắc bước đầu: hàng có cột b âm nhất
function getLeavingRowByMinB(
  tableau: number[][],
  dataRowCount: number,
): number {
  let minVal = -1e-9,
    row = -1;
  for (let r = 0; r < dataRowCount; r++) {
    const b = tableau[r][tableau[r].length - 1];
    if (b < minVal) {
      minVal = b;
      row = r;
    }
  }
  return row;
}

// allVarsCols theo mode và phase
function getAllVarsCols(config: SetupConfig, phase: Phase): string[] {
  if (config.mode === "standard") {
    if (phase === 2) return [...config.originalVars, ...config.slackVars];
    return [
      ...config.artificialVars,
      ...config.originalVars,
      ...config.slackVars,
    ];
  } else {
    if (phase === 2) return [...config.originalVars];
    return [...config.originalVars, ...config.artificialVars];
  }
}

// ========================
// SETUP CONFIG
// ========================
interface SetupConfig {
  mode: TwoPhaseMode;
  numVars: number;
  numConstraints: number;
  originalVars: string[];
  artificialVars: string[];
  slackVars: string[];
  basisNames: string[];
  tableau: string[][];
}

// ========================
// SETUP FORM
// ========================
function SetupForm({
  mode,
  onStart,
}: {
  mode: TwoPhaseMode;
  onStart: (c: SetupConfig) => void;
}) {
  const [step, setStep] = useState<"dims" | "names" | "tableau">("dims");
  const [numVars, setNumVars] = useState(3);
  const [numConstraints, setNumConstraints] = useState(3);
  const [originalVars, setOriginalVars] = useState<string[]>([]);
  const [artificialVars, setArtificialVars] = useState<string[]>([]);
  const [slackVars, setSlackVars] = useState<string[]>([]);
  const [basisNames, setBasisNames] = useState<string[]>([]);
  const [tableau, setTableau] = useState<string[][]>([]);

  const initNames = () => {
    const orig = Array.from({ length: numVars }, (_, i) => `x${i + 1}`);
    const art =
      mode === "standard"
        ? ["x0"]
        : Array.from({ length: numConstraints }, (_, i) => `y${i + 1}`);
    const slack =
      mode === "standard"
        ? Array.from({ length: numConstraints }, (_, i) => `s${i + 1}`)
        : [];
    setOriginalVars(orig);
    setArtificialVars(art);
    setSlackVars(slack);
    setBasisNames(mode === "standard" ? slack : art);
    setStep("names");
  };

  const initTableau = () => {
    const allVars =
      mode === "standard"
        ? [...artificialVars, ...originalVars, ...slackVars]
        : [...originalVars, ...artificialVars];
    const t = Array.from({ length: numConstraints + 2 }, () =>
      Array.from({ length: allVars.length + 1 }, () => "0"),
    );
    setTableau(t);
    setStep("tableau");
  };

  const allVarsCols =
    mode === "standard"
      ? [...artificialVars, ...originalVars, ...slackVars]
      : [...originalVars, ...artificialVars];

  if (step === "dims")
    return (
      <div className="space-y-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
        <div className="text-sm font-semibold text-primary/60 uppercase tracking-widest">
          Thiết lập
        </div>
        <div className="flex gap-6 flex-wrap">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-primary/50">Số biến quyết định</span>
            <input
              type="number"
              min={1}
              max={8}
              value={numVars}
              onChange={(e) =>
                setNumVars(Math.max(1, Math.min(8, +e.target.value)))
              }
              className="w-20 px-3 py-1.5 rounded-lg border border-primary/20 bg-transparent text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-primary/50">Số ràng buộc</span>
            <input
              type="number"
              min={1}
              max={8}
              value={numConstraints}
              onChange={(e) =>
                setNumConstraints(Math.max(1, Math.min(8, +e.target.value)))
              }
              className="w-20 px-3 py-1.5 rounded-lg border border-primary/20 bg-transparent text-sm outline-none focus:border-accent"
            />
          </label>
        </div>
        <button
          onClick={initNames}
          className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition"
        >
          Tiếp →
        </button>
      </div>
    );

  if (step === "names")
    return (
      <div className="space-y-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
        <div className="text-sm font-semibold text-primary/60 uppercase tracking-widest">
          Tên biến
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-primary/50 mb-2">
              Biến quyết định gốc
            </div>
            <div className="flex gap-2 flex-wrap">
              {originalVars.map((v, i) => (
                <input
                  key={i}
                  value={v}
                  onChange={(e) =>
                    setOriginalVars((n) =>
                      n.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                  className="w-16 px-2 py-1 rounded border border-primary/20 bg-transparent text-sm outline-none focus:border-accent text-center font-mono"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-primary/50 mb-2">
              {mode === "standard" ? "Biến nhân tạo" : "Biến nhân tạo y"}
            </div>
            <div className="flex gap-2 flex-wrap">
              {artificialVars.map((v, i) => (
                <input
                  key={i}
                  value={v}
                  onChange={(e) =>
                    setArtificialVars((n) =>
                      n.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                  className="w-16 px-2 py-1 rounded border border-primary/20 bg-transparent text-sm outline-none focus:border-accent text-center font-mono"
                />
              ))}
            </div>
          </div>
          {mode === "standard" && (
            <div>
              <div className="text-xs text-primary/50 mb-2">
                Biến bù (slack)
              </div>
              <div className="flex gap-2 flex-wrap">
                {slackVars.map((v, i) => (
                  <input
                    key={i}
                    value={v}
                    onChange={(e) =>
                      setSlackVars((n) =>
                        n.map((x, j) => (j === i ? e.target.value : x)),
                      )
                    }
                    className="w-16 px-2 py-1 rounded border border-primary/20 bg-transparent text-sm outline-none focus:border-accent text-center font-mono"
                  />
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-primary/50 mb-2">Cơ sở ban đầu</div>
            <div className="flex gap-2 flex-wrap">
              {basisNames.map((v, i) => (
                <input
                  key={i}
                  value={v}
                  onChange={(e) =>
                    setBasisNames((n) =>
                      n.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                  className="w-16 px-2 py-1 rounded border border-primary/20 bg-transparent text-sm outline-none focus:border-accent text-center font-mono"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStep("dims")}
            className="px-4 py-2 rounded-lg border border-primary/20 text-sm text-primary/60 hover:border-accent/40 transition"
          >
            ← Quay lại
          </button>
          <button
            onClick={initTableau}
            className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition"
          >
            Tiếp →
          </button>
        </div>
      </div>
    );

  return (
    <div className="space-y-4 p-4 rounded-xl border border-primary/10 bg-primary/5">
      <div className="text-sm font-semibold text-primary/60 uppercase tracking-widest">
        Nhập bảng
      </div>
      <div className="text-xs text-primary/40">
        Hàng {numConstraints + 1}: hàng z (hàm mục tiêu gốc) · Hàng{" "}
        {numConstraints + 2}: hàng w (hàm mục tiêu phụ trợ)
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs font-mono">
          <thead>
            <tr>
              <th className="w-10 h-8 border border-primary/20 bg-primary/5 text-primary/40 text-center">
                Cơ sở
              </th>
              {allVarsCols.map((v, i) => (
                <th
                  key={i}
                  className="w-14 h-8 border border-primary/20 bg-primary/5 text-center text-primary/60"
                >
                  {v}
                </th>
              ))}
              <th className="w-14 h-8 border border-primary/20 bg-primary/5 text-center text-primary/60">
                b
              </th>
            </tr>
          </thead>
          <tbody>
            {tableau.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={
                  rIdx === numConstraints
                    ? "border-t-2 border-primary/30"
                    : rIdx === numConstraints + 1
                      ? "border-t border-primary/20 bg-primary/5"
                      : ""
                }
              >
                <td className="w-10 border border-primary/20 text-center text-primary/40 text-xs">
                  {rIdx < numConstraints
                    ? basisNames[rIdx]
                    : rIdx === numConstraints
                      ? "-z"
                      : "-w"}
                </td>
                {row.map((val, cIdx) => (
                  <td key={cIdx} className="border border-primary/20 p-0">
                    <input
                      value={val}
                      onChange={(e) =>
                        setTableau((t) =>
                          t.map((r, ri) =>
                            ri === rIdx
                              ? r.map((c, ci) =>
                                  ci === cIdx ? e.target.value : c,
                                )
                              : r,
                          ),
                        )
                      }
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
        <button
          onClick={() => setStep("names")}
          className="px-4 py-2 rounded-lg border border-primary/20 text-sm text-primary/60 hover:border-accent/40 transition"
        >
          ← Quay lại
        </button>
        <button
          onClick={() =>
            onStart({
              mode,
              numVars,
              numConstraints,
              originalVars,
              artificialVars,
              slackVars,
              basisNames,
              tableau: tableau.map((r) =>
                r.map((v) => String(parseFloat(v) || 0)),
              ),
            })
          }
          className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition"
        >
          Bắt đầu →
        </button>
      </div>
    </div>
  );
}

// ========================
// TWO PHASE TABLE
// ========================
function TwoPhaseTable({
  config,
  history,
  step,
  selectedPivot,
  phase,
  onCellClick,
  onNext,
  onBack,
  onReset,
  onGoPhase2,
}: {
  config: SetupConfig;
  history: TableState[];
  step: number;
  phase: Phase;
  selectedPivot: { row: number; col: number } | null;
  onCellClick: (r: number, c: number) => void;
  onNext: () => void;
  onBack: () => void;
  onReset: () => void;
  onGoPhase2: () => void;
}) {
  const current = history[step];
  const { tableau, basis } = current;

  // Số hàng dữ liệu thực tế
  const numDataRows = current.numDataRows;

  const dataRows = tableau.slice(0, numDataRows);
  const zRow = tableau[numDataRows] ?? [];
  // Hàng w chỉ tồn tại ở pha 1 và phải có đủ hàng
  const wRow =
    phase === 1 && tableau.length > numDataRows + 1
      ? tableau[numDataRows + 1]
      : null;
  const activeObjRow = phase === 1 ? (wRow ?? zRow) : zRow;

  // allVarsCols phụ thuộc phase
  const allVarsCols = getAllVarsCols(config, phase);
  const basisSet = new Set(basis);
  const artificialSet = new Set(config.artificialVars);

  // Số bước trong pha 1 (để detect bước đầu chuẩn tắc)
  const phase1Steps =
    history.slice(0, step + 1).filter((h) => h.phase === 1).length - 1;
  const isFirstPhase1Step =
    phase === 1 && config.mode === "standard" && phase1Steps === 0;

  // ---- Điều kiện kết thúc pha 1 ----
  const phase1Done =
    phase === 1 &&
    wRow !== null &&
    history.length > 1 &&
    (() => {
      const allNonPos = wRow.slice(0, -1).every((v) => v <= 1e-9);
      if (config.mode === "standard") {
        // Chuẩn tắc: hàng w tất cả <= 0 VÀ giá trị w = 0
        return allNonPos && Math.abs(wRow[wRow.length - 1]) < 1e-9;
      } else {
        // Chính tắc: hàng w tất cả <= 0 (đã đạt max)
        return allNonPos;
      }
    })();

  // ---- Điều kiện vô nghiệm ----
  const phase1FeasibleFailed =
    phase === 1 &&
    phase1Done &&
    (() => {
      if (config.mode === "standard") {
        return wRow !== null && Math.abs(wRow[wRow.length - 1]) > 1e-6;
      } else {
        // Chính tắc: còn biến y trong basis với giá trị > 0
        return basis.some(
          (b, i) =>
            artificialSet.has(b) &&
            Math.abs(tableau[i]?.[tableau[i].length - 1] ?? 0) > 1e-9,
        );
      }
    })();

  // Pha 2 xong: hàng z tất cả <= 0
  const phase2Done = phase === 2 && zRow.slice(0, -1).every((v) => v <= 1e-9);
  const isOptimal = phase === 1 ? phase1Done : phase2Done;

  // ---- Chọn pivot ----
  const enteringCol = zRow.length > 0 ? getEnteringCol(activeObjRow) : -1;
  const leavingRow =
    enteringCol >= 0 ? getLeavingRow(tableau, enteringCol, numDataRows) : -1;
  const x0Col = allVarsCols.indexOf(config.artificialVars[0]);

  const pivotCol =
    selectedPivot?.col ??
    (isOptimal ? -1 : isFirstPhase1Step ? x0Col : enteringCol);
  const pivotRow =
    selectedPivot?.row ??
    (isOptimal
      ? -1
      : isFirstPhase1Step
        ? getLeavingRowByMinB(tableau, numDataRows)
        : leavingRow);

  // Ratios — ẩn ở bước đầu chuẩn tắc
  const showRatios = !isFirstPhase1Step;
  const ratios =
    showRatios && pivotCol >= 0
      ? dataRows.map((row) => {
          const a = row[pivotCol];
          const b = row[row.length - 1];
          if (a <= 1e-9 || b < 0) return null;
          return b / a;
        })
      : [];
  const minRatio = ratios.reduce<number | null>(
    (m, r) => (r === null ? m : m === null ? r : Math.min(m, r)),
    null,
  );

  if (zRow.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Phase indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={[
              "px-3 py-1 rounded-full text-xs font-semibold transition",
              phase === 1
                ? "bg-accent text-background"
                : "bg-primary/10 text-primary/50",
            ].join(" ")}
          >
            Pha 1
          </span>
          <span className="text-primary/20">→</span>
          <span
            className={[
              "px-3 py-1 rounded-full text-xs font-semibold transition",
              phase === 2
                ? "bg-accent text-background"
                : "bg-primary/10 text-primary/50",
            ].join(" ")}
          >
            Pha 2
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-mono text-primary/40">Bước</span>
          <span className="text-xl font-bold text-accent">{step}</span>
          {isOptimal && phase === 2 && (
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 text-xs font-semibold">
              Tối ưu ✓
            </span>
          )}
          {phase1Done && !phase1FeasibleFailed && phase === 1 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 text-xs font-semibold">
              Pha 1 xong ✓
            </span>
          )}
          {phase1FeasibleFailed && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 text-xs font-semibold">
              Vô nghiệm ✗
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onBack}
          disabled={step === 0}
          className="px-3 py-1.5 rounded-lg border border-primary/20 text-sm text-primary/60 hover:border-accent/40 hover:text-accent transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Trước
        </button>
        <button
          onClick={onNext}
          disabled={isOptimal || phase1FeasibleFailed}
          className="px-3 py-1.5 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent/80 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Tiếp →
        </button>
        {phase === 1 && phase1Done && !phase1FeasibleFailed && (
          <button
            onClick={onGoPhase2}
            className="px-3 py-1.5 rounded-lg bg-base text-primary text-sm font-medium hover:bg-blue-600 transition"
          >
            Sang Pha 2 →
          </button>
        )}
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg border border-primary/20 text-sm text-primary/50 hover:border-primary/40 transition"
        >
          Reset
        </button>
      </div>

      <div className="flex gap-6 items-start flex-wrap">
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm font-mono">
            <thead>
              <tr>
                <th className="min-w-12 h-9 text-center text-xs text-primary/40 font-semibold border border-primary/20 bg-primary/5">
                  Cơ sở
                </th>
                {allVarsCols.map((v, i) => {
                  const isArt = artificialSet.has(v);
                  const isEntering = i === pivotCol;
                  const inBasis = basisSet.has(v);
                  return (
                    <th
                      key={i}
                      className={[
                        "min-w-12 h-9 text-center text-xs font-semibold border border-primary/20 transition-all",
                        isEntering
                          ? "bg-yellow-200 text-yellow-800"
                          : isArt
                            ? "bg-red-50 text-red-400"
                            : inBasis
                              ? "bg-accent/10 text-accent"
                              : "bg-primary/5 text-primary/60",
                      ].join(" ")}
                    >
                      {v}
                    </th>
                  );
                })}
                <th className="min-w-12 h-9 text-center text-xs font-semibold border border-primary/20 bg-primary/5 text-primary/60">
                  b
                </th>
                <th className="min-w-14 h-9 text-center text-xs font-semibold text-primary/40 pl-2">
                  Ratio
                </th>
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rIdx) => {
                const isLeavingRow = rIdx === pivotRow;
                const bVal = row[row.length - 1];
                const isArtBasis = artificialSet.has(basis[rIdx]);
                return (
                  <tr key={rIdx}>
                    <td
                      className={[
                        "w-12 h-10 text-center text-xs font-bold border border-primary/20 transition-all",
                        isLeavingRow
                          ? "bg-orange-200 text-orange-800"
                          : isArtBasis
                            ? "bg-red-100 text-red-500"
                            : "bg-accent/10 text-accent",
                      ].join(" ")}
                    >
                      {basis[rIdx]}
                    </td>

                    {row.slice(0, -1).map((val, cIdx) => {
                      const isPivotCell =
                        rIdx === pivotRow && cIdx === pivotCol;
                      const isPivotColCell = cIdx === pivotCol;
                      const isPivotRowCell = rIdx === pivotRow;
                      return (
                        <td
                          key={cIdx}
                          onClick={() => onCellClick(rIdx, cIdx)}
                          className={[
                            "w-12 h-10 text-center border border-primary/20 cursor-pointer transition-all duration-150 select-none",
                            isPivotCell
                              ? "bg-amber-600 text-white font-bold"
                              : isPivotColCell
                                ? "bg-yellow-100"
                                : isPivotRowCell
                                  ? "bg-orange-100"
                                  : "hover:bg-primary/5",
                          ].join(" ")}
                        >
                          {fractionStr(val)}
                        </td>
                      );
                    })}

                    <td
                      className={[
                        "w-12 h-10 text-center border border-primary/20 font-semibold",
                        isLeavingRow ? "bg-orange-100" : "",
                      ].join(" ")}
                    >
                      {fractionStr(bVal)}
                    </td>
                    <td className="w-14 h-10 text-center pl-2">
                      {ratios[rIdx] !== null && ratios[rIdx] !== undefined ? (
                        <span
                          className={[
                            "px-1.5 py-0.5 rounded font-mono text-xs",
                            Math.abs(
                              (ratios[rIdx] ?? 0) - (minRatio ?? Infinity),
                            ) < 1e-9
                              ? "bg-green-500/20 text-green-700 font-bold"
                              : "text-primary/40",
                          ].join(" ")}
                        >
                          {fractionStr(ratios[rIdx]!)}
                        </span>
                      ) : (
                        <span className="text-primary/20 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* z row */}
              <tr className="border-t-2 border-primary/40">
                <td className="w-12 h-10 text-center text-xs font-bold border border-primary/20 bg-primary/5 text-primary/40">
                  -z
                </td>
                {zRow.slice(0, -1).map((val, cIdx) => (
                  <td
                    key={cIdx}
                    className={[
                      "w-12 h-10 text-center border border-primary/20 text-primary/70",
                      cIdx === pivotCol && phase === 2 ? "bg-yellow-50" : "",
                    ].join(" ")}
                  >
                    {fractionStr(val)}
                  </td>
                ))}
                <td className="w-12 h-10 text-center border border-primary/20 font-bold text-accent">
                  {fractionStr(zRow[zRow.length - 1])}
                </td>
                <td />
              </tr>

              {/* w row — chỉ pha 1 */}
              {phase === 1 && wRow && (
                <tr className="bg-blue-50/50">
                  <td className="w-12 h-10 text-center text-xs font-bold border border-primary/20 text-blue-500">
                    -w
                  </td>
                  {wRow.slice(0, -1).map((val, cIdx) => (
                    <td
                      key={cIdx}
                      className={[
                        "w-12 h-10 text-center border border-primary/20 text-blue-600/70",
                        cIdx === pivotCol ? "bg-yellow-50" : "",
                      ].join(" ")}
                    >
                      {fractionStr(val)}
                    </td>
                  ))}
                  <td
                    className={[
                      "w-12 h-10 text-center border border-primary/20 font-bold",
                      Math.abs(wRow[wRow.length - 1]) < 1e-6
                        ? "text-green-600"
                        : "text-blue-600",
                    ].join(" ")}
                  >
                    {fractionStr(wRow[wRow.length - 1])}
                  </td>
                  <td />
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
              { color: "bg-red-100", label: "Biến nhân tạo" },
              { color: "bg-blue-50", label: "Hàng w (pha 1)" },
            ].map(({ color, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs text-primary/40"
              >
                <span className={`w-3 h-3 rounded-sm ${color} inline-block`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Side info */}
        {!isOptimal && !phase1FeasibleFailed && (
          <div className="min-w-36 text-xs space-y-3 pt-9">
            <div className="p-2 rounded-lg border border-yellow-300/60 bg-yellow-50/50">
              <div className="font-semibold text-yellow-700 mb-1">Cột vào</div>
              <div className="font-mono text-yellow-800">
                {pivotCol >= 0 ? allVarsCols[pivotCol] : "—"}
              </div>
              <div className="text-yellow-600/60 mt-1 text-xs">
                {isFirstPhase1Step
                  ? "Cột x0 (bước đầu pha 1)"
                  : phase === 1
                    ? "Hệ số dương lớn nhất hàng w"
                    : "Hệ số dương lớn nhất hàng z"}
              </div>
            </div>
            <div className="p-2 rounded-lg border border-orange-300/60 bg-orange-50/50">
              <div className="font-semibold text-orange-700 mb-1">Hàng ra</div>
              <div className="font-mono text-orange-800">
                {pivotRow >= 0 ? basis[pivotRow] : "—"}
              </div>
              <div className="text-orange-600/60 mt-1 text-xs">
                {isFirstPhase1Step ? "Cột b âm nhất" : "Ratio dương nhỏ nhất"}
              </div>
            </div>
            {phase === 1 && wRow && (
              <div className="p-2 rounded-lg border border-blue-300/60 bg-blue-50/50">
                <div className="font-semibold text-blue-700 mb-1">
                  Giá trị w hiện tại
                </div>
                <div className="font-mono text-blue-800">
                  {fractionStr(-wRow[wRow.length - 1])}
                </div>
                <div className="text-blue-600/60 mt-1 text-xs">
                  {config.mode === "canonical"
                    ? "Pha 1 xong khi không còn hệ số dương hàng w"
                    : "Pha 1 kết thúc khi w = 0"}
                </div>
              </div>
            )}
          </div>
        )}

        {phase1FeasibleFailed && (
          <div className="min-w-36 text-xs pt-9">
            <div className="p-3 rounded-lg border border-red-400/40 bg-red-50/50">
              <div className="font-semibold text-red-700 mb-1">
                Bài toán vô nghiệm
              </div>
              <div className="text-red-600/70">
                {config.mode === "canonical"
                  ? "Còn biến y trong cơ sở với giá trị > 0."
                  : "w tối ưu ≠ 0, bài toán gốc không có nghiệm chấp nhận được."}
              </div>
            </div>
          </div>
        )}

        {phase === 2 && isOptimal && (
          <div className="min-w-36 text-xs pt-9">
            <div className="p-3 rounded-lg border border-green-400/40 bg-green-50/50 space-y-1">
              <div className="font-semibold text-green-700 mb-2">
                Nghiệm tối ưu
              </div>
              {basis.map((b, i) => (
                <div key={i} className="font-mono text-green-800">
                  {b} = {fractionStr(tableau[i][tableau[i].length - 1])}
                </div>
              ))}
              {config.originalVars
                .filter((v) => !basisSet.has(v))
                .map((v) => (
                  <div key={v} className="font-mono text-green-600/50">
                    {v} = 0
                  </div>
                ))}
              <div className="border-t border-green-300/50 mt-2 pt-2 font-bold text-green-800">
                z* = {fractionStr(-zRow[zRow.length - 1])}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-primary/30">
        Bấm vào cột để chọn cột xoay thủ công · Nhấn Tiếp để thuật toán tự chọn
      </p>
    </div>
  );
}

// ========================
// MAIN COMPONENT
// ========================
export function TwoPhaseSimplexSolver() {
  const [mode, setMode] = useState<TwoPhaseMode>("standard");
  const [config, setConfig] = useState<SetupConfig | null>(null);
  const [history, setHistory] = useState<TableState[]>([]);
  const [step, setStep] = useState(0);
  const [selectedPivot, setSelectedPivot] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>(1);

  const handleStart = (c: SetupConfig) => {
    const parsed = c.tableau.map((r) => r.map((v) => parseFloat(v) || 0));
    setConfig(c);
    setHistory([
      {
        tableau: parsed,
        basis: [...c.basisNames],
        phase: 1,
        numDataRows: c.numConstraints,
      },
    ]);
    setStep(0);
    setPhase(1);
    setSelectedPivot(null);
    setStarted(true);
  };

  const current = history[step] ?? null;
  const tableau = current?.tableau ?? [];
  const allVarsCols = config ? getAllVarsCols(config, phase) : [];

  const handleCellClick = (row: number, col: number) => {
    if (!current || !config) return;
    const bestRow = getLeavingRow(tableau, col, current.numDataRows);
    if (bestRow < 0) return;
    setSelectedPivot({ row: bestRow, col });
  };

  const handleNext = useCallback(() => {
    if (!current || !config) return;

    const numDataRows = current.numDataRows;
    const activeObj =
      phase === 1 ? tableau[numDataRows + 1] : tableau[numDataRows];

    const phase1Steps =
      history.slice(0, step + 1).filter((h) => h.phase === 1).length - 1;
    const isFirstPhase1Step =
      phase === 1 && config.mode === "standard" && phase1Steps === 0;

    let pCol: number;
    let pRow: number;

    if (selectedPivot) {
      pCol = selectedPivot.col;
      pRow = selectedPivot.row;
    } else if (isFirstPhase1Step) {
      // Bước đầu chuẩn tắc: cột x0, hàng b âm nhất
      pCol = allVarsCols.indexOf(config.artificialVars[0]);
      pRow = getLeavingRowByMinB(tableau, numDataRows);
    } else {
      // Các bước còn lại: simplex bình thường với activeObj (w hoặc z)
      pCol = getEnteringCol(activeObj);
      pRow = getLeavingRow(tableau, pCol, numDataRows);
    }

    if (pRow < 0 || pCol < 0) return;

    const newTableau = doPivot(tableau, pRow, pCol);
    const newBasis = [...current.basis];
    newBasis[pRow] = allVarsCols[pCol];

    const newHist = history.slice(0, step + 1);
    newHist.push({ tableau: newTableau, basis: newBasis, phase, numDataRows });
    setHistory(newHist);
    setStep(step + 1);
    setSelectedPivot(null);
  }, [
    current,
    config,
    phase,
    tableau,
    selectedPivot,
    allVarsCols,
    history,
    step,
  ]);

  const handleBack = () => {
    if (step === 0) return;
    const prevState = history[step - 1];
    setStep(step - 1);
    setPhase(prevState.phase);
    setSelectedPivot(null);
  };

  const handleReset = () => {
    if (!config) return;
    const parsed = config.tableau.map((r) => r.map((v) => parseFloat(v) || 0));
    setHistory([
      {
        tableau: parsed,
        basis: [...config.basisNames],
        phase: 1,
        numDataRows: config.numConstraints,
      },
    ]);
    setStep(0);
    setPhase(1);
    setSelectedPivot(null);
  };

  const handleGoPhase2 = () => {
    if (!config || !current) return;

    if (config.mode === "canonical") {
      // Chính tắc: bỏ cột y, bỏ hàng w, bỏ hàng có basis y với toàn hệ số gốc = 0
      const fullCols = [...config.originalVars, ...config.artificialVars];
      const artificialIndices = new Set(
        config.artificialVars.map((v) => fullCols.indexOf(v)),
      );
      const origCount = config.originalVars.length;

      // Tìm hàng giữ lại: không phải basis y, hoặc basis y nhưng còn hệ số gốc ≠ 0
      const keepRows: number[] = [];
      tableau.slice(0, current.numDataRows).forEach((row, rIdx) => {
        const isArtBasis = config.artificialVars.includes(current.basis[rIdx]);
        if (!isArtBasis) {
          keepRows.push(rIdx);
        } else if (row.slice(0, origCount).some((v) => Math.abs(v) > 1e-9)) {
          keepRows.push(rIdx); // y trong basis nhưng còn hệ số gốc ≠ 0, cần xoay thêm
        }
        // bỏ hàng: basis y và toàn hệ số gốc = 0 (phụ thuộc tuyến tính)
      });

      const filteredBasis = keepRows.map((rIdx) => current.basis[rIdx]);

      // Bỏ cột y, giữ cột b
      const stripArtCols = (row: number[]) =>
        row.filter(
          (_, cIdx) => cIdx === row.length - 1 || !artificialIndices.has(cIdx),
        );

      const phase2Tableau = [
        ...keepRows.map((rIdx) => stripArtCols(tableau[rIdx])),
        stripArtCols(tableau[current.numDataRows]), // hàng z
      ];

      const newHist = history.slice(0, step + 1);
      newHist.push({
        tableau: phase2Tableau,
        basis: filteredBasis,
        phase: 2,
        numDataRows: keepRows.length,
      });
      setHistory(newHist);
      setStep(step + 1);
      setPhase(2);
      setSelectedPivot(null);
    } else {
      // Chuẩn tắc: bỏ cột x0, bỏ hàng w
      const fullCols = [
        ...config.artificialVars,
        ...config.originalVars,
        ...config.slackVars,
      ];
      const artificialIndices = new Set(
        config.artificialVars.map((v) => fullCols.indexOf(v)),
      );

      const phase2Tableau = tableau
        .slice(0, current.numDataRows + 1) // bỏ hàng w
        .map((row) =>
          row.filter(
            (_, cIdx) =>
              cIdx === row.length - 1 || !artificialIndices.has(cIdx),
          ),
        );

      const newHist = history.slice(0, step + 1);
      newHist.push({
        tableau: phase2Tableau,
        basis: current.basis,
        phase: 2,
        numDataRows: current.numDataRows,
      });
      setHistory(newHist);
      setStep(step + 1);
      setPhase(2);
      setSelectedPivot(null);
    }
  };

  return (
    <div className="my-8 space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-primary/40 self-center">
          Dạng bài toán:
        </span>
        {(
          [
            ["standard", "Chuẩn tắc (≤)"],
            ["canonical", "Chính tắc (=)"],
          ] as [TwoPhaseMode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setStarted(false);
              setConfig(null);
              setHistory([]);
            }}
            className={[
              "px-3 py-1.5 rounded-lg text-sm transition",
              mode === m
                ? "bg-accent text-background font-medium"
                : "border border-primary/20 text-primary/60 hover:border-accent/40",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {!started ? (
        <SetupForm mode={mode} onStart={handleStart} key={mode} />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-primary/40">
              Thuật toán đơn hình 2 pha ·{" "}
              {mode === "standard" ? "Dạng chuẩn tắc" : "Dạng chính tắc"}
            </span>
            <button
              onClick={() => {
                setStarted(false);
                setConfig(null);
                setHistory([]);
              }}
              className="text-xs text-primary/40 hover:text-accent transition underline underline-offset-2"
            >
              Nhập lại
            </button>
          </div>
          {config && (
            <TwoPhaseTable
              config={config}
              history={history}
              step={step}
              phase={phase}
              selectedPivot={selectedPivot}
              onCellClick={handleCellClick}
              onNext={handleNext}
              onBack={handleBack}
              onReset={handleReset}
              onGoPhase2={handleGoPhase2}
            />
          )}
        </div>
      )}
    </div>
  );
}
