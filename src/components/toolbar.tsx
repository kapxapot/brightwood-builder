import Button from "./core/button";
import ToolbarBlock from "./toolbar-block";

interface Props {
  onSave: () => void;
  onLoad: () => void;
}

export default function Toolbar({ onSave, onLoad }: Props) {
  return (
    <aside className="w-32 bg-gray-200 p-2 border-r border-r-gray-300">
      <div className="space-y-3">
        <div>Drag 👉</div>
        <ToolbarBlock type="action" label="⚡ Action" />
        <ToolbarBlock type="redirect" label="🎲 Redirect" />
        <ToolbarBlock type="skip" label="🚀 Skip" />
        <ToolbarBlock type="finish" label="⛔ Finish" />
      </div>

      <div className="mt-20 space-y-3 text-center">
        <Button size="lg" onClick={onSave}>💾 Save</Button>
        <Button size="lg" onClick={onLoad}>📂 Load</Button>
      </div>
    </aside>
  );
}
