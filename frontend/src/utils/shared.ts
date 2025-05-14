import axios from 'axios'
import { NavigateFunction } from 'react-router-dom'

const { REACT_APP_SERVER_BASE_URL } = process.env

export async function workWithTokens(error: any, navigate: NavigateFunction) {
  if (error.response.data.error === 'The authorization token is invalid') {
    navigate('/authorization1')
    return false
  } else {
    try {
      const response = await axios.get(`${REACT_APP_SERVER_BASE_URL}/tokens/refresh`, {
        withCredentials: true
      })
      if (response.status == 200) {
        const { accessToken } = await response.data
        localStorage.setItem('access_token', accessToken)
        return true
      }
    } catch (error: any) {
      navigate('/authorization1')
      return false
    }
  }
}

export async function getRole(navigate: NavigateFunction): Promise<string> {
  const accessToken = localStorage.getItem('access_token')
  try {
    const response = await axios.get(`${REACT_APP_SERVER_BASE_URL}/workers-crm/role`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (response.status == 200) {
      return response.data.role
    }
  } catch (error: any) {
    if (error?.response?.status === 401) {
      if (await workWithTokens(error, navigate)) {
        return await getRole(navigate)
      }
    } else {
      navigate('/authorization1')
    }
  }
  return ''
}
