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
      <div style={styles.page}>
        <h2 style={styles.title}>Clientes</h2>
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
  page:     { padding:'2rem', maxWidth:1000, margin:'0 auto' },
  title:    { fontSize:22, fontWeight:700, marginBottom:16 },
  msg:      { background:'#e6f4ea', color:'#137333', padding:'8px 14px', borderRadius:6, marginBottom:16 },
  form:     { background:'#fff', padding:'1.5rem', borderRadius:10, marginBottom:24, boxShadow:'0 2px 8px #0001' },
  formTitle:{ margin:'0 0 16px', fontSize:16 },
  row:      { display:'flex', flexWrap:'wrap', gap:10, marginBottom:12 },
  input:    { padding:'9px 12px', borderRadius:7, border:'1px solid #ddd', fontSize:14, minWidth:160, flex:1 },
  btn:      { padding:'9px 20px', background:'#1a73e8', color:'#fff', border:'none', borderRadius:7, fontWeight:600, cursor:'pointer' },
  btnGray:  { padding:'9px 20px', background:'#eee', color:'#333', border:'none', borderRadius:7, fontWeight:600, cursor:'pointer' },
  table:    { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px #0001' },
  th:       { background:'#f8f9fa', padding:'12px 16px', textAlign:'left', fontSize:13, color:'#555', fontWeight:600 },
  tr:       { borderBottom:'1px solid #f0f0f0' },
  td:       { padding:'12px 16px', fontSize:14, color:'#333' },
  badge:    { padding:'3px 10px', borderRadius:12, fontSize:12, fontWeight:500 },
  btnSm:    { padding:'4px 12px', background:'#1a73e8', color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, marginRight:4 },
}
