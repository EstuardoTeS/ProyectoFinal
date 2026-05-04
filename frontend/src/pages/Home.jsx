import { Link } from 'react-router-dom'

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
    <div style={styles.shell}>
      <header style={styles.topbar}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandMark}>TS</span>
          <span>
            <strong style={styles.brandName}>TechSolutions</strong>
            <small style={styles.brandSub}>Business ERP</small>
          </span>
        </Link>
        <nav style={styles.nav}>
          <a href="#servicios" style={styles.navLink}>Servicios</a>
          <a href="#empresa" style={styles.navLink}>Empresa</a>
          <a href="#contacto" style={styles.navLink}>Contacto</a>
          <Link to="/login" style={styles.loginBtn}>Iniciar sesión</Link>
        </nav>
      </header>

      <main>
        <section style={styles.hero}>
          <img src="/erp-hero.png" alt="" style={styles.heroImage} />
          <div style={styles.heroShade} />
          <div style={styles.heroContent}>
            <span style={styles.eyebrow}>Software empresarial para equipos en crecimiento</span>
            <h1 style={styles.h1}>Controla proyectos, tareas, clientes y personal desde un ERP moderno.</h1>
            <p style={styles.heroText}>
              TechSolutions centraliza la operación de tu empresa con roles claros para administradores, empleados y clientes.
            </p>
            <div style={styles.heroActions}>
              <Link to="/login" style={styles.primaryBtn}>Acceder al sistema</Link>
              <a href="#servicios" style={styles.secondaryBtn}>Ver soluciones</a>
            </div>
          </div>
        </section>

        <section style={styles.statsBand}>
          {stats.map(([value, label]) => (
            <div key={label} style={styles.statItem}>
              <strong style={styles.statValue}>{value}</strong>
              <span style={styles.statLabel}>{label}</span>
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
          <Link to="/login" style={styles.primaryBtn}>Entrar ahora</Link>
        </section>
      </main>
    </div>
  )
}

const styles = {
  shell: { minHeight:'100vh', background:'#f8fafc' },
  topbar: { height:76, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', background:'rgba(255,255,255,0.92)', borderBottom:'1px solid #e5e7eb', position:'sticky', top:0, zIndex:20, backdropFilter:'blur(14px)' },
  brand: { display:'flex', alignItems:'center', gap:12, textDecoration:'none', color:'#111827' },
  brandMark: { width:42, height:42, borderRadius:9, background:'#111827', color:'#fff', display:'grid', placeItems:'center', fontWeight:850 },
  brandName: { display:'block', fontSize:17, fontWeight:850 },
  brandSub: { display:'block', color:'#64748b', fontSize:12, marginTop:1 },
  nav: { display:'flex', alignItems:'center', gap:18 },
  navLink: { color:'#475569', textDecoration:'none', fontSize:14, fontWeight:750 },
  loginBtn: { color:'#fff', background:'#2563eb', textDecoration:'none', padding:'10px 15px', borderRadius:8, fontSize:14, fontWeight:800, boxShadow:'0 10px 20px rgba(37,99,235,0.22)' },
  hero: { minHeight:'calc(100vh - 76px)', position:'relative', display:'flex', alignItems:'center', overflow:'hidden' },
  heroImage: { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' },
  heroShade: { position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(8,13,27,0.92) 0%, rgba(8,13,27,0.74) 42%, rgba(8,13,27,0.18) 100%)' },
  heroContent: { position:'relative', zIndex:1, width:'min(720px, 92vw)', marginLeft:'clamp(1.5rem, 7vw, 6rem)', color:'#fff', padding:'4rem 0' },
  eyebrow: { display:'inline-flex', color:'#bfdbfe', background:'rgba(37,99,235,0.22)', border:'1px solid rgba(191,219,254,0.28)', padding:'7px 10px', borderRadius:8, fontSize:13, fontWeight:800, marginBottom:18 },
  h1: { fontSize:'clamp(38px, 5vw, 68px)', lineHeight:1.02, letterSpacing:0, margin:'0 0 18px', fontWeight:900, maxWidth:780 },
  heroText: { fontSize:18, lineHeight:1.6, color:'rgba(255,255,255,0.78)', margin:'0 0 26px', maxWidth:640 },
  heroActions: { display:'flex', gap:12, flexWrap:'wrap' },
  primaryBtn: { display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', background:'#2563eb', color:'#fff', borderRadius:8, textDecoration:'none', fontWeight:850, boxShadow:'0 12px 26px rgba(37,99,235,0.28)' },
  secondaryBtn: { display:'inline-flex', alignItems:'center', justifyContent:'center', minHeight:44, padding:'0 18px', background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.24)', borderRadius:8, textDecoration:'none', fontWeight:800 },
  statsBand: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:1, background:'#e5e7eb', maxWidth:1180, margin:'-42px auto 0', position:'relative', zIndex:2, borderRadius:10, overflow:'hidden', boxShadow:'0 18px 42px rgba(15,23,42,0.16)' },
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
