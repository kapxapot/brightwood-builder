import ToolbarBlock from "./toolbar-block";

export default function Toolbar() {
  return (
    <aside className="w-24 bg-gray-200 p-2 border-r border-r-gray-300 space-y-3">
      <div>Drag 👉</div>
      <ToolbarBlock type="action" label="Action" />
      <ToolbarBlock type="skip" label="Skip" />
      <ToolbarBlock type="redirect" label="Redirect" />
      <ToolbarBlock type="finish" label="Finish" />
    </aside>
  );
};
