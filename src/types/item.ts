export interface SecondaryUom {
  id: string | number
  uomId: string | number
  uomName?: string
  uomCode?: string
  upc: string
  conversionFactor?: number
}

export interface Item {
  id: number
  uuid: string
  organisationId?: number
  code: string
  name: string
  description: string
  price: number | string
  image: string
  baseUpc: string
  status: 0 | 1
  merchandisingData?: Record<string, any>
  brandId: number | string
  brandName?: string
  categoryId: number | string
  categoryName?: string
  tax?: number
  baseUomId: number | string
  baseUomName?: string
  secondaryUoms: SecondaryUom[]
  createdAt?: string
  updatedAt?: string
}

export interface ItemSalesChartPoint {
  label: string
  unitsSold: number
  revenue: number
  orderCount: number
}

export interface ItemSalesStats {
  chartData: ItemSalesChartPoint[]
  summary: {
    totalUnits: number
    totalRevenue: number
    totalOrders: number
  }
}

export interface ItemStockLevel {
  warehouseCode: string
  warehouseName: string
  quantity: number
}

export interface ItemForm {
  itemCode: string
  itemName: string
  description: string
  itemPrice: string | number
  brandId: string | number
  categoryId: string | number
  image: string
  status: 0 | 1
  baseUom: string | number
  baseUpc: string
  secondaryUoms: SecondaryUom[]
}
