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
    ...(role !== 'employee' ? [{ to:'/projects', label: role === 'client' ? '📁 Mis proyectos' : '📁 Proyectos' }] : []),
    { to:'/tasks',     label:'✅ Tareas' },
    ...(role === 'admin' || role === 'employee' ? [{ to:'/chat', label:'💬 Chat' }] : []),
    ...(role === 'admin' ? [{ to:'/users', label:'👷 Empleados' }] : []),
    ...(role === 'admin' ? [{ to:'http://127.0.0.1:8000/admin/', label:'🔧 Panel Admin', external:true }] : []),
  ]

  const appLinks = links.filter(l => !l.external)

  return (
    <>
    <nav className="app-navbar" style={styles.nav}>
      <div className="app-navbar-brand" style={styles.brand}>
        <span style={styles.brandName}>TechSolutions</span>
        <span style={styles.brandSub}>ERP</span>
      </div>
      <div className="app-navbar-links" style={styles.links}>
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
      <div className="app-navbar-session" style={styles.right}>
        <span style={styles.userInfo}>👤 {username} · <strong>{roleLabel}</strong></span>
        <button onClick={logout} style={styles.logout}>Salir</button>
      </div>
    </nav>
    <nav className="native-tabbar" aria-label="Navegación principal">
      {appLinks.map(l => (
        <Link
          key={l.to}
          to={l.to}
          className={`native-tabbar-item ${location.pathname === l.to ? 'is-active' : ''}`}
        >
          <span className="native-tabbar-icon">{l.label.split(' ')[0]}</span>
          <span className="native-tabbar-text">{l.label.replace(/^.\s/, '')}</span>
        </Link>
      ))}
    </nav>
    </>
  )
}

const styles = {
  nav:       { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', height:68, background:'#111827', color:'#fff', position:'sticky', top:0, zIndex:100, boxShadow:'0 16px 36px rgba(15,23,42,0.18)' },
  brand:     { display:'flex', alignItems:'baseline', gap:6 },
  brandName: { fontWeight:800, fontSize:20, letterSpacing:0 },
  brandSub:  { fontSize:11, background:'#2563eb', padding:'3px 7px', borderRadius:6, fontWeight:700 },
  links:     { display:'flex', gap:6, alignItems:'center' },
  link:      { color:'rgba(255,255,255,0.78)', textDecoration:'none', fontSize:13, fontWeight:650, padding:'9px 12px', borderRadius:8, transition:'background .15s, color .15s' },
  linkActive:{ background:'rgba(255,255,255,0.12)', color:'#fff' },
  right:     { display:'flex', alignItems:'center', gap:12 },
  userInfo:  { fontSize:13, color:'rgba(255,255,255,0.88)', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', padding:'7px 10px', borderRadius:9 },
  logout:    { background:'#ef4444', border:'1px solid rgba(255,255,255,0.12)', color:'#fff', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:700, boxShadow:'0 8px 16px rgba(239,68,68,0.22)' },
}
