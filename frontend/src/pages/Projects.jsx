import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const empty = { name:'', description:'', client:'', start_date:'', end_date:'', status:'planning' }

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

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
    const projectName = escapeHtml(project.name)
    const projectDescription = escapeHtml(project.description || 'Sin descripción registrada para este proyecto.')
    const clientName = escapeHtml(project.client_name || 'Asignado')
    const projectStatus = escapeHtml(statusLabel[project.status] ?? project.status)
    const generatedAt = new Date().toLocaleString('es-GT', {
      day:'2-digit',
      month:'long',
      year:'numeric',
      hour:'2-digit',
      minute:'2-digit',
    })
    const rows = project.tasks.map(t => `
      <tr>
        <td>
          <strong>${escapeHtml(t.title)}</strong>
          <span>${escapeHtml(t.description || 'Sin detalle adicional')}</span>
        </td>
        <td><span class="status status-${escapeHtml(t.status)}">${escapeHtml(taskStatusLabel[t.status] ?? t.status)}</span></td>
        <td>${escapeHtml(t.assigned_to_username ?? 'Sin asignar')}</td>
        <td>
          <div class="task-progress">
            <div style="width:${t.progress ?? 0}%"></div>
          </div>
          <small>${t.progress ?? 0}% completado</small>
        </td>
      </tr>
    `).join('')
    const report = window.open('', '_blank')
    report.document.write(`
      <html>
        <head>
          <title>Reporte - ${projectName}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #efe8d4;
              color: #082f57;
              font-family: Inter, Segoe UI, Arial, sans-serif;
            }
            .page {
              width: min(1040px, calc(100% - 48px));
              min-height: calc(100vh - 48px);
              margin: 24px auto;
              background: #fffdfa;
              border: 1px solid #e4dac1;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 24px 70px rgba(8, 47, 87, 0.18);
            }
            .hero {
              background:
                radial-gradient(circle at 88% 12%, rgba(255, 133, 0, 0.34), transparent 240px),
                linear-gradient(135deg, #041c34 0%, #082f57 58%, #117b82 100%);
              color: #fffdfa;
              padding: 34px 38px;
              display: flex;
              justify-content: space-between;
              gap: 28px;
              align-items: flex-start;
            }
            .brand {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              font-size: 13px;
              font-weight: 900;
              letter-spacing: 0.02em;
              text-transform: uppercase;
              color: #f2dfb8;
              margin-bottom: 24px;
            }
            .mark {
              width: 38px;
              height: 38px;
              display: grid;
              place-items: center;
              border-radius: 10px;
              background: linear-gradient(135deg, #2aa2a5, #ff8500);
              color: #fff;
              font-weight: 900;
            }
            h1 {
              margin: 0 0 10px;
              font-size: 34px;
              line-height: 1.08;
              letter-spacing: 0;
            }
            .description {
              margin: 0;
              max-width: 680px;
              color: rgba(255, 253, 250, 0.78);
              line-height: 1.55;
              font-size: 15px;
            }
            .date-card {
              min-width: 190px;
              background: rgba(255, 253, 250, 0.1);
              border: 1px solid rgba(239, 232, 212, 0.22);
              border-radius: 14px;
              padding: 14px;
              color: #fffdfa;
            }
            .date-card span,
            .metric span,
            .project-meta span {
              display: block;
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              color: #f2dfb8;
              margin-bottom: 5px;
            }
            .date-card strong {
              font-size: 13px;
              line-height: 1.4;
            }
            .content { padding: 30px 38px 36px; }
            .metrics {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 14px;
              margin-top: -54px;
              margin-bottom: 24px;
              position: relative;
            }
            .metric {
              background: #fffdfa;
              border: 1px solid #e4dac1;
              border-radius: 14px;
              padding: 16px;
              box-shadow: 0 14px 32px rgba(8, 47, 87, 0.12);
            }
            .metric span { color: #658094; }
            .metric strong {
              display: block;
              font-size: 28px;
              color: #082f57;
              margin-bottom: 8px;
            }
            .metric small {
              color: #658094;
              font-weight: 700;
            }
            .progress-track {
              width: 100%;
              height: 10px;
              background: #efe8d4;
              border-radius: 999px;
              overflow: hidden;
              margin-top: 8px;
            }
            .progress-fill {
              height: 100%;
              width: ${summary.progress_percent}%;
              background: linear-gradient(90deg, #2aa2a5, #ff8500);
              border-radius: 999px;
            }
            .project-meta {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 22px;
            }
            .project-meta article {
              background: #fff8e9;
              border: 1px solid #e4dac1;
              border-radius: 12px;
              padding: 13px 14px;
            }
            .project-meta strong {
              color: #082f57;
              font-size: 14px;
            }
            .section-title {
              display: flex;
              justify-content: space-between;
              align-items: end;
              gap: 16px;
              margin: 10px 0 14px;
            }
            h2 {
              margin: 0;
              font-size: 20px;
              color: #082f57;
            }
            .section-title p {
              margin: 4px 0 0;
              color: #658094;
              font-size: 13px;
            }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              overflow: hidden;
              border: 1px solid #e4dac1;
              border-radius: 14px;
              background: #fffdfa;
            }
            th {
              background: #082f57;
              color: #fffdfa;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.03em;
              text-align: left;
              padding: 13px 14px;
            }
            td {
              padding: 14px;
              border-bottom: 1px solid #efe8d4;
              vertical-align: middle;
              color: #31546e;
              font-size: 14px;
            }
            tr:last-child td { border-bottom: 0; }
            td strong {
              display: block;
              color: #082f57;
              margin-bottom: 4px;
            }
            td span {
              display: block;
              color: #658094;
              font-size: 12px;
              line-height: 1.4;
            }
            .status {
              display: inline-flex;
              width: fit-content;
              padding: 6px 9px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 900;
            }
            .status-pending { background: #fff1dd; color: #e36800; }
            .status-in_progress { background: #dff3ef; color: #117b82; }
            .status-completed { background: #dff3ef; color: #0f6f57; }
            .status-cancelled { background: #fce8e6; color: #c5221f; }
            .task-progress {
              height: 8px;
              width: 130px;
              background: #efe8d4;
              border-radius: 999px;
              overflow: hidden;
              margin-bottom: 6px;
            }
            .task-progress div {
              height: 100%;
              background: linear-gradient(90deg, #2aa2a5, #ff8500);
              border-radius: 999px;
            }
            small {
              color: #658094;
              font-size: 12px;
              font-weight: 750;
            }
            .footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #efe8d4;
              display: flex;
              justify-content: space-between;
              gap: 16px;
              color: #658094;
              font-size: 12px;
            }
            .footer strong { color: #082f57; }
            @media print {
              body { background: #fff; }
              .page {
                width: 100%;
                min-height: auto;
                margin: 0;
                border: 0;
                border-radius: 0;
                box-shadow: none;
              }
              .hero {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .metrics { margin-top: -38px; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <section class="hero">
              <div>
                <div class="brand"><span class="mark">TS</span> TechSolutions ERP</div>
                <h1>${projectName}</h1>
                <p class="description">${projectDescription}</p>
              </div>
              <div class="date-card">
                <span>Reporte generado</span>
                <strong>${generatedAt}</strong>
              </div>
            </section>

            <main class="content">
              <section class="metrics">
                <article class="metric">
                  <span>Avance general</span>
                  <strong>${summary.progress_percent}%</strong>
                  <div class="progress-track"><div class="progress-fill"></div></div>
                </article>
                <article class="metric">
                  <span>Tareas finalizadas</span>
                  <strong>${summary.completed_tasks}/${summary.total_tasks}</strong>
                  <small>Seguimiento operativo</small>
                </article>
                <article class="metric">
                  <span>Cliente</span>
                <strong>${clientName}</strong>
                  <small>Portal de avance</small>
                </article>
              </section>

              <section class="project-meta">
                <article>
                  <span>Fecha de inicio</span>
                  <strong>${escapeHtml(project.start_date || '-')}</strong>
                </article>
                <article>
                  <span>Fecha de fin</span>
                  <strong>${escapeHtml(project.end_date || '-')}</strong>
                </article>
                <article>
                  <span>Estado del proyecto</span>
                  <strong>${projectStatus}</strong>
                </article>
              </section>

              <div class="section-title">
                <div>
                  <h2>Detalle de tareas</h2>
                  <p>Responsables, estado actual y porcentaje de avance por actividad.</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Estado</th>
                    <th>Empleado asignado</th>
                    <th>Avance</th>
                  </tr>
                </thead>
                <tbody>${rows || '<tr><td colspan="4">No hay tareas registradas.</td></tr>'}</tbody>
              </table>

              <footer class="footer">
                <span><strong>TechSolutions ERP</strong> · Reporte de avance para clientes</span>
                <span>Confidencial</span>
              </footer>
            </main>
          </div>
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
