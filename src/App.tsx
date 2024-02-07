import { ReactFlowProvider } from "reactflow";
import Flow from "./components/flow";

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow fit={false} />
    </ReactFlowProvider>
  );
}
