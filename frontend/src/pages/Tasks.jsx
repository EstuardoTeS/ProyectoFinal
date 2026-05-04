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
  const role = localStorage.getItem('role')
  const canCreate = role === 'admin' || role === 'client'
  const isAdmin = role === 'admin'
  const isEmployee = role === 'employee'

  useEffect(() => {
    const load = async () => {
      const requests = [api.get('/tasks/')]
      if (!isEmployee) requests.push(api.get('/projects/'))
      if (isAdmin) requests.push(api.get('/users/'))
      const responses = await Promise.all(requests)
      setTasks(responses[0].data)
      setProjects(!isEmployee ? responses[1].data : [])
      setUsers(isAdmin ? responses[2].data.filter(u => u.role === 'employee' && u.is_active) : [])
    }
    load()
  }, [isAdmin, isEmployee])

  const reload = async () => {
    const res = await api.get('/tasks/')
    setTasks(res.data)
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
        setMsg(role === 'client' ? 'Solicitud creada y asignada automáticamente' : 'Tarea creada')
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

  const updateProgress = async (task, values) => {
    await api.patch(`/tasks/${task.id}/`, values)
    await reload()
    setMsg('Avance actualizado')
  }

  const priorityColor = { low:'#0f9d58', medium:'#f4b400', high:'#e53e3e' }
  const priorityLabel = { low:'Baja', medium:'Media', high:'Alta' }
  const statusLabel = { pending:'Pendiente', in_progress:'En progreso', review:'En revisión', completed:'Completada' }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.title}>{isEmployee ? 'Mis tareas' : 'Tareas'}</h2>
        {msg && <p style={styles.msg}>{msg}</p>}

        {canCreate && (
          <form onSubmit={save} style={styles.form}>
            <h3 style={styles.formTitle}>{editing ? 'Editar tarea' : role === 'client' ? 'Nueva solicitud' : 'Nueva tarea'}</h3>
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
                  <span style={{...styles.badge, background:'#f1f3f4', color:'#333'}}>{priorityLabel[t.priority]}</span>
                  <span style={{...styles.badge, background:'#e8f0fe', color:'#1a73e8'}}>{statusLabel[t.status]}</span>
                </div>
              </div>
              <div style={styles.progressWrap}>
                <div style={{...styles.progressBar, width:`${t.progress ?? 0}%`}} />
              </div>
              <div style={{display:'flex', gap:16, flexWrap:'wrap', marginTop:8}}>
                <span style={styles.meta}>Proyecto: <strong>{t.project_name ?? projects.find(p=>p.id===t.project)?.name ?? '-'}</strong></span>
                <span style={styles.meta}>Responsable: <strong>{t.assigned_to_username ?? 'Sin asignar'}</strong></span>
                <span style={styles.meta}>Avance: <strong>{t.progress ?? 0}%</strong></span>
                {t.due_date && <span style={styles.meta}>Vence: <strong>{t.due_date}</strong></span>}
              </div>
              {t.progress_note && <p style={styles.note}>{t.progress_note}</p>}
              {(isEmployee || isAdmin) && (
                <div style={styles.updateBox}>
                  <select style={styles.statusSelect} defaultValue={t.status} onChange={e=>updateProgress(t, { status:e.target.value })}>
                    {Object.entries(statusLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                  <input type="number" min="0" max="100" defaultValue={t.progress ?? 0} style={styles.smallInput}
                    onBlur={e=>updateProgress(t, { progress:Number(e.target.value) })}/>
                  <input placeholder="Nota de avance" defaultValue={t.progress_note ?? ''} style={styles.noteInput}
                    onBlur={e=>updateProgress(t, { progress_note:e.target.value })}/>
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
  page:        { padding:'2rem', maxWidth:1000, margin:'0 auto' },
  title:       { fontSize:22, fontWeight:700, marginBottom:16 },
  msg:         { background:'#e6f4ea', color:'#137333', padding:'8px 14px', borderRadius:6, marginBottom:16 },
  form:        { background:'#fff', padding:'1.5rem', borderRadius:10, marginBottom:24, boxShadow:'0 2px 8px #0001' },
  formTitle:   { margin:'0 0 16px', fontSize:16, fontWeight:600 },
  row:         { display:'flex', flexWrap:'wrap', gap:10, marginBottom:12 },
  label:       { fontSize:12, color:'#666', display:'block', marginBottom:4 },
  input:       { padding:'9px 12px', borderRadius:7, border:'1px solid #ddd', fontSize:14, flex:1, boxSizing:'border-box' },
  btn:         { padding:'9px 20px', background:'#f4b400', color:'#fff', border:'none', borderRadius:7, fontWeight:600, cursor:'pointer' },
  btnGray:     { padding:'9px 20px', background:'#eee', color:'#333', border:'none', borderRadius:7, fontWeight:600, cursor:'pointer' },
  list:        { display:'flex', flexDirection:'column', gap:12 },
  card:        { background:'#fff', borderRadius:10, padding:'1.25rem', boxShadow:'0 2px 8px #0001' },
  cardTitle:   { margin:'0 0 4px', fontSize:16, fontWeight:600 },
  cardDesc:    { color:'#666', fontSize:14, margin:0 },
  badge:       { padding:'4px 10px', borderRadius:12, fontSize:12, fontWeight:500 },
  meta:        { fontSize:13, color:'#555' },
  note:        { fontSize:13, background:'#f8f9fa', padding:'8px 10px', borderRadius:7, color:'#555' },
  progressWrap:{ height:8, background:'#f1f3f4', borderRadius:8, overflow:'hidden', marginTop:12 },
  progressBar: { height:'100%', background:'#0f9d58' },
  updateBox:   { display:'flex', gap:8, flexWrap:'wrap', marginTop:12 },
  statusSelect:{ padding:'7px 8px', borderRadius:6, border:'1px solid #ddd', fontSize:12, cursor:'pointer' },
  smallInput:  { width:80, padding:'7px 8px', borderRadius:6, border:'1px solid #ddd' },
  noteInput:   { flex:1, minWidth:220, padding:'7px 8px', borderRadius:6, border:'1px solid #ddd' },
  btnSm:       { padding:'5px 14px', background:'#1a73e8', color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12 },
}
