import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import styles from '../../style/accountant/ChangeEmployeeData.module.css'
import { Employee } from '../../models/employee'
import { ToastContainer, toast } from 'react-toastify'
import { workWithTokens } from '../../utils/shared'
interface ChangeEmployeeDataProps {
  onClose: () => void
  onCnangeEmployee: (updatedEmployee: Employee) => void
  selectedEmployee: Employee
}
const ChangeEmployeeData: React.FC<ChangeEmployeeDataProps> = ({
  onClose,
  selectedEmployee,
  onCnangeEmployee
}) => {
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<Employee>(selectedEmployee)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await changeEmployee()
    if (result) {
      toast.success('Данные успешно обновлены!', {
        position: 'top-center',
        autoClose: 2000
      })
      setTimeout(() => {
        onCnangeEmployee(employee)
      }, 2000)
    } else {
      toast.error('Ошибка обновления данных!', {
        position: 'top-center',
        autoClose: 2000
      })
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setEmployee(prev => ({
      ...prev,
      [name]: value
    }))
  }
  async function changeEmployee(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const employeeToSend = {
        ...employee,
        salary: Number(employee.salary)
      }
      const response = await axios.put('http://localhost:5001/workers', employeeToSend, {
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
      }
    }
    return false
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
          <h2>Данные сотрудника</h2>
        </div>
        <ToastContainer />
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Имя:</label>
              <input
                type="text"
                name="firstName"
                value={employee.firstName}
                required
                disabled
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Фамилия:</label>
              <input
                type="text"
                name="lastName"
                value={employee.lastName}
                required
                disabled
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Зарплата:</label>
              <input
                type="number"
                name="salary"
                value={employee.salary}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Адрес кошелька:</label>
              <input
                type="text"
                name="walletAddress"
                pattern="^0x[a-fA-F0-9]{40}$"
                value={employee.walletAddress}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Должность:</label>
              <input
                type="text"
                name="position"
                value={employee.position}
                required
                disabled
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Отдел:</label>
              <input
                type="text"
                name="department"
                value={employee.department}
                required
                disabled
              />
            </div>
          </div>
          {/* {showToast && (
            <div className={styles.toast} style={{ backgroundColor: toastColor }}>
              {toastMessage}
            </div>
          )} */}
          <div className={styles.buttonsWrapper}>
            <button type="submit" className={styles.saveButton}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default ChangeEmployeeData
