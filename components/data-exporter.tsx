"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DataExporterProps<T> {
  data: T[];
  filename: string;
  headers: { key: keyof T; label: string }[];
  language: "uz" | "ru" | "en";
}

export function DataExporter<T>({
  data,
  filename,
  headers,
  language,
}: DataExporterProps<T>) {
  const texts = {
    uz: {
      export: "Export (CSV)",
    },
    ru: {
      export: "Экспорт (CSV)",
    },
    en: {
      export: "Export (CSV)",
    },
  };

  const t = texts[language];

  const exportToCsv = () => {
    if (!data || data.length === 0) {
      alert("No data to export!");
      return;
    }

    const csvRows = [];
    const headerRow = headers.map((h) => h.label).join(",");
    csvRows.push(headerRow);

    for (const item of data) {
      const values = headers.map((h) => {
        const value = item[h.key];
        // Handle potential commas in data by quoting
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button
      onClick={exportToCsv}
      className="w-full bg-transparent"
      variant="outline"
    >
      <Download className="h-4 w-4 mr-2" /> {t.export}
    </Button>
  );
}
