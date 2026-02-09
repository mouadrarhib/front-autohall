export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => unknown;
}

interface ExportCsvOptions<T> {
  fileName: string;
  rows: T[];
  columns: CsvColumn<T>[];
}

const sanitizeCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const normalized =
    value instanceof Date ? value.toISOString() : typeof value === 'object' ? JSON.stringify(value) : String(value);

  return `"${normalized.replace(/"/g, '""')}"`;
};

export const exportRowsToCsv = <T,>({ fileName, rows, columns }: ExportCsvOptions<T>): void => {
  const headerLine = columns.map((column) => sanitizeCellValue(column.header)).join(',');
  const dataLines = rows.map((row) => columns.map((column) => sanitizeCellValue(column.accessor(row))).join(','));
  const csvContent = [headerLine, ...dataLines].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
