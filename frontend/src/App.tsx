import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import GreetinPage from './components/authorization/GreetingPage'
import AuthorizationPage1 from './components/authorization/AuthorizationPage1'
import AuthorizationPage2 from './components/authorization/AuthorizationPage2'
import AditionalInfoForm from './components/authorization/AdditionalInfoForm'
import HomeAdminPage from './components/admin/HomeAdmin'
import HomeHRPage from './components/hr/HomeHr'
import HomeAccountantPage from './components/accountant/HomeAccountant'
import TelegamBot from './components/authorization/TelegramBot'
import ProtectedRoute from './ProtectedRoute'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GreetinPage />} />
        <Route path="/authorization1" element={<AuthorizationPage1 />} />
        <Route path="/authorization2" element={<AuthorizationPage2 />} />
        <Route path="/additional-info-form" element={<AditionalInfoForm />} />
        <Route
          path="/home-admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <HomeAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home-accountant"
          element={
            <ProtectedRoute allowedRoles={['accountant']}>
              <HomeAccountantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home-hr"
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <HomeHRPage />
            </ProtectedRoute>
          }
        />
        <Route path="/accountant-telegramBot" element={<TelegamBot />} />
      </Routes>
    </Router>
  )
}

export default App
