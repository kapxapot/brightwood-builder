type MessageRenderValue = string | number | boolean | null | undefined;

export type MessageRenderParams = Record<string, MessageRenderValue>;

export const MALE = 1;
const DEFAULT_PLAYER_GENDER = MALE;

const TEMPLATE_TOKEN_RE = /{{(.+?)}}/g;

function hasParam(params: MessageRenderParams, key: string): boolean {
  return Object.hasOwn(params, key);
}

function renderByIndex(index: number, text: string): string {
  const parts = text.split("|");
  return parts[index - 1] ?? "";
}

function toIndex(value: MessageRenderValue): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
  }

  return 0;
}

function toPhpString(value: MessageRenderValue): string {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  if (value === true) {
    return "1";
  }

  return String(value);
}

/**
 * Mirrors the Brightwood template behavior for constructs inside {{...}}.
 */
export function renderMessage(
  text: string,
  params: MessageRenderParams = {},
  gender: number = DEFAULT_PLAYER_GENDER,
): string {
  return text.replace(TEMPLATE_TOKEN_RE, (_fullMatch, match: string) => {
    const colonPos = match.indexOf(":");
    const tag = colonPos === -1 ? "" : match.slice(0, colonPos);
    const body = colonPos === -1 ? match : match.slice(colonPos + 1);

    if (tag.length > 0) {
      if (hasParam(params, tag)) {
        return renderByIndex(toIndex(params[tag]), body);
      }

      return renderByIndex(1, body);
    }

    if (hasParam(params, body)) {
      return toPhpString(params[body]);
    }

    return renderByIndex(gender, body);
  });
}

export function extractMessageTemplateDependencies(
  text: string,
  availableKeys: Iterable<string>
): string[] {
  const keys = new Set(availableKeys);
  const dependencies = new Set<string>();

  for (const match of text.matchAll(TEMPLATE_TOKEN_RE)) {
    const token = match[1];
    const colonPos = token.indexOf(":");
    const tag = colonPos === -1 ? "" : token.slice(0, colonPos);
    const body = colonPos === -1 ? token : token.slice(colonPos + 1);

    if (tag.length > 0) {
      if (keys.has(tag)) {
        dependencies.add(tag);
      }

      continue;
    }

    if (keys.has(body)) {
      dependencies.add(body);
    }
  }

  return [...dependencies];
}
