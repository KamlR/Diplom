import axios from 'axios'
import { NavigateFunction } from 'react-router-dom'

export async function workWithTokens(error: any, navigate: NavigateFunction) {
  if (error.response.data.error === 'The authorization token is invalid') {
    navigate('/authorization1')
    return false
  } else {
    try {
      const response = await axios.get('http://localhost:5001/tokens/refresh', {
        withCredentials: true
      })
      if (response.status == 200) {
        const { accessToken } = await response.data
        console.log(accessToken)
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
    const response = await axios.get('http://localhost:5001/workers_crm/role', {
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
