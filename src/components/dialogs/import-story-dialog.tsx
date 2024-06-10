import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";

type State = {
  file?: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: string) => void;
}

export function ImportStoryDialog({ open, onOpenChange, onImport }: Props) {
  const [state, setState] = useState<State>({});
  const [error, setError] = useState("");
  const isValid = !error;

  useEffect(function validate() {
    if (!state.file) {
      setError("No file selected.");
    } else {
      setError("");
    }
  }, [state]);

  function fileSelected(value: string) {
    setState(state => ({
      ...state,
      file: value
    }));
  }

  function tryImport() {
    if (isValid) {
      onImport(state.file!);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import story</DialogTitle>
          <DialogDescription>
            Choose a <span className="font-bold">.json</span> story file to import.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="file"
          accept=".json"
          onChange={value => fileSelected(value.currentTarget.value)}
        />
        {!!error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={tryImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
