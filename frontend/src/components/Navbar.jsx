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
    { to:'/dashboard', icon:'⌂', label:'Inicio' },
    ...(role === 'admin' ? [{ to:'/clients', icon:'◎', label:'Clientes' }] : []),
    ...(role !== 'employee' ? [{ to:'/projects', icon:'▣', label: role === 'client' ? 'Mis proyectos' : 'Proyectos' }] : []),
    { to:'/tasks', icon:'✓', label:'Tareas' },
    ...(role === 'admin' ? [{ to:'/audit', icon:'◷', label:'Auditoría' }] : []),
    ...(role === 'admin' ? [{ to:'/users', icon:'◆', label:'Empleados' }] : []),
    ...(role === 'admin' ? [{ to:'http://127.0.0.1:8000/admin/', icon:'⚙', label:'Panel Admin', external:true }] : []),
  ]

  const appLinks = links.filter(l => !l.external)

  return (
    <>
    <nav className="app-navbar">
      <div className="app-navbar-brand">
        <span className="app-navbar-mark">TS</span>
        <span className="app-navbar-brand-text">
          <span className="app-navbar-brand-name">TechSolutions</span>
          <span className="app-navbar-brand-sub">ERP</span>
        </span>
      </div>
      <div className="app-navbar-links">
        {links.map(l => l.external ? (
          <a key={l.to} href={l.to} target="_blank" rel="noreferrer"
            className="app-navbar-link">
            <span className="app-navbar-link-icon">{l.icon}</span>
            <span>{l.label}</span>
          </a>
        ) : (
          <Link key={l.to} to={l.to}
            className={`app-navbar-link ${location.pathname===l.to ? 'is-active' : ''}`}>
            <span className="app-navbar-link-icon">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </div>
      <div className="app-navbar-session">
        <span className="app-navbar-user">
          <span className="app-navbar-user-name">{username}</span>
          <span className="app-navbar-user-role">{roleLabel}</span>
        </span>
        <button onClick={logout} className="app-navbar-logout">Salir</button>
      </div>
    </nav>
    <nav className="native-tabbar" aria-label="Navegación principal">
      {appLinks.map(l => (
        <Link
          key={l.to}
          to={l.to}
          className={`native-tabbar-item ${location.pathname === l.to ? 'is-active' : ''}`}
        >
          <span className="native-tabbar-icon">{l.icon}</span>
          <span className="native-tabbar-text">{l.label}</span>
        </Link>
      ))}
    </nav>
    </>
  )
}
