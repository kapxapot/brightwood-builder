import { z } from "zod";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { BaseSyntheticEvent } from "react";

const formSchema = z.object({
  file: z.string().trim()
    .min(1, { message: "File must be selected" })
    .endsWith(".json", { message: "Only .json files are allowed" })
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => void;
}

export function ImportStoryDialog({ open, onOpenChange, onImport }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: ""
    }
  });
 
  function onSubmit(_values: z.infer<typeof formSchema>, e?: BaseSyntheticEvent) {
    if (e) {
      onOpenChange(false);
      onImport(e.target.file.files[0] as File);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import story</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".json"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a <span className="font-bold">.json</span> story file to import
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Import</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
