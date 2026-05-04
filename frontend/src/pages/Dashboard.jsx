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
    <div style={{ minHeight:'100vh', background:'#f8f9fa' }}>
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
                  ? 'Puedes crear tareas y consultar el avance de tus solicitudes.'
                  : 'Puedes visualizar tus tareas asignadas y registrar el avance realizado.'}
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
  page:         { padding:'2rem', maxWidth:1100, margin:'0 auto' },
  welcome:      { background:'#fff', borderRadius:12, padding:'1.5rem 2rem', marginBottom:24, boxShadow:'0 2px 8px #0001', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 },
  welcomeTitle: { margin:'0 0 6px', fontSize:22, fontWeight:700 },
  welcomeSub:   { margin:0, color:'#666', fontSize:14 },
  roleBadge:    { padding:'8px 16px', borderRadius:20, fontSize:13, fontWeight:600 },
  grid:         { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16, marginBottom:24 },
  card:         { background:'#fff', borderRadius:10, padding:'1.25rem 1.5rem', cursor:'pointer', boxShadow:'0 2px 8px #0001', transition:'transform .15s' },
  cardLabel:    { margin:'0 0 4px', fontSize:13, color:'#888', fontWeight:500 },
  cardValue:    { margin:'0 0 4px', fontSize:32, fontWeight:700 },
  cardDesc:     { margin:0, fontSize:12, color:'#aaa' },
  cardIcon:     { width:52, height:52, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 },
  section:      { background:'#fff', borderRadius:12, padding:'1.5rem 2rem', boxShadow:'0 2px 8px #0001' },
  sectionTitle: { margin:'0 0 16px', fontSize:16, fontWeight:600, color:'#333' },
  actions:      { display:'flex', gap:12, flexWrap:'wrap' },
  actionBtn:    { padding:'10px 20px', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:500 },
}
