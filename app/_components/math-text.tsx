import { createElement, Fragment, type ReactNode } from "react";
import { mathToPlain, parseMathText, type MathNode } from "@/lib/math-markup";

/**
 * Question text with its $...$ maths rendered as MathML (see lib/math-markup).
 * Works in server and client components alike; no client JavaScript needed.
 */
export function MathText({ text }: { text: string }) {
  if (!text.includes("$")) return text;
  return (
    <>
      {parseMathText(text).map((seg, i) =>
        seg.kind === "text" ? (
          <Fragment key={i}>{seg.text}</Fragment>
        ) : (
          // display="inline" keeps it in the line of text; alttext is the fallback reading.
          createElement("math", { key: i, display: "inline", alttext: mathToPlain(`$${seg.source}$`) }, render(seg.node))
        ),
      )}
    </>
  );
}

let keySeq = 0;
const el = (tag: string, props: Record<string, unknown>, ...children: ReactNode[]) =>
  createElement(tag, { key: keySeq++, ...props }, ...children);

function render(n: MathNode): ReactNode {
  switch (n.t) {
    case "mi":
      return el("mi", n.upright || n.text.length > 1 ? { mathvariant: "normal" } : {}, n.text);
    case "mn":
    case "mo":
    case "mtext":
      return el(n.t, {}, n.text);
    case "mrow":
      return el("mrow", {}, ...n.children.map(render));
    case "mfrac":
      return el("mfrac", {}, render(n.num), render(n.den));
    case "msqrt":
      return el("msqrt", {}, render(n.body));
    case "mroot":
      return el("mroot", {}, render(n.body), render(n.index));
    case "script":
      if (n.sub && n.sup) return el("msubsup", {}, render(n.base), render(n.sub), render(n.sup));
      if (n.sub) return el("msub", {}, render(n.base), render(n.sub));
      return el("msup", {}, render(n.base), render(n.sup!));
  }
}
