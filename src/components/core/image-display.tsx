import { useState } from "react";

type Props = {
  url: string;
};

export function ImageDisplay({ url }: Props) {
  const [src, setSrc] = useState(url);

  const handleError = () => {
    setSrc("/images/image-not-found.jpg");
  };

  return (
    <img
      src={src}
      alt=""
      className="w-full min-h-[1.85rem] h-auto rounded-lg"
      onError={handleError}
    />
  );
}
