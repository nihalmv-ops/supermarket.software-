import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { CsvImportResult } from '../../types/customer.types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);

  if (!isOpen) return null;

  // Simple and robust RFC-4180 compliant CSV parser
  const parseCsvText = (text: string): Array<Record<string, string>> => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV file must contain a header line and at least one data row.');
    }

    const parseLine = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    };

    const headers = parseLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
    const dataRows: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.every((v) => v === '')) continue;

      const rowObj: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] ? values[index].replace(/^["']|["']$/g, '') : '';
      });
      dataRows.push(rowObj);
    }

    return dataRows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setParseError('Please select a valid CSV (.csv) file.');
      return;
    }

    setParseError(null);
    setImportResult(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const rows = parseCsvText(content);
        setParsedRows(rows);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to parse CSV file.';
        setParseError(msg);
        setSelectedFile(null);
        setParsedRows([]);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setParseError(null);
    try {
      const result = await customerService.importCustomersCsv(parsedRows);
      setImportResult(result);
      if (result.importedCount > 0) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed.';
      setParseError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setImportResult(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bulk Import Customers via CSV
              </h3>
              <p className="text-xs text-slate-500">
                Upload a spreadsheet to import multiple business customer accounts at once.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Download Template Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <div className="flex items-center gap-2.5 text-xs text-indigo-900">
            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Need the official CSV format template with sample fields?</span>
          </div>
          <button
            onClick={() => customerService.downloadCsvTemplate()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" /> Download Template
          </button>
        </div>

        {parseError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Upload Drop Zone */}
        {!importResult && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : 'Click to browse or drag & drop CSV file'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports up to 500 customers per batch with automatic duplicate detection
              </p>
            </div>

            {parsedRows.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>File Parsed Successfully</span>
                  <span className="text-indigo-600">{parsedRows.length} rows ready</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Sample first customer:{' '}
                  <strong className="text-slate-700">
                    {parsedRows[0]['Customer Name'] || parsedRows[0].customerName || 'N/A'}
                  </strong>{' '}
                  ({parsedRows[0].Phone || parsedRows[0].phone || 'No phone'})
                </div>
              </div>
            )}
          </div>
        )}

        {/* Import Results Feedback */}
        {importResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Import Processing Complete</h4>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total</span>
                  <span className="text-lg font-bold text-slate-800">{importResult.totalRows}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                  <span className="text-emerald-600 block text-[10px] uppercase font-bold">Imported</span>
                  <span className="text-lg font-bold text-emerald-600">{importResult.importedCount}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-rose-200">
                  <span className="text-rose-600 block text-[10px] uppercase font-bold">Rejected</span>
                  <span className="text-lg font-bold text-rose-600">{importResult.failedCount}</span>
                </div>
              </div>
            </div>

            {/* Error table if any rows were rejected */}
            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Row-level Errors ({importResult.errors.length})</span>
                </div>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                  {importResult.errors.map((err, idx) => (
                    <div key={idx} className="p-2.5 bg-white flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                        Row {err.row}
                      </span>
                      <span className="text-rose-600 text-[11px] font-medium">{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {importResult ? 'Close' : 'Cancel'}
          </button>

          {!importResult ? (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isProcessing || parsedRows.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Import...' : `Import ${parsedRows.length} Customers`}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Upload Another File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
