import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home      from './pages/Home'
import Login     from './pages/login'
import Dashboard from './pages/Dashboard'
import Clients   from './pages/Clients'
import Projects  from './pages/Projects'
import Tasks     from './pages/Tasks'
import Users from './pages/Users'
import Audit from './pages/Audit'

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clients"   element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/projects"  element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/tasks"     element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/audit"     element={<PrivateRoute><Audit /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/" />} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
