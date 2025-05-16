import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNavigate } from 'react-router-dom'
import styles from '../../style/accountant/TelegramBot.module.css'
import generalStyles from '../../style/general/General.module.css'
import axios from 'axios'
import { workWithTokens } from '../../utils/shared'
import { getRole } from '../../utils/shared'

const { REACT_APP_SERVER_BASE_URL } = process.env

const TelegamBot: React.FC = () => {
  const navigate = useNavigate()
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [successToast, setSuccessToast] = useState('Уведомления успешно подключены ✅')
  const [errorToast, setErrorToast] = useState('Уведомления не подключены! ❌')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  useEffect(() => {
    fetch('/telegramBot-guide.md')
      .then(res => res.text())
      .then(text => setMarkdown(text))
      .catch(err => console.error('Ошибка загрузки markdown:', err))
  }, [])

  const checkConnectionToTelegramBot = async () => {
    setShowErrorToast(false)
    setLoading(true)
    const chatID = await getInfoAboutTelegramBotConnection()
    setLoading(false)
    if (chatID) {
      setShowSuccessToast(true)
      setTimeout(async () => {
        const role = await getRole(navigate)
        switch (role) {
          case 'admin':
            navigate('/home-admin')
            break
          case 'hr':
            navigate('/home-hr')
            break
          case 'accountant':
            navigate('/home-accountant')
        }
      }, 1000)
    } else {
      setShowErrorToast(true)
    }
  }

  async function getInfoAboutTelegramBotConnection(): Promise<string | null> {
    const accessToken = localStorage.getItem('access_token')
    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_BASE_URL}/workers-crm/check-telegrambot-connection`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
      if (response.status == 200) {
        return response.data.chatID
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await getInfoAboutTelegramBotConnection()
        }
      }
    }
    return ''
  }

  return (
    <div className={generalStyles.body}>
      <div className={styles.telegram_guide_block}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        {!showSuccessToast && !showErrorToast && <b>Проверьте, что уведомления настроены ⬇</b>}
        {loading && <div className={styles.spinner}></div>}
        {showSuccessToast && <div className={styles.success_toast}>{successToast}</div>}
        {showErrorToast && <div className={styles.erorr_toast}>{errorToast}</div>}
        <button className={styles.button_check} onClick={checkConnectionToTelegramBot}>
          Проверить
        </button>
      </div>
    </div>
  )
}
export default TelegamBot
