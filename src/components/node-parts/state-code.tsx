import { Fragment } from "react";
import { cn } from "@/lib/utils";

type TokenKind =
  | "plain"
  | "property"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "function"
  | "identifier"
  | "operator"
  | "punctuation";

type Token = {
  value: string;
  kind: TokenKind;
};

type Props = {
  code: string;
  block?: boolean;
  className?: string;
};

const TOKEN_PATTERN =
  /"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?|\btrue\b|\bfalse\b|\bnull\b|\b[A-Za-z_]\w*(?=\()|\b[A-Za-z_]\w*\b|==|!=|<=|>=|\|\||&&|[=+\-*/%<>!]+|[()[\]{}.,:]/g;

const lightTokenClassNames: Record<TokenKind, string> = {
  plain: "text-slate-700",
  property: "text-sky-700",
  string: "text-emerald-700",
  number: "text-amber-700",
  boolean: "text-violet-700",
  null: "text-fuchsia-700",
  function: "text-blue-700",
  identifier: "text-slate-900",
  operator: "text-rose-700",
  punctuation: "text-slate-500"
};

const darkTokenClassNames: Record<TokenKind, string> = {
  plain: "text-slate-300",
  property: "text-sky-300",
  string: "text-emerald-300",
  number: "text-amber-300",
  boolean: "text-violet-300",
  null: "text-fuchsia-300",
  function: "text-blue-300",
  identifier: "text-slate-100",
  operator: "text-rose-300",
  punctuation: "text-slate-500"
};

function getTokenKind(input: string, token: string, index: number): TokenKind {
  if (token.startsWith("\"")) {
    const trailingText = input.slice(index + token.length);
    return /^\s*:/.test(trailingText) ? "property" : "string";
  }

  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(token)) {
    return "number";
  }

  if (token === "true" || token === "false") {
    return "boolean";
  }

  if (token === "null") {
    return "null";
  }

  if (/^[A-Za-z_]\w*$/.test(token)) {
    return /^\s*\(/.test(input.slice(index + token.length))
      ? "function"
      : "identifier";
  }

  if (/^(==|!=|<=|>=|\|\||&&|[=+\-*/%<>!]+)$/.test(token)) {
    return "operator";
  }

  if (/^[()[\]{}.,:]$/.test(token)) {
    return "punctuation";
  }

  return "plain";
}

function tokenizeCode(input: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    const value = match[0];

    if (index > lastIndex) {
      tokens.push({
        value: input.slice(lastIndex, index),
        kind: "plain"
      });
    }

    tokens.push({
      value,
      kind: getTokenKind(input, value, index)
    });

    lastIndex = index + value.length;
  }

  if (lastIndex < input.length) {
    tokens.push({
      value: input.slice(lastIndex),
      kind: "plain"
    });
  }

  return tokens;
}

export default function StateCode({ code, block, className }: Props) {
  const tokens = tokenizeCode(code);
  const tokenClassNames = block ? darkTokenClassNames : lightTokenClassNames;

  if (block) {
    return (
      <pre
        className={cn(
          "nowheel overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-sm leading-5 shadow-inner",
          className
        )}
      >
        <code>
          {tokens.map((token, index) => (
            <Fragment key={`${token.kind}-${index}`}>
              <span className={tokenClassNames[token.kind]}>{token.value}</span>
            </Fragment>
          ))}
        </code>
      </pre>
    );
  }

  return (
    <code
      className={cn(
        "inline-block max-w-full whitespace-pre-wrap break-words rounded-md border border-slate-300 border-opacity-80 bg-white bg-opacity-70 px-1.5 py-0.5 align-middle font-mono text-[11px] leading-4 shadow-sm shadow-slate-200/40",
        className
      )}
    >
      {tokens.map((token, index) => (
        <Fragment key={`${token.kind}-${index}`}>
          <span className={tokenClassNames[token.kind]}>{token.value}</span>
        </Fragment>
      ))}
    </code>
  );
}
