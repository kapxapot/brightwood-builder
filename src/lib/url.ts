export const isImageUrl = (text: string) =>
  /^https?:\/\/.*\.(png|jpe?g|gif|webp)$/i.test(text);
