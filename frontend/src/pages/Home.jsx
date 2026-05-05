import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const services = [
    { title:'Gestión de proyectos', text:'Planificación, seguimiento y control de entregables desde una sola plataforma.', color:'#2563eb' },
    { title:'Operaciones y tareas', text:'Asignación de responsabilidades, estados de avance y trazabilidad por empleado.', color:'#16a34a' },
    { title:'Portal de clientes', text:'Visibilidad clara del progreso, responsables asignados y reportes imprimibles.', color:'#7c3aed' },
  ]

  const stats = [
    ['3', 'roles operativos'],
    ['100%', 'trazabilidad'],
    ['24/7', 'consulta web'],
    ['ERP', 'enfoque empresarial'],
  ]

  return (
    <div className="home-shell">
      <header className="home-topbar">
        <Link to="/" className="home-brand">
          <span className="home-brand-mark">TS</span>
          <span>
            <strong className="home-brand-name">TechSolutions</strong>
            <small className="home-brand-sub">Business ERP</small>
          </span>
        </Link>
        <nav className="home-nav">
          <a href="#servicios" className="home-nav-link">Servicios</a>
          <a href="#empresa" className="home-nav-link">Empresa</a>
          <Link to="/login" className="home-login-btn">Iniciar sesión</Link>
          <span className="home-menu-icon" aria-hidden="true">☰</span>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <img src="/erp-hero.png" alt="" className="home-hero-image" />
          <div className="home-hero-shade" />
          <div className="home-hero-content">
            <span className="home-eyebrow">Software empresarial para equipos en crecimiento</span>
            <h1 className="home-h1">Controla proyectos, tareas, clientes y personal desde un ERP moderno.</h1>
            <p className="home-hero-text">
              TechSolutions centraliza la operación de tu empresa con roles claros para administradores, empleados y clientes.
            </p>
            <div className="home-hero-actions">
              <Link to="/login" className="home-primary-btn">Acceder al sistema</Link>
              <a href="#servicios" className="home-secondary-btn">Ver soluciones</a>
            </div>
          </div>
        </section>

        <section className="home-stats-band">
          {stats.map(([value, label]) => (
            <div key={label} className="home-stat-item">
              <strong className="home-stat-value">{value}</strong>
              <span className="home-stat-label">{label}</span>
            </div>
          ))}
        </section>

        <section id="servicios" style={styles.section}>
          <div style={styles.sectionHead}>
            <span style={styles.sectionKicker}>Soluciones</span>
            <h2 style={styles.h2}>Una plataforma preparada para operación diaria.</h2>
            <p style={styles.sectionText}>Diseñada para que cada usuario vea únicamente la información que necesita para trabajar mejor.</p>
          </div>
          <div style={styles.serviceGrid}>
            {services.map(service => (
              <article key={service.title} style={styles.serviceCard}>
                <span style={{...styles.serviceIcon, background:service.color}} />
                <h3 style={styles.cardTitle}>{service.title}</h3>
                <p style={styles.cardText}>{service.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="empresa" style={styles.splitSection}>
          <div>
            <span style={styles.sectionKicker}>Empresa</span>
            <h2 style={styles.h2}>Tecnología para ordenar procesos y acelerar decisiones.</h2>
          </div>
          <div style={styles.copyBlock}>
            <p>
              TechSolutions desarrolla soluciones empresariales para centralizar información, reducir tareas manuales y mejorar la comunicación entre áreas.
            </p>
            <p>
              El sistema conecta la gestión interna con una experiencia transparente para clientes, permitiendo consultar avances y reportes sin depender de intercambios dispersos.
            </p>
          </div>
        </section>

        <section id="contacto" style={styles.cta}>
          <div>
            <span style={styles.sectionKicker}>Acceso seguro</span>
            <h2 style={styles.ctaTitle}>Ingresa al panel de gestión empresarial.</h2>
          </div>
          <Link to="/login" className="home-primary-btn">Entrar ahora</Link>
        </section>
      </main>
    </div>
  )
}

const styles = {
  shell: { minHeight:'100vh', background:'#f8fafc' },
  topbar: { minHeight:72, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'0.75rem clamp(1rem, 4vw, 2rem)', background:'rgba(255,255,255,0.94)', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:20, backdropFilter:'blur(14px)', maxWidth:'100vw', overflow:'hidden' },
  brand: { display:'flex', alignItems:'center', gap:12, textDecoration:'none', color:'#111827' },
  brandMark: { width:42, height:42, minWidth:42, borderRadius:9, background:'#111827', color:'#fff', display:'grid', placeItems:'center', fontWeight:850 },
  brandName: { display:'block', fontSize:'clamp(15px, 4vw, 17px)', fontWeight:850 },
  brandSub: { display:'block', color:'#64748b', fontSize:12, marginTop:1 },
  nav: { display:'flex', alignItems:'center', gap:'clamp(8px, 2vw, 18px)', minWidth:0 },
  navLink: { color:'#475569', textDecoration:'none', fontSize:'clamp(12px, 3.2vw, 14px)', fontWeight:750, whiteSpace:'nowrap' },
  loginBtn: { color:'#fff', background:'#2563eb', textDecoration:'none', padding:'10px 13px', borderRadius:8, fontSize:'clamp(12px, 3.2vw, 14px)', fontWeight:800, boxShadow:'0 10px 20px rgba(37,99,235,0.22)', whiteSpace:'nowrap' },
  hero: { minHeight:'calc(100vh - 72px)', position:'relative', display:'flex', alignItems:'center', overflow:'hidden', maxWidth:'100vw' },
  heroImage: { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' },
  heroShade: { position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(8,13,27,0.92) 0%, rgba(8,13,27,0.74) 42%, rgba(8,13,27,0.18) 100%)' },
  heroContent: { position:'relative', zIndex:1, width:'min(720px, calc(100vw - 2rem))', marginLeft:'clamp(1rem, 7vw, 6rem)', marginRight:'1rem', color:'#fff', padding:'4rem 0' },
  eyebrow: { display:'inline-flex', color:'#bfdbfe', background:'rgba(37,99,235,0.22)', border:'1px solid rgba(191,219,254,0.28)', padding:'7px 10px', borderRadius:8, fontSize:13, fontWeight:800, marginBottom:18 },
  h1: { fontSize:'clamp(34px, 10vw, 68px)', lineHeight:1.04, letterSpacing:0, margin:'0 0 18px', fontWeight:900, maxWidth:780 },
  heroText: { fontSize:'clamp(16px, 4.3vw, 18px)', lineHeight:1.55, color:'rgba(255,255,255,0.78)', margin:'0 0 26px', maxWidth:640 },
  heroActions: { display:'flex', gap:12, flexWrap:'wrap' },
  primaryBtn: { display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', background:'#2563eb', color:'#fff', borderRadius:8, textDecoration:'none', fontWeight:850, boxShadow:'0 12px 26px rgba(37,99,235,0.28)', flex:'0 1 auto' },
  secondaryBtn: { display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.24)', borderRadius:8, textDecoration:'none', fontWeight:800, flex:'0 1 auto' },
  statsBand: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:1, background:'#e5e7eb', width:'min(1180px, calc(100% - 2rem))', margin:'-42px auto 0', position:'relative', zIndex:2, borderRadius:10, overflow:'hidden', boxShadow:'0 18px 42px rgba(15,23,42,0.16)' },
  statItem: { background:'#fff', padding:'1.35rem', display:'flex', flexDirection:'column', gap:4 },
  statValue: { fontSize:28, fontWeight:900, color:'#111827' },
  statLabel: { color:'#64748b', fontSize:13, fontWeight:750 },
  section: { maxWidth:1180, margin:'0 auto', padding:'5rem 2rem 2rem' },
  sectionHead: { maxWidth:720, marginBottom:24 },
  sectionKicker: { color:'#2563eb', fontSize:12, fontWeight:900, textTransform:'uppercase' },
  h2: { fontSize:'clamp(28px, 3vw, 42px)', lineHeight:1.1, margin:'8px 0 12px', color:'#111827', fontWeight:900 },
  sectionText: { color:'#64748b', fontSize:16, lineHeight:1.6, margin:0 },
  serviceGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:16 },
  serviceCard: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'1.5rem', boxShadow:'0 10px 28px rgba(15,23,42,0.08)' },
  serviceIcon: { display:'block', width:36, height:8, borderRadius:999, marginBottom:18 },
  cardTitle: { margin:'0 0 10px', fontSize:18, color:'#111827', fontWeight:850 },
  cardText: { margin:0, color:'#64748b', lineHeight:1.55 },
  splitSection: { maxWidth:1180, margin:'0 auto', padding:'4rem 2rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:40, alignItems:'start' },
  copyBlock: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'1.5rem 1.75rem', color:'#475569', lineHeight:1.65, boxShadow:'0 10px 28px rgba(15,23,42,0.08)' },
  cta: { maxWidth:1180, margin:'0 auto 4rem', padding:'1.5rem 1.75rem', background:'#111827', color:'#fff', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'space-between', gap:18, boxShadow:'0 18px 42px rgba(15,23,42,0.18)' },
  ctaTitle: { margin:'8px 0 0', fontSize:28, lineHeight:1.15 },
}
