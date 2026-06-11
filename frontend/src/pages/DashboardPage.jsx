import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Trash2, ArrowRight, FileText, Loader2, X, Search, Layers } from 'lucide-react'
import api from '../api/client'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '../store/authStore'

const PAL = [
  { a:'#7c3aed', b:'#a855f7', light:'#ede9fe', border:'rgba(124,58,237,0.25)', text:'#7c3aed' },
  { a:'#059669', b:'#0ea5e9', light:'#d1fae5', border:'rgba(5,150,105,0.25)',  text:'#059669' },
  { a:'#0ea5e9', b:'#7c3aed', light:'#e0f2fe', border:'rgba(14,165,233,0.25)', text:'#0ea5e9' },
  { a:'#d97706', b:'#e11d48', light:'#fef3c7', border:'rgba(217,119,6,0.25)',  text:'#d97706' },
  { a:'#e11d48', b:'#d97706', light:'#ffe4e6', border:'rgba(225,29,72,0.25)',  text:'#e11d48' },
  { a:'#0284c7', b:'#059669', light:'#e0f2fe', border:'rgba(2,132,199,0.25)',  text:'#0284c7' },
]

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [delTarget, setDelTarget]   = useState(null)
  const [name, setName]             = useState('')
  const [desc, setDesc]             = useState('')
  const [search, setSearch]         = useState('')
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const load = async () => {
    try { const { data } = await api.get('/workspaces/'); setWorkspaces(data) }
    catch(e){ console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  const handleCreate = async (e) => {
    e.preventDefault(); if (!name.trim()) return; setCreating(true)
    try {
      const { data } = await api.post('/workspaces/',{ name:name.trim(), description:desc.trim()||null })
      setWorkspaces(w=>[data,...w]); setShowModal(false); setName(''); setDesc('')
    } catch(e){ console.error(e) }
    finally { setCreating(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/workspaces/${id}`); setWorkspaces(w=>w.filter(ws=>ws.id!==id)) }
    catch(e){ console.error(e) }
    finally { setDelTarget(null) }
  }

  const filtered = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(search.toLowerCase()) ||
    (ws.description||'').toLowerCase().includes(search.toLowerCase())
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const totalDocs = workspaces.reduce((a, w) => a + (w.doc_count||0), 0)

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Header (LIGHT) ── */}
      <div style={{
        padding:'24px 36px 20px',
        flexShrink:0,
        background:'var(--bg)',
        borderBottom:'1.5px solid var(--border2)',
        animation:'fadeUp 0.35s ease both',
      }}>
        {/* Top row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18 }}>
          <div>
            <p style={{ fontSize:12, color:'var(--text4)', fontFamily:'var(--mono)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:4 }}>
              {greeting}, <span style={{ color:'var(--text3)' }}>{user?.full_name?.split(' ')[0] || 'there'}</span>
            </p>
            <h1 style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, color:'var(--text)' }}>
              Your <span className="gv">Knowledge Bases</span>
            </h1>
          </div>
          <button onClick={()=>setShowModal(true)} className="btn btn-v" style={{ padding:'11px 22px', fontSize:14 }}>
            <Plus size={15}/> New Workspace
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          <StatChip value={workspaces.length} label="workspaces" color="var(--v)"/>
          <div style={{ width:1, height:26, background:'var(--border2)', margin:'0 20px' }}/>
          <StatChip value={totalDocs} label="docs indexed" color="var(--neon)"/>
          <div style={{ flex:1 }}/>
          {/* Search */}
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            background:'var(--bg2)', border:'1.5px solid var(--border2)',
            borderRadius:'var(--r)', padding:'8px 13px', width:236,
            transition:'border-color 0.18s, box-shadow 0.18s',
          }}
            onFocusCapture={e=>{ e.currentTarget.style.borderColor='var(--v)'; e.currentTarget.style.boxShadow='0 0 0 3px var(--v-sub)'; }}
            onBlurCapture={e=>{ e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.boxShadow='none'; }}
          >
            <Search size={13} style={{ color:'var(--text3)', flexShrink:0 }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search workspaces…"
              style={{ flex:1, fontSize:13, color:'var(--text)', background:'none' }}/>
            {search && <button onClick={()=>setSearch('')} style={{ color:'var(--text3)', lineHeight:0 }}><X size={12}/></button>}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'28px 36px 36px', background:'var(--bg)' }}>
        {loading ? (
          <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--text3)', padding:'60px 0', justifyContent:'center' }}>
            <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }}/> Loading workspaces…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onNew={()=>setShowModal(true)} isSearch={!!search} term={search}/>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(295px, 1fr))', gap:16 }}>
            {filtered.map((ws, i) => (
              <WorkspaceCard
                key={ws.id} ws={ws} pal={PAL[i % PAL.length]} index={i}
                onClick={()=>navigate(`/workspace/${ws.id}`)}
                onDelete={()=>setDelTarget(ws)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showModal && (
        <Overlay onClose={()=>{ setShowModal(false); setName(''); setDesc(''); }}>
          <div style={{ padding:'28px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.03em', marginBottom:3, color:'var(--text)' }}>
                  New Workspace
                </h2>
                <p style={{ fontSize:12.5, color:'var(--text3)' }}>A dedicated collection for a topic or project.</p>
              </div>
              <button onClick={()=>{ setShowModal(false); setName(''); setDesc(''); }} className="btn btn-ghost" style={{ padding:'7px 8px' }}>
                <X size={15}/>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <MField label="Workspace name *">
                  <input className="inp" value={name} onChange={e=>setName(e.target.value)}
                    placeholder="e.g. Research Papers, Product Docs…" required autoFocus/>
                </MField>
                <MField label="Description (optional)">
                  <textarea className="inp" value={desc} onChange={e=>setDesc(e.target.value)}
                    placeholder="What documents will go here?" rows={3} style={{ resize:'vertical', lineHeight:1.6 }}/>
                </MField>
                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  <button type="button" onClick={()=>{ setShowModal(false); setName(''); setDesc(''); }}
                    className="btn btn-ghost" style={{ flex:1, padding:11 }}>Cancel</button>
                  <button type="submit" disabled={creating||!name.trim()} className="btn btn-v"
                    style={{ flex:2, padding:11, opacity:!name.trim()?0.5:1 }}>
                    {creating
                      ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> Creating…</>
                      : <>Create Workspace <ArrowRight size={14}/></>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Overlay>
      )}

      {/* ── Delete Confirm ── */}
      {delTarget && (
        <Overlay onClose={()=>setDelTarget(null)}>
          <div style={{ padding:'28px' }}>
            <div style={{ width:50, height:50, borderRadius:13, background:'var(--rose-light)', border:'1.5px solid rgba(225,29,72,0.25)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <Trash2 size={22} style={{ color:'var(--rose)' }}/>
            </div>
            <h3 style={{ fontSize:18, fontWeight:800, marginBottom:8, color:'var(--text)' }}>Delete workspace?</h3>
            <p style={{ fontSize:13.5, color:'var(--text2)', lineHeight:1.65, marginBottom:24 }}>
              <strong style={{ color:'var(--text)' }}>"{delTarget.name}"</strong> and all its indexed documents will be permanently removed.
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setDelTarget(null)} className="btn btn-ghost" style={{ flex:1, padding:11 }}>Keep it</button>
              <button onClick={()=>handleDelete(delTarget.id)} className="btn btn-danger" style={{ flex:1, padding:11, fontWeight:700 }}>Delete permanently</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  )
}

function StatChip({ value, label, color }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', gap:7 }}>
      <span style={{ fontSize:28, fontWeight:900, color, fontFamily:'var(--mono)', letterSpacing:'-0.04em', lineHeight:1 }}>
        {value}
      </span>
      <span style={{ fontSize:12.5, color:'var(--text3)' }}>{label}</span>
    </div>
  )
}

function WorkspaceCard({ ws, pal, index, onClick, onDelete }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        background:'var(--bg1)',
        border:`1.5px solid ${hov ? pal.border.replace('0.25','0.5') : pal.border}`,
        borderRadius:'var(--r2)',
        padding:'22px',
        cursor:'pointer',
        transition:'all 0.2s ease',
        animation:`fadeUp 0.4s ${index*0.06}s both ease`,
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov
          ? `0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)`
          : '0 2px 8px rgba(0,0,0,0.05)',
        position:'relative', overflow:'hidden',
      }}
    >
      {/* Top gradient bar */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg, ${pal.a}, ${pal.b})`,
        opacity: hov ? 1 : 0.7,
        transition:'opacity 0.2s',
      }}/>

      {/* Subtle bg tint on hover */}
      <div style={{
        position:'absolute', inset:0,
        background:`linear-gradient(145deg, ${pal.light}55, transparent)`,
        opacity: hov ? 1 : 0,
        transition:'opacity 0.25s',
        pointerEvents:'none',
      }}/>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, position:'relative' }}>
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          background: pal.light,
          border:`1.5px solid ${pal.border}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color: pal.text,
          transition:'box-shadow 0.2s',
          boxShadow: hov ? `0 4px 16px ${pal.border.replace('0.25','0.5')}` : 'none',
        }}>
          <FolderOpen size={20}/>
        </div>
        <button
          onClick={e=>{ e.stopPropagation(); onDelete(); }}
          style={{
            color:'var(--text4)', padding:6, borderRadius:7,
            opacity: hov ? 1 : 0, transition:'all 0.15s',
          }}
          onMouseEnter={e=>{ e.currentTarget.style.color='var(--rose)'; e.currentTarget.style.background='var(--rose-light)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.color='var(--text4)'; e.currentTarget.style.background='transparent'; }}
        ><Trash2 size={14}/></button>
      </div>

      {/* Text */}
      <div style={{ position:'relative' }}>
        <h3 style={{ fontSize:15.5, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:6, lineHeight:1.3 }}>
          {ws.name}
        </h3>
        <p style={{
          fontSize:13, color:'var(--text3)', lineHeight:1.6, marginBottom:18,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', minHeight:40,
        }}>
          {ws.description || 'No description provided'}
        </p>

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:`1px solid var(--border)` }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:pal.text, fontWeight:600, fontFamily:'var(--mono)' }}>
            <FileText size={12}/>
            {ws.doc_count} doc{ws.doc_count !== 1 ? 's' : ''}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ fontSize:11.5, color:'var(--text4)' }}>
              {formatDistanceToNow(new Date(ws.created_at), { addSuffix:true })}
            </span>
            <ArrowRight size={13} style={{
              color: pal.text,
              opacity: hov ? 1 : 0,
              transform: hov ? 'translateX(0)' : 'translateX(-5px)',
              transition:'all 0.2s ease',
            }}/>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onNew, isSearch, term }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:20, textAlign:'center', animation:'fadeIn 0.4s ease' }}>
      <div style={{ width:80, height:80, borderRadius:'var(--r3)', background:'var(--bg1)', border:'1.5px dashed var(--border3)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text4)', animation:'float 4s ease-in-out infinite', boxShadow:'0 4px 16px rgba(0,0,0,0.06)' }}>
        {isSearch ? <Search size={32}/> : <Layers size={32}/>}
      </div>
      <div>
        <h3 style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:8 }}>
          {isSearch ? `No results for "${term}"` : 'No workspaces yet'}
        </h3>
        <p style={{ color:'var(--text3)', fontSize:13.5, maxWidth:300 }}>
          {isSearch ? 'Try a different search term.' : 'Create your first workspace to start chatting with your documents.'}
        </p>
      </div>
      {!isSearch && (
        <button onClick={onNew} className="btn btn-ghost" style={{ marginTop:4 }}>
          <Plus size={14}/> Create your first workspace
        </button>
      )}
    </div>
  )
}

function Overlay({ children, onClose }) {
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, animation:'fadeIn 0.15s ease', backdropFilter:'blur(6px)' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--bg1)', border:'1.5px solid var(--border2)', borderRadius:'var(--r3)', width:'100%', maxWidth:460, animation:'scaleIn 0.2s cubic-bezier(0.34,1.2,0.64,1)', boxShadow:'0 24px 64px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)' }}
        onClick={e=>e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function MField({ label, children }) {
  return (
    <div>
      <label style={{ display:'block', marginBottom:7, fontSize:12, fontWeight:600, color:'var(--text2)' }}>{label}</label>
      {children}
    </div>
  )
}
