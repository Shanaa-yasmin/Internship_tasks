import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

/*
 * axiosPublic — for unauthenticated requests (login, refresh).
 * No token attached. Safe to use before auth is established.
 */
export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // needed so the httpOnly refresh cookie is sent
})

/*
 * axiosPrivate — for authenticated requests.
 * Interceptors are attached in useAxiosPrivate() to access fresh token from state.
 */
export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})
