"use client";

import { useRef, useState } from "react";
import { Backspace, CaretLeft, CaretRight, DotsSixVertical, X } from "@phosphor-icons/react";

/*
 * The scientific calculator from the DSA site's quiz runner, rebuilt: the same
 * draggable panel, standard pad, expandable scientific functions and DEG/RAD
 * switch. DSA evaluates with `new Function`; this parses instead, so nothing
 * typed is ever run as code.
 */

const FUNCS = ["sin", "cos", "tan", "log", "ln", "√"] as const;
type Func = (typeof FUNCS)[number];

/** Recursive descent over the token list. Missing closing brackets are allowed. */
function evaluate(tokens: string[], degrees: boolean): number {
  let i = 0;
  const peek = () => tokens[i];
  const toRad = (x: number) => (degrees ? (x * Math.PI) / 180 : x);
  const apply: Record<Func, (x: number) => number> = {
    sin: (x) => Math.sin(toRad(x)),
    cos: (x) => Math.cos(toRad(x)),
    tan: (x) => Math.tan(toRad(x)),
    log: Math.log10,
    ln: Math.log,
    "√": Math.sqrt,
  };
  const startsPrimary = (t?: string) => t !== undefined && (/^[\d.]/.test(t) || t === "π" || t === "e" || t === "(" || FUNCS.includes(t as Func));

  function primary(): number {
    const t = tokens[i++];
    if (t === undefined) throw new Error("incomplete");
    if (t === "π") return Math.PI;
    if (t === "e") return Math.E;
    if (t === "(") {
      const v = expr();
      if (peek() === ")") i++;
      return v;
    }
    if (FUNCS.includes(t as Func)) {
      if (peek() === "(") i++;
      const v = expr();
      if (peek() === ")") i++;
      return apply[t as Func](v);
    }
    const n = Number(t);
    if (Number.isNaN(n)) throw new Error("bad number");
    return n;
  }
  function unary(): number {
    if (peek() === "−") {
      i++;
      return -unary();
    }
    return primary();
  }
  function power(): number {
    const base = unary();
    if (peek() === "^") {
      i++;
      return base ** power();
    }
    return base;
  }
  function term(): number {
    let v = power();
    for (;;) {
      if (peek() === "×" || peek() === "÷") {
        const op = tokens[i++];
        const rhs = power();
        v = op === "×" ? v * rhs : v / rhs;
      } else if (startsPrimary(peek())) v *= power(); // 2π, 3(4), 2sin(30)
      else return v;
    }
  }
  function expr(): number {
    let v = term();
    while (peek() === "+" || peek() === "−") v = tokens[i++] === "+" ? v + term() : v - term();
    return v;
  }

  const result = expr();
  if (i < tokens.length) throw new Error("trailing input");
  return result;
}

function format(n: number) {
  return Number.isFinite(n) ? String(parseFloat(n.toFixed(8))) : "Error";
}

const PAD = ["C", "DEL", "÷", "×", "7", "8", "9", "−", "4", "5", "6", "+", "1", "2", "3", ".", "0", "="];
const SCI = ["sin", "cos", "tan", "log", "ln", "√", "π", "e", "^", "(", ")", "x²"];

export function Calculator({ onClose }: { onClose: () => void }) {
  const [tokens, setTokens] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [degrees, setDegrees] = useState(true);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  function press(key: string) {
    if (key === "C") return (setTokens([]), setError(false));
    if (key === "DEL") return (setError(false), setTokens((t) => t.slice(0, -1)));
    if (key === "=") {
      try {
        const v = format(evaluate(tokens, degrees));
        setError(v === "Error");
        setTokens(v === "Error" ? [] : [v]);
      } catch {
        setError(true);
        setTokens([]);
      }
      return;
    }
    setError(false);
    setTokens((t) => {
      const last = t[t.length - 1];
      if (key === "x²") return [...t, "^", "2"];
      if (FUNCS.includes(key as Func)) return [...t, key, "("];
      // Digits and the point extend the number being typed.
      if (/^[\d.]$/.test(key) && last && /^[\d.]+$/.test(last)) {
        if (key === "." && last.includes(".")) return t;
        return [...t.slice(0, -1), last + key];
      }
      return [...t, key];
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    const rect = panel.current!.getBoundingClientRect();
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !panel.current) return;
    const { width, height } = panel.current.getBoundingClientRect();
    setPos({
      x: Math.min(Math.max(0, e.clientX - drag.current.dx), window.innerWidth - width),
      y: Math.min(Math.max(0, e.clientY - drag.current.dy), window.innerHeight - height),
    });
  }

  const display = error ? "Error" : tokens.join("") || "0";
  const key = "grid h-10 place-items-center rounded-xl text-sm font-semibold transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <div
      ref={panel}
      role="dialog"
      aria-label="Calculator"
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={`fixed z-50 rounded-3xl border border-line bg-surface p-3 shadow-2xl ${pos ? "" : "top-20 right-4"} ${expanded ? "w-[26rem] max-w-[calc(100vw-2rem)]" : "w-64"}`}
    >
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = null)}
          className="flex flex-1 cursor-grab touch-none items-center gap-2 text-muted active:cursor-grabbing"
        >
          <DotsSixVertical size={16} aria-hidden />
          <span className="text-xs font-semibold">Calculator</span>
        </div>
        <button
          type="button"
          onClick={() => setDegrees((d) => !d)}
          className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] font-bold text-brand-ink"
          aria-label={`Angle unit: ${degrees ? "degrees" : "radians"}. Switch`}
        >
          {degrees ? "DEG" : "RAD"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-tint"
          aria-label={expanded ? "Hide scientific functions" : "Show scientific functions"}
        >
          {expanded ? <CaretLeft size={16} aria-hidden /> : <CaretRight size={16} aria-hidden />}
        </button>
        <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad">
          <X size={16} aria-hidden />
          <span className="sr-only">Close calculator</span>
        </button>
      </div>

      <output className="mb-3 block truncate rounded-2xl bg-tint px-4 py-3 text-right font-mono text-2xl" aria-live="polite">
        {display}
      </output>

      <div className="flex gap-2">
        {expanded && (
          <div className="grid w-36 shrink-0 grid-cols-3 gap-1.5 border-r border-line pr-2">
            {SCI.map((k) => (
              <button key={k} type="button" onClick={() => press(k)} className={`${key} bg-tint font-mono text-xs text-brand-ink hover:bg-brand/15`}>
                {k}
              </button>
            ))}
          </div>
        )}
        <div className="grid flex-1 grid-cols-4 gap-1.5">
          {PAD.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === "DEL" ? "Delete" : undefined}
              className={`${key} ${
                k === "="
                  ? "col-span-2 bg-brand text-on-brand"
                  : "÷×−+".includes(k)
                    ? "bg-canvas text-brand-ink"
                    : k === "C" || k === "DEL"
                      ? "bg-bad-soft text-bad"
                      : "bg-canvas text-ink"
              } font-mono`}
            >
              {k === "DEL" ? <Backspace size={16} aria-hidden /> : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
