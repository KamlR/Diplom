import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Employee } from '../../models/employee'
import GiveAccess from '../admin/GiveAccess'
import BalanceInfo from '../admin/general/BalanceInfo'
import AddEmployeeForm from '../admin/AddEmployeeForm'
import SalaryDate from './SalaryDate'
import styles from '../../style/general/HomePage.module.css'
import { workWithTokens } from '../../utils/shared'

const REACT_APP_SMART_CONTRACT_ADDRESS: string = process.env
  .REACT_APP_SMART_CONTRACT_ADDRESS as string
const REACT_APP_BUNDLER_EOA_ADDRESS: string = process.env.REACT_APP_BUNDLER_EOA_ADDRESS as string

const REACT_APP_SERVER_BASE_URL = process.env.REACT_APP_SERVER_BASE_URL
interface HomePageProps {
  showTabs: boolean
}

const HomePage: React.FC<HomePageProps> = ({ showTabs }) => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [mode, setMode] = useState('')
  const [activeTab, setActiveTab] = useState('employees')
  const [defaultEmployee] = useState({
    _id: '',
    firstName: '',
    lastName: '',
    salary: '',
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
      const response = await axios.get(`${REACT_APP_SERVER_BASE_URL}/workers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (response.status == 200) {
        console.log(response.data.workers)
        setEmployees(response.data.workers)
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
    const id = updatedEmployee._id
    setEmployees(prevEmployees =>
      prevEmployees.map(employee =>
        employee._id === id ? { ...employee, ...updatedEmployee } : employee
      )
    )
  }

  const handleEmployeeDeleted = (id: string) => {
    setIsFormOpen(false)
    setEmployees(prevEmployees => prevEmployees.filter(employee => employee._id !== id))
  }

  const onClickLeftMenu = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className={styles.home_admin_container}>
      <aside className={styles.sidebar}>
        <nav>
          <ul>
            <li>
              <button
                onClick={() => onClickLeftMenu('employees')}
                style={{
                  backgroundColor: activeTab === 'employees' ? '#292929' : '#444'
                }}
              >
                Сотрудники
              </button>
            </li>
            {showTabs && (
              <>
                <li>
                  <button
                    onClick={() => onClickLeftMenu('access')}
                    style={{
                      backgroundColor: activeTab === 'access' ? '#292929' : '#444'
                    }}
                  >
                    Выдача доступа
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onClickLeftMenu('sca')}
                    style={{
                      backgroundColor: activeTab === 'sca' ? '#292929' : '#444'
                    }}
                  >
                    Счёт SCA
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onClickLeftMenu('bundler')}
                    style={{
                      backgroundColor: activeTab === 'bundler' ? '#292929' : '#444'
                    }}
                  >
                    Счёт Bundler
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onClickLeftMenu('salary-date')}
                    style={{
                      backgroundColor: activeTab === 'salary-date' ? '#292929' : '#444'
                    }}
                  >
                    Зарплата
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
      <main className={styles.content}>
        {activeTab === 'employees' && (
          <>
            <div className={styles.headerContainer}>
              <h2>Список сотрудников</h2>
              <button
                className={styles.addButton}
                onClick={() => onClickOpenForm('add', defaultEmployee)}
              >
                <span className={styles.plus}>+</span>
              </button>
            </div>
            <div className={styles.employee_list}>
              {errorMessage && <div className={styles.error_message}>{errorMessage}</div>}
              {employees.map(employee => (
                <div
                  className={styles.employee_card}
                  key={employee._id}
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
        {activeTab === 'access' && <GiveAccess />}
        {activeTab === 'sca' && (
          <BalanceInfo
            component="Smart Contract Account"
            componentAddress={REACT_APP_SMART_CONTRACT_ADDRESS}
          />
        )}
        {activeTab === 'bundler' && (
          <BalanceInfo component="Bundler" componentAddress={REACT_APP_BUNDLER_EOA_ADDRESS} />
        )}
        {activeTab === 'salary-date' && <SalaryDate />}
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
export default HomePage
