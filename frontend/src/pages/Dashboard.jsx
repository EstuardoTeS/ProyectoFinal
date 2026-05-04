import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Dashboard() {
  const navigate = useNavigate()
  const role     = localStorage.getItem('role')
  const username = localStorage.getItem('username')
  const [stats, setStats] = useState({ clients:0, projects:0, tasks:0, employees:0 })
  const roleName = { admin:'Administrador', employee:'Empleado', client:'Cliente' }[role] ?? 'Usuario'

  useEffect(() => {
    const load = async () => {
      try {
        const requests = [api.get('/tasks/')]
        if (role !== 'employee') requests.push(api.get('/projects/'))
        if (role === 'admin') requests.push(api.get('/clients/'), api.get('/users/'))
        const responses = await Promise.all(requests)
        const taskCount = responses[0].data.length
        const projectCount = role !== 'employee' ? responses[1].data.length : 0
        const clientCount = role === 'admin' ? responses[2].data.length : 0
        const users = role === 'admin' ? responses[3].data : []
        setStats({
          clients: clientCount,
          projects: projectCount,
          tasks: taskCount,
          employees: users.filter(u => u.role === 'employee').length,
        })
      } catch (err) {
        console.error('No se pudo cargar el dashboard', err)
      }
    }
    load()
  }, [role])

  const cards = [
    ...(role === 'admin' ? [{ title:'Clientes',  value:stats.clients,  color:'#1a73e8', bg:'#e8f0fe', icon:'👥', path:'/clients',  desc:'Total registrados' }] : []),
    ...(role !== 'employee' ? [{ title:'Proyectos', value:stats.projects, color:'#0f9d58', bg:'#e6f4ea', icon:'📁', path:'/projects', desc:'Disponibles' }] : []),
    { title:'Tareas',    value:stats.tasks,    color:'#f4b400', bg:'#fff8e1', icon:'✅', path:'/tasks',    desc:'Registradas' },
    ...(role==='admin' ? [{ title:'Empleados', value:stats.employees, color:'#9c27b0', bg:'#f3e5f5', icon:'👷', path:'/users', desc:'Personal activo' }] : []),
  ]

  const adminActions = [
    { label:'➕ Nuevo Cliente',  path:'/clients',  color:'#1a73e8' },
    { label:'➕ Nuevo Proyecto', path:'/projects', color:'#0f9d58' },
    { label:'➕ Nueva Tarea',    path:'/tasks',    color:'#f4b400' },
    { label:'👷 Ver Empleados',  path:'/users',    color:'#9c27b0' },
  ]

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      <div style={styles.page}>

        {/* Bienvenida */}
        <div style={styles.welcome}>
          <div>
            <h2 style={styles.welcomeTitle}>Bienvenido, {username} 👋</h2>
            <p style={styles.welcomeSub}>
              {role === 'admin'
                ? 'Tienes acceso completo para supervisar clientes, empleados, proyectos y tareas.'
                : role === 'client'
                  ? 'Puedes consultar el avance de tus proyectos y generar reportes.'
                  : 'Puedes visualizar tus tareas asignadas y actualizar su estado.'}
            </p>
          </div>
          <span style={{...styles.roleBadge, background: role==='admin'?'#e8f0fe':'#e6f4ea', color: role==='admin'?'#1a73e8':'#0f9d58'}}>
            {role === 'admin' ? '🔑 ' : role === 'employee' ? '👷 ' : '👤 '}{roleName}
          </span>
        </div>

        {/* Estadísticas */}
        <div style={styles.grid}>
          {cards.map(c => (
            <div key={c.title} style={{...styles.card, borderTop:`3px solid ${c.color}`}}
              onClick={() => navigate(c.path)}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <p style={styles.cardLabel}>{c.title}</p>
                  <p style={{...styles.cardValue, color:c.color}}>{c.value}</p>
                  <p style={styles.cardDesc}>{c.desc}</p>
                </div>
                <span style={{...styles.cardIcon, background:c.bg}}>{c.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones rápidas solo admin */}
        {role === 'admin' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Acciones rápidas</h3>
            <div style={styles.actions}>
              {adminActions.map(a => (
                <button key={a.label} style={{...styles.actionBtn, background:a.color}}
                  onClick={() => navigate(a.path)}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page:         { padding:'2rem', maxWidth:1180, margin:'0 auto' },
  welcome:      { background:'linear-gradient(135deg, #111827 0%, #1e3a8a 100%)', color:'#fff', borderRadius:12, padding:'1.75rem 2rem', marginBottom:24, boxShadow:'0 18px 42px rgba(15,23,42,0.18)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 },
  welcomeTitle: { margin:'0 0 6px', fontSize:24, fontWeight:800, letterSpacing:0 },
  welcomeSub:   { margin:0, color:'rgba(255,255,255,0.78)', fontSize:14, maxWidth:650 },
  roleBadge:    { padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:750, border:'1px solid rgba(255,255,255,0.28)' },
  grid:         { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(230px,1fr))', gap:16, marginBottom:24 },
  card:         { background:'#fff', borderRadius:10, padding:'1.35rem 1.45rem', cursor:'pointer', boxShadow:'0 10px 28px rgba(15,23,42,0.08)', border:'1px solid #e5e7eb', transition:'transform .15s, box-shadow .15s' },
  cardLabel:    { margin:'0 0 4px', fontSize:12, color:'#64748b', fontWeight:750, textTransform:'uppercase' },
  cardValue:    { margin:'0 0 4px', fontSize:34, fontWeight:850, letterSpacing:0 },
  cardDesc:     { margin:0, fontSize:12, color:'#94a3b8' },
  cardIcon:     { width:50, height:50, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 },
  section:      { background:'#fff', borderRadius:10, padding:'1.5rem 1.75rem', boxShadow:'0 10px 28px rgba(15,23,42,0.08)', border:'1px solid #e5e7eb' },
  sectionTitle: { margin:'0 0 16px', fontSize:16, fontWeight:750, color:'#172033' },
  actions:      { display:'flex', gap:12, flexWrap:'wrap' },
  actionBtn:    { padding:'10px 18px', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:750, boxShadow:'0 8px 18px rgba(15,23,42,0.12)' },
}
