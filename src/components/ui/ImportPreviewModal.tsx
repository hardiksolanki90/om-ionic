import { useState, useRef, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  X, Upload, FileSpreadsheet, Download, AlertCircle,
  CheckCircle2, AlertTriangle, Loader2, Info,
} from 'lucide-react'
import { parseImportFile } from '../../lib/parseImportFile'
import { Button } from './Button'
import { cn } from '../../lib/cn'

interface RowData extends Record<string, string> {}

interface ValidatedRow {
  data: RowData
  isValid: boolean
  errors: string[]
}

interface ImportPreviewModalProps {
  isOpen: boolean
  importing: boolean
  requiredFields: string[]
  onClose: () => void
  onConfirm: (file: File) => void
  onDownloadTemplate: () => void
}

function validateRows(rows: RowData[], requiredFields: string[]): ValidatedRow[] {
  return rows.map(row => {
    const errors: string[] = []
    for (const field of requiredFields) {
      if (!row[field] || String(row[field]).trim() === '') {
        errors.push(`"${field}" is required`)
      }
    }
    return { data: row, isValid: errors.length === 0, errors }
  })
}

export function ImportPreviewModal({
  isOpen,
  importing,
  requiredFields,
  onClose,
  onConfirm,
  onDownloadTemplate,
}: ImportPreviewModalProps) {
  const [step, setStep]           = useState<'upload' | 'preview'>('upload')
  const [rows, setRows]           = useState<ValidatedRow[]>([])
  const [headers, setHeaders]     = useState<string[]>([])
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [parsing, setParsing]     = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef              = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('upload')
    setRows([])
    setHeaders([])
    setPendingFile(null)
    setParsing(false)
    setIsDragging(false)
  }

  const handleClose = () => { reset(); onClose() }

  const processFile = async (file: File) => {
    setParsing(true)
    try {
      const parsed = await parseImportFile(file)
      const validated = validateRows(parsed.rows, requiredFields)
      setHeaders(parsed.headers)
      setRows(validated)
      setPendingFile(file)
      setStep('preview')
    } finally {
      setParsing(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [requiredFields])

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const validRows   = rows.filter(r => r.isValid).length
  const invalidRows = rows.filter(r => !r.isValid).length

  const handleConfirm = () => {
    if (!pendingFile) return
    onConfirm(pendingFile)
    reset()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) handleClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content
          className={cn(
            'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100vw-2rem)] max-w-5xl max-h-[90vh]',
            'bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/60',
            'flex flex-col animate-in fade-in zoom-in-95 duration-200'
          )}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {step === 'upload' ? 'Import from CSV / Excel' : 'Preview Import Data'}
                </Dialog.Title>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {step === 'upload'
                    ? 'Upload a file to preview records before importing'
                    : `${rows.length} records parsed · ${validRows} valid · ${invalidRows} invalid`
                  }
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-auto px-6 py-5">

            {/* ─ Step 1: Upload ─ */}
            {step === 'upload' && (
              <div className="space-y-4">
                {/* Requirements info */}
                <div className="flex gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/40">
                  <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-sky-800 dark:text-sky-300 space-y-1.5">
                    <p className="font-semibold">File Requirements</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-sky-700 dark:text-sky-400">
                      <li>Format: <span className="font-mono">.csv</span>, <span className="font-mono">.xlsx</span>, or <span className="font-mono">.xls</span> (UTF-8)</li>
                      {requiredFields.length > 0 && (
                        <li>
                          Required columns:{' '}
                          {requiredFields.map((f, i) => (
                            <span key={f}>
                              <span className="font-mono bg-sky-100 dark:bg-sky-800/50 px-1 rounded">{f}</span>
                              {i < requiredFields.length - 1 && ', '}
                            </span>
                          ))}
                        </li>
                      )}
                      <li>First row must contain column headers</li>
                      <li>Max file size: 5 MB</li>
                    </ul>
                    <button
                      onClick={onDownloadTemplate}
                      className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Sample Template
                    </button>
                  </div>
                </div>

                {/* Drag-drop zone */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    'flex flex-col items-center justify-center gap-3 py-14 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                    isDragging
                      ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10',
                    parsing && 'pointer-events-none opacity-70'
                  )}
                >
                  {parsing ? (
                    <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
                  ) : (
                    <Upload className={cn('w-10 h-10 transition-colors', isDragging ? 'text-sky-500' : 'text-slate-300 dark:text-slate-600')} />
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {parsing ? 'Parsing file…' : isDragging ? 'Drop file here' : 'Click or drag file to upload'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">CSV, XLSX, XLS · Max 5 MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* ─ Step 2: Preview table ─ */}
            {step === 'preview' && (
              <div className="space-y-4">
                {invalidRows > 0 && (
                  <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <span className="font-semibold">{invalidRows} row{invalidRows !== 1 ? 's' : ''}</span> have validation errors and will be skipped. Review below.
                    </p>
                  </div>
                )}

                <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700/60" style={{ maxHeight: '420px' }}>
                  <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/60">
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-400 w-8">#</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-slate-500 w-14">Status</th>
                        {headers.map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-500 w-40">Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr
                          key={i}
                          className={cn(
                            'border-b border-slate-100 dark:border-slate-800 transition-colors',
                            row.isValid
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              : 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                          )}
                        >
                          <td className="px-3 py-2 text-slate-400 font-mono">{i + 1}</td>
                          <td className="px-3 py-2 text-center">
                            {row.isValid
                              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                              : <AlertCircle className="w-4 h-4 text-red-500 mx-auto" />
                            }
                          </td>
                          {headers.map(h => (
                            <td key={h} className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[160px] truncate">
                              {row.data[h] ?? '—'}
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            {row.errors.length > 0 ? (
                              <div className="space-y-0.5">
                                {row.errors.map((e, ei) => (
                                  <p key={ei} className="text-red-600 dark:text-red-400">{e}</p>
                                ))}
                              </div>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700/60 flex-shrink-0">
            {/* Stats — only in preview step */}
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {step === 'preview' && rows.length > 0 && (
                <span>
                  Total: <span className="font-medium text-slate-700 dark:text-slate-200">{rows.length}</span>
                  {' · '}Valid: <span className="font-medium text-emerald-600">{validRows}</span>
                  {' · '}Invalid: <span className="font-medium text-red-500">{invalidRows}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step === 'preview' && (
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} disabled={importing}>
                Cancel
              </Button>
              {step === 'preview' && (
                <Button
                  icon={importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  onClick={handleConfirm}
                  disabled={importing || validRows === 0}
                >
                  {importing ? 'Importing…' : `Import ${validRows} Record${validRows !== 1 ? 's' : ''}`}
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
