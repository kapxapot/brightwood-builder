interface Props {
  id?: number;
  label: string | number;
}

export default function NodeTitle({ id, label }: Props) {
  return (
    <div className="text-lg">
      {id && <span className="border border-gray-500 px-2 rounded-lg bg-gray-50">{id}</span>}
      <span className="font-bold ml-2">{label}</span>
    </div>
  )
};
