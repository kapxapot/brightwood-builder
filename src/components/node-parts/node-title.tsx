interface Props {
  id?: number;
  label: string | number;
  isStart?: boolean;
}

export default function NodeTitle({ id, label, isStart }: Props) {
  return (
    <div className="space-x-2">
      {id && <span className="border border-gray-500 px-2 rounded-xl bg-gray-50">{id}</span>}
      <span className="font-bold">{label}</span>
      {isStart && <span title="Start node">🚩</span>}
    </div>
  )
};
