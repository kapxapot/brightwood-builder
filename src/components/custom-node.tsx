import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface CustomNodeProps {
  data: {
    emoji: string;
    name: string;
    job: string;
  }
}

const CustomNode = memo(function CustomNode(props: CustomNodeProps) {
  const data = props.data;

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-cyan-50 border-2 border-stone-400">
      <div className="flex">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-red-200">
          {data.emoji}
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">{data.job}</div>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-2 bg-teal-500" />
      <Handle type="source" position={Position.Right} className="w-2 bg-teal-500" />
    </div>
  );
});

export default CustomNode;
