import React from 'react'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workWithTokens } from '../utils/shared'
import { ToastContainer, toast } from 'react-toastify'
import styles from '../style/general/AdditionalInfoForm.module.css'
import generalStyles from '../style/general/General.module.css'

const AditionalInfoForm: React.FC = () => {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [telegramID, setTelegramID] = useState<string>('')
  const [validData, setValidData] = useState(false)
  const [borderTelegramStyle, setBorderTelegramStyle] = useState<React.CSSProperties>({
    border: '1px solid #cccccc'
  })
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validData) {
      return
    }
    const result = await saveData()
    if (result) {
      toast.success('Данные успешно сохранены!', {
        position: 'top-center',
        autoClose: 3000
      })
      setTimeout(() => {
        navigate('/accountant-telegramBot')
      }, 2000)
    } else {
      toast.error('Ошибка сохранения данных!', {
        position: 'top-center',
        autoClose: 3000
      })
    }
  }

  const onChangeTelegramID = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTelegramID(value)
    if (value == '') {
      setValidData(false)
      setBorderTelegramStyle({ border: '1px solid #cccccc' })
      return
    }
    const regex = /^[A-Za-z][A-Za-z0-9_]{3,30}[A-Za-z0-9]$/
    const isValid = regex.test(value)
    if (!isValid) {
      setValidData(false)
      setBorderTelegramStyle({ border: '2px solid rgb(226, 68, 56)', outline: 'none' })
    } else {
      setValidData(true)
      setBorderTelegramStyle({ border: '1px solid #cccccc' })
    }
  }

  async function saveData(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await axios.post(
        'http://localhost:5001/workers_crm/add_info',
        {
          firstName,
          lastName,
          telegramID
        },
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
          return await saveData()
        }
        return false
      }
      return false
    }
    return false
  }
  return (
    <div className={`${generalStyles.body}`}>
      <div className={`${styles.container}`}>
        <h2>Заполнение данных</h2>
        <form onSubmit={handleSubmit}>
          <ToastContainer />
          <div>
            <label htmlFor="firstName">Имя:</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Введите имя"
              maxLength={35}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName">Фамилия:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Введите фамилию"
              maxLength={35}
              required
            />
          </div>
          <div>
            <label htmlFor="telegramID">Telegram (без @):</label>
            <input
              type="text"
              id="telegramID"
              value={telegramID}
              onChange={onChangeTelegramID}
              placeholder="Введите telegram"
              maxLength={35}
              style={borderTelegramStyle}
              required
            />
          </div>
          {validData ? (
            <button type="submit" className={styles.submit_button}>
              Сохранить
            </button>
          ) : (
            <button className={styles.sendMoneyButtonNotActive}>Сохранить</button>
          )}
        </form>
      </div>
    </div>
  )
}

export default AditionalInfoForm
