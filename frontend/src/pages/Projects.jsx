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
  const isClient = role === 'client'

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

  const printReport = async (projectId) => {
    const res = await api.get(`/projects/${projectId}/report/`)
    const { project, summary } = res.data
    const rows = project.tasks.map(t => `
      <tr>
        <td>${t.title}</td>
        <td>${taskStatusLabel[t.status] ?? t.status}</td>
        <td>${t.assigned_to_username ?? 'Sin asignar'}</td>
        <td>${t.progress ?? 0}%</td>
      </tr>
    `).join('')
    const report = window.open('', '_blank')
    report.document.write(`
      <html>
        <head>
          <title>Reporte - ${project.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #222; }
            h1 { margin-bottom: 4px; }
            p { color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f4f6f8; }
            .summary { margin-top: 16px; padding: 12px; background: #f8f9fa; }
          </style>
        </head>
        <body>
          <h1>${project.name}</h1>
          <p>${project.description || 'Sin descripción'}</p>
          <div class="summary">
            <strong>Avance:</strong> ${summary.progress_percent}% |
            <strong>Tareas:</strong> ${summary.completed_tasks}/${summary.total_tasks}
          </div>
          <table>
            <thead><tr><th>Tarea</th><th>Estado</th><th>Empleado asignado</th><th>Avance</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `)
    report.document.close()
    report.print()
  }

  const statusLabel = {
    planning:'Planificación', active:'Activo', paused:'Pausado', completed:'Completado', cancelled:'Cancelado',
    pending:'Pendiente', in_progress:'En proceso', completed_task:'Finalizada', cancelled_task:'Cancelada'
  }
  const taskStatusLabel = { pending:'Pendiente', in_progress:'En proceso', completed:'Finalizada', cancelled:'Cancelada' }
  const statusColor = { planning:'#e8f0fe', active:'#e6f4ea', paused:'#fff8e1', completed:'#e6f4ea', cancelled:'#fce8e6' }
  const statusText  = { planning:'#1a73e8', active:'#137333', paused:'#b45309', completed:'#0f5132', cancelled:'#c5221f' }

  return (
    <div>
      <Navbar />
      <div className="app-page" style={styles.page}>
        <header className="app-page-header">
          <div>
            <span className="app-page-kicker">Portafolio</span>
            <h2 style={styles.title}>{isClient ? 'Mis proyectos' : 'Proyectos'}</h2>
            <p className="app-page-subtitle">
              {isClient
                ? 'Consulta avances, responsables y reportes de los proyectos vinculados a tu empresa.'
                : 'Organiza entregas, fechas y clientes con tarjetas listas para revisar de un vistazo.'}
            </p>
          </div>
        </header>
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
                Cliente: <strong>{p.client_name ?? clients.find(c=>c.id===p.client)?.name ?? (isAdmin ? '—' : 'Asignado')}</strong>
              </p>
              <p style={styles.cardMeta}>{p.start_date} → {p.end_date}</p>
              {isClient && (
                <div style={styles.tasksBox}>
                  <h4 style={styles.tasksTitle}>Tareas del proyecto</h4>
                  {(p.tasks ?? []).length === 0 && <p style={styles.cardMeta}>No hay tareas asignadas.</p>}
                  {(p.tasks ?? []).map(t => (
                    <div key={t.id} style={styles.taskRow}>
                      <div>
                        <strong>{t.title}</strong>
                        <p style={styles.cardMeta}>Empleado: {t.assigned_to_username ?? 'Sin asignar'}</p>
                      </div>
                      <span style={styles.badge}>{taskStatusLabel[t.status] ?? t.status}</span>
                    </div>
                  ))}
                  <button style={styles.btnReport} onClick={()=>printReport(p.id)}>Imprimir reporte</button>
                </div>
              )}
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
  page:      { padding:'2rem', maxWidth:1180, margin:'0 auto' },
  title:     { fontSize:24, fontWeight:850, margin:'0 0 18px', color:'#172033' },
  msg:       { background:'#dcfce7', color:'#166534', padding:'10px 14px', borderRadius:8, marginBottom:16, border:'1px solid #bbf7d0', fontWeight:650 },
  form:      { background:'#fff', padding:'1.5rem', borderRadius:10, marginBottom:24, boxShadow:'0 10px 28px rgba(15,23,42,0.08)', border:'1px solid #e5e7eb' },
  formTitle: { margin:'0 0 16px', fontSize:16, fontWeight:800 },
  row:       { display:'flex', flexWrap:'wrap', gap:12, marginBottom:12 },
  label:     { fontSize:12, color:'#64748b', display:'block', marginBottom:5, fontWeight:750 },
  input:     { padding:'10px 12px', borderRadius:8, border:'1px solid #d7dee8', fontSize:14, width:'100%', boxSizing:'border-box', outline:'none', background:'#fff' },
  btn:       { padding:'10px 18px', background:'#16a34a', color:'#fff', border:'none', borderRadius:8, fontWeight:750, cursor:'pointer', boxShadow:'0 8px 16px rgba(22,163,74,0.2)' },
  btnGray:   { padding:'10px 18px', background:'#e5e7eb', color:'#374151', border:'none', borderRadius:8, fontWeight:750, cursor:'pointer' },
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(310px,1fr))', gap:16 },
  card:      { background:'#fff', borderRadius:10, padding:'1.25rem', boxShadow:'0 10px 28px rgba(15,23,42,0.08)', border:'1px solid #e5e7eb' },
  cardTitle: { margin:'0 0 8px', fontSize:17, fontWeight:850, color:'#172033' },
  cardDesc:  { color:'#64748b', fontSize:14, margin:'0 0 10px', lineHeight:1.45 },
  cardMeta:  { fontSize:13, color:'#64748b', margin:'3px 0' },
  badge:     { padding:'4px 9px', borderRadius:7, fontSize:12, fontWeight:750, whiteSpace:'nowrap', background:'#eef2ff', color:'#3730a3' },
  btnSm:     { padding:'6px 11px', background:'#2563eb', color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:750 },
  tasksBox:  { marginTop:14, paddingTop:13, borderTop:'1px solid #e5e7eb' },
  tasksTitle:{ margin:'0 0 8px', fontSize:13, color:'#172033', fontWeight:800 },
  taskRow:   { display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'9px 0', borderBottom:'1px solid #f1f5f9' },
  btnReport: { marginTop:12, padding:'8px 12px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:750, boxShadow:'0 8px 16px rgba(37,99,235,0.18)' },
}
