type Props = {
  id: number;
  label: string | number;
}

export default function NodeTitle({ id, label }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="custom-drag-handle flex min-w-0 flex-1 cursor-grab items-center gap-2">
        {id > 0 && <span className="shrink-0 rounded-xl border border-gray-500 bg-gray-50 px-2">{id}</span>}
        <span className="min-w-0 flex-1 truncate font-semibold">{label}</span>
      </div>
    </div>
  );
}
