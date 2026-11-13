import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { ProductImportResult } from '../../types/product.types';

interface CsvImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImportProductsModal: React.FC<CsvImportProductsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [parsedRows, setParsedRows] = useState<Record<string, unknown>[]>([]);
  const [importResult, setImportResult] = useState<ProductImportResult | null>(null);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    try {
      await productService.downloadTemplate();
    } catch {
      setError('Failed to download template. Please try again.');
    }
  };

  // Simple, robust client-side CSV parser supporting quoted cells with commas
  const parseCsvContent = (csvText: string): Record<string, unknown>[] => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (line: string): string[] => {
      const values: string[] = [];
      let inQuote = false;
      let buffer = '';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuote && line[i + 1] === '"') {
            buffer += '"';
            i++;
          } else {
            inQuote = !inQuote;
          }
        } else if (char === ',' && !inQuote) {
          values.push(buffer.trim());
          buffer = '';
        } else {
          buffer += char;
        }
      }
      values.push(buffer.trim());
      return values;
    };

    const headers = parseLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
    const records: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = parseLine(lines[i]);
      if (vals.every((v) => !v)) continue;

      const record: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        const rawVal = vals[idx] !== undefined ? vals[idx].replace(/^["']|["']$/g, '').trim() : '';
        record[header] = rawVal;
      });
      records.push(record);
    }

    return records;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.csv')) {
      setError('Please select a valid CSV file (.csv).');
      return;
    }

    setFile(selected);
    setError('');
    setImportResult(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCsvContent(text);
        if (rows.length === 0) {
          setError('No data rows found in the uploaded file.');
        } else {
          setParsedRows(rows);
        }
      } catch {
        setError('Failed to parse CSV file. Ensure standard comma-separated formatting.');
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsParsing(false);
    };
    reader.readAsText(selected);
  };

  const handleUpload = async () => {
    if (parsedRows.length === 0) return;

    try {
      setIsUploading(true);
      setError('');
      const result = await productService.importCsv(parsedRows);
      setImportResult(result);
      if (result.importedCount > 0) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setParsedRows([]);
    setImportResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-surface-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 bg-surface-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-surface-900 text-base">Bulk Import Items</h3>
              <p className="text-xs text-surface-500">
                Upload products and services in bulk using CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Download Template Banner */}
          <div className="flex items-center justify-between p-3.5 bg-brand-50/50 rounded-xl border border-brand-100">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-surface-900">Need the template?</p>
                <p className="text-[11px] text-surface-500">
                  Download our formatted sample CSV with required columns.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors flex items-center space-x-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Template</span>
            </button>
          </div>

          {/* File Upload Zone */}
          {!importResult && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-surface-200 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-500 hover:bg-surface-50/50 transition-all group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface-100 text-surface-400 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-surface-800">
                    Click to select CSV file
                  </p>
                  <p className="text-xs text-surface-400 mt-1">
                    Standard comma-separated file (.csv), maximum 500 records
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-surface-50 rounded-xl border border-surface-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-surface-900">{file.name}</p>
                      <p className="text-xs text-surface-500">
                        {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows parsed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetAll}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded hover:bg-rose-50"
                  >
                    Change file
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-base">
                      {importResult.importedCount} Imported
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">
                    Added to your active business catalog.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    importResult.failedCount > 0
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-surface-50 border-surface-200 text-surface-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle
                      className={`w-5 h-5 ${
                        importResult.failedCount > 0 ? 'text-rose-600' : 'text-surface-400'
                      }`}
                    />
                    <span className="font-bold text-base">
                      {importResult.failedCount} Failed
                    </span>
                  </div>
                  <p className="text-xs mt-1">
                    {importResult.failedCount > 0
                      ? 'Errors encountered on some rows.'
                      : 'Zero failures.'}
                  </p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="border border-rose-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-rose-100/50 font-semibold text-rose-900 text-xs">
                    Row-Level Errors ({importResult.errors.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-rose-100 text-xs">
                    {importResult.errors.map((err, idx) => (
                      <div key={idx} className="p-2.5 flex items-start space-x-2 bg-white">
                        <span className="font-bold text-rose-700 whitespace-nowrap">
                          Row {err.row}:
                        </span>
                        <span className="text-rose-800">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-50 border-t border-surface-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
          >
            {importResult ? 'Close' : 'Cancel'}
          </button>

          {!importResult && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || isParsing || parsedRows.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Importing {parsedRows.length} items...</span>
                </>
              ) : (
                <span>Import {parsedRows.length > 0 ? `(${parsedRows.length} rows)` : ''}</span>
              )}
            </button>
          )}

          {importResult && (
            <button
              type="button"
              onClick={resetAll}
              className="px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg"
            >
              Upload another file
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
