import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { workWithTokens } from '../utils/shared'

import styles from '../style/GreetingPage.module.css'
import generalStyles from '../style/General.module.css'

const GreetinPage: React.FC = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const checkAuth = async () => {
        const accessToken = localStorage.getItem('access_token')
        if (!accessToken) {
          navigate('/authorization1')
        } else {
          const role = await getRole()
          if (role === 'admin') {
            navigate('/home_admin')
          }
        }
      }

      checkAuth()
    }, 1500) // 1 секунда

    return () => clearTimeout(timeoutId) // Очищаем таймер при размонтировании компонента
  }, [navigate]) // Добавляем `navigate` в зависимости

  const getRole = async (): Promise<string | null> => {
    const accessToken = localStorage.getItem('access_token')
    try {
      const response = await axios.get('http://localhost:5001/workers_crm/role', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        return response.data.role
      }
    } catch (error: any) {
      if (error.response.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await getRole()
        }
      } else {
        navigate('/authorization1')
      }
    }
    return ''
  }
  return (
    <div className={`${generalStyles.body}`}>
      <div>{<h1 className={`${styles.h1}`}>Welcome to Crypto Salary Payments!</h1>}</div>
    </div>
  )
}
export default GreetinPage
