export interface UserForm {
  firstName: string
  lastName: string
  email: string
  mobile: string
  password?: string
  roleId: number | string
  roleName: string
}

export interface User {
  id: number
  uuid: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  roleId: number | string
  roleName: string
}
