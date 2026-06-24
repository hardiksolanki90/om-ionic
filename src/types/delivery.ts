export interface DeliveryItem {
  id: string
  itemId?: number
  itemCode?: string
  itemName: string
  uomId?: number
  uomName?: string
  availableUoms?: Array<{ id: number; name: string }>
  quantity: number
  price: number
  reason?: string
  excise: number
  discount: number
  discountType: 'percentage' | 'fixed'
  tax: number
  net: number
  total: number
}

export interface DeliveryForm {
  deliveryType: string
  customerId: string
  customerLob: string
  warehouseId: string
  warehouseName: string
  orderId: string
  deliveryCode: string
  deliveryDate: string
  deliveryTime: string
  items: DeliveryItem[]
  customerNote: string
  grossTotal: number
  totalDiscount?: number
  totalExcise: number
  netTotal: number
  totalTax: number
  totalQty: number
  rounding: number
  finalTotal: number
  reference: string
  status: 0 | 1
}

export interface DeliveryDetailItem {
  id: number
  deliveryId: number
  itemId: number
  itemCode?: string
  itemName?: string
  uomId?: number
  uomName?: string
  quantity: number
  price: number
  reason?: string
  excise: number
  discount: number
  discountType?: 'percentage' | 'fixed'
  taxAmount: number
  net?: number
  total: number
  item?: { id: number; name: string; code?: string }
}

export interface Delivery extends DeliveryForm {
  id: number
  uuid: string
  customerName?: string
  shopName?: string
  orderCode?: string
  currentStatus?: string
  customer?: { id: number; firstName: string; lastName: string; shopName?: string }
  order?: { id: number; orderCode: string; totalAmount?: number }
  deliveryItems?: DeliveryDetailItem[]
  items?: DeliveryDetailItem[]
}
