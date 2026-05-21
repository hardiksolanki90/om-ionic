import { cn } from '../../lib/cn'
import {
  MODULE_GROUPS, ALL_ACTIONS, Action, ModuleDef,
  PermissionMap, isFullAccess,
} from '../../types/role-permissions'

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({
  checked, indeterminate, disabled, onChange,
}: {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className={cn('flex items-center justify-center cursor-pointer', disabled && 'cursor-not-allowed opacity-30')}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        ref={el => { if (el) el.indeterminate = !!indeterminate }}
      />
      <span className={cn(
        'w-4 h-4 rounded flex items-center justify-center border transition-all duration-150',
        checked || indeterminate
          ? 'bg-brand-500 border-brand-500'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-brand-400',
        disabled && 'pointer-events-none',
      )}>
        {checked && !indeterminate && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {indeterminate && (
          <span className="w-2 h-0.5 bg-white rounded-full" />
        )}
      </span>
    </label>
  )
}

// ─── Module row ───────────────────────────────────────────────────────────────
function ModuleRow({
  mod, perms, onChange,
}: {
  mod: ModuleDef
  perms: PermissionMap
  onChange: (key: string, action: Action | 'full', value: boolean) => void
}) {
  const full = isFullAccess(mod, perms)
  const someActive = mod.actions.some(a => perms[mod.key]?.[a])
  const indeterminate = !full && someActive

  return (
    <tr className="group border-b border-slate-100 dark:border-slate-700/60 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
      {/* Module label */}
      <td className="py-2.5 pl-4 pr-3 text-sm text-slate-700 dark:text-slate-300 font-medium w-44">
        {mod.label}
      </td>

      {/* Action columns */}
      {ALL_ACTIONS.map(action => (
        <td key={action} className="py-2.5 px-3 text-center w-20">
          {mod.actions.includes(action) ? (
            <Checkbox
              checked={!!perms[mod.key]?.[action]}
              onChange={v => onChange(mod.key, action, v)}
            />
          ) : (
            <span className="text-slate-200 dark:text-slate-700 text-xs select-none">—</span>
          )}
        </td>
      ))}

      {/* Full Access column */}
      <td className="py-2.5 px-3 text-center w-24">
        <Checkbox
          checked={full}
          indeterminate={indeterminate}
          onChange={v => onChange(mod.key, 'full', v)}
        />
      </td>
    </tr>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface PermissionMatrixProps {
  value: PermissionMap
  onChange: (p: PermissionMap) => void
}

export function PermissionMatrix({ value, onChange }: PermissionMatrixProps) {

  function handleChange(key: string, action: Action | 'full', checked: boolean) {
    const next = { ...value, [key]: { ...value[key] } }

    if (action === 'full') {
      // Find module def to know applicable actions
      for (const g of MODULE_GROUPS) {
        const mod = g.modules.find(m => m.key === key)
        if (mod) {
          for (const a of mod.actions) next[key][a] = checked
          break
        }
      }
    } else {
      next[key][action] = checked
    }

    onChange(next)
  }

  // Column-level "Full Access" toggle (all modules)
  function handleColumnFull(checked: boolean) {
    const next = { ...value }
    for (const g of MODULE_GROUPS) {
      for (const mod of g.modules) {
        next[mod.key] = { ...next[mod.key] }
        for (const a of mod.actions) next[mod.key][a] = checked
      }
    }
    onChange(next)
  }

  // Per-action column toggle
  function handleColumnAction(action: Action, checked: boolean) {
    const next = { ...value }
    for (const g of MODULE_GROUPS) {
      for (const mod of g.modules) {
        if (mod.actions.includes(action)) {
          next[mod.key] = { ...next[mod.key], [action]: checked }
        }
      }
    }
    onChange(next)
  }

  // Derive column-level states
  function colState(action: Action) {
    const applicable = MODULE_GROUPS.flatMap(g => g.modules).filter(m => m.actions.includes(action))
    const allOn = applicable.every(m => value[m.key]?.[action])
    const someOn = applicable.some(m => value[m.key]?.[action])
    return { checked: allOn, indeterminate: !allOn && someOn }
  }

  const allModules = MODULE_GROUPS.flatMap(g => g.modules)
  const allFull = allModules.every(m => isFullAccess(m, value))
  const someFull = allModules.some(m => isFullAccess(m, value))

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          {/* Column headers */}
          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60">
            <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-44">
              Module
            </th>
            {ALL_ACTIONS.map(action => (
              <th key={action} className="py-2.5 px-3 text-center w-20">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </span>
                  <Checkbox
                    {...colState(action)}
                    onChange={v => handleColumnAction(action, v)}
                  />
                </div>
              </th>
            ))}
            {/* Full Access header — visually separated */}
            <th className="py-2.5 px-3 text-center w-24 border-l border-slate-200 dark:border-slate-700/60 bg-brand-50 dark:bg-brand-900/20">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Full
                </span>
                <Checkbox
                  checked={allFull}
                  indeterminate={!allFull && someFull}
                  onChange={handleColumnFull}
                />
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {MODULE_GROUPS.map(group => (
            <>
              {/* Group heading row */}
              <tr key={group.heading} className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/60">
                <td
                  colSpan={6}
                  className="py-1.5 pl-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                >
                  {group.heading}
                </td>
              </tr>

              {/* Module rows */}
              {group.modules.map(mod => (
                <ModuleRow
                  key={mod.key}
                  mod={mod}
                  perms={value}
                  onChange={handleChange}
                />
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
