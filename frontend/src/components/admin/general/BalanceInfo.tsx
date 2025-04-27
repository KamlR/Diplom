import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import styles from '../../../style/admin/BalanceInfo.module.css'
import AddToBalance from './AddToBalance'

interface BalanceInfoProps {
  component: string
  componentAddress: string
}

const BalanceInfo: React.FC<BalanceInfoProps> = ({ component, componentAddress }) => {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [balanceETH, setBalanceETH] = useState<string>('')
  const [balanceWEI, setBalanceWEI] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  useEffect(() => {
    const scaHandler = async () => {
      await getBalance()
    }
    scaHandler()
  }, [])

  async function getBalance() {
    setIsLoading(true)
    setErrorMessage('')
    setBalanceETH('-')
    setBalanceWEI('-')
    const networkUrl = 'http://127.0.0.1:8545'
    try {
      const provider = new ethers.JsonRpcProvider(networkUrl)
      const balance = await provider.getBalance(componentAddress)
      setBalanceWEI(balance.toString())
      setBalanceETH(ethers.formatEther(balance).toString())
    } catch (error: any) {
      setErrorMessage(`Ошибка получения баланса  ${component}!`)
    } finally {
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  const onClickAddToBalance = () => {
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
  }

  return (
    <div>
      <div>
        <p className={styles.title}>Текущий баланс {component}</p>
        {isLoading ? (
          <div className={styles.spinner}></div>
        ) : (
          <>
            <b>В ETH: </b>
            {balanceETH}
            <br />
            <b>В WEI: </b>
            {balanceWEI}
            <br />
            <b className={styles.errorMessage}>{errorMessage}</b>
          </>
        )}
      </div>
      <div>
        <button onClick={getBalance} className={styles.refreshButton}>
          Обновить данные
        </button>
        <button className={styles.addToBalance} onClick={onClickAddToBalance}>
          Пополнить баланс
        </button>
      </div>

      {isFormOpen && (
        <AddToBalance
          onClose={closeForm}
          receiver={component}
          receiverAddress={componentAddress}
        />
      )}
    </div>
  )
}
export default BalanceInfo
