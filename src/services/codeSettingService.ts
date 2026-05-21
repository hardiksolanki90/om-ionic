import api from '../lib/Axios'

export const COMPONENTS = [
  'area',
  'brand',
  'category',
  'customer',
  'item',
  'order',
  'return',
  'salesman',
  'route',
  'uom',
  'warehouse',
] as const

export type CodeComponent = typeof COMPONENTS[number]

export interface CodeSetting {
  uuid: string | null
  component: CodeComponent
  is_auto: boolean
  prefix: string | null
  separator: string | null
  padding: number
  starting_number: number
  current_number: number
}

export interface UpdateCodeSettingPayload {
  is_auto: boolean
  prefix?: string | null
  separator?: string | null
  padding: number
  starting_number: number
}

export interface CodePreviewResponse {
  code: string | null
  is_auto: boolean
}

export const codeSettingService = {
  /** Fetch code settings for one component */
  get: (component: CodeComponent): Promise<CodeSetting> =>
    api.get(`/admin/code-settings/${component}`) as any,

  /** Update the configuration for a single component */
  update: (component: CodeComponent, payload: UpdateCodeSettingPayload): Promise<CodeSetting> =>
    api.put(`/admin/code-settings/${component}`, payload) as any,

  /** Preview the next generated code without consuming the sequence */
  preview: (component: CodeComponent): Promise<CodePreviewResponse> =>
    api.get(`/admin/code-settings/${component}/preview`) as any,
}
