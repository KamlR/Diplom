import { useNavigate } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'
import { getRole } from './utils/shared'
import styles from './style/ProtectedRoute.module.css'

interface ProtectedRouteProps {
  allowedRoles: string[]
  children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const navigate = useNavigate()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const roleHandler = async () => {
      const role = await getRole(navigate)
      setRole(role)
      setLoading(false)
    }
    roleHandler()
  }, [navigate])

  if (loading) {
    return <div className={styles.text_block}>Загрузка...</div>
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.3rem',
          fontWeight: 'bold'
        }}
      >
        У вас нет доступа к этой странице!
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
