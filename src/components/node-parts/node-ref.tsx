interface Props {
  id?: number;
}

export default function NodeRef({ id }: Props) {
  if (!id) {
    return null;
  }

  return (
    <span className="border border-gray-500 px-1 rounded-xl bg-gray-50 opacity-30">
      {id}
    </span>
  );
}
