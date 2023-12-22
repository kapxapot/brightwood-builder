import type React from "react";

type EditableInput = HTMLTextAreaElement | HTMLInputElement;
type AutoHeightableInput = Element & ElementCSSInlineStyle;

type Ref<T> = React.RefObject<T>;

export function focusAndSelect<T extends EditableInput>(ref: Ref<T>) {
  if (ref.current) {
    ref.current.focus();
    ref.current.select();
  }
}

export function autoHeight<T extends AutoHeightableInput>(ref: Ref<T>) {
  if (ref.current) {
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }
}
