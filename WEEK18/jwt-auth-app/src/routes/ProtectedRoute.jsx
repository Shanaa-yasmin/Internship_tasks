import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
 * ProtectedRoute
 * ──────────────
 * A route guard that wraps any page requiring authentication.
 *
 * Logic:
 *  - If isAuthenticated is true  → render the children (the protected page)
 *  - If isAuthenticated is false → redirect to /login
 *
 * We pass `state={{ from: location }}` so the Login page can redirect
 * the user back to the page they originally tried to visit after login.
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
