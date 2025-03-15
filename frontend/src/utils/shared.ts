import axios from 'axios'
import { NavigateFunction } from 'react-router-dom'

export async function workWithTokens(error: any, navigate: NavigateFunction) {
  console.log(error.response.data.error)
  if (error.response.data.error === 'The authorization token is invalid') {
    navigate('/authorization1')
    return false
  } else {
    try {
      const response = await axios.get('http://localhost:5001/tokens/refresh', { withCredentials: true })
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
