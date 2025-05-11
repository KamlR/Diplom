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
    if (result[0]) {
      toast.success(result[1], {
        position: 'top-center',
        autoClose: 2000
      })
    } else {
      toast.error(result[1], {
        position: 'top-center',
        autoClose: 4000
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

  async function sendUserOperation(userOp: any): Promise<[boolean, string]> {
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
        return [true, 'Доступ выдан']
      }
    } catch (error: any) {
      if (error?.response?.status === 400) {
        let errorMessageForUser = ''
        const errorMessage = error.response?.data?.error
        switch (errorMessage) {
          case 'Not enough money in SCA deposit to pay for gas':
            errorMessageForUser =
              'На балансе смарт контракта недостаточно денег для покрытия gas за транзакцию!'
            break
          case 'Signer not found in usersWithAccess':
            errorMessageForUser =
              'Транзакция была подписана с аккаунта, у которого нет доступа к системе! Проверьте выбранный аккаунт в MetaMask!'
            break
          case 'Signer must be admin':
            errorMessageForUser = 'Данная транзакция может быть выполнена только от лица admin!'
            break
          case 'Signer must be accountant':
            errorMessageForUser =
              'Данная транзакция может быть выполнена только от лица accountant!'
            break
        }
        return [false, errorMessageForUser]
      } else {
        return [false, 'Ошибка в процессе выдачи доступа!']
      }
    }
    return [false, '']
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
