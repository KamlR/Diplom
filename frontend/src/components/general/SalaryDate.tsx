import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { workWithTokens } from '../../utils/shared'
import CalendarForm from './CalendarForm'
import styles from '../../style/general/SalaryDate.module.css'

const { REACT_APP_SERVER_BASE_URL } = process.env

const SalaryDate: React.FC = () => {
  const navigate = useNavigate()
  const [salaryDate, setSalaryDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [openCalendar, setOpenCalendar] = useState<boolean>(false)

  useEffect(() => {
    const dateHandler = async () => {
      await getCurrentSalaryDate()
    }
    dateHandler()
  }, [])

  const onClickCalendar = async () => {
    setOpenCalendar(true)
  }

  const closeCalendar = () => {
    setOpenCalendar(false)
  }

  async function getCurrentSalaryDate() {
    setIsLoading(true)
    setErrorMessage('')
    const accessToken = localStorage.getItem('access_token')
    try {
      const response = await axios.get(`${REACT_APP_SERVER_BASE_URL}/salary/date`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        setSalaryDate(new Date(response.data.date))
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          await getCurrentSalaryDate()
          return
        }
      }
      setErrorMessage('Ошибка получения даты выплаты зарплат!')
    } finally {
      setTimeout(() => setIsLoading(false), 1000)
    }
  }
  return (
    <div>
      <p className={styles.title}>Текущая дата выплаты зарплаты</p>
      {isLoading ? (
        <div className={styles.spinner}></div>
      ) : (
        <>
          <b>Дата:</b>{' '}
          {salaryDate
            ? salaryDate.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'не выбрано'}
          <br />
          <b className={styles.errorMessage}>{errorMessage}</b>
        </>
      )}

      {openCalendar && <CalendarForm onCloseCalendar={closeCalendar} salaryDate={salaryDate} />}
      <div>
        <button onClick={getCurrentSalaryDate} className={styles.refreshButton}>
          Обновить данные
        </button>
        <button className={styles.addToBalance} onClick={onClickCalendar}>
          Изменить дату
        </button>
      </div>
    </div>
  )
}
export default SalaryDate
