import api from '../lib/Axios'
import { Order, OrderForm } from '../types/order'

export interface OrderListResponse {
  items: Order[]
  currentPage: number
  nextPage: number | null
}

const mapOrderItems = (items: any[] = []) =>
  items.map((item) => ({
    ...item,
    price: Number(item.price ?? item.unitPrice ?? 0),
    item: item.item ?? (item.itemName ? { id: item.itemId, name: item.itemName, code: item.itemCode } : undefined),
  }))

const mapOrder = (o: any): Order => {
  const orderItems = mapOrderItems(o.items ?? o.orderItems ?? [])

  return {
    ...o,
    orderItems,
    items: orderItems,
    customerName:
      o.customerName ??
      (o.customer ? `${o.customer.firstName ?? ''} ${o.customer.lastName ?? ''}`.trim() : undefined),
    shopName: o.shopName ?? o.customer?.shopName,
    salesmanName:
      o.salesmanName ??
      (o.salesman ? `${o.salesman.firstName ?? ''} ${o.salesman.lastName ?? ''}`.trim() : undefined),
  }
}

export const orderService = {
  list: async (params: { page?: number; perPage?: number; search?: string } = {}): Promise<OrderListResponse> => {
    const res: any = await api.get('/admin/orders', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    })
    return { ...res, items: (res.orders || res.items || []).map(mapOrder) }
  },

  get: async (uuid: string): Promise<{ data: Order }> => {
    const res: any = await api.get(`/admin/orders/${uuid}`)
    const order = res.data ?? res.item ?? res
    return { data: mapOrder(order) }
  },

  create: async (data: OrderForm): Promise<{ item: Order; message: string }> => {
    return api.post('/admin/orders', data)
  },

  update: async (uuid: string, data: Partial<OrderForm>): Promise<{ item: Order; message: string }> => {
    return api.put(`/admin/orders/${uuid}`, data)
  },

  delete: async (uuid: string): Promise<{ message: string }> => {
    return api.delete(`/admin/orders/${uuid}`)
  },
}
