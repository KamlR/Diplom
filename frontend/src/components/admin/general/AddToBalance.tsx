import React, { useEffect, useState } from 'react'
import styles from '../../../style/admin/AddToBalance.module.css'
import { ToastContainer, toast } from 'react-toastify'
import { ethers } from 'ethers'
import { checkData } from '../../../utils/regexValidation'

interface AddToBalance {
  onClose: () => void
  receiver: string
  receiverAddress: string
}

const AddToBalance: React.FC<AddToBalance> = ({ onClose, receiver, receiverAddress }) => {
  const [borderAddressStyle, setBorderAddressStyle] = useState<React.CSSProperties>({
    border: '2px solid #4A90E2'
  })
  const [borderMoneyStyle, setBorderMoneyStyle] = useState<React.CSSProperties>({
    border: '2px solid #4A90E2'
  })
  const [money, setMoney] = useState<string>('')
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [validAddress, setValidAddress] = useState<boolean>(false)
  const [validMoney, setValidMoney] = useState<boolean>(false)
  const handleInputAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWalletAddress(value)
    const regex = /^0x[a-fA-F0-9]{40}$/
    checkData(value, regex, '', setValidAddress, setBorderAddressStyle)
  }
  const handleInputMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMoney(value)
    const regex = /^(?:0|[1-9]\d*)(?:\.\d+)?$/
    checkData(value, regex, '', setValidMoney, setBorderMoneyStyle)
  }

  async function onClickSendMoney() {
    if (typeof window.ethereum == 'undefined') {
      toast.error('MetaMask не установлен!', {
        position: 'top-center',
        autoClose: 2000
      })
      return
    }
    const accounts: string[] = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    const targetAddress = walletAddress.toLowerCase()
    if (!accounts.map((a: string) => a.toLowerCase()).includes(targetAddress)) {
      toast.error('Адрес указанного аккаунта не найден в MetaMask!', {
        position: 'top-center',
        autoClose: 3000
      })
      return
    }
    if (accounts[0] !== targetAddress) {
      toast.error('Выберите в MetaMask аккаунт с указанным адресом!', {
        position: 'top-center',
        autoClose: 3000
      })
      return
    }
    try {
      await sendETH()
      toast.success(`ETH успешно отправлены на баланс ${receiver}!`, {
        position: 'top-center',
        autoClose: 2000
      })
    } catch (error: any) {
      toast.error(`Ошибка отправки ETH на баланс ${receiver}!`, {
        position: 'top-center',
        autoClose: 3000
      })
    }
  }

  // TODO: ошибка не вылетает, если нода не запущена
  async function sendETH() {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const tx = await signer.sendTransaction({
      to: receiverAddress,
      value: ethers.parseEther(money)
    })
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.formContainer}>
        <div className={styles.closeButtonDiv}>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div>
          <h2>Пополение баланса {receiver}</h2>
        </div>
        <div className={styles.address}>
          <b>Введите адрес кошелька, с которого будет производиться пополнение:</b>
          <input
            type="text"
            placeholder="Введите адрес кошелька"
            value={walletAddress}
            className={styles.inputAddress}
            style={borderAddressStyle}
            onChange={handleInputAddressChange}
          />
          <p className={styles.example}>
            <b>Пример: </b>0x8dE3f843ADBCaBbc50a8fDFEa84499c2842d9641
          </p>
        </div>

        <div className={styles.money}>
          <b>Введите сумму пополнения в ETH</b>
          <input
            type="text"
            placeholder="Сумма пополнения в ETH"
            value={money}
            className={styles.inputAddress}
            style={borderMoneyStyle}
            onChange={handleInputMoneyChange}
          />
          <p className={styles.example}>
            <b>Пример: </b>0.03
          </p>
        </div>
        <ToastContainer />
        {validAddress && validMoney ? (
          <button className={styles.sendMoneyButton} onClick={onClickSendMoney}>
            Перевести
          </button>
        ) : (
          <button className={styles.sendMoneyButtonNotActive}>Перевести</button>
        )}
      </div>
    </div>
  )
}
export default AddToBalance
