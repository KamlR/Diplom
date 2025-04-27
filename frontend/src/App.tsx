import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import GreetinPage from './components/GreetingPage'
import AuthorizationPage1 from './components/AuthorizationPage1'
import AuthorizationPage2 from './components/AuthorizationPage2'
import AditionalInfoForm from './components/AdditionalInfoForm'
import HomeAdminPage from './components/admin/HomeAdmin'
import HomeHRPage from './components/hr/HomeHr'
import HomeAccountantPage from './components/accountant/HomeAccountant'
import TelegamBot from './components/accountant/TelegramBot'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GreetinPage />} />
        <Route path="/authorization1" element={<AuthorizationPage1 />} />
        <Route path="/authorization2" element={<AuthorizationPage2 />} />
        <Route path="/additional-info-form" element={<AditionalInfoForm />} />
        <Route path="/home-admin" element={<HomeAdminPage />} />
        <Route path="/home-hr" element={<HomeHRPage />} />
        <Route path="/home-accountant" element={<HomeAccountantPage />} />
        <Route path="/accountant-telegramBot" element={<TelegamBot />} />
      </Routes>
    </Router>
  )
}

export default App
