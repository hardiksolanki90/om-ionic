import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMyOrganisation, updateMyOrganisation } from '../services/organisationOnboardingService'
import type { OnboardingFormState } from '../types/organisationOnboarding'

export const MY_ORGANISATION_KEY = ['organisation', 'me'] as const

export function useMyOrganisation(enabled = true) {
  return useQuery({
    queryKey: MY_ORGANISATION_KEY,
    queryFn: fetchMyOrganisation,
    enabled,
  })
}

export function useUpdateMyOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OnboardingFormState) => updateMyOrganisation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ORGANISATION_KEY })
    },
  })
}
