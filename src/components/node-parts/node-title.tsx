type Props = {
  id: number;
  label: string | number;
}

export default function NodeTitle({ id, label }: Props) {
  return (
    <div className="space-x-2 custom-drag-handle cursor-grab">
      {id > 0 && <span className="border border-gray-500 px-2 rounded-xl bg-gray-50">{id}</span>}
      <span className="font-semibold">{label}</span>
    </div>
  )
}
