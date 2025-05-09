import React from 'react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { getRole } from '../utils/shared'
import styles from '../style/general/AuthorizationPage2.module.css'
import generalStyles from '../style/general/General.module.css'

const AuthorizationPage2: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusMessageColor, setStatusMessageColor] = useState<string>('')

  const handlerProveWalletAddress = async () => {
    const walletAddress = localStorage.getItem('walletAddress')
    if (walletAddress == null || typeof window.ethereum == 'undefined') {
      navigate('/authorization1')
    } else {
      let message = '',
        signature = ''
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = provider.getSigner(walletAddress)
        message = uuidv4().replace(/-/g, '').substring(0, 10)
        signature = await (await signer).signMessage(message)
      } catch (error: any) {
        setStatusMessageColor('red')
        setStatusMessage('Ошибка в процессе получения подписи!')
        return
      }
      let existWorker: boolean
      try {
        existWorker = await authorize(walletAddress, message, signature)
      } catch (error: any) {
        setStatusMessageColor('red')
        setStatusMessage('Ошибка в процессе подтверждения адреса!')
        return
      }
      setTimeout(async () => {
        if (!existWorker) {
          navigate('/additional-info-form')
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
      }, 2000)
    }
  }

  async function authorize(
    walletAddress: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const response = await axios.post('http://localhost:5001/workers_crm/authorize', {
        expectedWalletAddress: walletAddress,
        role,
        message,
        signature
      })
      if (response.status == 200) {
        setStatusMessageColor('#4caf50')
        setStatusMessage('Владение адресом успешно подтверждено!')
        const { accessToken, existWorker } = await response.data
        localStorage.setItem('access_token', accessToken)
        return existWorker
      }
    } catch (error: any) {
      throw error
    }
    return false
  }
  return (
    <div className={`${generalStyles.body}`}>
      <div className={`${styles.container}`}>
        <div className={`${styles.title}`}>Step 2</div>
        <button onClick={handlerProveWalletAddress} className={`${styles.connectButton}`}>
          Prove wallet address using Metamask
        </button>
        {statusMessage && (
          <div
            className={`${styles.statusMessage}`}
            style={{ color: statusMessageColor }}
          >
            <b>{statusMessage}</b>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthorizationPage2
