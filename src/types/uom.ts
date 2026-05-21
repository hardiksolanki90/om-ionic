export interface UomForm {
  name: string
  code: string
  status: string
}

export interface Uom {
  id: number
  uuid: string
  name: string
  code: string
  status: string
  organisationId?: number | null
  createdAt?: string
  updatedAt?: string
}
