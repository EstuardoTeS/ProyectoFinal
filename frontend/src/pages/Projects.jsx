import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const empty = { name:'', description:'', client:'', start_date:'', end_date:'', status:'planning' }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [clients,  setClients]  = useState([])
  const [form,     setForm]     = useState(empty)
  const [editing,  setEditing]  = useState(null)
  const [msg,      setMsg]      = useState('')
  const role = localStorage.getItem('role')
  const isAdmin = role === 'admin'

  const load = async () => {
    const requests = [api.get('/projects/')]
    if (isAdmin) requests.push(api.get('/clients/'))
    const responses = await Promise.all(requests)
    setProjects(responses[0].data)
    setClients(isAdmin ? responses[1].data : [])
  }

  useEffect(() => {
    const loadProjects = async () => {
      const requests = [api.get('/projects/')]
      if (isAdmin) requests.push(api.get('/clients/'))
      const responses = await Promise.all(requests)
      setProjects(responses[0].data)
      setClients(isAdmin ? responses[1].data : [])
    }
    loadProjects()
  }, [isAdmin])

  const save = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/projects/${editing}/`, form)
        setMsg('Proyecto actualizado')
      } else {
        await api.post('/projects/', form)
        setMsg('Proyecto creado')
      }
      setForm(empty)
      setEditing(null)
      load()
    } catch { setMsg('Error al guardar') }
    setTimeout(() => setMsg(''), 3000)
  }

  const edit = (p) => {
    setEditing(p.id)
    setForm({ name:p.name, description:p.description, client:p.client,
              start_date:p.start_date, end_date:p.end_date, status:p.status })
    window.scrollTo(0, 0)
  }

  const del = async (id) => {
    if (!window.confirm('¿Eliminar proyecto?')) return
    await api.delete(`/projects/${id}/`)
    load()
  }

  const statusLabel = { planning:'Planificación', active:'Activo', paused:'Pausado', completed:'Completado', cancelled:'Cancelado' }
  const statusColor = { planning:'#e8f0fe', active:'#e6f4ea', paused:'#fff8e1', completed:'#e6f4ea', cancelled:'#fce8e6' }
  const statusText  = { planning:'#1a73e8', active:'#137333', paused:'#b45309', completed:'#0f5132', cancelled:'#c5221f' }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.title}>Proyectos</h2>
        {msg && <p style={styles.msg}>{msg}</p>}

        {isAdmin && (
          <form onSubmit={save} style={styles.form}>
            <h3 style={styles.formTitle}>{editing ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>
            <div style={styles.row}>
              <input placeholder="Nombre del proyecto *" style={styles.input} required
                value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
              <select style={styles.input} value={form.client} required
                onChange={e=>setForm({...form, client:e.target.value})}>
                <option value="">Selecciona un cliente *</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <textarea placeholder="Descripción" style={{...styles.input, resize:'vertical', minHeight:70}}
              value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
            <div style={styles.row}>
              <div style={{flex:1}}>
                <label style={styles.label}>Fecha de inicio *</label>
                <input type="date" style={styles.input} required
                  value={form.start_date} onChange={e=>setForm({...form, start_date:e.target.value})}/>
              </div>
              <div style={{flex:1}}>
                <label style={styles.label}>Fecha de fin *</label>
                <input type="date" style={styles.input} required
                  value={form.end_date} onChange={e=>setForm({...form, end_date:e.target.value})}/>
              </div>
              <select style={{...styles.input, flex:1}} value={form.status}
                onChange={e=>setForm({...form, status:e.target.value})}>
                {Object.entries(statusLabel).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button type="submit" style={styles.btn}>{editing ? 'Actualizar' : 'Crear proyecto'}</button>
              {editing && <button type="button" style={styles.btnGray}
                onClick={()=>{setEditing(null);setForm(empty)}}>Cancelar</button>}
            </div>
          </form>
        )}

        <div style={styles.grid}>
          {projects.length === 0 && <p style={{color:'#888'}}>No hay proyectos aún.</p>}
          {projects.map(p => (
            <div key={p.id} style={styles.card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <span style={{...styles.badge, background:statusColor[p.status], color:statusText[p.status]}}>
                  {statusLabel[p.status]}
                </span>
              </div>
              <p style={styles.cardDesc}>{p.description || 'Sin descripción'}</p>
              <p style={styles.cardMeta}>
                Cliente: <strong>{clients.find(c=>c.id===p.client)?.name ?? (isAdmin ? '—' : 'Asignado')}</strong>
              </p>
              <p style={styles.cardMeta}>{p.start_date} → {p.end_date}</p>
              {isAdmin && (
                <div style={{display:'flex', gap:8, marginTop:12}}>
                  <button style={styles.btnSm} onClick={()=>edit(p)}>Editar</button>
                  <button style={{...styles.btnSm, background:'#e53e3e'}} onClick={()=>del(p.id)}>Eliminar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page:      { padding:'2rem', maxWidth:1000, margin:'0 auto' },
  title:     { fontSize:22, fontWeight:700, marginBottom:16 },
  msg:       { background:'#e6f4ea', color:'#137333', padding:'8px 14px', borderRadius:6, marginBottom:16 },
  form:      { background:'#fff', padding:'1.5rem', borderRadius:10, marginBottom:24, boxShadow:'0 2px 8px #0001' },
  formTitle: { margin:'0 0 16px', fontSize:16, fontWeight:600 },
  row:       { display:'flex', flexWrap:'wrap', gap:10, marginBottom:12 },
  label:     { fontSize:12, color:'#666', display:'block', marginBottom:4 },
  input:     { padding:'9px 12px', borderRadius:7, border:'1px solid #ddd', fontSize:14, width:'100%', boxSizing:'border-box' },
  btn:       { padding:'9px 20px', background:'#0f9d58', color:'#fff', border:'none', borderRadius:7, fontWeight:600, cursor:'pointer' },
  btnGray:   { padding:'9px 20px', background:'#eee', color:'#333', border:'none', borderRadius:7, fontWeight:600, cursor:'pointer' },
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 },
  card:      { background:'#fff', borderRadius:10, padding:'1.25rem', boxShadow:'0 2px 8px #0001' },
  cardTitle: { margin:'0 0 8px', fontSize:16, fontWeight:600 },
  cardDesc:  { color:'#666', fontSize:14, margin:'0 0 8px' },
  cardMeta:  { fontSize:13, color:'#555', margin:'2px 0' },
  badge:     { padding:'4px 10px', borderRadius:12, fontSize:12, fontWeight:500, whiteSpace:'nowrap' },
  btnSm:     { padding:'5px 14px', background:'#1a73e8', color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12 },
}
