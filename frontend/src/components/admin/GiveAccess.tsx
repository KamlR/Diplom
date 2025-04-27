import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import styles from '../../style/admin/GiveAccess.module.css'
import { ethers } from 'ethers'
import abi from '../../abis/CryptoPayments.json'
import { ToastContainer, toast } from 'react-toastify'
import { formUserOperation } from '../../utils/shared'

const GiveAccess: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')

  // TODO: вынести подключение к смарт контракту
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (typeof window.ethereum == 'undefined') {
      toast.error('MetaMask не установлен! Он нужен для подписи.', {
        position: 'top-center',
        autoClose: 3000
      })
      return
    }
    const { userOp, userOpHash } = formUserOperation(walletAddress, role)
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = provider.getSigner()
    const signature = await (await signer).signMessage(ethers.getBytes(userOpHash))
    userOp.signature = signature

    const result = await sendUserOperation(userOp)
    if (result) {
      toast.success('Доступ выдан!', {
        position: 'top-center',
        autoClose: 2000
      })
    } else {
      toast.error('Ошибка в процессе выдачи доступа!', {
        position: 'top-center',
        autoClose: 3000
      })
    }
  }

  async function sendUserOperation(userOp: any): Promise<boolean> {
    const entryPoint = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    try {
      const response = await axios.post(
        'http://localhost:4337/send-user-operation',
        {
          userOp,
          entryPoint
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      if (response.status == 200) {
        return true
      }
    } catch (error) {
      return false
    }
    return false
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
        <button type="submit" className={styles.buttonSubmit}>
          Выдать доступ
        </button>
      </form>
      <ToastContainer />
    </div>
  )
}
export default GiveAccess
