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
  const [showPassword, setShowPassword] = useState(false)
  const [msg,      setMsg]      = useState({ text:'', ok:true })
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setMsg({ text:'', ok:true })
    const cleanUsername = username.trim()
    try {
      const res = await api.post('/auth/login/', { username: cleanUsername, password })
      localStorage.setItem('token',    res.data.access)
      localStorage.setItem('role',     res.data.role ?? 'user')
      localStorage.setItem('username', cleanUsername)
      const role = res.data.role
      navigate(role === 'employee' ? '/tasks' : role === 'client' ? '/projects' : '/dashboard')
    } catch (err) {
      if (!err.response) {
        setMsg({ text:'No se pudo conectar con el servidor. Revisa internet o espera a que Render despierte.', ok:false })
        return
      }
      const detail = err.response?.data?.detail
      setMsg({ text: detail || 'Usuario o contraseña incorrectos', ok:false })
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
              onChange={e=>setUsername(e.target.value)} required autoComplete="username"
              autoCapitalize="none" autoCorrect="off" spellCheck={false}/>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.passwordWrap}>
              <input type={showPassword ? 'text' : 'password'} style={{...styles.input, ...styles.passwordInput}} value={password}
                onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"
                autoCapitalize="none" autoCorrect="off" spellCheck={false}/>
              <button type="button" style={styles.eyeBtn} onClick={()=>setShowPassword(!showPassword)}>
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
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
            <div style={styles.passwordWrap}>
              <input type={showPassword ? 'text' : 'password'} style={{...styles.input, ...styles.passwordInput}} value={password}
                onChange={e=>setPassword(e.target.value)} required autoCapitalize="none" autoCorrect="off" spellCheck={false}/>
              <button type="button" style={styles.eyeBtn} onClick={()=>setShowPassword(!showPassword)}>
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
            <button type="submit" style={styles.btn}>Registrar cliente</button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  bg:        { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  card:      { background:'#fff', borderRadius:12, padding:'2.25rem 2rem', width:390, boxShadow:'0 24px 60px rgba(15,23,42,0.18)', border:'1px solid #e5e7eb' },
  title:     { margin:0, fontSize:28, fontWeight:850, color:'#111827', textAlign:'center', letterSpacing:0 },
  sub:       { margin:'6px 0 22px', fontSize:13, color:'#64748b', textAlign:'center' },
  tabs:      { display:'flex', marginBottom:20, background:'#f1f5f9', padding:4, borderRadius:9 },
  tab:       { flex:1, padding:'9px', background:'transparent', border:'none', cursor:'pointer', fontSize:13, color:'#64748b', fontWeight:750, borderRadius:7 },
  tabActive: { color:'#111827', background:'#fff', boxShadow:'0 2px 8px rgba(15,23,42,0.08)' },
  alert:     { padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:12, border:'1px solid transparent' },
  form:      { display:'flex', flexDirection:'column', gap:10 },
  label:     { fontSize:13, color:'#475569', fontWeight:750 },
  input:     { padding:'10px 12px', borderRadius:8, border:'1px solid #d7dee8', fontSize:14, outline:'none', background:'#fff' },
  passwordWrap:{ position:'relative', display:'flex', alignItems:'center' },
  passwordInput:{ width:'100%', paddingRight:74 },
  eyeBtn:    { position:'absolute', right:6, top:6, bottom:6, border:'none', borderRadius:7, background:'#e2e8f0', color:'#0f172a', padding:'0 12px', fontSize:12, fontWeight:800, cursor:'pointer' },
  btn:       { marginTop:8, padding:11, borderRadius:8, background:'#2563eb', color:'#fff', fontWeight:750, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 10px 20px rgba(37,99,235,0.22)' },
}
