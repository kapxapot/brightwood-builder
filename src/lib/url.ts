export function extractImageUrl(text: string): string | null {
  if (/^https?:\/\/.+\.(png|jpe?g|gif|webp)$/i.test(text)) {
    return text;
  }

  const imageMatch = /^<image>(https?:\/\/.+)<\/image>$/i.exec(text);

  if (imageMatch) {
    return imageMatch[1];
  }

  return null;
}
