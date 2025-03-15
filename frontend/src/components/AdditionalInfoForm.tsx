import React from 'react'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workWithTokens } from '../utils/shared'

import styles from '../style/AdditionalInfoForm.module.css'
import generalStyles from '../style/General.module.css'

const AditionalInfoForm: React.FC = () => {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [succesMessage, setSuccesMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = await saveData()
    if (result) {
      setErrorMessage('')
      setSuccesMessage('Data saved successfully!')
      setTimeout(() => {
        navigate('/home_admin') // Переход на главную страницу
      }, 1500)
    } else {
      setErrorMessage('Error!')
    }
  }

  async function saveData(): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('access_token')
      const response = await axios.post(
        'http://localhost:5001/workers_crm/add_info',
        {
          firstName,
          lastName
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
        <h2>Additional Information</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
        {succesMessage && <p className={styles.succes_message}>{succesMessage}</p>}
        {errorMessage && <p className={styles.error_message}>{errorMessage}</p>}
      </div>
    </div>
  )
}

export default AditionalInfoForm
