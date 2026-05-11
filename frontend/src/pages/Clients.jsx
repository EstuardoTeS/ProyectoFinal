import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [form,    setForm]    = useState({ name:'', email:'', phone:'', company:'', status:'active' })
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg]     = useState('')
  const role = localStorage.getItem('role')

  const load = async () => {
    const res = await api.get('/clients/')
    setClients(res.data)
  }

  useEffect(() => {
    const loadClients = async () => {
      const res = await api.get('/clients/')
      setClients(res.data)
    }
    loadClients()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/clients/${editing}/`, form)
        setMsg('Cliente actualizado')
      } else {
        await api.post('/clients/', form)
        setMsg('Cliente creado')
      }
      setForm({ name:'', email:'', phone:'', company:'', status:'active' })
      setEditing(null)
      load()
    } catch { setMsg('Error al guardar') }
  }

  const edit = (c) => {
    setEditing(c.id)
    setForm({ name:c.name, email:c.email, phone:c.phone, company:c.company, status:c.status })
  }

  const del = async (id) => {
    if (!window.confirm('¿Eliminar cliente?')) return
    await api.delete(`/clients/${id}/`)
    load()
  }

  return (
    <div>
      <Navbar />
      <div className="app-page" style={styles.page}>
        <header className="app-page-header">
          <div>
            <span className="app-page-kicker">CRM</span>
            <h2 style={styles.title}>Clientes</h2>
            <p className="app-page-subtitle">Administra contactos, empresas y estado comercial desde una vista limpia para consultar rápido.</p>
          </div>
        </header>
        {msg && <p style={styles.msg}>{msg}</p>}

        {role === 'admin' && (
          <form onSubmit={save} style={styles.form}>
            <h3 style={styles.formTitle}>{editing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
            <div style={styles.row}>
              {[['name','Nombre'],['email','Email'],['phone','Teléfono'],['company','Empresa']].map(([k,l]) => (
                <input key={k} placeholder={l} style={styles.input} required={k==='name'||k==='email'}
                  value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
              ))}
              <select style={styles.input} value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button type="submit" style={styles.btn}>{editing ? 'Actualizar' : 'Crear'}</button>
              {editing && <button type="button" style={styles.btnGray} onClick={() => { setEditing(null); setForm({ name:'', email:'', phone:'', company:'', status:'active' }) }}>Cancelar</button>}
            </div>
          </form>
        )}

        <table style={styles.table}>
          <thead>
            <tr>{['Nombre','Email','Teléfono','Empresa','Estado', role==='admin'?'Acciones':''].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} style={styles.tr}>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}>{c.email}</td>
                <td style={styles.td}>{c.phone}</td>
                <td style={styles.td}>{c.company}</td>
                <td style={styles.td}><span style={{...styles.badge, background: c.status==='active'?'#e6f4ea':'#fce8e6', color: c.status==='active'?'#137333':'#c5221f'}}>{c.status==='active'?'Activo':'Inactivo'}</span></td>
                {role==='admin' && <td style={styles.td}><button style={styles.btnSm} onClick={()=>edit(c)}>Editar</button> <button style={{...styles.btnSm, background:'#e53e3e'}} onClick={()=>del(c.id)}>Eliminar</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  page:     { padding:'2rem', maxWidth:1120, margin:'0 auto' },
  title:    { fontSize:24, fontWeight:850, margin:'0 0 18px', color:'#172033' },
  msg:      { background:'#dcfce7', color:'#166534', padding:'10px 14px', borderRadius:8, marginBottom:16, border:'1px solid #bbf7d0', fontWeight:650 },
  form:     { background:'#fff', padding:'1.5rem', borderRadius:10, marginBottom:24, boxShadow:'0 10px 28px rgba(15,23,42,0.08)', border:'1px solid #e5e7eb' },
  formTitle:{ margin:'0 0 16px', fontSize:16, fontWeight:800, color:'#172033' },
  row:      { display:'flex', flexWrap:'wrap', gap:12, marginBottom:12 },
  input:    { padding:'10px 12px', borderRadius:8, border:'1px solid #d7dee8', fontSize:14, minWidth:170, flex:1, background:'#fff', outline:'none' },
  btn:      { padding:'10px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:750, cursor:'pointer', boxShadow:'0 8px 16px rgba(37,99,235,0.2)' },
  btnGray:  { padding:'10px 18px', background:'#e5e7eb', color:'#374151', border:'none', borderRadius:8, fontWeight:750, cursor:'pointer' },
  table:    { width:'100%', borderCollapse:'separate', borderSpacing:0, background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 10px 28px rgba(15,23,42,0.08)', border:'1px solid #e5e7eb' },
  th:       { background:'#f8fafc', padding:'13px 16px', textAlign:'left', fontSize:12, color:'#64748b', fontWeight:800, textTransform:'uppercase', borderBottom:'1px solid #e5e7eb' },
  tr:       { borderBottom:'1px solid #eef2f7' },
  td:       { padding:'13px 16px', fontSize:14, color:'#334155', borderBottom:'1px solid #eef2f7' },
  badge:    { padding:'4px 9px', borderRadius:7, fontSize:12, fontWeight:750 },
  btnSm:    { padding:'6px 11px', background:'#2563eb', color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, marginRight:4, fontWeight:750 },
}
