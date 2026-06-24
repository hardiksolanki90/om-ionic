export interface InvoiceItem {
  id: string
  itemId?: number
  itemName: string
  uomId?: number
  uomName?: string
  availableUoms?: Array<{ id: number; name: string }>
  quantity: number
  price: number
  discount: number
  discountType: 'percentage' | 'fixed'
  tax: number
  net: number
  total: number
}

export interface InvoiceForm {
  customerId: string
  orderId: string
  deliveryId?: string
  invoiceCode: string
  invoiceDate: string
  dueDate: string
  items: InvoiceItem[]
  customerNote: string
  grossTotal: number
  totalDiscount?: number
  netTotal: number
  totalTax: number
  totalQty: number
  rounding: number
  finalTotal: number
  reference: string
  status: 0 | 1
  paymentStatus: 'pending' | 'partial' | 'paid'
  paymentMethod?: string
  paidAmount: number
}

export interface InvoiceDetailItem {
  id: number
  invoiceId: number
  itemId: number
  itemName?: string
  uomId?: number
  uomName?: string
  quantity: number
  price: number
  discount: number
  discountType?: 'percentage' | 'fixed'
  taxAmount: number
  net?: number
  total: number
  item?: { id: number; name: string; code?: string }
}

export interface Invoice extends InvoiceForm {
  id: number
  uuid: string
  customerName?: string
  shopName?: string
  orderCode?: string
  deliveryCode?: string
  currentStatus?: string
  customer?: { id: number; firstName: string; lastName: string; shopName?: string }
  order?: { id: number; orderCode: string; totalAmount?: number }
  delivery?: { id: number; deliveryCode: string }
  invoiceItems?: InvoiceDetailItem[]
  items?: InvoiceDetailItem[]
}