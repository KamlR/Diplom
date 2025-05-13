import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { workWithTokens } from '../../utils/shared'
import { checkData } from '../../utils/regexValidation'
import { Employee } from '../../models/employee'
import styles from '../../style/admin/AddEmployeeForm.module.css'
import { ToastContainer, toast } from 'react-toastify'

const { REACT_APP_SERVER_BASE_URL } = process.env

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
  const [validData, setValidData] = useState(true)
  const [borderWalletAddressStyle, setBorderWalletAddressStyle] = useState<React.CSSProperties>({
    border: '1px solid #dddddd'
  })
  const [saveButtonStyle, setSaveButtonStyle] = useState<React.CSSProperties>({
    backgroundColor: '#b3c9e2'
  })
  useEffect(() => {
    if (mode == 'add') {
      setTitle('Добавление сотрудника')
      setRightButtonText('Добавить')
    } else if (mode == 'change') {
      setSaveButtonStyle({ backgroundColor: '#4A90E2' })
      setTitle('Редактирование сотрудника')
      setRightButtonText('Сохранить')
      setLeftButtonText('Удалить')
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedEmployee = {
      ...employee,
      [name]: value
    }

    setEmployee(updatedEmployee)
    if (name == 'walletAddress') {
      const regex = /^0x[a-fA-F0-9]{40}$/
      checkData(value, regex, 'employee', setValidData, setBorderWalletAddressStyle)
    }
    if (validData && checkFieldsForEmpty(updatedEmployee)) {
      setSaveButtonStyle({ backgroundColor: '#4A90E2' })
    } else {
      setSaveButtonStyle({ backgroundColor: '#b3c9e2' })
    }
  }

  function checkFieldsForEmpty(employee: Employee): boolean {
    return (Object.keys(employee) as (keyof Employee)[]).every(key => {
      if (key == '_id') {
        return true
      }
      const value = employee[key]
      return value !== ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validData) {
      toast.error('Ошибка в адресе кошелька!', {
        position: 'top-center',
        autoClose: 2000
      })
      return
    }
    let result
    if (mode == 'add') {
      result = await addEmployee()
    } else if (mode == 'change') {
      result = await changeEmployee()
    }
    if (result) {
      await setSuccessMessage(result.toString())
    } else {
      await setErrorMessage()
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    const result = await deleteEmployee()
    if (result) {
      await setSuccessMessage()
      onDeleteEmployee(employee._id)
    } else {
      await setErrorMessage()
    }
  }

  async function addEmployee(): Promise<string | null> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const employeeToSend = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        salary: Number(employee.salary),
        walletAddress: employee.walletAddress,
        position: employee.position,
        department: employee.department
      }
      const response = await axios.post(`${REACT_APP_SERVER_BASE_URL}/workers`, employeeToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        return response.data.worker._id
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await addEmployee()
        }
      }
    }
    return null
  }

  async function changeEmployee(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const employeeToSend = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        salary: Number(employee.salary),
        walletAddress: employee.walletAddress,
        position: employee.position,
        department: employee.department
      }
      const response = await axios.put(
        `${REACT_APP_SERVER_BASE_URL}/workers/${employee._id}`,
        employeeToSend,
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
      console.log(error)
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await changeEmployee()
        }
      }
    }
    return false
  }

  async function deleteEmployee(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await axios.delete(`${REACT_APP_SERVER_BASE_URL}/workers/${employee._id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        return true
      }
    } catch (error: any) {
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

  async function setSuccessMessage(id: string = '') {
    setToastMessage('✅ Успешно!')
    setToastColor('#4caf50')
    setShowToast(true)
    await new Promise<void>(resolve => {
      setTimeout(() => {
        setShowToast(false)
        resolve()
      }, 1000)
    })
    if (mode == 'add') {
      const employeeWithId = {
        ...employee,
        ['_id']: id
      }
      onAddEmployee(employeeWithId)
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
    }, 2000)
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
              <input
                type="text"
                name="firstName"
                value={employee.firstName}
                onChange={handleChange}
                maxLength={35}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Фамилия:</label>
              <input
                type="text"
                name="lastName"
                value={employee.lastName}
                onChange={handleChange}
                maxLength={35}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Зарплата:</label>
              <input
                type="number"
                name="salary"
                value={employee.salary}
                onChange={handleChange}
                maxLength={35}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Адрес кошелька:</label>
              <input
                type="text"
                name="walletAddress"
                value={employee.walletAddress}
                onChange={handleChange}
                style={borderWalletAddressStyle}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Должность:</label>
              <input
                type="text"
                name="position"
                value={employee.position}
                onChange={handleChange}
                maxLength={35}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Отдел:</label>
              <input
                type="text"
                name="department"
                value={employee.department}
                onChange={handleChange}
                maxLength={35}
                required
              />
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
            <button type="submit" className={styles.rightButton} style={saveButtonStyle}>
              {rightButtonText}
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  )
}

export default AddEmployeeForm
