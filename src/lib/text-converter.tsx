export function convertText(text: string): string {
  text = text.replaceAll("<tg-spoiler>", green("&lt;tg-spoiler&gt;"));
  text = text.replaceAll("</tg-spoiler>", green("&lt;/tg-spoiler&gt;"));

  text = curlyBraces(text);

  return text;
}

const green = (content: string) => `<span class="text-green-500 font-semibold">${content}</span>`;
const blue = (content: string) => `<span class="text-blue-700">${content}</span>`;
const yellow = (content: string) => `<span class="text-yellow-600">${content}</span>`;

const curlyBraces = (text: string) =>
  text.replaceAll(/{{(?:([a-z]+):)?(.+?)}}/g, (_match: string, p1: string, p2: string) => {
    const content = p2
      .split("|")
      .map(p => blue(p))
      .join(green("|"));

    const prefix = p1
      ? yellow(p1) + green(":")
      : "";

    return green("{{") + prefix + content + green("}}");
  });
