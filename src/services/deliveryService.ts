import api from '../lib/Axios'
import { Delivery, DeliveryForm } from '../types/delivery'

export interface DeliveryListResponse {
  items: Delivery[]
  currentPage: number
  nextPage: number | null
}

const mapDeliveryItems = (items: any[] = []) =>
  items.map((item) => ({
    ...item,
    price: Number(item.price ?? item.unitPrice ?? 0),
    item: item.item ?? (item.itemName ? { id: item.itemId, name: item.itemName, code: item.itemCode } : undefined),
  }))

const mapDelivery = (o: any): Delivery => {
  const deliveryItems = mapDeliveryItems(o.items ?? o.deliveryItems ?? [])

  return {
    ...o,
    deliveryItems,
    items: deliveryItems,
    customerName:
      o.customerName ??
      (o.customer ? `${o.customer.firstName ?? ''} ${o.customer.lastName ?? ''}`.trim() : undefined),
    shopName: o.shopName ?? o.customer?.shopName,
    orderCode: o.orderCode ?? o.order?.orderCode,
  }
}

export const deliveryService = {
  list: async (params: { page?: number; perPage?: number; search?: string } = {}): Promise<DeliveryListResponse> => {
    const res: any = await api.get('/admin/deliveries', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    })
    return { ...res, items: (res.deliveries || res.items || []).map(mapDelivery) }
  },

  get: async (uuid: string): Promise<{ data: Delivery }> => {
    const res: any = await api.get(`/admin/deliveries/${uuid}`)
    const delivery = res.data ?? res.item ?? res
    return { data: mapDelivery(delivery) }
  },

  create: async (data: DeliveryForm): Promise<{ item: Delivery; message: string }> => {
    return api.post('/admin/deliveries', data)
  },

  update: async (uuid: string, data: Partial<DeliveryForm>): Promise<{ item: Delivery; message: string }> => {
    return api.put(`/admin/deliveries/${uuid}`, data)
  },

  delete: async (uuid: string): Promise<{ message: string }> => {
    return api.delete(`/admin/deliveries/${uuid}`)
  },
}