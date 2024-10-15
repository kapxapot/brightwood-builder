import { convertText } from "@/lib/text-converter";

type Props = {
  className?: string;
  text: string;
};

export default function TextDisplay({ className, text }: Props) {
  const convertedText = convertText(text);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: convertedText }}
    >
    </span>
  );
}
