import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export function useToastMessages() {
  const { toast } = useToast();

  const showToast = useCallback(
    (message: string, status: "success" | "error" | "none") => {
      setTimeout(() => toast({
        description: (
          <div className="flex gap-2 items-center">
            {status === "success" && (
              <CheckCircleIcon className="w-9 text-green-600" />
            )}
            {status === "error" && (
              <XCircleIcon className="w-9 text-red-600" />
            )}
            <span>{message}</span>
          </div>
        )
      }));
    },
    [toast]
  );

  const showSuccess = (message: string) => showToast(message, "success");
  const showError = (message: string) => showToast(message, "error");
  const showMessage = (message: string) => showToast(message, "none");

  return { showSuccess, showError, showMessage };
}
