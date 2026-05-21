import api from '../lib/Axios'
import { Item, ItemForm, ItemSalesStats, ItemStockLevel } from '../types/item'

function toItemPayload(data: Partial<ItemForm>): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (data.itemCode != null && data.itemCode !== '') {
    payload.code = data.itemCode
  }
  if (data.itemName != null) {
    payload.name = data.itemName
  }
  if (data.description != null) {
    payload.description = data.description
  }
  if (data.itemPrice != null && data.itemPrice !== '') {
    payload.price = Number(data.itemPrice)
  }
  if (data.brandId != null && data.brandId !== '') {
    payload.brandId = data.brandId
  }
  if (data.categoryId != null && data.categoryId !== '') {
    payload.categoryId = data.categoryId
  }
  if (data.baseUom != null && data.baseUom !== '') {
    payload.baseUomId = data.baseUom
  }
  if (data.baseUpc != null) {
    payload.baseUpc = data.baseUpc
  }
  if (data.image != null) {
    payload.image = data.image
  }
  if (data.status != null) {
    payload.status = data.status
  }
  if (data.secondaryUoms != null) {
    payload.secondaryUoms = data.secondaryUoms.map(u => ({
      uomId: u.uomId,
      upc: u.upc,
      conversionFactor: u.conversionFactor ?? 1,
    }))
  }

  return payload
}

export interface ItemListResponse {
  items: Item[]
  total: number
  currentPage: number
  lastPage: number
  nextPage: number | null
  prevPage: number | null
}

export const itemService = {
  list: (params: { page?: number; perPage?: number; search?: string } = {}): Promise<ItemListResponse> =>
    api.get('/admin/items', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    }).then((r: any) => ({ ...r, items: r.items || r.items })) as any,

  get: (uuid: string): Promise<{ success: boolean; data: Item }> =>
    api.get(`/admin/items/${uuid}`) as any,

  create: (data: ItemForm): Promise<{ item: Item; message: string }> =>
    api.post('/admin/items', toItemPayload(data)) as any,

  update: (uuid: string, data: Partial<ItemForm>): Promise<{ item: Item; message: string }> =>
    api.put(`/admin/items/${uuid}`, toItemPayload(data)) as any,

  delete: (uuid: string): Promise<{ message: string }> =>
    api.delete(`/admin/items/${uuid}`) as any,

  salesStats: (uuid: string, range: string): Promise<ItemSalesStats> =>
    api.get(`/admin/items/${uuid}/sales-stats`, { params: { range } }) as Promise<ItemSalesStats>,

  stockLevels: (uuid: string): Promise<{ stockLevels: ItemStockLevel[] }> =>
    api.get(`/admin/items/${uuid}/stock-levels`) as Promise<{ stockLevels: ItemStockLevel[] }>,
}
