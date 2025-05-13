import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRole } from '../../utils/shared'

import styles from '../../style/general/GreetingPage.module.css'
import generalStyles from '../../style/general/General.module.css'

const GreetinPage: React.FC = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const checkAuth = async () => {
        const accessToken = localStorage.getItem('access_token')
        if (!accessToken) {
          navigate('/authorization1')
        } else {
          const role = await getRole(navigate)
          switch (role) {
            case 'admin':
              navigate('/home-admin')
              break
            case 'hr':
              navigate('/home-hr')
              break
            case 'accountant':
              navigate('/home-accountant')
          }
        }
      }

      checkAuth()
    }, 1500) // 1 секунда

    return () => clearTimeout(timeoutId)
  }, [navigate])

  return (
    <div className={`${generalStyles.body}`}>
      <div>{<h1 className={`${styles.h1}`}>Welcome to Crypto Salary Payments!</h1>}</div>
    </div>
  )
}
export default GreetinPage
