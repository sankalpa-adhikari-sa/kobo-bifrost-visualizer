import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileSpreadsheetIcon } from "lucide-react";
import XlsxReader from "@/components/XlsxReader.tsx";

export function UploadDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {" "}
          <FileSpreadsheetIcon /> Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add XLSForm</DialogTitle>
          <DialogDescription>Visualize your XLSForm.</DialogDescription>
        </DialogHeader>
        <XlsxReader />
      </DialogContent>
    </Dialog>
  );
}
