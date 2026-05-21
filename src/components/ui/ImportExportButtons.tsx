import { Download, Upload, X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ImportResult } from '../../hooks/useImportExport'
import { ImportPreviewModal } from './ImportPreviewModal'

interface ImportExportButtonsProps {
  exporting: boolean
  importing: boolean
  result: ImportResult | null
  importModalOpen: boolean
  requiredFields: string[]
  onExport: () => void
  onDownloadTemplate: () => void
  onOpenImport: () => void
  onCloseImport: () => void
  onConfirmImport: (file: File) => void
  onClearResult: () => void
}

export function ImportExportButtons({
  exporting,
  importing,
  result,
  importModalOpen,
  requiredFields,
  onExport,
  onDownloadTemplate,
  onOpenImport,
  onCloseImport,
  onConfirmImport,
  onClearResult,
}: ImportExportButtonsProps) {
  return (
    <>
      {/* Export button */}
      <button
        disabled={exporting}
        onClick={onExport}
        className={cn(
          'flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium border transition-colors',
          'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300',
          'hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {exporting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Download className="w-4 h-4" />
        }
        Export
      </button>

      {/* Import button */}
      <button
        disabled={importing}
        onClick={onOpenImport}
        className={cn(
          'flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium border transition-colors',
          'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300',
          'hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {importing
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Upload className="w-4 h-4" />
        }
        Import
      </button>

      {/* 2-step import modal */}
      <ImportPreviewModal
        isOpen={importModalOpen}
        importing={importing}
        requiredFields={requiredFields}
        onClose={onCloseImport}
        onConfirm={onConfirmImport}
        onDownloadTemplate={onDownloadTemplate}
      />

      {/* Result toast */}
      {result && (
        <ImportResultPanel result={result} onClose={onClearResult} />
      )}
    </>
  )
}

function ImportResultPanel({ result, onClose }: { result: ImportResult; onClose: () => void }) {
  const hasFailures = result.failures.length > 0

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 w-80 rounded-xl border shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
      hasFailures
        ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/60'
        : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/60'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {hasFailures
            ? <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          }
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Import {hasFailures ? 'Partial' : 'Complete'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {result.imported} imported · {result.skipped} skipped
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {result.failures.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5">
          {result.failures.slice(0, 10).map((f, i) => (
            <div key={i} className="text-xs bg-white/60 dark:bg-slate-800/60 rounded-lg px-2.5 py-1.5 border border-amber-100 dark:border-amber-800/40">
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">Row {f.row}:</span>
              <span className="text-slate-600 dark:text-slate-300 ml-1">{f.errors.join(', ')}</span>
            </div>
          ))}
          {result.failures.length > 10 && (
            <p className="text-xs text-center text-slate-400 py-1">+{result.failures.length - 10} more errors</p>
          )}
        </div>
      )}
    </div>
  )
}
