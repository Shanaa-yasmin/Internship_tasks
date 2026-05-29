import { useEffect } from 'react'
import { axiosPrivate, axiosPublic } from '../api/axios'
import { useAuth } from '../context/AuthContext'

/*
 * useAxiosPrivate
 * ───────────────
 * Returns axiosPrivate with request + response interceptors applied.
 *
 * Why a hook? Because interceptors need access to the *current* accessToken
 * from React state. A plain module-level setup would capture a stale closure.
 * By attaching/detaching interceptors inside useEffect, we always use the
 * latest token and auth helpers.
 */
export function useAxiosPrivate() {
  const { accessToken, updateAccessToken, logout } = useAuth()

  useEffect(() => {
    /*
     * REQUEST INTERCEPTOR
     * ───────────────────
     * Attach the Authorization header before every outgoing request.
     * We read accessToken from the closure — it's always fresh because
     * useEffect re-runs whenever accessToken changes.
     */
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (accessToken && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    /*
     * RESPONSE INTERCEPTOR
     * ────────────────────
     * Handles 401 Unauthorized responses (expired access token).
     *
     * Flow:
     *  1. Request fails with 401
     *  2. Call /api/refresh (browser sends httpOnly cookie automatically)
     *  3. Backend returns a new access_token
     *  4. Update token in memory (updateAccessToken)
     *  5. Retry the original request with the new token
     *  6. If refresh also fails → logout (token revoked / session expired)
     *
     * _retry flag prevents infinite loops if the retried request also 401s.
     */
    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response, // pass through successful responses
      async (error) => {
        const originalRequest = error?.config

        if (error?.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true // mark to prevent retry loop

          try {
            const { data } = await axiosPublic.post('/api/refresh')
            const newToken = data.access_token

            updateAccessToken(newToken)

            // Patch the header on the original request and retry it
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            return axiosPrivate(originalRequest)
          } catch (refreshError) {
            // Refresh failed — session is dead, force logout
            logout()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    // Cleanup: eject interceptors when component unmounts or token changes
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept)
      axiosPrivate.interceptors.response.eject(responseIntercept)
    }
  }, [accessToken, updateAccessToken, logout])

  return axiosPrivate
}
