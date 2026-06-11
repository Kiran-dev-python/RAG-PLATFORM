import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, BarChart3, LogOut, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const handleLogout = () => { logout(); navigate('/login') }

  const links = [
    { to:'/', end:true, icon:<LayoutDashboard size={18}/>, label:'Workspaces' },
    { to:'/stats',      icon:<BarChart3 size={18}/>,       label:'Analytics' },
  ]
  const initials = (user?.full_name || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 64 : 232,
        background:'#6C63FF',
        borderRight:'none',
        display:'flex', flexDirection:'column', flexShrink:0,
        transition:'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow:'hidden', zIndex:10,
        boxShadow:'4px 0 20px rgba(108,99,255,0.3)',
      }}>

        {/* Logo row */}
        <div style={{
          height:64, flexShrink:0,
          borderBottom:'1px solid rgba(255,255,255,0.15)',
          display:'flex', alignItems:'center',
          padding: collapsed ? '0 14px' : '0 18px',
          gap:10, justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:'rgba(255,255,255,0.2)',
              border:'1px solid rgba(255,255,255,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Zap size={18} color="#fff" fill="#fff"/>
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.03em', color:'#fff', whiteSpace:'nowrap' }}>
                RAG<span style={{ color:'#fff', fontWeight:400 }}>Platform</span>
              </div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.55)', fontFamily:'var(--mono)', letterSpacing:'0.08em' }}>v1.0</div>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(c => !c)} style={{
            width:26, height:26, borderRadius:7, flexShrink:0,
            background:'rgba(255,255,255,0.15)',
            border:'1px solid rgba(255,255,255,0.25)',
            color:'rgba(255,255,255,0.8)',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.28)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
          >
            {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ padding:'12px 8px', display:'flex', flexDirection:'column', gap:3, flex:1 }}>
          {links.map(({ to, end, icon, label }) => (
            <NavLink key={to} to={to} end={end} title={collapsed ? label : ''}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '11px' : '10px 13px',
                borderRadius:9, fontSize:13.5, fontWeight:500,
                textDecoration:'none', transition:'all 0.15s ease',
                whiteSpace:'nowrap', overflow:'hidden',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.background.includes('0.22')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.style.background.includes('0.22')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                }
              }}
            >
              <span style={{ display:'flex', flexShrink:0 }}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding:'10px 8px', borderTop:'1px solid rgba(255,255,255,0.15)', flexShrink:0 }}>
          <div style={{
            display:'flex', alignItems:'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '8px 0' : '10px 12px',
            background:'rgba(255,255,255,0.13)',
            border:'1px solid rgba(255,255,255,0.2)',
            borderRadius:10, marginBottom:6, overflow:'hidden',
          }}>
            <div style={{
              width:30, height:30, borderRadius:'50%', flexShrink:0,
              background:'rgba(255,255,255,0.25)',
              border:'1.5px solid rgba(255,255,255,0.5)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:800, color:'#fff',
            }}>{initials}</div>
            {!collapsed && (
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user?.full_name || 'User'}
                </div>
                <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.55)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'var(--mono)' }}>
                  {user?.email}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleLogout} title={collapsed ? 'Sign out' : ''} style={{
            width:'100%', display:'flex', alignItems:'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: collapsed ? 0 : 8,
            padding: collapsed ? '9px 0' : '8px 12px',
            borderRadius:8, fontSize:13,
            color:'rgba(255,255,255,0.6)',
            transition:'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color='#fca5a5'; e.currentTarget.style.background='rgba(239,68,68,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.background='transparent'; }}
          >
            <LogOut size={14}/> {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>
        <Outlet/>
      </main>
    </div>
  )
}
