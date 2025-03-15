import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { workWithTokens } from '../../utils/shared'
import { Employee } from './HomeAdmin'
import styles from '../../style/AddEmployeeForm.module.css'

interface AddEmployeeFormProps {
  onAddEmployee: (newEmployee: Employee) => void
  onCnangeEmployee: (newEmployee: Employee) => void
  onDeleteEmployee: (id: string) => void
  onClose: () => void
  mode: string
  employeeFromHome: Employee
}

// TODO: если удалить человека, который только что был внесён и его id ещё не появился в объекте, то будет ошибка
const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  onAddEmployee,
  onCnangeEmployee,
  onDeleteEmployee,
  onClose,
  mode,
  employeeFromHome
}) => {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [toastColor, setToastColor] = useState('#4caf50')
  const [toastMessage, setToastMessage] = useState('')
  const [leftButtonText, setLeftButtonText] = useState('')
  const [rightButtonText, setRightButtonText] = useState('')
  const [title, setTitle] = useState('')
  const [employee, setEmployee] = useState<Employee>(employeeFromHome)

  useEffect(() => {
    if (mode == 'add') {
      setTitle('Добавление сотрудника')
      setRightButtonText('Добавить')
    } else if (mode == 'change') {
      setTitle('Редактирование сотрудника')
      setRightButtonText('Сохранить')
      setLeftButtonText('Удалить')
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setEmployee(prev => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let result
    if (mode == 'add') {
      result = await addEmployee()
    } else if (mode == 'change') {
      result = await changeEmployee()
    }
    if (result) {
      await setSuccessMessage()
    } else {
      await setErrorMessage()
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    const result = await deleteEmployee()
    if (result) {
      await setSuccessMessage()
      onDeleteEmployee(employee.id)
    } else {
      await setErrorMessage()
    }
  }

  async function addEmployee(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await axios.post('http://localhost:5001/workers', employee, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        return true
      }
    } catch (error: any) {
      console.log(error)
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await addEmployee()
        }
        return false
      }
      return false
    }
    return false
  }

  async function changeEmployee(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await axios.put('http://localhost:5001/workers', employee, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        return true
      }
    } catch (error: any) {
      console.log(error)
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await changeEmployee()
        }
        return false
      }
      return false
    }
    return false
  }

  async function deleteEmployee(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await axios.delete('http://localhost:5001/workers/' + employee.id, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: { id: employee.id }
      })
      if (response.status == 200) {
        return true
      }
    } catch (error: any) {
      console.log(error)
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await deleteEmployee()
        }
        return false
      }
      return false
    }
    return false
  }

  async function setSuccessMessage() {
    setToastMessage('✅ Успешно!')
    setToastColor('#4caf50')
    setShowToast(true)
    await new Promise<void>(resolve => {
      setTimeout(() => {
        setShowToast(false)
        resolve()
      }, 4000)
    })
    if (mode == 'add') {
      onAddEmployee(employee)
    } else if (mode == 'change') {
      onCnangeEmployee(employee)
    }
  }

  async function setErrorMessage() {
    setToastMessage('❌ Ошибка!')
    setToastColor('#E07E77FF')
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 5000)
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
          <h2>{title}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Имя:</label>
              <input type="text" name="firstName" value={employee.firstName} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Фамилия:</label>
              <input type="text" name="lastName" value={employee.lastName} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Зарплата:</label>
              <input type="number" name="salary" value={employee.salary} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Адрес кошелька:</label>
              <input type="text" name="walletAddress" value={employee.walletAddress} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Должность:</label>
              <input type="text" name="position" value={employee.position} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Отдел:</label>
              <input type="text" name="department" value={employee.department} onChange={handleChange} required />
            </div>
          </div>
          {showToast && (
            <div className={styles.toast} style={{ backgroundColor: toastColor }}>
              {toastMessage}
            </div>
          )}
          <div className={styles.buttonsWrapper}>
            {mode == 'change' && (
              <button type="button" onClick={handleDelete} className={styles.leftButton}>
                {leftButtonText}
              </button>
            )}
            <button type="submit" className={styles.rightButton}>
              {rightButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEmployeeForm
