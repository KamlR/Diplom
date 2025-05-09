import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import axios from 'axios'
import styles from '../../style/general/CalendarForm.module.css'
import { workWithTokens } from '../../utils/shared'

interface CalendarFormProps {
  onCloseCalendar: () => void
  salaryDate: Date | null
}
const CalendarForm: React.FC<CalendarFormProps> = ({ onCloseCalendar, salaryDate }) => {
  const navigate = useNavigate()
  const [date, setDate] = useState<Date | null>(salaryDate)
  async function onClickSaveNewSalaryDate() {
    const result = await saveNewSalaryDate()
    if (result) {
      toast.success('Дата успешно обновлена!', {
        position: 'top-center',
        autoClose: 2000
      })
    } else {
      toast.error('Ошибка обновления даты!', {
        position: 'top-center',
        autoClose: 2000
      })
    }
  }
  async function saveNewSalaryDate(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await axios.put(
        'http://localhost:5001/salary/change-salary-date',
        { newDate: date?.toISOString() },
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
          return await saveNewSalaryDate()
        }
      }
    }
    return false
  }
  return (
    <div className={styles.overlay}>
      <div className={styles.formContainer}>
        <div className={styles.closeButtonDiv}>
          <button className={styles.closeButton} onClick={onCloseCalendar}>
            ×
          </button>
        </div>
        <p className={styles.title}>Выберите ближайшую дату выплат</p>
        <ToastContainer />
        <div className={styles.calendarDiv}>
          <DatePicker
            selected={date}
            onChange={d => setDate(d)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd.MM.yyyy HH:mm"
            timeCaption="Время"
            inline
          />
          <p>❗️Выбранная дата будет сохранена в UTC❗️</p>
          <div>
            Выбрана дата:{' '}
            {date
              ? date.toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'не выбрано'}
          </div>
        </div>
        <button className={styles.saveButton} onClick={onClickSaveNewSalaryDate}>
          Сохранить
        </button>
      </div>
    </div>
  )
}
export default CalendarForm
