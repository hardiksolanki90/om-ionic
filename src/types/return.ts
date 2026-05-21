export interface ReturnItem {
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

export interface ReturnForm {
  customerId: string
  routeId: string
  salesmanId: string
  returnNumber: string
  returnDate: string
  items: ReturnItem[]
  customerNote: string
  grossTotal: number
  netTotal: number
  totalTax: number
  totalQty: number
  rounding: number
  finalTotal: number
  reference: string
  status: 0 | 1
}

export interface Return extends ReturnForm {
  id: number
  uuid: string
  returnCode?: string
  customerName?: string
  shopName?: string
  salesmanName?: string
  routeName?: string
  currentStatus?: string
  customer?: { id: number; firstName: string; lastName: string; shopName?: string }
  salesman?: { id: number; firstName: string; lastName: string }
  returnItems?: any[]
}
