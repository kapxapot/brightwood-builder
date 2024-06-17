import { isEmpty } from "@/lib/common";
import { ValidationMessage } from "@/lib/validation";
import { LightBulbIcon } from "@heroicons/react/24/solid";

interface Props {
  messages: ValidationMessage[];
}

export function ValidationMessages({ messages }: Props) {
  if (isEmpty(messages)) {
    return null;
  }

  const nodeLabel = (message: ValidationMessage) => message.nodeId === 0
    ? "Story"
    : `Node ${message.nodeId}`;

  return (
    <div className="absolute bottom-4 left-16 bg-amber-50 p-2 rounded-3xl z-10">
      {messages.map((message, index) => (
        <div className="flex gap-1 p-1" key={index}>
          <LightBulbIcon className="w-6 text-amber-400" />
          <span><strong>{nodeLabel(message)}:</strong> {message.message}</span>
        </div>
      ))}
    </div>
  );
}
