import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  codeSettingService,
  CodeComponent,
  UpdateCodeSettingPayload,
} from '../services/codeSettingService'

/** Fetch code settings for one component */
export function useCodeSettings(component: CodeComponent) {
  return useQuery({
    queryKey: ['code-settings', component],
    queryFn: () => codeSettingService.get(component),
    staleTime: 5 * 60 * 1000, // 5 min – settings don't change often
  })
}

/** Preview the next auto-generated code for a component (no increment) */
export function useCodePreview(component: CodeComponent, enabled = true) {
  return useQuery({
    queryKey: ['code-preview', component],
    queryFn: () => codeSettingService.preview(component),
    staleTime: 0, // always fresh
    enabled,
  })
}

/** Refetch all code previews after a record is created with auto-code */
export function invalidateCodePreviews(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: ['code-preview'] })
}

/** Mutation to update a single component's code configuration */
export function useUpdateCodeSetting(component: CodeComponent) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCodeSettingPayload) =>
      codeSettingService.update(component, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code-settings', component] })
      queryClient.invalidateQueries({ queryKey: ['code-preview', component] })
    },
  })
}
