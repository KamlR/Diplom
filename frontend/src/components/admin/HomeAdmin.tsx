import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { workWithTokens } from '../../utils/shared'

import styles from '../../style/HomeAdmin.module.css'
import AddEmployeeForm from './AddEmployeeForm'
import AuthorizationPage1 from '../AuthorizationPage1'
import GiveAccess from './GiveAccess'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  salary: number
  walletAddress: string
  position: string
  department: string
}

const HomeAdminPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [mode, setMode] = useState('')
  const [activeTab, setActiveTab] = useState('employees')
  const [defaultEmployee] = useState({
    id: '',
    firstName: '',
    lastName: '',
    salary: 0,
    walletAddress: '',
    position: '',
    department: ''
  })
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(defaultEmployee)
  const navigate = useNavigate()
  useEffect(() => {
    const employeesHandler = async () => {
      const result = await getEmployees()
      if (!result) {
        setErrorMessage('Ошибка получения списка сотрудников!')
      }
    }
    employeesHandler()
  }, [])

  async function getEmployees(): Promise<boolean> {
    const accessToken = localStorage.getItem('access_token')
    try {
      const response = await axios.get('http://localhost:5001/workers', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        setEmployees(response.data)
        return true
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        if (await workWithTokens(error, navigate)) {
          return await getEmployees()
        }
        return false
      }
      return false
    }
    return false
  }

  const onClickOpenForm = (mode_: string, employee: Employee) => {
    setSelectedEmployee(employee)
    setMode(mode_)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
  }

  const handleEmployeeAdded = (newEmployee: Employee) => {
    setIsFormOpen(false)
    setEmployees(prevEmployees => [...prevEmployees, newEmployee])
  }

  const handleEmployeeChanged = (updatedEmployee: Employee) => {
    setIsFormOpen(false)
    const id = updatedEmployee.id
    setEmployees(prevEmployees =>
      prevEmployees.map(employee => (employee.id === id ? { ...employee, ...updatedEmployee } : employee))
    )
  }

  const handleEmployeeDeleted = (id: string) => {
    setIsFormOpen(false)
    setEmployees(prevEmployees => prevEmployees.filter(employee => employee.id !== id))
  }

  const onClickEmployee = () => {
    setActiveTab('employees')
  }
  const onClickSynchronization = () => {
    setActiveTab('sync')
  }
  const onClickGiveAccess = () => {
    setActiveTab('access')
  }

  return (
    <div className={styles.home_admin_container}>
      <aside className={styles.sidebar}>
        <nav>
          <ul>
            <li>
              <button onClick={onClickEmployee}>Сотрудники</button>
            </li>
            <li>
              <button onClick={onClickSynchronization}>Синхронизация</button>
            </li>
            <li>
              <button onClick={onClickGiveAccess}>Выдача доступа</button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className={styles.content}>
        {activeTab === 'employees' && (
          <>
            <div className={styles.headerContainer}>
              <h2>Список сотрудников</h2>
              <button className={styles.addButton} onClick={() => onClickOpenForm('add', defaultEmployee)}>
                <span className={styles.plus}>+</span>
              </button>
            </div>
            <div className={styles.employee_list}>
              {employees.map(employee => (
                <div
                  className={styles.employee_card}
                  key={employee.id}
                  onClick={() => onClickOpenForm('change', employee)}
                >
                  <h3>
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p>
                    <strong>Зарплата:</strong> {employee.salary}
                  </p>
                  <p>
                    <strong>Адрес кошелька:</strong> {employee.walletAddress}
                  </p>
                  <p>
                    <strong>Должность:</strong> {employee.position}
                  </p>
                  <p>
                    <strong>Отдел:</strong> {employee.department}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'sync' && <AuthorizationPage1 />}
        {activeTab === 'access' && <GiveAccess />}
      </main>

      {isFormOpen && (
        <AddEmployeeForm
          onAddEmployee={handleEmployeeAdded}
          onCnangeEmployee={handleEmployeeChanged}
          onDeleteEmployee={handleEmployeeDeleted}
          onClose={closeForm}
          mode={mode}
          employeeFromHome={selectedEmployee}
        />
      )}
    </div>
  )
}

export default HomeAdminPage
