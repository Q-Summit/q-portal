"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/server/api/client";
import { Download, Loader2 } from "lucide-react";
import * as React from "react";

interface CsvExportButtonProps {
  filename?: string;
}

export function CsvExportButton({ filename = "shifts-export.csv" }: CsvExportButtonProps) {
  const exportMutation = api.shift.exportCsv.useMutation({
    onSuccess: (data) => {
      // Create blob with UTF-8 BOM for German Excel compatibility
      const bom = "\uFEFF";
      const blob = new Blob([bom + data.csv], {
        type: "text/csv;charset=utf-8",
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });

  const handleExport = () => {
    exportMutation.mutate();
  };

  const isPending = exportMutation.isPending;

  return (
    <Button
      onClick={handleExport}
      disabled={isPending}
      size="sm"
      variant="outline"
      className="gap-1.5"
      aria-label="Export shifts as CSV"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      <span className="hidden sm:inline">Export</span>
    </Button>
  );
}
