import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from '../../style/admin/GiveAccess.module.css'
import { ethers } from 'ethers'
import { ToastContainer, toast } from 'react-toastify'
import { checkData } from '../../utils/regexValidation'
import { formUserOperation } from '../../utils/accountAbstraction'

const GiveAccess: React.FC = () => {
  const [borderAddressStyle, setBorderAddressStyle] = useState<React.CSSProperties>({
    border: '1px solid #dddddd'
  })
  const [borderRoleStyle, setBorderRoleStyle] = useState<React.CSSProperties>({
    border: '1px solid #dddddd'
  })
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [validAddress, setValidAddress] = useState<boolean>(false)
  const [validRole, setValidRole] = useState<boolean>(false)

  // TODO: вынести подключение к смарт контракту
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validAddress || !validRole) {
      toast.error('Ошибка в данных для выдачи!', {
        position: 'top-center',
        autoClose: 2000
      })
      return
    }
    if (typeof window.ethereum == 'undefined') {
      toast.error('MetaMask не установлен! Он нужен для подписи.', {
        position: 'top-center',
        autoClose: 3000
      })
      return
    }
    const { userOp, userOpHash } = formUserOperation(walletAddress, role)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = provider.getSigner()
      const signature = await (await signer).signMessage(ethers.getBytes(userOpHash))
      userOp.signature = signature
    } catch (error: any) {
      toast.error('Ошибка в процессе работы с MetaMask!', {
        position: 'top-center',
        autoClose: 3000
      })
      return
    }

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

  const onChangeWalletAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWalletAddress(value)
    const regex = /^0x[a-fA-F0-9]{40}$/
    checkData(value, regex, 'give_access', setValidAddress, setBorderAddressStyle)
  }

  const onChangeRole = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setRole(value)
    const regex = /^(admin|accountant|hr)$/
    checkData(value, regex, 'give_access', setValidRole, setBorderRoleStyle)
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
            onChange={onChangeWalletAddress}
            placeholder="Введите адрес кошелька"
            style={borderAddressStyle}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Роль:</label>
          <input
            type="text"
            id="role"
            value={role}
            onChange={onChangeRole}
            placeholder="Введите роль"
            style={borderRoleStyle}
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
