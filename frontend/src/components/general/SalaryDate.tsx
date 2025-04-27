import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { workWithTokens } from '../../utils/shared'
import Calendar from 'react-calendar'
import styles from '../../style/general/SalaryDate.module.css'

import CalendarWithTime from './CalendarWithTime'
const SalaryDate: React.FC = () => {
  const navigate = useNavigate()
  const [salaryDate, setSalaryDate] = useState<string>('')
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

  async function getCurrentSalaryDate() {
    setIsLoading(true)
    setErrorMessage('')
    const accessToken = localStorage.getItem('access_token')
    try {
      const response = await axios.get('http://localhost:5001/salary/date', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        setSalaryDate(response.data.date)
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
          <b>Дата: </b>
          {salaryDate}
          <br />
          <b className={styles.errorMessage}>{errorMessage}</b>
        </>
      )}

      {openCalendar && <Calendar />}
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
