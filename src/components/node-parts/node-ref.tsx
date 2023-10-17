interface Props {
  id?: number;
}

export default function NodeRef({ id }: Props) {
  const idStr = !!id ? String(id) : "?";

  return (
    <span className="border border-gray-500 px-1 rounded-xl bg-gray-50 opacity-30">
      {idStr}
    </span>
  );
}
