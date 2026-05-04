import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const role     = localStorage.getItem('role')
  const username = localStorage.getItem('username')
  const roleLabel = { admin:'Administrador', employee:'Empleado', client:'Cliente' }[role] ?? role

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const links = [
    { to:'/dashboard', label:'🏠 Inicio' },
    ...(role === 'admin' ? [{ to:'/clients', label:'👥 Clientes' }] : []),
    ...(role !== 'employee' ? [{ to:'/projects', label:'📁 Proyectos' }] : []),
    { to:'/tasks',     label:'✅ Tareas' },
    ...(role === 'admin' ? [{ to:'/users', label:'👷 Empleados' }] : []),
    ...(role === 'admin' ? [{ to:'http://127.0.0.1:8000/admin/', label:'🔧 Panel Admin', external:true }] : []),
  ]

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.brandName}>TechSolutions</span>
        <span style={styles.brandSub}>ERP</span>
      </div>
      <div style={styles.links}>
        {links.map(l => l.external ? (
          <a key={l.to} href={l.to} target="_blank" rel="noreferrer"
            style={styles.link}>{l.label}</a>
        ) : (
          <Link key={l.to} to={l.to}
            style={{...styles.link, ...(location.pathname===l.to ? styles.linkActive : {})}}>
            {l.label}
          </Link>
        ))}
      </div>
      <div style={styles.right}>
        <span style={styles.userInfo}>👤 {username} · <strong>{roleLabel}</strong></span>
        <button onClick={logout} style={styles.logout}>Salir</button>
      </div>
    </nav>
  )
}

const styles = {
  nav:       { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', height:60, background:'#1a73e8', color:'#fff', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 8px #0002' },
  brand:     { display:'flex', alignItems:'baseline', gap:6 },
  brandName: { fontWeight:700, fontSize:20 },
  brandSub:  { fontSize:11, background:'rgba(255,255,255,0.25)', padding:'2px 6px', borderRadius:4 },
  links:     { display:'flex', gap:4 },
  link:      { color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:13, fontWeight:500, padding:'6px 12px', borderRadius:6, transition:'background .15s' },
  linkActive:{ background:'rgba(255,255,255,0.2)', color:'#fff' },
  right:     { display:'flex', alignItems:'center', gap:12 },
  userInfo:  { fontSize:13, color:'rgba(255,255,255,0.9)' },
  logout:    { background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:13 },
}
