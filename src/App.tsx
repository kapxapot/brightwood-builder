import { ReactFlowProvider } from "reactflow";
import Flow from "./components/flow";
import { Toaster } from "./components/ui/toaster";
import "../node_modules/flag-icons/css/flag-icons.min.css";

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
