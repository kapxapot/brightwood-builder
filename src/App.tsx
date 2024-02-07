import { ReactFlowProvider } from "reactflow";
import Flow from "./components/flow";
import { Toaster } from "./components/ui/toaster";

export default function App() {
  return (
    <>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
      <Toaster />
    </>
  );
}
