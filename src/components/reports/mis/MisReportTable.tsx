import type { ReactNode } from 'react';
import { cn } from '../../../lib/cn';

const tableHeader =
  'px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700/60';

interface MisReportTableProps {
  title: string;
  icon: ReactNode;
  headers: string[];
  rows: string[][];
  maxHeight?: string;
}

export function MisReportTable({
  title,
  icon,
  headers,
  rows,
  maxHeight = 'max-h-[28rem]',
}: MisReportTableProps) {
  return (
    <section className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        {icon}
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className={cn('overflow-x-auto overflow-y-auto', maxHeight)}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
            <tr>
              {headers.map((h) => (
                <th key={h} className={tableHeader}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-3 py-8 text-center text-slate-400 text-xs"
                >
                  No data for this period
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn('px-3 py-2.5', j === 0 && 'max-w-[200px] truncate')}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
