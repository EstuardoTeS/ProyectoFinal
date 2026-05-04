import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Login() {
  const [tab,      setTab]      = useState('login')
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [company,  setCompany]  = useState('')
  const [password, setPassword] = useState('')
  const [msg,      setMsg]      = useState({ text:'', ok:true })
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setMsg({ text:'', ok:true })
    try {
      const res = await api.post('/auth/login/', { username, password })
      localStorage.setItem('token',    res.data.access)
      localStorage.setItem('role',     res.data.role ?? 'user')
      localStorage.setItem('username', username)
      navigate('/dashboard')
    } catch {
      setMsg({ text:'Usuario o contraseña incorrectos', ok:false })
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setMsg({ text:'', ok:true })
    try {
      await api.post('/users/', { username, email, phone, company, password, role: 'client' })
      setMsg({ text:'Cliente registrado correctamente. Ya puedes iniciar sesión.', ok:true })
      setTab('login')
      setUsername('')
      setPassword('')
      setEmail('')
      setPhone('')
      setCompany('')
    } catch (err) {
      const data  = err.response?.data
      const first = data ? Object.values(data)[0] : null
      setMsg({ text: Array.isArray(first) ? first[0] : 'Error al registrar', ok:false })
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <h1 style={styles.title}>TechSolutions</h1>
        <p style={styles.sub}>Sistema de gestión empresarial</p>

        <div style={styles.tabs}>
          <button style={{...styles.tab, ...(tab==='login'   ? styles.tabActive : {})}} onClick={()=>setTab('login')}>Iniciar sesión</button>
          <button style={{...styles.tab, ...(tab==='register'? styles.tabActive : {})}} onClick={()=>setTab('register')}>Registro cliente</button>
        </div>

        {msg.text && (
          <p style={{...styles.alert, background: msg.ok ? '#e6f4ea' : '#fce8e6', color: msg.ok ? '#137333' : '#c5221f'}}>
            {msg.text}
          </p>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <label style={styles.label}>Usuario</label>
            <input style={styles.input} value={username}
              onChange={e=>setUsername(e.target.value)} required autoComplete="username"/>
            <label style={styles.label}>Contraseña</label>
            <input type="password" style={styles.input} value={password}
              onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/>
            <button type="submit" style={styles.btn}>Ingresar</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={styles.form}>
            <label style={styles.label}>Nombre del cliente</label>
            <input style={styles.input} value={username}
              onChange={e=>setUsername(e.target.value)} required/>
            <label style={styles.label}>Correo electrónico</label>
            <input type="email" style={styles.input} value={email}
              onChange={e=>setEmail(e.target.value)} required/>
            <label style={styles.label}>Teléfono</label>
            <input style={styles.input} value={phone}
              onChange={e=>setPhone(e.target.value)}/>
            <label style={styles.label}>Empresa</label>
            <input style={styles.input} value={company}
              onChange={e=>setCompany(e.target.value)}/>
            <label style={styles.label}>Contraseña</label>
            <input type="password" style={styles.input} value={password}
              onChange={e=>setPassword(e.target.value)} required/>
            <button type="submit" style={styles.btn}>Registrar cliente</button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  bg:        { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f2f5' },
  card:      { background:'#fff', borderRadius:12, padding:'2.5rem 2rem', width:360, boxShadow:'0 4px 24px #0001' },
  title:     { margin:0, fontSize:26, fontWeight:700, color:'#1a73e8', textAlign:'center' },
  sub:       { margin:'4px 0 20px', fontSize:13, color:'#888', textAlign:'center' },
  tabs:      { display:'flex', marginBottom:20, borderBottom:'2px solid #f0f0f0' },
  tab:       { flex:1, padding:'10px', background:'none', border:'none', cursor:'pointer', fontSize:14, color:'#888', fontWeight:500 },
  tabActive: { color:'#1a73e8', borderBottom:'2px solid #1a73e8', marginBottom:-2 },
  alert:     { padding:'10px 14px', borderRadius:7, fontSize:13, marginBottom:12 },
  form:      { display:'flex', flexDirection:'column', gap:10 },
  label:     { fontSize:13, color:'#555', fontWeight:500 },
  input:     { padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, outline:'none' },
  btn:       { marginTop:8, padding:11, borderRadius:8, background:'#1a73e8', color:'#fff', fontWeight:600, fontSize:15, border:'none', cursor:'pointer' },
}
