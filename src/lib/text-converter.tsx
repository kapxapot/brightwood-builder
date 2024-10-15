export function convertText(text: string): string {
  text = text.replace("<tg-spoiler>", "&lt;tg-spoiler&gt;");
  text = text.replace("</tg-spoiler>", "&lt;/tg-spoiler&gt;");

  return text;
}
