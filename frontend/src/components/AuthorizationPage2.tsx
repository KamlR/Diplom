import React from 'react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

import styles from '../style/AuthorizationPage2.module.css'
import generalStyles from '../style/General.module.css'

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
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = provider.getSigner(walletAddress)
      const message = uuidv4().replace(/-/g, '').substring(0, 10)
      const signature = await (await signer).signMessage(message)
      try {
        const response = await axios.post('http://localhost:5001/workers_crm/authorize', {
          expectedWalletAddress: walletAddress,
          role,
          message,
          signature
        })
        if (response.status == 200) {
          setStatusMessageColor('#28d42b')
          setStatusMessage('Wallet ownership verified successfully!')
          const { accessToken, existWorker } = await response.data
          localStorage.setItem('access_token', accessToken)
          setTimeout(() => {
            if (!existWorker) {
              navigate('/additional_info_form')
            } else {
              // TODO: разобраться, куда я иду в зависимости от роли
              navigate('/home_admin')
            }
          }, 2000)
        }
      } catch (error: any) {
        setStatusMessageColor('red')
        setStatusMessage(error?.response?.data?.error || 'Signature verification failed')
      }
    }
  }
  return (
    <div className={`${generalStyles.body}`}>
      <div className={`${styles.container}`}>
        <div className={`${styles.title}`}>Step 2</div>
        <button onClick={handlerProveWalletAddress} className={`${styles.connectButton}`}>
          Prove wallet address using Metamask
        </button>
        {statusMessage && (
          <div className={`${styles.statusMessage}`} style={{ color: statusMessageColor }}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthorizationPage2
