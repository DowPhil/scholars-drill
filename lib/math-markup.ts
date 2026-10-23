/**
 * Maths and chemistry in question text (WEB-PRD 7), as a small LaTeX-style
 * markup inside $...$, turned into MathML. Every current browser renders
 * MathML natively and screen readers read it, so there is no library to
 * download (WEB-PRD 9: no heavy libraries).
 *
 * Outside $...$ text is left alone, so "x_y" in an English passage is safe.
 * The full reference for question authors is docs/QUESTION-MARKUP.md.
 *
 *   $x^2$  $x^{2n}$  $a_1$  $\frac{2}{3}$  $\sqrt{16}$  $\sqrt[3]{8}$
 *   $\log_{10} 2$  $30\degree$  $\ce{H2SO4}$  $\ce{SO4^{2-}}$  $\ce{N2 + 3H2 <=> 2NH3}$
 */

export type MathNode =
  | { t: "mi" | "mn" | "mo" | "mtext"; text: string; upright?: boolean }
  | { t: "mrow"; children: MathNode[] }
  | { t: "mfrac"; num: MathNode; den: MathNode }
  | { t: "msqrt"; body: MathNode }
  | { t: "mroot"; body: MathNode; index: MathNode }
  | { t: "script"; base: MathNode; sub?: MathNode; sup?: MathNode };

export type Segment = { kind: "text"; text: string } | { kind: "math"; node: MathNode; source: string };

const SYMBOLS: Record<string, MathNode> = {
  times: { t: "mo", text: "×" },
  div: { t: "mo", text: "÷" },
  pm: { t: "mo", text: "±" },
  cdot: { t: "mo", text: "·" },
  le: { t: "mo", text: "≤" },
  ge: { t: "mo", text: "≥" },
  ne: { t: "mo", text: "≠" },
  approx: { t: "mo", text: "≈" },
  to: { t: "mo", text: "→" },
  infty: { t: "mi", text: "∞" },
  degree: { t: "mo", text: "°" },
  pi: { t: "mi", text: "π" },
  theta: { t: "mi", text: "θ" },
  alpha: { t: "mi", text: "α" },
  beta: { t: "mi", text: "β" },
  lambda: { t: "mi", text: "λ" },
  mu: { t: "mi", text: "μ" },
  omega: { t: "mi", text: "ω" },
  Omega: { t: "mi", text: "Ω" },
  Delta: { t: "mo", text: "Δ" },
  sum: { t: "mo", text: "∑" },
};
const FUNCTIONS = new Set(["sin", "cos", "tan", "log", "ln", "lim"]);
const ARROWS: Array<[string, string]> = [
  ["<=>", "⇌"],
  ["->", "→"],
  ["<-", "←"],
];

class Parser {
  private i = 0;
  private s: string;
  private chem: boolean;
  constructor(s: string, chem = false) {
    this.s = s;
    this.chem = chem;
  }

  parse(): MathNode {
    const node = this.seq(null);
    if (this.i < this.s.length) throw new Error(`Unexpected "${this.s[this.i]}"`);
    return node;
  }

  private seq(close: string | null): MathNode {
    const children: MathNode[] = [];
    while (this.i < this.s.length && this.s[this.i] !== close) {
      if (this.s[this.i] === " ") {
        this.i++;
        continue;
      }
      children.push(this.scripted(children));
    }
    if (close !== null) {
      if (this.s[this.i] !== close) throw new Error(`Missing "${close}"`);
      this.i++;
    }
    return children.length === 1 ? children[0] : { t: "mrow", children };
  }

  /** An atom and any ^ or _ after it. In \ce, digits after an element are subscripts. */
  private scripted(before: MathNode[]): MathNode {
    let base = this.atom();
    if (this.chem && base.t === "mn" && before.length > 0) {
      const prev = before[before.length - 1];
      // "H2" or ")2": the count belongs to what precedes it, as a subscript.
      if ((prev.t === "mi" || (prev.t === "mo" && prev.text === ")")) && !/\s/.test(this.s[this.i - base.text.length - 1] ?? "")) {
        before.pop();
        base = { t: "script", base: prev, sub: base };
      }
    }
    let sub: MathNode | undefined;
    let sup: MathNode | undefined;
    while (this.s[this.i] === "^" || this.s[this.i] === "_") {
      const op = this.s[this.i++];
      const arg = this.argument();
      if (op === "^") sup = arg;
      else sub = arg;
    }
    if (!sub && !sup) return base;
    if (base.t === "script" && !base.sup && sup) return { ...base, sup };
    return { t: "script", base, sub, sup };
  }

  /** A script or command argument: {group} or one character. */
  private argument(): MathNode {
    if (this.s[this.i] === "{") {
      this.i++;
      return this.seq("}");
    }
    // In \ce a charge like ^2- or ^+ reads as one unit.
    if (this.chem) {
      const m = /^(\d*[+-])/.exec(this.s.slice(this.i));
      if (m) {
        this.i += m[1].length;
        return { t: "mo", text: m[1].replace("-", "−") };
      }
    }
    return this.atom();
  }

