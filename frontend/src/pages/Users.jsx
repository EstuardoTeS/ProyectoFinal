import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const empty = { username:'', email:'', password:'', phone:'', role:'employee', is_active:true }

export default function Users() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const role = localStorage.getItem('role')

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/users/')
      setUsers(res.data)
    }
    load()
  }, [])

  const reload = async () => {
    const res = await api.get('/users/')
    setUsers(res.data)
  }

  const save = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')
    try {
      await api.post('/users/', form)
      setForm(empty)
      await reload()
      setMsg('Empleado creado')
    } catch (err) {
      const data = err.response?.data
      const first = data ? Object.values(data)[0] : null
      setError(Array.isArray(first) ? first[0] : 'No se pudo guardar el usuario')
    }
  }

  const toggleActive = async (user) => {
    if (user.is_protected_admin) return
    await api.patch(`/users/${user.id}/`, { is_active: !user.is_active })
    await reload()
    setMsg(`Usuario ${user.username} ${!user.is_active ? 'activado' : 'desactivado'}`)
  }

  const remove = async (user) => {
    if (user.is_protected_admin) return
    if (!window.confirm(`¿Eliminar a ${user.username}?`)) return
    await api.delete(`/users/${user.id}/`)
    await reload()
    setMsg('Usuario eliminado')
  }

  if (role !== 'admin') return (
    <div><Navbar /><div style={{padding:'2rem'}}><p>Acceso denegado.</p></div></div>
  )

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.title}>Empleados</h2>
        {msg && <p style={styles.msg}>{msg}</p>}
        {error && <p style={{...styles.msg, background:'#fce8e6', color:'#c5221f'}}>{error}</p>}

        <form onSubmit={save} style={styles.form}>
          <h3 style={styles.formTitle}>Nuevo empleado</h3>
          <div style={styles.row}>
            <input placeholder="Usuario *" style={styles.input} required
              value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
            <input type="email" placeholder="Correo *" style={styles.input} required
              value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
            <input type="password" placeholder="Contraseña *" style={styles.input} required
              value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
            <input placeholder="Teléfono" style={styles.input}
              value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
          </div>
          <button type="submit" style={styles.btn}>Crear empleado</button>
        </form>

        <table style={styles.table}>
          <thead>
            <tr>{['Usuario','Email','Rol','Estado','Acciones'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.filter(u => u.role !== 'client').map(u => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}><strong>{u.username}</strong>{u.is_protected_admin && <span style={styles.lock}>Principal</span>}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.role === 'admin' ? 'Administrador' : 'Empleado'}</td>
                <td style={styles.td}>
                  <span style={{...styles.badge, background: u.is_active ? '#e6f4ea' : '#fce8e6', color: u.is_active ? '#137333' : '#c5221f'}}>
                    {u.is_active ? 'Activo' : 'Bloqueado'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button disabled={u.is_protected_admin} style={{...styles.btnSm, background:u.is_active?'#e53e3e':'#0f9d58', opacity:u.is_protected_admin?0.45:1}}
                    onClick={() => toggleActive(u)}>
                    {u.is_active ? 'Bloquear' : 'Activar'}
                  </button>
                  <button disabled={u.is_protected_admin} style={{...styles.btnSm, background:'#555', opacity:u.is_protected_admin?0.45:1}}
                    onClick={() => remove(u)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  page:   { padding:'2rem', maxWidth:1000, margin:'0 auto' },
  title:  { fontSize:22, fontWeight:700, marginBottom:16 },
  msg:    { background:'#e6f4ea', color:'#137333', padding:'8px 14px', borderRadius:6, marginBottom:16 },
  form:   { background:'#fff', padding:'1.5rem', borderRadius:10, marginBottom:24, boxShadow:'0 2px 8px #0001' },
  formTitle:{ margin:'0 0 16px', fontSize:16 },
  row:    { display:'flex', flexWrap:'wrap', gap:10, marginBottom:12 },
  input:  { padding:'9px 12px', borderRadius:7, border:'1px solid #ddd', fontSize:14, minWidth:160, flex:1 },
  btn:    { padding:'9px 20px', background:'#9c27b0', color:'#fff', border:'none', borderRadius:7, fontWeight:600, cursor:'pointer' },
  table:  { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' },
  th:     { background:'#f8f9fa', padding:'12px 16px', textAlign:'left', fontSize:13, color:'#555', fontWeight:600 },
  tr:     { borderBottom:'1px solid #f0f0f0' },
  td:     { padding:'12px 16px', fontSize:14 },
  badge:  { padding:'3px 10px', borderRadius:12, fontSize:12, fontWeight:500 },
  lock:   { marginLeft:8, padding:'2px 8px', borderRadius:10, background:'#e8f0fe', color:'#1a73e8', fontSize:11 },
  btnSm:  { padding:'5px 12px', color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, marginRight:6 },
}
