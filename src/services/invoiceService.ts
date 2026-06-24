import api from '../lib/Axios'
import { Invoice, InvoiceForm } from '../types/invoice'

export interface InvoiceListResponse {
  items: Invoice[]
  currentPage: number
  nextPage: number | null
}

const mapInvoiceItems = (items: any[] = []) =>
  items.map((item) => ({
    ...item,
    price: Number(item.price ?? item.unitPrice ?? 0),
    item: item.item ?? (item.itemName ? { id: item.itemId, name: item.itemName, code: item.itemCode } : undefined),
  }))

const mapInvoice = (o: any): Invoice => {
  const invoiceItems = mapInvoiceItems(o.items ?? o.invoiceItems ?? [])

  return {
    ...o,
    invoiceItems,
    items: invoiceItems,
    customerName:
      o.customerName ??
      (o.customer ? `${o.customer.firstName ?? ''} ${o.customer.lastName ?? ''}`.trim() : undefined),
    shopName: o.shopName ?? o.customer?.shopName,
    orderCode: o.orderCode ?? o.order?.orderCode,
    deliveryCode: o.deliveryCode ?? o.delivery?.deliveryCode,
  }
}

export const invoiceService = {
  list: async (params: { page?: number; perPage?: number; search?: string } = {}): Promise<InvoiceListResponse> => {
    const res: any = await api.get('/admin/invoices', {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
      },
    })
    return { ...res, items: (res.invoices || res.items || []).map(mapInvoice) }
  },

  get: async (uuid: string): Promise<{ data: Invoice }> => {
    const res: any = await api.get(`/admin/invoices/${uuid}`)
    const invoice = res.data ?? res.item ?? res
    return { data: mapInvoice(invoice) }
  },

  create: async (data: InvoiceForm): Promise<{ item: Invoice; message: string }> => {
    return api.post('/admin/invoices', data)
  },

  update: async (uuid: string, data: Partial<InvoiceForm>): Promise<{ item: Invoice; message: string }> => {
    return api.put(`/admin/invoices/${uuid}`, data)
  },

  delete: async (uuid: string): Promise<{ message: string }> => {
    return api.delete(`/admin/invoices/${uuid}`)
  },
}