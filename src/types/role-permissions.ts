export type Action = 'view' | 'create' | 'edit' | 'delete'

export const ALL_ACTIONS: Action[] = ['view', 'create', 'edit', 'delete']

export interface ModuleDef {
  key: string
  label: string
  actions: Action[]   // which actions are applicable for this module
}

export interface ModuleGroup {
  heading: string
  modules: ModuleDef[]
}

export type PermissionMap = Record<string, Record<Action, boolean>>

// ─── Module registry ─────────────────────────────────────────────────────────
export const MODULE_GROUPS: ModuleGroup[] = [
  {
    heading: 'General',
    modules: [
      { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
    ],
  },
  {
    heading: 'Catalog',
    modules: [
      { key: 'items',      label: 'Items',      actions: ALL_ACTIONS },
      { key: 'categories', label: 'Categories', actions: ALL_ACTIONS },
      { key: 'brands',     label: 'Brands',     actions: ALL_ACTIONS },
    ],
  },
  {
    heading: 'Operations',
    modules: [
      { key: 'customers', label: 'Customers', actions: ALL_ACTIONS },
      { key: 'orders',    label: 'Orders',    actions: ALL_ACTIONS },
      { key: 'returns',   label: 'Returns',   actions: ALL_ACTIONS },
    ],
  },
  {
    heading: 'Logistics',
    modules: [
      { key: 'areas',      label: 'Areas',      actions: ALL_ACTIONS },
      { key: 'routes',     label: 'Routes',     actions: ALL_ACTIONS },
      { key: 'warehouses', label: 'Warehouses', actions: ALL_ACTIONS },
    ],
  },
  {
    heading: 'System',
    modules: [
      { key: 'users',       label: 'Users',       actions: ALL_ACTIONS },
      { key: 'roles',       label: 'Roles',       actions: ALL_ACTIONS },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function emptyPermissions(): PermissionMap {
  const map: PermissionMap = {}
  for (const group of MODULE_GROUPS) {
    for (const mod of group.modules) {
      map[mod.key] = { view: false, create: false, edit: false, delete: false }
    }
  }
  return map
}

export function fullPermissions(): PermissionMap {
  const map: PermissionMap = {}
  for (const group of MODULE_GROUPS) {
    for (const mod of group.modules) {
      map[mod.key] = {
        view:   mod.actions.includes('view'),
        create: mod.actions.includes('create'),
        edit:   mod.actions.includes('edit'),
        delete: mod.actions.includes('delete'),
      }
    }
  }
  return map
}

export function countPermissions(p: PermissionMap | null | undefined): number {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return 0
  return Object.values(p).reduce(
    (sum, actions) => sum + Object.values(actions || {}).filter(Boolean).length,
    0
  )
}

export function isFullAccess(mod: ModuleDef, p: PermissionMap | null | undefined): boolean {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return false
  return mod.actions.every(a => p[mod.key]?.[a])
}
