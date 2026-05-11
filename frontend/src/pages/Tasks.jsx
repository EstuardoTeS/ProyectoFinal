import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const empty = { title:'', description:'', project:'', assigned_to:'', priority:'medium', status:'pending', progress:0, progress_note:'', due_date:'' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')
  const [reportTask, setReportTask] = useState(null)
  const [adminHistory, setAdminHistory] = useState([])
  const role = localStorage.getItem('role')
  const canCreate = role === 'admin'
  const isAdmin = role === 'admin'
  const isEmployee = role === 'employee'

  useEffect(() => {
    const load = async () => {
      const requests = [api.get('/tasks/')]
      if (!isEmployee) requests.push(api.get('/projects/'))
      if (isAdmin) requests.push(api.get('/users/'))
      if (isAdmin) requests.push(api.get('/tasks/history/'))
      const responses = await Promise.all(requests)
      setTasks(responses[0].data)
      setProjects(!isEmployee ? responses[1].data : [])
      setUsers(isAdmin ? responses[2].data.filter(u => u.role === 'employee' && u.is_active) : [])
      setAdminHistory(isAdmin ? responses[3].data : [])
    }
    load()
  }, [isAdmin, isEmployee])

  const reload = async () => {
    const res = await api.get('/tasks/')
    setTasks(res.data)
    if (isAdmin) {
      const historyRes = await api.get('/tasks/history/')
      setAdminHistory(historyRes.data)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      const data = {...form}
      if (!data.assigned_to || !isAdmin) delete data.assigned_to
      if (!data.due_date) data.due_date = null
      data.progress = Number(data.progress || 0)
      if (editing) {
        await api.put(`/tasks/${editing}/`, data)
        setMsg('Tarea actualizada')
      } else {
        await api.post('/tasks/', data)
        setMsg('Tarea creada')
      }
      setForm(empty)
      setEditing(null)
      await reload()
    } catch {
      setMsg('Error al guardar la tarea')
    }
  }

  const edit = (t) => {
    setEditing(t.id)
    setForm({
      title:t.title,
      description:t.description,
      project:t.project,
      assigned_to:t.assigned_to ?? '',
      priority:t.priority,
      status:t.status,
      progress:t.progress ?? 0,
      progress_note:t.progress_note ?? '',
      due_date:t.due_date ?? '',
    })
    window.scrollTo(0, 0)
  }

  const del = async (id) => {
    if (!window.confirm('¿Eliminar tarea?')) return
    await api.delete(`/tasks/${id}/`)
    await reload()
  }

  const updateStatus = async (task, status) => {
    await api.patch(`/tasks/${task.id}/`, { status })
    await reload()
    setMsg('Estado actualizado')
  }

  const updateTask = async (task, values) => {
    await api.patch(`/tasks/${task.id}/`, values)
    await reload()
    setMsg('Tarea actualizada')
  }

  const openReport = (task) => {
    setReportTask(task)
    window.setTimeout(() => window.print(), 120)
  }

  const priorityColor = { low:'#0f9d58', medium:'#f4b400', high:'#e53e3e' }
  const priorityLabel = { low:'Baja', medium:'Media', high:'Alta' }
  const statusLabel = { pending:'Pendiente', in_progress:'En proceso', completed:'Finalizada', cancelled:'Cancelada' }
  const statusColor = { pending:'#f59e0b', in_progress:'#2563eb', completed:'#16a34a', cancelled:'#ef4444' }
  const statusBg = { pending:'#fef3c7', in_progress:'#dbeafe', completed:'#dcfce7', cancelled:'#fee2e2' }
  const statusText = { pending:'#92400e', in_progress:'#1d4ed8', completed:'#166534', cancelled:'#991b1b' }
  const taskHistoryItems = tasks
    .flatMap(task => (task.history ?? []).map(item => ({ ...item, task })))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const historyItems = isAdmin
    ? adminHistory.map(item => ({
        ...item,
        task: {
          title: item.task_title,
          project_name: item.project_name,
          client_name: item.client_name,
          assigned_to_username: item.assigned_to_username,
        },
      }))
    : taskHistoryItems
  const formatHistoryDate = (value) => new Date(value).toLocaleString('es-GT', {
    day:'2-digit',
    month:'2-digit',
    year:'numeric',
    hour:'2-digit',
    minute:'2-digit',
  })

  return (
    <div>
      <Navbar />
      <div className="app-page" style={styles.page}>
        <section className="task-report-print">
          {reportTask && (
            <div className="task-report-sheet">
              <div className="task-report-top">
                <div>
                  <span className="task-report-brand">TechSolutions ERP</span>
                  <h1>Reporte histórico de tarea</h1>
                  <p>Documento generado para seguimiento de cambios, estados y trazabilidad operativa.</p>
                </div>
                <strong>{new Date().toLocaleDateString('es-GT')}</strong>
              </div>
              <div className="task-report-summary">
                <article>
                  <span>Tarea</span>
                  <strong>{reportTask.title}</strong>
                </article>
                <article>
                  <span>Cliente</span>
                  <strong>{reportTask.client_name || '-'}</strong>
                </article>
                <article>
                  <span>Proyecto</span>
                  <strong>{reportTask.project_name || '-'}</strong>
                </article>
                <article>
                  <span>Estado actual</span>
                  <strong>{statusLabel[reportTask.status]}</strong>
                </article>
                <article>
                  <span>Responsable</span>
                  <strong>{reportTask.assigned_to_username || 'Sin asignar'}</strong>
                </article>
                <article>
                  <span>Avance</span>
                  <strong>{reportTask.progress ?? 0}%</strong>
                </article>
              </div>
              <h2>Historial de movimientos</h2>
              <div className="task-report-timeline">
                {(reportTask.history ?? []).length === 0 ? (
                  <p>Esta tarea aún no tiene movimientos registrados.</p>
                ) : reportTask.history.map(item => (
                  <article key={item.id}>
                    <span>{new Date(item.created_at).toLocaleString('es-GT')}</span>
                    <strong>{item.action_label}</strong>
                    <p>
                      {item.action === 'status_changed'
                        ? `${item.previous_status_label || 'Sin estado'} → ${item.new_status_label || 'Sin estado'}`
                        : item.new_status_label || 'Movimiento registrado'}
                    </p>
                    <small>{item.changed_by_username || 'Sistema'}{item.note ? ` · ${item.note}` : ''}</small>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
        <header className="app-page-header">
          <div>
            <span className="app-page-kicker">Operación</span>
            <h2 style={styles.title}>{isEmployee ? 'Mis tareas' : 'Tareas'}</h2>
            <p className="app-page-subtitle">
              {isEmployee
                ? 'Actualiza estados y revisa prioridades para mantener el trabajo al día.'
                : 'Da seguimiento a prioridades, responsables, vencimientos y avance por tarea.'}
            </p>
          </div>
        </header>
        {msg && <p style={styles.msg}>{msg}</p>}

        {isAdmin && (
          <section style={styles.historyPanel}>
            <div style={styles.historyHead}>
              <div>
                <span className="app-page-kicker">Auditoría</span>
                <h3 style={styles.historyTitle}>Historial general de proyectos</h3>
                <p style={styles.historyIntro}>Consulta todos los cambios de estado por proyecto, tarea, empleado, fecha y hora en una ventana independiente.</p>
              </div>
              <button type="button" style={styles.auditBtn} onClick={() => window.open('/audit', '_blank', 'noopener,noreferrer')}>
                Abrir auditoría en nueva ventana
              </button>
            </div>
          </section>
        )}

        {role === 'client' && (
          <section style={styles.historyPanel}>
            <div style={styles.historyHead}>
              <div>
                <span className="app-page-kicker">Historial</span>
                <h3 style={styles.historyTitle}>Historial de mis proyectos</h3>
              </div>
              <span style={styles.historyCount}>{historyItems.length} movimientos</span>
            </div>
            <div style={styles.historyList}>
              {historyItems.length === 0 ? (
                <p style={styles.historyEmpty}>Aún no hay movimientos históricos registrados.</p>
              ) : historyItems.slice(0, 8).map(item => (
                <article key={`${item.task.id}-${item.id}`} style={styles.historyItem}>
                  <span style={styles.historyDot} />
                  <div style={{flex:1}}>
                    <strong style={styles.historyTask}>{item.task.title}</strong>
                    <p style={styles.historyText}>
                      {item.action === 'status_changed'
                        ? `${item.previous_status_label || 'Sin estado'} → ${item.new_status_label || 'Sin estado'}`
                        : item.action_label}
                    </p>
                    <small style={styles.historyMeta}>
                      {formatHistoryDate(item.created_at)} · {item.changed_by_username || 'Sistema'}
                      {item.task.client_name ? ` · ${item.task.client_name}` : ''}
                    </small>
                  </div>
                  <button type="button" style={styles.reportBtn} onClick={() => openReport(item.task)}>PDF</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {canCreate && (
          <form onSubmit={save} style={styles.form}>
            <h3 style={styles.formTitle}>{editing ? 'Editar tarea' : 'Nueva tarea'}</h3>
            <div style={styles.row}>
              <input placeholder="Título de la tarea *" style={{...styles.input, flex:2}} required
                value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
              <select style={{...styles.input, flex:1}} value={form.project} required
                onChange={e=>setForm({...form, project:e.target.value})}>
                <option value="">Proyecto *</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <textarea placeholder="Descripción" style={{...styles.input, resize:'vertical', minHeight:60}}
              value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
            <div style={styles.row}>
              {isAdmin && (
                <select style={styles.input} value={form.assigned_to}
                  onChange={e=>setForm({...form, assigned_to:e.target.value})}>
                  <option value="">Asignación automática</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              )}
              <select style={styles.input} value={form.priority}
                onChange={e=>setForm({...form, priority:e.target.value})}>
                <option value="low">Prioridad baja</option>
                <option value="medium">Prioridad media</option>
                <option value="high">Prioridad alta</option>
              </select>
              {isAdmin && (
                <select style={styles.input} value={form.status}
                  onChange={e=>setForm({...form, status:e.target.value})}>
                  {Object.entries(statusLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              )}
              <div style={{flex:1}}>
                <label style={styles.label}>Fecha límite</label>
                <input type="date" style={styles.input}
                  value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})}/>
              </div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button type="submit" style={styles.btn}>{editing ? 'Actualizar' : 'Crear tarea'}</button>
              {editing && <button type="button" style={styles.btnGray} onClick={()=>{setEditing(null);setForm(empty)}}>Cancelar</button>}
            </div>
          </form>
        )}

        <div style={styles.list}>
          {tasks.length === 0 && <p style={{color:'#888'}}>No hay tareas registradas.</p>}
          {tasks.map(t => (
            <div key={t.id} style={{...styles.card, borderLeft:`4px solid ${priorityColor[t.priority]}`}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8}}>
                <div>
                  <h3 style={styles.cardTitle}>{t.title}</h3>
                  <p style={styles.cardDesc}>{t.description || 'Sin descripción'}</p>
                </div>
                <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                  <span style={{...styles.badge, background:'#f8fafc', color:priorityColor[t.priority], border:`1px solid ${priorityColor[t.priority]}33`}}>{priorityLabel[t.priority]}</span>
                  <span style={{...styles.badge, background:statusBg[t.status], color:statusText[t.status]}}>{statusLabel[t.status]}</span>
                </div>
              </div>
              <div style={styles.progressHeader}>
                <span style={styles.meta}>Avance</span>
                <strong style={styles.progressText}>{t.progress ?? 0}%</strong>
              </div>
              <div style={styles.progressWrap}>
                <div style={{...styles.progressBar, width:`${t.progress ?? 0}%`, background:statusColor[t.status] ?? '#2563eb'}} />
              </div>
              <div style={{display:'flex', gap:16, flexWrap:'wrap', marginTop:8}}>
                <span style={styles.meta}>Proyecto: <strong>{t.project_name ?? projects.find(p=>p.id===t.project)?.name ?? '-'}</strong></span>
                <span style={styles.meta}>Responsable: <strong>{t.assigned_to_username ?? 'Sin asignar'}</strong></span>
                <span style={styles.meta}>Avance: <strong>{t.progress ?? 0}%</strong></span>
                {t.due_date && <span style={styles.meta}>Vence: <strong>{t.due_date}</strong></span>}
              </div>
              {t.progress_note && <p style={styles.note}>{t.progress_note}</p>}
              {(isAdmin || role === 'client') && (
                <div style={styles.cardHistory}>
                  <div style={styles.cardHistoryTop}>
                    <strong>Historial de cambios</strong>
                    <button type="button" style={styles.reportBtn} onClick={() => openReport(t)}>Imprimir PDF</button>
                  </div>
                  {(t.history ?? []).length === 0 ? (
                    <p style={styles.historyEmpty}>Sin movimientos registrados.</p>
                  ) : (
                    <div style={styles.miniTimeline}>
                      {(t.history ?? []).slice(0, 4).map(item => (
                        <div key={item.id} style={styles.miniHistoryItem}>
                          <span style={styles.historyDot} />
                          <div>
                            <strong style={styles.historyText}>{item.action_label}</strong>
                            <small style={styles.historyMeta}>
                              {item.action === 'status_changed'
                                ? ` ${item.previous_status_label || 'Sin estado'} → ${item.new_status_label || 'Sin estado'} · `
                                : ' '}
                              {new Date(item.created_at).toLocaleString('es-GT')}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {(isEmployee || isAdmin) && (
                <div style={styles.updateBox}>
                  <select style={styles.statusSelect} defaultValue={t.status} onChange={e=>updateStatus(t, e.target.value)}>
                    {Object.entries(statusLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                  {isAdmin && (
                    <>
                      <input type="number" min="0" max="100" defaultValue={t.progress ?? 0} style={styles.smallInput}
                        onBlur={e=>updateTask(t, { progress:Number(e.target.value) })}/>
                      <input placeholder="Nota de avance" defaultValue={t.progress_note ?? ''} style={styles.noteInput}
                        onBlur={e=>updateTask(t, { progress_note:e.target.value })}/>
                    </>
                  )}
                </div>
              )}
              {isAdmin && (
                <div style={{display:'flex', gap:8, marginTop:10}}>
                  <button style={styles.btnSm} onClick={()=>edit(t)}>Editar/Reasignar</button>
                  <button style={{...styles.btnSm, background:'#e53e3e'}} onClick={()=>del(t.id)}>Eliminar</button>
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
  page:        { padding:'2rem', maxWidth:1120, margin:'0 auto' },
  title:       { fontSize:24, fontWeight:850, margin:'0 0 18px', color:'#172033' },
  msg:         { background:'#dcfce7', color:'#166534', padding:'10px 14px', borderRadius:8, marginBottom:16, border:'1px solid #bbf7d0', fontWeight:650 },
  form:        { background:'#fff', padding:'1.5rem', borderRadius:10, marginBottom:24, boxShadow:'0 10px 28px rgba(15,23,42,0.08)', border:'1px solid #e5e7eb' },
  formTitle:   { margin:'0 0 16px', fontSize:16, fontWeight:800 },
  row:         { display:'flex', flexWrap:'wrap', gap:12, marginBottom:12 },
  label:       { fontSize:12, color:'#64748b', display:'block', marginBottom:5, fontWeight:750 },
  input:       { padding:'10px 12px', borderRadius:8, border:'1px solid #d7dee8', fontSize:14, flex:1, boxSizing:'border-box', outline:'none', background:'#fff' },
  btn:         { padding:'10px 18px', background:'#f59e0b', color:'#fff', border:'none', borderRadius:8, fontWeight:750, cursor:'pointer', boxShadow:'0 8px 16px rgba(245,158,11,0.2)' },
  btnGray:     { padding:'10px 18px', background:'#e5e7eb', color:'#374151', border:'none', borderRadius:8, fontWeight:750, cursor:'pointer' },
  list:        { display:'flex', flexDirection:'column', gap:12 },
  card:        { background:'#fff', borderRadius:10, padding:'1.25rem', boxShadow:'0 10px 28px rgba(15,23,42,0.08)', border:'1px solid #e5e7eb' },
  cardTitle:   { margin:'0 0 4px', fontSize:17, fontWeight:850, color:'#172033' },
  cardDesc:    { color:'#64748b', fontSize:14, margin:0, lineHeight:1.45 },
  badge:       { padding:'4px 9px', borderRadius:7, fontSize:12, fontWeight:750 },
  meta:        { fontSize:13, color:'#64748b' },
  note:        { fontSize:13, background:'#f8fafc', padding:'9px 10px', borderRadius:8, color:'#475569', border:'1px solid #e5e7eb' },
  progressHeader:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:13, marginBottom:6 },
  progressText:{ fontSize:13, color:'#172033' },
  progressWrap:{ height:9, background:'#e5e7eb', borderRadius:999, overflow:'hidden' },
  progressBar: { height:'100%', borderRadius:999 },
  updateBox:   { display:'flex', gap:8, flexWrap:'wrap', marginTop:12 },
  statusSelect:{ padding:'8px 9px', borderRadius:8, border:'1px solid #d7dee8', fontSize:12, cursor:'pointer', background:'#fff' },
  smallInput:  { width:80, padding:'8px 9px', borderRadius:8, border:'1px solid #d7dee8' },
  noteInput:   { flex:1, minWidth:220, padding:'8px 9px', borderRadius:8, border:'1px solid #d7dee8' },
  btnSm:       { padding:'6px 11px', background:'#2563eb', color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:750 },
  historyPanel:{ background:'#fffdfa', border:'1px solid #e4dac1', borderRadius:12, padding:'1.25rem', marginBottom:24, boxShadow:'0 14px 32px rgba(8,47,87,0.09)' },
  historyHead: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:12 },
  historyTitle:{ margin:'4px 0 0', fontSize:18, color:'#082f57', fontWeight:850 },
  historyIntro:{ margin:'6px 0 0', color:'#658094', fontSize:13, maxWidth:760 },
  historyCount:{ background:'#fff1dd', color:'#e36800', borderRadius:999, padding:'6px 10px', fontSize:12, fontWeight:850 },
  historyList: { display:'grid', gap:10 },
  historyItem: { display:'flex', gap:10, alignItems:'center', padding:'12px', borderRadius:10, background:'#fff', border:'1px solid #efe8d4' },
  historyDot:  { width:10, height:10, borderRadius:999, background:'#ff8500', boxShadow:'0 0 0 4px #fff1dd', flex:'0 0 auto' },
  historyTask: { display:'block', color:'#082f57', fontSize:14 },
  historyText: { margin:'3px 0', color:'#31546e', fontSize:13, fontWeight:750 },
  historyMeta: { color:'#658094', fontSize:12 },
  historyEmpty:{ margin:0, color:'#658094', fontSize:13 },
  reportBtn:   { border:'none', background:'linear-gradient(135deg,#ff8500,#e36800)', color:'#fff', borderRadius:999, padding:'8px 12px', fontWeight:850, fontSize:12, cursor:'pointer', boxShadow:'0 8px 18px rgba(255,133,0,0.22)' },
  cardHistory: { marginTop:12, padding:'12px', borderRadius:10, background:'#fffaf0', border:'1px solid #efe8d4' },
  cardHistoryTop:{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, color:'#082f57', marginBottom:10 },
  miniTimeline:{ display:'grid', gap:8 },
  miniHistoryItem:{ display:'flex', gap:10, alignItems:'flex-start' },
  auditBtn:    { border:'none', background:'linear-gradient(135deg,#082f57,#117b82)', color:'#fffdfa', borderRadius:10, padding:'11px 14px', fontWeight:900, cursor:'pointer', boxShadow:'0 10px 24px rgba(8,47,87,0.18)' },
}
