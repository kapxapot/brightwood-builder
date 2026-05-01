import { ZodError, type ZodType } from "zod";

export const formatJson = (value: unknown) => JSON.stringify(value, null, 2) ?? "";

export function parseJsonWithSchema<T>(rawValue: string, schema: ZodType<T>): T {
  return schema.parse(JSON.parse(rawValue));
}

export function getJsonEditorErrorMessage(error: unknown): string {
  if (error instanceof SyntaxError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return error.issues
      .map(issue => {
        const path = formatPath(issue.path);
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join("; ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Invalid JSON value.";
}

function formatPath(path: (string | number)[]) {
  if (!path.length) {
    return "";
  }

  return path.reduce<string>((result, part) => {
    if (typeof part === "number") {
      return `${result}[${part}]`;
    }

    return result.length ? `${result}.${part}` : part;
  }, "");
}
