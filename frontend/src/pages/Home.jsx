import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const services = [
    { title:'Gestión de proyectos', text:'Planificación, seguimiento y control de entregables desde una sola plataforma.', color:'#2aa2a5' },
    { title:'Operaciones y tareas', text:'Asignación de responsabilidades, estados de avance y trazabilidad por empleado.', color:'#ff8500' },
    { title:'Portal de clientes', text:'Visibilidad clara del progreso, responsables asignados y reportes imprimibles.', color:'#082f57' },
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
  shell: { minHeight:'100vh', background:'#fffdfa' },
  topbar: { minHeight:72, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'0.75rem clamp(1rem, 4vw, 2rem)', background:'#082f57', borderBottom:'1px solid rgba(239,232,212,0.14)', position:'sticky', top:0, zIndex:20, backdropFilter:'blur(14px)', maxWidth:'100vw', overflow:'hidden' },
  brand: { display:'flex', alignItems:'center', gap:12, textDecoration:'none', color:'#fff8e9' },
  brandMark: { width:42, height:42, minWidth:42, borderRadius:9, background:'#ff8500', color:'#fff', display:'grid', placeItems:'center', fontWeight:850 },
  brandName: { display:'block', fontSize:'clamp(15px, 4vw, 17px)', fontWeight:850 },
  brandSub: { display:'block', color:'#f2dfb8', fontSize:12, marginTop:1 },
  nav: { display:'flex', alignItems:'center', gap:'clamp(8px, 2vw, 18px)', minWidth:0 },
  navLink: { color:'rgba(255,253,247,0.78)', textDecoration:'none', fontSize:'clamp(12px, 3.2vw, 14px)', fontWeight:750, whiteSpace:'nowrap' },
  loginBtn: { color:'#fff', background:'#ff8500', textDecoration:'none', padding:'10px 13px', borderRadius:8, fontSize:'clamp(12px, 3.2vw, 14px)', fontWeight:800, boxShadow:'0 10px 20px rgba(255,133,0,0.24)', whiteSpace:'nowrap' },
  hero: { minHeight:'calc(100vh - 72px)', position:'relative', display:'flex', alignItems:'center', overflow:'hidden', maxWidth:'100vw' },
  heroImage: { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' },
  heroShade: { position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(4,28,52,0.96) 0%, rgba(8,47,87,0.82) 48%, rgba(42,162,165,0.3) 100%)' },
  heroContent: { position:'relative', zIndex:1, width:'min(720px, calc(100vw - 2rem))', marginLeft:'clamp(1rem, 7vw, 6rem)', marginRight:'1rem', color:'#fff', padding:'4rem 0' },
  eyebrow: { display:'inline-flex', color:'#fff8e9', background:'rgba(42,162,165,0.28)', border:'1px solid rgba(239,232,212,0.28)', padding:'7px 10px', borderRadius:8, fontSize:13, fontWeight:800, marginBottom:18 },
  h1: { fontSize:'clamp(34px, 10vw, 68px)', lineHeight:1.04, letterSpacing:0, margin:'0 0 18px', fontWeight:900, maxWidth:780 },
  heroText: { fontSize:'clamp(16px, 4.3vw, 18px)', lineHeight:1.55, color:'rgba(255,255,255,0.78)', margin:'0 0 26px', maxWidth:640 },
  heroActions: { display:'flex', gap:12, flexWrap:'wrap' },
  primaryBtn: { display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', background:'#ff8500', color:'#fff', borderRadius:8, textDecoration:'none', fontWeight:850, boxShadow:'0 12px 26px rgba(255,133,0,0.28)', flex:'0 1 auto' },
  secondaryBtn: { display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.24)', borderRadius:8, textDecoration:'none', fontWeight:800, flex:'0 1 auto' },
  statsBand: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:1, background:'#e4dac1', width:'min(1180px, calc(100% - 2rem))', margin:'-42px auto 0', position:'relative', zIndex:2, borderRadius:10, overflow:'hidden', boxShadow:'0 18px 42px rgba(8,47,87,0.16)' },
  statItem: { background:'#fffdfa', padding:'1.35rem', display:'flex', flexDirection:'column', gap:4 },
  statValue: { fontSize:28, fontWeight:900, color:'#082f57' },
  statLabel: { color:'#658094', fontSize:13, fontWeight:750 },
  section: { maxWidth:1180, margin:'0 auto', padding:'5rem 2rem 2rem' },
  sectionHead: { maxWidth:720, marginBottom:24 },
  sectionKicker: { color:'#2aa2a5', fontSize:12, fontWeight:900, textTransform:'uppercase' },
  h2: { fontSize:'clamp(28px, 3vw, 42px)', lineHeight:1.1, margin:'8px 0 12px', color:'#082f57', fontWeight:900 },
  sectionText: { color:'#658094', fontSize:16, lineHeight:1.6, margin:0 },
  serviceGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:16 },
  serviceCard: { background:'#fffdfa', border:'1px solid #e4dac1', borderRadius:10, padding:'1.5rem', boxShadow:'0 10px 28px rgba(8,47,87,0.08)' },
  serviceIcon: { display:'block', width:36, height:8, borderRadius:999, marginBottom:18 },
  cardTitle: { margin:'0 0 10px', fontSize:18, color:'#082f57', fontWeight:850 },
  cardText: { margin:0, color:'#658094', lineHeight:1.55 },
  splitSection: { maxWidth:1180, margin:'0 auto', padding:'4rem 2rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:40, alignItems:'start' },
  copyBlock: { background:'#fffdfa', border:'1px solid #e4dac1', borderRadius:10, padding:'1.5rem 1.75rem', color:'#31546e', lineHeight:1.65, boxShadow:'0 10px 28px rgba(8,47,87,0.08)' },
  cta: { maxWidth:1180, margin:'0 auto 4rem', padding:'1.5rem 1.75rem', background:'#082f57', color:'#fff', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'space-between', gap:18, boxShadow:'0 18px 42px rgba(8,47,87,0.18)' },
  ctaTitle: { margin:'8px 0 0', fontSize:28, lineHeight:1.15 },
}
