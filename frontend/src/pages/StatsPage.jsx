import { useEffect, useState } from 'react'
import { LayoutDashboard, FileText, MessageSquare, Clock, TrendingUp, Loader2, Zap, Activity } from 'lucide-react'
import api from '../api/client'
import { formatDistanceToNow } from 'date-fns'

const TILES = [
  { key:'total_workspaces', label:'Workspaces',    icon:<LayoutDashboard size={22}/>, col:'#c084fc', glow:'rgba(192,132,252,0.5)', grad:'linear-gradient(135deg,#c084fc,#f0abfc)', bg:'rgba(192,132,252,0.1)', border:'rgba(192,132,252,0.3)' },
  { key:'total_docs',       label:'Docs Indexed',  icon:<FileText size={22}/>,        col:'#00ff88', glow:'rgba(0,255,136,0.45)',  grad:'linear-gradient(135deg,#00ff88,#22d3ee)', bg:'rgba(0,255,136,0.08)', border:'rgba(0,255,136,0.28)' },
  { key:'total_queries',    label:'Total Queries', icon:<MessageSquare size={22}/>,   col:'#22d3ee', glow:'rgba(34,211,238,0.45)', grad:'linear-gradient(135deg,#22d3ee,#c084fc)', bg:'rgba(34,211,238,0.08)', border:'rgba(34,211,238,0.28)' },
  { key:'avg_duration_ms',  label:'Avg Response',  icon:<Clock size={22}/>,           col:'#fbbf24', glow:'rgba(251,191,36,0.45)', grad:'linear-gradient(135deg,#fbbf24,#f43f5e)', bg:'rgba(251,191,36,0.08)', border:'rgba(251,191,36,0.28)', isMs:true },
]

