import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../style/accountant/HomeAccountant.module.css'
import Salary from './Salary'
import axios from 'axios'
import { Employee } from '../../models/employee'
import { workWithTokens } from '../../utils/shared'
import ChangeEmployeeData from './ChangeEmployeeData'
const HomeAccountantPage: React.FC = () => {
  const navigate = useNavigate()
  const [userOpDataAvailable, setUserOpDataAvailable] = useState(false)
  const [activeTab, setActiveTab] = useState('employees')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>({
    id: '',
    firstName: '',
    lastName: '',
    salary: '',
    walletAddress: '',
    position: '',
    department: ''
  })
  const onChangeTab = (tab: string) => {
    setActiveTab(tab)
  }
  const closeForm = () => {
    setIsFormOpen(false)
  }

  const onClickOpenForm = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsFormOpen(true)
  }

  const handleEmployeeChanged = (updatedEmployee: Employee) => {
    setIsFormOpen(false)
    const id = updatedEmployee.id
    setEmployees(prevEmployees =>
      prevEmployees.map(employee => (employee.id === id ? { ...employee, ...updatedEmployee } : employee))
    )
  }

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
        setEmployees(response.data.workers)
        console.log(response)
        setUserOpDataAvailable(response.data.userOpDataAvailable)
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

  return (
    <div className={styles.home_accountant_container}>
      <aside className={styles.sidebar}>
        <nav>
          <ul>
            <li>
              <div
                onClick={() => onChangeTab('employees')}
                style={{
                  backgroundColor: activeTab === 'employees' ? '#292929' : '#444'
                }}
              >
                Сотрудники
              </div>
            </li>
            <li>
              <div
                onClick={() => onChangeTab('salary')}
                className={styles.salaryContainer}
                style={{
                  backgroundColor: activeTab === 'salary' ? '#292929' : '#444'
                }}
              >
                Зарплата
                {userOpDataAvailable && <span className={styles.badge}>1</span>}
              </div>
            </li>
          </ul>
        </nav>
      </aside>

      <main className={styles.content}>
        {activeTab === 'employees' && (
          <>
            <div className={styles.headerContainer}>
              <h2>Список сотрудников</h2>
            </div>
            <div className={styles.employee_list}>
              {errorMessage && <div className={styles.error_message}>{errorMessage}</div>}
              {employees.map(employee => (
                <div className={styles.employee_card} key={employee.id} onClick={() => onClickOpenForm(employee)}>
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
        {activeTab == 'salary' && (
          <Salary userOpDataAvailable={userOpDataAvailable} setUserOpDataAvailable={setUserOpDataAvailable} />
        )}
      </main>

      {isFormOpen && (
        <ChangeEmployeeData
          onClose={closeForm}
          selectedEmployee={selectedEmployee}
          onCnangeEmployee={handleEmployeeChanged}
        />
      )}
    </div>
  )
}
export default HomeAccountantPage
