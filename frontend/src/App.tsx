import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import GreetinPage from './components/GreetingPage'
import AuthorizationPage1 from './components/AuthorizationPage1'
import AuthorizationPage2 from './components/AuthorizationPage2'
import AditionalInfoForm from './components/AdditionalInfoForm'
import HomeAdminPage from './components/admin/HomeAdmin'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GreetinPage />} />
        <Route path="/authorization1" element={<AuthorizationPage1 />} />
        <Route path="/authorization2" element={<AuthorizationPage2 />} />
        <Route path="/additional_info_form" element={<AditionalInfoForm />} />
        <Route path="/home_admin" element={<HomeAdminPage />} />
      </Routes>
    </Router>
  )
}

export default App