  private atom(): MathNode {
    const s = this.s;
    const c = s[this.i];
    if (c === undefined) throw new Error("Unexpected end");

    if (c === "{") {
      this.i++;
      return this.seq("}");
    }
    if (c === "\\") return this.command();

    for (const [ascii, glyph] of ARROWS) {
      if (s.startsWith(ascii, this.i)) {
        this.i += ascii.length;
        return { t: "mo", text: glyph };
      }
    }
    const num = /^\d+(\.\d+)?/.exec(s.slice(this.i));
    if (num) {
      this.i += num[0].length;
      return { t: "mn", text: num[0] };
    }
    if (/[A-Za-z]/.test(c)) {
      if (this.chem) {
        // An element: capital plus optional lower case, upright (Na, Cl, O).
        // A lone lower-case letter is a variable, italic as in CₙH₂ₙ₊₂.
        const el = /^[A-Z][a-z]?|^[a-z]/.exec(s.slice(this.i))![0];
        this.i += el.length;
        return { t: "mi", text: el, upright: /^[A-Z]/.test(el) };
      }
      this.i++;
      return { t: "mi", text: c };
    }
    this.i++;
    return { t: "mo", text: c === "-" ? "−" : c };
  }

  private command(): MathNode {
    const name = /^\\([A-Za-z]+)/.exec(this.s.slice(this.i))?.[1];
    if (!name) {
      // \$ \{ \} and similar: the character itself.
      this.i += 2;
      return { t: "mo", text: this.s[this.i - 1] };
    }
    this.i += name.length + 1;
    switch (name) {
      case "frac":
        return { t: "mfrac", num: this.argument(), den: this.argument() };
      case "sqrt": {
        if (this.s[this.i] === "[") {
          this.i++;
          const index = this.seq("]");
          return { t: "mroot", body: this.argument(), index };
        }
        return { t: "msqrt", body: this.argument() };
      }
      case "text": {
        const close = this.s.indexOf("}", this.i + 1);
        if (this.s[this.i] !== "{" || close < 0) throw new Error("\\text needs {…}");
        const text = this.s.slice(this.i + 1, close);
        this.i = close + 1;
        return { t: "mtext", text };
      }
      case "ce": {
        const close = this.matchingBrace(this.i);
        const inner = new Parser(this.s.slice(this.i + 1, close), true).parse();
        this.i = close + 1;
        return inner;
      }
    }
    if (FUNCTIONS.has(name)) return { t: "mi", text: name, upright: true };
    const sym = SYMBOLS[name];
    if (!sym) throw new Error(`Unknown command \\${name}`);
    return sym;
  }

  private matchingBrace(open: number): number {
    if (this.s[open] !== "{") throw new Error("Expected {");
    let depth = 0;
    for (let j = open; j < this.s.length; j++) {
      if (this.s[j] === "{") depth++;
      else if (this.s[j] === "}" && --depth === 0) return j;
    }
    throw new Error('Missing "}"');
  }
}

/**
 * Split text into plain and maths segments. A segment that fails to parse
 * stays as its source text: a typo shows as written, never as a broken page.
 */
export function parseMathText(text: string): Segment[] {
  const out: Segment[] = [];
  let plain = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\" && text[i + 1] === "$") {
      plain += "$";
      i += 2;
      continue;
    }
    if (text[i] === "$") {
      const end = text.indexOf("$", i + 1);
      if (end > i) {
        const source = text.slice(i + 1, end);
        try {
          const node = new Parser(source).parse();
          if (plain) out.push({ kind: "text", text: plain });
          plain = "";
          out.push({ kind: "math", node, source });
        } catch {
          plain += text.slice(i, end + 1);
        }
        i = end + 1;
        continue;
      }
    }
    plain += text[i++];
  }
  if (plain) out.push({ kind: "text", text: plain });
  return out;
}

/** Plain-text version, for places that cannot show MathML (titles, aria labels). */
export function mathToPlain(text: string): string {
  return parseMathText(text)
    .map((s) => (s.kind === "text" ? s.text : flatten(s.node)))
    .join("");
}

function flatten(n: MathNode): string {
  switch (n.t) {
    case "mrow":
      return n.children.map(flatten).join("");
    case "mfrac":
      return `${flatten(n.num)}/${flatten(n.den)}`;
    case "msqrt":
      return `√(${flatten(n.body)})`;
    case "mroot":
      return `${flatten(n.index)}√(${flatten(n.body)})`;
    case "script":
      return `${flatten(n.base)}${n.sub ? `_${flatten(n.sub)}` : ""}${n.sup ? `^${flatten(n.sup)}` : ""}`;
    default:
      return n.text;
  }
}
