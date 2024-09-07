import { useEffect, useRef, useState } from "react";
import Button from "../core/button";
import { autoHeight, focus } from "../../lib/ref-operations";
import { Delete, Edit } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";
import { useCharLimit } from "@/hooks/use-char-limit";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { popupButtonVariants } from "@/lib/motion";

type Props = {
  line: string;
  index: number;
  deletable: boolean;
  readonly?: boolean;
  charLimit?: number;
  updateLine: (updatedLine: string) => void;
  deleteLine: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
};

export default function NodeTextLine({ line, index, deletable, readonly, charLimit = 0, updateLine, deleteLine, onEditStarted, onEditFinished }: Props) {
  const { t } = useTranslation();

  const virgin = !line.length;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [editedLine, setEditedLine] = useState(line);
  const [editing, setEditing] = useState(virgin);
  const { showCharLimit, valueTooLong} = useCharLimit(editedLine, charLimit);

  const MotionButton = motion(Button);

  function startEdit() {
    if (readonly) {
      return;
    }

    setEditedLine(line);
    setEditing(true);
    onEditStarted();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    onEditFinished();

    if (!virgin) {
      setEditedLine(line);
    } else if (deletable) {
      deleteLine();
    }
  }

  function commitEdit() {
    setEditing(false);
    onEditFinished();

    updateLine(editedLine);
  }

  function updateEditedLine(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = event.currentTarget.value.trim();
    setEditedLine(value);
  }

  useEffect(() => {
    if (virgin) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    autoHeight(inputRef);
  }, [editing, editedLine]);

  const isImageUrl =
    (
      editedLine.startsWith("http://")
      || editedLine.startsWith("https://")
    ) && (
      editedLine.endsWith(".png")
      || editedLine.endsWith(".jpg")
      || editedLine.endsWith(".jpeg")
      || editedLine.endsWith(".gif")
      || editedLine.endsWith(".webp")
    );

  return (
    <>
      {/* edit */}
      {editing && (
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 mt-3 text-sm nowheel">
          <TextInputLabel>
            {t("Text line")}
          </TextInputLabel>
          <textarea
            defaultValue={editedLine}
            onChange={updateEditedLine}
            className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
            ref={inputRef}
            rows={3}
          >
          </textarea>
          {showCharLimit &&
            <div className={`text-xs ${valueTooLong ? 'text-red-500' : 'opacity-50'}`}>
              {editedLine.length} / {charLimit}
            </div>
          }
          <div className="flex gap-2 mt-1">
            <Button
              disabled={!editedLine.length || valueTooLong}
              onClick={commitEdit}
            >
              {t("Save")}
            </Button>
            {(deletable || !virgin) &&
              <Button onClick={cancelEdit}>
                {t("Cancel")}
              </Button>
            }
          </div>
        </div>
      )}
      {/* view */}
      {!editing && (
        <motion.div
          className={`relative ${!readonly && "cursor-text"} text-sm`}
          initial="hidden"
          animate="hidden"
          whileHover="visible"
        >
          {isImageUrl &&
            <img src={line} alt="" className="w-full h-auto rounded-lg" />
          }
          {!isImageUrl &&
          <p
            className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1 break-words"
            onClick={startEdit}
          >
            <span
              className={`whitespace-pre-line ${virgin && "opacity-30"}`}
              dangerouslySetInnerHTML={{ __html: line || `${t("Text line")} ${index + 1}` }}
            >
            </span>
          </p>
          }
          {!readonly && (
            <div className="absolute right-1 top-1 flex gap-1">
              <MotionButton
                size="small"
                onClick={startEdit}
                variants={popupButtonVariants}
                custom={deletable ? 2 : 1}
              >
                <Edit />
              </MotionButton>
              {deletable && (
                <MotionButton
                  size="small"
                  onClick={deleteLine}
                  variants={popupButtonVariants}
                  custom={1}
                >
                  <Delete />
                </MotionButton>
              )}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
