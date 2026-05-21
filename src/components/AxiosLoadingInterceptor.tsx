/**
 * AxiosLoadingInterceptor
 *
 * Mounts inside the React tree so it has access to LoadingContext.
 * Attaches request/response Axios interceptors that auto-show/hide
 * the global IonLoading spinner for every API request.
 *
 * Usage: render <AxiosLoadingInterceptor /> once inside <LoadingProvider>.
 */
import { useEffect, useRef } from 'react'
import api from '../lib/Axios'
import { useLoading } from '../contexts/LoadingContext'

export function AxiosLoadingInterceptor() {
  const { show, hide } = useLoading()
  const reqInterceptor = useRef<number | null>(null)
  const resInterceptor = useRef<number | null>(null)

  useEffect(() => {
    reqInterceptor.current = api.interceptors.request.use(
      (config) => {
        show('medium')
        return config
      },
      (error) => {
        hide()
        return Promise.reject(error)
      }
    )

    resInterceptor.current = api.interceptors.response.use(
      (response) => {
        hide()
        return response
      },
      (error) => {
        hide()
        return Promise.reject(error)
      }
    )

    return () => {
      if (reqInterceptor.current !== null) api.interceptors.request.eject(reqInterceptor.current)
      if (resInterceptor.current !== null) api.interceptors.response.eject(resInterceptor.current)
    }
  }, [show, hide])

  return null
}
