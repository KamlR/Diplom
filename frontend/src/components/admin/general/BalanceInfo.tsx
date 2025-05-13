import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import styles from '../../../style/admin/BalanceInfo.module.css'
import AddToBalance from './AddToBalance'

const { REACT_APP_JSON_RPC_SERVER_URL } = process.env

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
    try {
      const provider = new ethers.JsonRpcProvider(REACT_APP_JSON_RPC_SERVER_URL)
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
        <AddToBalance onClose={closeForm} receiver={component} receiverAddress={componentAddress} />
      )}
    </div>
  )
}
export default BalanceInfo
