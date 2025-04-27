import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import styles from '../../style/accountant/Salary.module.css'
import { workWithTokens } from '../../utils/shared'
import axios from 'axios'
import { ethers } from 'ethers'
interface SalaryProps {
  userOpDataAvailable: boolean
  setUserOpDataAvailable: React.Dispatch<React.SetStateAction<boolean>>
}
const Salary: React.FC<SalaryProps> = ({ userOpDataAvailable, setUserOpDataAvailable }) => {
  const [markdown, setMarkdown] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/salary-guide.md')
      .then(res => res.text())
      .then(text => setMarkdown(text))
      .catch(err => console.error('Ошибка загрузки markdown:', err))
  }, [])

  const onClickShowGuideHandler = () => {
    if (showGuide) {
      setShowGuide(false)
    } else {
      setShowGuide(true)
    }
  }

  const onClickSighUserOp = async () => {
    setErrorMessage('')
    const userOpHash = await getUserOpHash()
    if (userOpHash) {
      await signUserOpWithMetaMask(userOpHash)
    } else {
      setErrorMessage('Ошибка получения user operation hash')
    }
  }

  const signUserOpWithMetaMask = async (userOpHash: string) => {
    const walletAddress = localStorage.getItem('walletAddress')
    if (walletAddress == null || typeof window.ethereum == 'undefined') {
      navigate('/authorization1')
    } else {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = provider.getSigner(walletAddress)
        const signature = await (await signer).signMessage(ethers.getBytes(userOpHash))
        const result = await sendSignatureOfUserOpHash(signature)
        if (!result) {
          setErrorMessage('Ошибка отправки подписи на сервер')
        } else {
          setUserOpDataAvailable(false)
          setSuccessMessage(
            'Подпись успешно обработана. Как только все бухгалтеры подпишут User Operation, транзакция будет отправлена. Вы получите уведомление в telegramBot'
          )
        }
      } catch (error) {
        setErrorMessage('Ошибка подписи user operations через Metamask')
      }
    }
  }

  async function sendSignatureOfUserOpHash(signature: string): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await axios.post(
        'http://localhost:5001/salary/sign-salary-userop',
        { signature },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
      if (response.status == 200) {
        return true
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await sendSignatureOfUserOpHash(signature)
        }
      }
    }
    return false
  }

  const getUserOpHash = async (): Promise<string | null> => {
    const accessToken = localStorage.getItem('access_token')
    try {
      const response = await axios.get('http://localhost:5001/salary/user-op-hash', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        return response.data.userOpHash
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await getUserOpHash()
        }
      }
    }
    return null
  }
  return (
    <div>
      <div
        className={`${styles.show_guide} ${showGuide ? styles.show_guide_open : styles.show_guide_close}`}
        onClick={onClickShowGuideHandler}
      >
        {showGuide ? <b>Скрыть инструкцию ⬆️</b> : <b>Показать инструкцию ⬇️</b>}
      </div>
      <div className={`${styles.salary_guide_block} ${showGuide ? styles.open : styles.closed}`}>
        <div>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
      <div className={styles.userop_hash_error}>{errorMessage}</div>
      <div className={styles.userop_hash_success}>{successMessage}</div>
      {userOpDataAvailable && (
        <button className={styles.sign_userop_process} onClick={onClickSighUserOp}>
          Подписать транзакцию
        </button>
      )}
    </div>
  )
}
export default Salary
