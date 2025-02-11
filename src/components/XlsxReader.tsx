import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { read, utils } from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { LucideFileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { sheetsAtom } from "@/atoms/sheetsAtom";
import { fileAtom } from "@/atoms/fileAtom.ts";

const fileSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required"),
});

const REQUIRED_SHEETS = ["survey", "choices"];
const REQUIRED_SURVEY_COLUMNS = ["type", "name"];
const REQUIRED_CHOICES_COLUMNS = ["list_name", "name"];

const XlsxReader: React.FC = () => {
  const [sheets, setSheets] = useAtom(sheetsAtom);
  const [fileInfo, setFileInfo] = useAtom(fileAtom);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const form = useForm<{ file: FileList }>({
    resolver: zodResolver(fileSchema),
  });

  const validateXLSForm = (sheetsData: Record<string, any[][]>) => {
    for (const sheet of REQUIRED_SHEETS) {
      if (!sheetsData[sheet]) {
        toast.error(`Missing required sheet: ${sheet}`);
        return false;
      }
    }

    const surveyHeaders = sheetsData["survey"][0] || [];
    const choicesHeaders = sheetsData["choices"][0] || [];

    for (const col of REQUIRED_SURVEY_COLUMNS) {
      if (!surveyHeaders.includes(col)) {
        toast.error(`Missing required column in survey sheet: ${col}`);
        return false;
      }
    }

    for (const col of REQUIRED_CHOICES_COLUMNS) {
      if (!choicesHeaders.includes(col)) {
        toast.error(`Missing required column in choices sheet: ${col}`);
        return false;
      }
    }

    if (!surveyHeaders.some((col) => col.startsWith("label"))) {
      toast.error("Missing required column in survey sheet: label");
      return false;
    }

    if (!choicesHeaders.some((col) => col.startsWith("label"))) {
      toast.error("Missing required column in choices sheet: label");
      return false;
    }

    return true;
  };

  const onSubmit = (data: { file: FileList }) => {
    const file = data.file[0];
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size });

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer | null;
      if (!arrayBuffer) return;

      const workbook = read(new Uint8Array(arrayBuffer), { type: "array" });

      const sheetsData: Record<string, any[][]> = {};
      workbook.SheetNames.forEach((sheetName) => {
        const sheetData = utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        });

        const filteredData = sheetData.filter((row: any[]) =>
          row.some((cell) => cell !== null && cell !== ""),
        );

        sheetsData[sheetName] = filteredData;
      });

      if (!validateXLSForm(sheetsData)) return;

      setSheets(sheetsData);
      setActiveSheet(workbook.SheetNames[0] || null);
      toast.success("XLSForm uploaded successfully!");
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-row space-x-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row space-x-2"
        >
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormDescription>
                  Upload an XLSForm (.xlsx) file
                </FormDescription>
              </FormItem>
            )}
          />
          <Button type="submit">
            Upload
            <LucideFileSpreadsheet className="ml-2" />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default XlsxReader;
