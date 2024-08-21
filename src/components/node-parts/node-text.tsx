import { useTranslation } from "react-i18next";
import type { StoryNode } from "../../entities/story-node";
import { toArray } from "../../lib/common";
import { addTextLine, deleteTextLine, updateTextLine } from "../../lib/node-data-mutations";
import Button from "../core/button";
import NodeTextLine from "./node-text-line";

type Props = {
  data: StoryNode;
  allowEmpty?: boolean;
  readonly?: boolean;
  onEditStarted: () => void;
  onEditFinished: () => void;
};

export default function NodeText({ data, allowEmpty, readonly, onEditStarted, onEditFinished }: Props) {
  const { t } = useTranslation();

  const text = data.text;
  const lines = toArray(text);

  return (
    <>
      {lines.map((line, index) =>
        <NodeTextLine
          key={index}
          index={index}
          line={line}
          deletable={allowEmpty || lines.length > 1}
          readonly={readonly}
          charLimit={1000}
          updateLine={updatedLine => updateTextLine(data, index, updatedLine)}
          deleteLine={() => deleteTextLine(data, index)}
          onEditStarted={onEditStarted}
          onEditFinished={onEditFinished}
        />
      )}

      <Button
        onClick={() => addTextLine(data)}
        disabled={readonly}
      >
        {t("Add text")}
      </Button>
    </>
  );
}
