import type React from "react";

type EditableInput = HTMLTextAreaElement | HTMLInputElement;
type AutoHeightableInput = Element & ElementCSSInlineStyle;

type Ref<T> = React.RefObject<T>;

export function focus<T extends HTMLOrSVGElement>(ref: Ref<T>) {
  setTimeout(() => {
    const cur = ref.current;

    if (!cur) {
      return;
    }

    cur.focus();
  });
}

export function focusAndSelect<T extends EditableInput>(ref: Ref<T>) {
  setTimeout(() => {
    const cur = ref.current;

    if (!cur) {
      return;
    }

    cur.focus();
    cur.select();
  });
}

export function autoHeight<T extends AutoHeightableInput>(ref: Ref<T>, maxHeight: number = 200) {
  if (ref.current) {
    ref.current.style.height = "auto";

    const height = Math.min(ref.current.scrollHeight, maxHeight);
    ref.current.style.height = `${height}px`;
  }
}
