export interface OrderItem {
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

export interface OrderForm {
  customerId: string
  routeId: string
  salesmanId: string
  orderCode: string
  orderDate: string
  items: OrderItem[]
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
}

export interface OrderDetailItem {
  id: number
  orderId: number
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

export interface Order extends OrderForm {
  id: number
  uuid: string
  customerName?: string
  shopName?: string
  salesmanName?: string
  routeName?: string
  currentStatus?: string
  customer?: { id: number; firstName: string; lastName: string; shopName?: string }
  salesman?: { id: number; firstName: string; lastName: string; idRoute?: number; routeName?: string }
  orderItems?: OrderDetailItem[]
  items?: OrderDetailItem[]
}
