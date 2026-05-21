import { PermissionMap } from './role-permissions'

export interface RoleForm {
  name: string
  description: string
  usersCount: number
  status: number

  permissions: PermissionMap
}

export interface Role {
  id: number
  uuid: string
  name: string
  description: string
  usersCount: number
  status: number
  permissions: PermissionMap
}