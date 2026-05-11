import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const formatDate = (value) => new Date(value).toLocaleString('es-GT', {
  day:'2-digit',
  month:'2-digit',
  year:'numeric',
  hour:'2-digit',
  minute:'2-digit',
})

const statusLabel = {
  pending:'Pendiente',
  in_progress:'En proceso',
  completed:'Finalizada',
  cancelled:'Cancelada',
}

export default function Audit() {
  const role = localStorage.getItem('role')
  const [history, setHistory] = useState([])
  const [query, setQuery] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/tasks/history/')
        setHistory(res.data)
      } catch (err) {
        try {
          const tasksRes = await api.get('/tasks/')
          const fallbackHistory = tasksRes.data.flatMap(task => {
            const realHistory = (task.history ?? []).map(item => ({
              ...item,
              task_title: task.title,
              project_name: task.project_name,
              client_name: task.client_name,
              assigned_to_username: task.assigned_to_username,
            }))

            if (realHistory.length > 0) return realHistory

            return [{
              id: `task-${task.id}`,
              action: 'current_snapshot',
              action_label: 'Estado actual registrado',
              previous_status_label: '',
              new_status_label: statusLabel[task.status] ?? task.status,
              changed_by_username: task.assigned_to_username || 'Sistema',
              task_title: task.title,
              project_name: task.project_name,
              client_name: task.client_name,
              assigned_to_username: task.assigned_to_username,
              note: task.progress_note || `Avance actual: ${task.progress ?? 0}%`,
              created_at: task.updated_at || task.created_at,
            }]
          })
          setHistory(fallbackHistory)
          setMsg('Vista de auditoría generada desde el estado actual de las tareas.')
        } catch {
          setMsg(err.response?.status === 404
            ? 'El backend desplegado aún no tiene activo el endpoint de auditoría.'
            : 'No se pudo cargar el historial de auditoría.')
        }
      }
    }
    if (role === 'admin') load()
  }, [role])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return history
    return history.filter(item => [
      item.project_name,
      item.client_name,
      item.task_title,
      item.assigned_to_username,
      item.changed_by_username,
      item.previous_status_label,
      item.new_status_label,
      item.note,
    ].some(value => String(value ?? '').toLowerCase().includes(term)))
  }, [history, query])

  const grouped = useMemo(() => filtered.reduce((acc, item) => {
    const project = item.project_name || 'Sin proyecto'
    if (!acc[project]) acc[project] = []
    acc[project].push(item)
    return acc
  }, {}), [filtered])

  if (role !== 'admin') {
    return (
      <>
        <Navbar />
        <main style={styles.page}>
          <p style={styles.error}>Acceso denegado. La auditoría solo está disponible para administradores.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="app-page" style={styles.page}>
        <header className="app-page-header" style={styles.header}>
          <div>
            <span className="app-page-kicker">Auditoría</span>
            <h1 style={styles.title}>Historial general de proyectos</h1>
            <p className="app-page-subtitle">
              Registro de cambios de estado en tareas con fecha, hora, responsable y usuario que realizó cada movimiento.
            </p>
          </div>
          <button type="button" style={styles.printBtn} onClick={() => window.print()}>Imprimir auditoría</button>
        </header>

        {msg && <p style={styles.error}>{msg}</p>}

        <section style={styles.toolbar}>
          <input
            style={styles.search}
            placeholder="Buscar por proyecto, tarea, cliente, empleado o estado..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span style={styles.count}>{filtered.length} movimientos</span>
        </section>

        <section style={styles.list}>
          {filtered.length === 0 && <p style={styles.empty}>No hay movimientos para mostrar.</p>}
          {Object.entries(grouped).map(([projectName, items]) => (
            <article key={projectName} style={styles.card}>
              <div style={styles.cardHead}>
                <div>
                  <span style={styles.kicker}>Proyecto</span>
                  <h2 style={styles.projectName}>{projectName}</h2>
                  <p style={styles.client}>{items[0]?.client_name || 'Sin cliente registrado'}</p>
                </div>
                <span style={styles.badge}>{items.length} cambios</span>
              </div>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha y hora</th>
                      <th style={styles.th}>Tarea</th>
                      <th style={styles.th}>Cambio</th>
                      <th style={styles.th}>Empleado</th>
                      <th style={styles.th}>Usuario</th>
                      <th style={styles.th}>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td style={styles.td}>{formatDate(item.created_at)}</td>
                        <td style={styles.td}><strong>{item.task_title}</strong></td>
                        <td style={styles.td}>
                          <span style={styles.flow}>
                            {item.action === 'status_changed'
                              ? `${item.previous_status_label || 'Sin estado'} -> ${item.new_status_label || 'Sin estado'}`
                              : item.action_label}
                          </span>
                        </td>
                        <td style={styles.td}>{item.assigned_to_username || 'Sin asignar'}</td>
                        <td style={styles.td}>{item.changed_by_username || 'Sistema'}</td>
                        <td style={styles.td}>{item.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}

const styles = {
  page: { padding:'2rem', maxWidth:1220, margin:'0 auto' },
  header: { alignItems:'center' },
  title: { margin:'4px 0 8px', color:'#082f57', fontSize:30, fontWeight:900 },
  toolbar: { display:'flex', alignItems:'center', gap:12, marginBottom:18 },
  search: { flex:1, padding:'12px 14px', border:'1px solid #e4dac1', borderRadius:10, background:'#fffdfa', color:'#082f57', fontSize:14 },
  count: { background:'#fff1dd', color:'#e36800', borderRadius:999, padding:'8px 12px', fontSize:12, fontWeight:900 },
  printBtn: { border:'none', background:'linear-gradient(135deg,#ff8500,#e36800)', color:'#fff', borderRadius:10, padding:'11px 14px', fontWeight:900, cursor:'pointer', boxShadow:'0 10px 22px rgba(255,133,0,0.24)' },
  error: { background:'#fce8e6', color:'#c5221f', border:'1px solid #f5c2bd', borderRadius:10, padding:'12px 14px', fontWeight:750 },
  empty: { color:'#658094' },
  list: { display:'grid', gap:16 },
  card: { background:'#fffdfa', border:'1px solid #e4dac1', borderRadius:14, overflow:'hidden', boxShadow:'0 16px 36px rgba(8,47,87,0.1)' },
  cardHead: { display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, padding:'18px 20px', background:'linear-gradient(135deg,#041c34,#082f57 62%,#117b82)', color:'#fffdfa' },
  kicker: { color:'#f2dfb8', textTransform:'uppercase', fontSize:11, fontWeight:900 },
  projectName: { margin:'3px 0', fontSize:21, fontWeight:900 },
  client: { margin:0, color:'rgba(255,253,250,0.75)', fontSize:13 },
  badge: { background:'#fff1dd', color:'#e36800', borderRadius:999, padding:'7px 11px', fontSize:12, fontWeight:900 },
  tableWrap: { overflowX:'auto' },
  table: { width:'100%', minWidth:920, borderCollapse:'collapse' },
  th: { textAlign:'left', background:'#fff8e9', color:'#31546e', fontSize:11, textTransform:'uppercase', letterSpacing:'0.03em', padding:'12px 14px', borderBottom:'1px solid #e4dac1' },
  td: { padding:'13px 14px', borderBottom:'1px solid #efe8d4', color:'#31546e', fontSize:13, verticalAlign:'top' },
  flow: { color:'#117b82', fontWeight:900 },
}
