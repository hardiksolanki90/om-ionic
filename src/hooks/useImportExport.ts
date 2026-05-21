import { useState } from 'react'
import api from '../lib/Axios'

export interface ImportFailure {
  row: number
  errors: string[]
}

export interface ImportResult {
  imported: number
  skipped: number
  failures: ImportFailure[]
}

const REQUIRED_FIELDS: Record<string, string[]> = {
  areas:     ['code', 'name'],
  brands:    ['code', 'name'],
  categories:['code', 'name'],
  uoms:      ['code', 'name'],
  routes:    ['code', 'name'],
  salesman:  ['code', 'first_name', 'last_name', 'username'],
  customers: ['code', 'name'],
  warehouses:['code', 'name'],
  items:     ['item_code', 'item_name', 'item_price'],
  orders:    ['reference', 'customer_code', 'item_code'],
  returns:   ['reference', 'customer_code', 'item_code'],
}

export function useImportExport(slug: string, organisationId?: number | null) {
  const [exporting, setExporting]           = useState(false)
  const [importing, setImporting]           = useState(false)
  const [result, setResult]                 = useState<ImportResult | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  const baseParams = organisationId ? `?organisation_id=${organisationId}` : ''

  const exportData = async () => {
    setExporting(true)
    try {
      const response = await api.get(`/admin/${slug}/export${baseParams}`, {
        responseType: 'blob',
      } as any)

      const blob = response instanceof Blob ? response : new Blob([response as any])
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${slug}_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const downloadTemplate = () => {
    const a    = document.createElement('a')
    a.href     = `/templates/${slug}_template.csv`
    a.download = `${slug}_template.csv`
    a.click()
  }

  const openImportModal  = () => setImportModalOpen(true)
  const closeImportModal = () => setImportModalOpen(false)

  // Called from modal on confirm — file already parsed/previewed client-side
  const confirmImport = async (file: File) => {
    setImporting(true)
    setImportModalOpen(false)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (organisationId) formData.append('organisation_id', String(organisationId))

      const res = await (api as any).post(`/admin/${slug}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(res as ImportResult)
      return res as ImportResult
    } finally {
      setImporting(false)
    }
  }

  return {
    exporting,
    importing,
    result,
    importModalOpen,
    requiredFields: REQUIRED_FIELDS[slug] ?? [],
    exportData,
    downloadTemplate,
    openImportModal,
    closeImportModal,
    confirmImport,
    clearResult: () => setResult(null),
  }
}
