import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import abi from '../../abis/CryptoPayments.json'

import styles from '../../style/general/AuthorizationPage1.module.css'
import generalStyles from '../../style/general/General.module.css'

declare global {
  interface Window {
    ethereum?: any
  }
}

const AuthorizationPage1: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const navigate = useNavigate()

  const handlerConnectToMetamask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setErrorMessage('')
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        let resultAccess
        try {
          resultAccess = await checkAccess(accounts[0])
        } catch (error: any) {
          setErrorMessage('Ошибка в процессе проверки доступа к системе!')
          return
        }
        if (resultAccess) {
          setWalletAddress(accounts[0])
          localStorage.setItem('walletAddress', accounts[0])
          setErrorMessage(null)
        } else {
          setErrorMessage('У вас нет доступа к системе!')
        }
      } catch (error) {
        setErrorMessage('Ошибка в процессе получения адреса!')
      }
    } else {
      setErrorMessage('Установите MetaMask')
    }
  }

  // TODO: если смарт контракт упадёт, надо что-то придумать
  const checkAccess = async (walletAddress: string) => {
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const networkUrl = 'http://127.0.0.1:8545'
    const localProvider = new ethers.JsonRpcProvider(networkUrl)
    const contract = new ethers.Contract(contractAddress, abi, localProvider)
    const role = await contract.checkUserAccess(walletAddress)
    if (role == 'forbidden') {
      return false
    }
    setRole(role)
    return true
  }
  const handlerNextStep = () => {
    navigate('/authorization2', { state: { role } })
  }
  return (
    <div className={`${generalStyles.body}`}>
      <div className={`${styles.container}`}>
        <div className={`${styles.title}`}>Step 1</div>
        {walletAddress ? (
          <div className={`${styles.walletAddress}`}>
            <div>
              <div>
                <h3>Your wallet address:</h3> {walletAddress}
              </div>
            </div>
            <button onClick={handlerNextStep} className={`${styles.nextButton}`}>
              Next
            </button>
          </div>
        ) : (
          <button
            onClick={handlerConnectToMetamask}
            className={`${styles.connectButton}`}
          >
            Get wallet address from MetaMask
          </button>
        )}
        {errorMessage && <div className={`${styles.errorMessage}`}>{errorMessage}</div>}
      </div>
    </div>
  )
}
export default AuthorizationPage1
