import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ethers } from 'ethers'
import abi from '../../abis/CryptoPayments.json'
import styles from '../../style/general/AuthorizationPage1.module.css'
import generalStyles from '../../style/general/General.module.css'

const { REACT_APP_JSON_RPC_SERVER_URL } = process.env
const REACT_APP_SMART_CONTRACT_ADDRESS: string = process.env
  .REACT_APP_SMART_CONTRACT_ADDRESS as string
declare global {
  interface Window {
    ethereum?: any
  }
}

const AuthorizationPage1: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showMetaMaskUrl, setShowMetaMaskUrl] = useState<boolean>(false)
  const [role, setRole] = useState<string | null>(null)
  const navigate = useNavigate()

  const handlerConnectToMetamask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setErrorMessage('')
      setShowMetaMaskUrl(false)
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        let resultAccess
        try {
          resultAccess = await checkAccess(accounts[0])
        } catch (error: any) {
          setErrorMessage('Ошибка в процессе проверки доступа к системе!')
          console.log(error)
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
      setShowMetaMaskUrl(true)
      setErrorMessage('Установите MetaMask')
    }
  }

  // TODO: если смарт контракт упадёт, надо что-то придумать
  const checkAccess = async (walletAddress: string) => {
    const provider = new ethers.JsonRpcProvider(REACT_APP_JSON_RPC_SERVER_URL)
    const contract = new ethers.Contract(REACT_APP_SMART_CONTRACT_ADDRESS, abi, provider)
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
          <button onClick={handlerConnectToMetamask} className={`${styles.connectButton}`}>
            Get wallet address from MetaMask
          </button>
        )}
        {errorMessage && <div className={`${styles.errorMessage}`}>{errorMessage}</div>}
        {showMetaMaskUrl && (
          <div>
            <a
              href="https://metamask.io/download.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#007bff',
                textDecoration: 'underline',
                marginTop: '8px',
                display: 'inline-block'
              }}
            >
              https://metamask.io/download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
export default AuthorizationPage1
