import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedImport {
  headers: string[]
  rows: Record<string, string>[]
}

export async function parseImportFile(file: File): Promise<ParsedImport> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'csv' ? parseCsv(file) : parseXlsx(file)
}

function parseCsv(file: File): Promise<ParsedImport> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        resolve({
          headers: result.meta.fields ?? [],
          rows: result.data,
        })
      },
      error: reject,
    })
  })
}

async function parseXlsx(file: File): Promise<ParsedImport> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
  return {
    headers: data.length > 0 ? Object.keys(data[0]) : [],
    rows: data,
  }
}