export default function StatsPage() {
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    api.get('/stats/').then(({ data }) => {
      setStats(data); setLoading(false)
      setTimeout(() => setVisible(true), 120)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',gap:10,color:'var(--text3)' }}>
      <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/> Loading analytics…
    </div>
  )

  return (
    <div style={{ height:'100%',overflowY:'auto',padding:'28px 36px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom:30,animation:'fadeUp 0.4s ease both' }}>
        <div style={{ fontSize:11.5,color:'var(--text3)',fontFamily:'var(--mono)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:4 }}>Analytics</div>
        <h1 style={{ fontSize:28,fontWeight:900,letterSpacing:'-0.04em',lineHeight:1 }}>
          Usage <span className="gv">Overview</span>
        </h1>
      </div>

      {/* Stat tiles */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(215px,1fr))',gap:14,marginBottom:26 }}>
        {TILES.map((t,i) => {
          const raw = stats?.[t.key] ?? 0
          const display = t.isMs ? (raw ? `${Math.round(raw)}ms` : '—') : raw
          return <StatTile key={t.key} {...t} value={display} delay={i*0.08} visible={visible}/>
        })}
      </div>

      {/* Performance */}
      {(stats?.total_queries||0) > 0 && (
        <div style={{ background:'linear-gradient(145deg,rgba(192,132,252,0.06),var(--bg1))',border:'1.5px solid rgba(192,132,252,0.22)',borderRadius:'var(--r2)',padding:'22px 26px',marginBottom:24,animation:'fadeUp 0.45s 0.22s both ease',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#c084fc,#f0abfc)',opacity:0.7 }}/>
          <div style={{ display:'flex',alignItems:'center',gap:9,marginBottom:18 }}>
            <Activity size={14} style={{ color:'var(--v)' }}/>
            <h2 style={{ fontSize:14,fontWeight:700,color:'var(--text)' }}>Performance</h2>
          </div>
          <div style={{ display:'flex',gap:40 }}>
            <PNum label="Queries / doc" value={stats.total_docs>0?(stats.total_queries/stats.total_docs).toFixed(1):'0'}/>
            <PNum label="Avg latency" value={stats.avg_duration_ms?`${Math.round(stats.avg_duration_ms)}ms`:'—'} good={stats.avg_duration_ms<3000}/>
            <PNum label="Total events" value={stats.total_docs+stats.total_queries}/>
          </div>
        </div>
      )}

      {/* Recent queries */}
      <div style={{ animation:'fadeUp 0.5s 0.3s both ease' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
          <TrendingUp size={14} style={{ color:'var(--v)' }}/>
          <h2 style={{ fontSize:14,fontWeight:700,color:'var(--text)' }}>Recent Queries</h2>
          <span className="badge" style={{ background:'var(--v-sub)',border:'1px solid rgba(192,132,252,0.3)',color:'var(--v)' }}>
            {stats?.recent_queries?.length??0}
          </span>
        </div>
        {!stats?.recent_queries?.length ? (
          <div style={{ padding:'52px 0',textAlign:'center',color:'var(--text3)',fontSize:13.5,background:'var(--bg1)',border:'1.5px solid var(--border)',borderRadius:'var(--r2)' }}>
            <MessageSquare size={30} style={{ margin:'0 auto 12px',display:'block',color:'var(--text4)',opacity:0.5 }}/>
            No queries yet. Start chatting with your documents!
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
            {stats.recent_queries.map((q,i)=><QRow key={i} q={q} index={i}/>)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Stat tile ── */
function StatTile({ label, value, icon, col, glow, grad, bg, border, delay, visible }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background: hov
          ? `linear-gradient(145deg,${bg},var(--bg1))`
          : `linear-gradient(145deg,${bg.replace('0.1','0.07').replace('0.08','0.04')},var(--bg1))`,
        border:`1.5px solid ${hov?border:border.replace('0.3','0.2').replace('0.28','0.14')}`,
        borderRadius:'var(--r2)',padding:'22px',
        position:'relative',overflow:'hidden',
        animation:`fadeUp 0.4s ${delay}s both ease`,
        transition:'all 0.22s ease',
        transform:hov?'translateY(-4px)':'none',
        boxShadow:hov?`0 16px 44px rgba(0,0,0,0.45),0 0 0 1px ${border}`:'none',
        cursor:'default',
      }}
    >
      {/* Gradient top bar */}
      <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:grad,opacity:hov?1:0.5,boxShadow:hov?`0 0 18px ${glow}`:'none',transition:'all 0.22s' }}/>

      {/* Corner glow */}
      <div style={{ position:'absolute',top:-50,right:-50,width:150,height:150,borderRadius:'50%',background:`radial-gradient(circle,${glow} 0%,transparent 65%)`,opacity:hov?0.6:0.18,transition:'opacity 0.3s',pointerEvents:'none' }}/>

      {/* Icon */}
      <div style={{ width:46,height:46,borderRadius:12,marginBottom:20,background:bg,border:`1.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',color:col,boxShadow:hov?`0 0 20px ${glow}`:'none',transition:'box-shadow 0.22s' }}>
        {icon}
      </div>

      {/* Value */}
      <div style={{ fontSize:34,fontWeight:900,letterSpacing:'-0.04em',lineHeight:1,color:visible?col:'var(--text3)',transition:'color 0.5s ease',marginBottom:6,fontFamily:'var(--mono)',animation:visible?'countUp 0.5s ease':'none',textShadow:hov&&visible?`0 0 24px ${glow}`:'none' }}>
        {value}
      </div>
      <div style={{ fontSize:12.5,color:'var(--text3)',fontWeight:600 }}>{label}</div>
    </div>
  )
}

function PNum({ label, value, good }) {
  return (
    <div>
      <div style={{ fontSize:22,fontWeight:900,letterSpacing:'-0.03em',color:good===true?'var(--neon)':good===false?'var(--amber)':'var(--text)',fontFamily:'var(--mono)',marginBottom:3,lineHeight:1 }}>
        {value}
      </div>
      <div style={{ fontSize:11.5,color:'var(--text3)' }}>{label}</div>
    </div>
  )
}

function QRow({ q, index }) {
  const [hov, setHov] = useState(false)
  const fast = q.duration_ms < 2000
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:'12px 16px',background:hov?'linear-gradient(135deg,rgba(192,132,252,0.05),var(--bg1))':'var(--bg1)',border:'1.5px solid var(--border)',borderRadius:'var(--r)',transition:'all 0.15s',animation:`slideL 0.3s ${index*0.04}s both ease`,display:'flex',alignItems:'center',gap:14 }}
    >
      <div style={{ width:8,height:8,borderRadius:'50%',background:'var(--v)',flexShrink:0,boxShadow:'0 0 10px var(--v-glow)',animation:'glow 2s ease-in-out infinite' }}/>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:13,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2 }}>{q.query}</p>
        <p style={{ fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)' }}>{formatDistanceToNow(new Date(q.created_at),{ addSuffix:true })}</p>
      </div>
      {q.duration_ms && (
        <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,color:fast?'var(--neon)':'var(--amber)',background:fast?'rgba(0,255,136,0.08)':'rgba(251,191,36,0.08)',border:`1px solid ${fast?'rgba(0,255,136,0.28)':'rgba(251,191,36,0.28)'}`,padding:'3px 9px',borderRadius:6,fontFamily:'var(--mono)',flexShrink:0 }}>
          <Zap size={9}/> {q.duration_ms}ms
        </div>
      )}
    </div>
  )
}
