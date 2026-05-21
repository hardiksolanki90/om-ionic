export interface RouteRef {
  id: number
  uuid: string
  name: string
  code: string
}

export type WarehouseStatus = 'active' | 'inactive'

export function isWarehouseActive(status: WarehouseStatus | string | number | boolean | undefined): boolean {
  if (status === 'inactive' || status === 0 || status === '0' || status === false) {
    return false
  }

  return true
}

export function toWarehouseStatus(active: boolean): WarehouseStatus {
  return active ? 'active' : 'inactive'
}

export interface WarehouseDetailForm {
  id: string
  itemId: string
  itemName?: string
  uomId: string
  uomName?: string
  qty: string | number
  availableUoms?: Array<{ id: number; name: string }>
}

export interface WarehouseForm {
  code: string
  name: string
  routeIds: string[]
  address: string
  status: WarehouseStatus
  details: WarehouseDetailForm[]
}

export interface Warehouse {
  id: number
  uuid: string
  code: string
  name: string
  routes: RouteRef[]
  address: string
  status?: WarehouseStatus
  details?: WarehouseDetailForm[]
}
