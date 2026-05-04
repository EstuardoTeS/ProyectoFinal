import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login     from './pages/login'
import Dashboard from './pages/Dashboard'
import Clients   from './pages/Clients'
import Projects  from './pages/Projects'
import Tasks     from './pages/Tasks'
import Users from './pages/Users'

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clients"   element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/projects"  element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/tasks"     element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/login" />} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
