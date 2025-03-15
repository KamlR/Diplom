import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../style/GiveAccess.module.css'
import { ethers } from 'ethers'
import abi from '../../abis/CryptoPayments.json'

const GiveAccess: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('')
  const [role, setRole] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState('#4caf50')
  const [showToast, setShowToast] = useState(false)

  // TODO: вынести подключение к смарт контракту
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    const networkUrl = 'http://127.0.0.1:8545'
    try {
      const localProvider = new ethers.JsonRpcProvider(networkUrl)
      const signer = await localProvider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)
      const result = await contract.giveAccessToEmployee(walletAddress, role)
      if (result) {
        setToastColor('#4caf50')
        setToastMessage('Успешно')
        setShowToast(true)
      }
    } catch (error) {
      setToastMessage('❌ Ошибка!')
      setToastColor('#E07E77FF')
      setShowToast(true)
      console.error('Ошибка при вызове контракта:', error)
    }
  }
  return (
    <div className={styles.accessForm}>
      <h2>Форма выдачи доступа</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="walletAddress">Адрес кошелька:</label>
          <input
            type="text"
            id="walletAddress"
            value={walletAddress}
            onChange={e => setWalletAddress(e.target.value)}
            placeholder="Введите адрес кошелька"
            required
          />
        </div>
        <div>
          <label htmlFor="role">Роль:</label>
          <input
            type="text"
            id="role"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Введите роль"
            required
          />
        </div>
        {showToast && (
          <div className={styles.toast} style={{ backgroundColor: toastColor }}>
            {toastMessage}
          </div>
        )}
        <button type="submit" className={styles.buttonSubmit}>
          Выдать доступ
        </button>
      </form>
    </div>
  )
}
export default GiveAccess
