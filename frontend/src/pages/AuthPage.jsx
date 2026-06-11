import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, ArrowRight, Loader2, Zap, Shield, Search, CheckCircle } from 'lucide-react'

export default function AuthPage({ mode }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted]   = useState(false)
  const { login, register, loading, error, clearError, token } = useAuthStore()
  const navigate = useNavigate()
  const isLogin  = mode === 'login'

  useEffect(() => { setMounted(true); clearError(); if (token) navigate('/') }, [mode])

  const submit = async (e) => {
    e.preventDefault()
    const ok = isLogin ? await login(email, password) : await register(email, password, name)
    if (ok) navigate('/')
  }

  const features = [
    { icon:<Zap size={18}/>,           color:'#7c3aed', bg:'#ede9fe', label:'Semantic Search',       sub:'384-dim vector similarity · not keywords' },
    { icon:<Shield size={18}/>,        color:'#059669', bg:'#d1fae5', label:'Multi-tenant Isolation', sub:'Your data stays completely private' },
    { icon:<CheckCircle size={18}/>,   color:'#0ea5e9', bg:'#e0f2fe', label:'Instant AI Answers',     sub:'Llama 3.3 70B via Groq · sub-2s' },
    { icon:<Search size={18}/>,        color:'#d97706', bg:'#fef3c7', label:'Smart Document RAG',     sub:'PDF · DOCX · TXT · Markdown' },
  ]

  return (
    <div style={{ height:'100vh', display:'flex', overflow:'hidden', background:'var(--bg)' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width:'46%', flexShrink:0,
        background:'linear-gradient(145deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'36px 48px', position:'relative', overflow:'hidden',
      }}>
        {/* Subtle dot pattern */}
        <div style={{ position:'absolute',inset:0,pointerEvents:'none',backgroundImage:`radial-gradient(rgba(255,255,255,0.12) 1px,transparent 1px)`,backgroundSize:'28px 28px' }}/>

        {/* Bottom fade */}
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:200,background:'linear-gradient(to top,rgba(29,78,216,0.6),transparent)',pointerEvents:'none' }}/>

        {/* Decorative circles */}
        <div style={{ position:'absolute',top:-80,right:-80,width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,0.08)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:-60,left:-60,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,0.06)',pointerEvents:'none' }}/>

        {/* Logo */}
        <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:28,position:'relative' }}>
          <div style={{ width:40,height:40,borderRadius:11,background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.35)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Zap size={20} color="#fff" fill="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:18,fontWeight:900,letterSpacing:'-0.03em',color:'#fff' }}>RAGPlatform</div>
            <div style={{ fontSize:9.5,color:'rgba(255,255,255,0.6)',fontFamily:'var(--mono)',letterSpacing:'0.08em' }}>POWERED BY GROQ</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position:'relative', marginBottom:24 }}>
          <h1 style={{ fontSize:36,fontWeight:900,letterSpacing:'-0.04em',lineHeight:1.1,color:'#fff',marginBottom:10 }}>
            Chat with your<br/>
            <span style={{ color:'#93c5fd' }}>documents.</span>
          </h1>
          <p style={{ fontSize:13.5,color:'rgba(255,255,255,0.75)',lineHeight:1.7,maxWidth:340 }}>
            Upload files, ask questions, get AI answers grounded in your content.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display:'flex',flexDirection:'column',gap:7,position:'relative' }}>
          {features.map((f,i)=>(
            <div key={i} style={{
              display:'flex',alignItems:'center',gap:12,
              padding:'10px 14px',
              background:'rgba(255,255,255,0.12)',
              border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:'var(--r)',
              animation:mounted?`slideL 0.5s ${i*0.1+0.1}s both ease`:'none',
            }}>
              <div style={{ width:34,height:34,borderRadius:9,flexShrink:0,background:f.bg,display:'flex',alignItems:'center',justifyContent:'center',color:f.color }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:'#fff',marginBottom:1 }}>{f.label}</div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.62)',fontFamily:'var(--mono)' }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 32px',overflowY:'auto',background:'var(--bg)' }}>
        <div style={{ width:'100%',maxWidth:420,animation:mounted?'fadeUp 0.45s 0.05s both ease':'none' }}>

          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'5px 13px',background:'var(--v-light)',border:'1.5px solid rgba(124,58,237,0.25)',borderRadius:20,marginBottom:20 }}>
              <div style={{ width:7,height:7,borderRadius:'50%',background:'var(--v)' }}/>
              <span style={{ fontSize:11,color:'var(--v)',fontWeight:700,fontFamily:'var(--mono)',letterSpacing:'0.07em' }}>
                {isLogin?'SIGN IN':'GET STARTED'}
              </span>
            </div>
            <h2 style={{ fontSize:30,fontWeight:900,letterSpacing:'-0.04em',color:'var(--text)',marginBottom:8 }}>
              {isLogin?'Welcome back':'Create your account'}
            </h2>
            <p style={{ fontSize:14,color:'var(--text3)' }}>
              {isLogin?'Sign in to access your knowledge bases.':'Start building your AI workspace today.'}
            </p>
          </div>

          {/* Form card */}
          <div style={{ background:'var(--bg1)',borderRadius:'var(--r3)',border:'1.5px solid var(--border2)',padding:'28px',boxShadow:'0 8px 32px rgba(0,0,0,0.08),0 2px 8px rgba(0,0,0,0.04)' }}>
            <form onSubmit={submit}>
              <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
                {!isLogin && (
                  <FField label="Full name">
                    <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
                  </FField>
                )}
                <FField label="Email address">
                  <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/>
                </FField>
                <FField label="Password">
                  <div style={{ position:'relative' }}>
                    <input className="inp" type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',padding:4,transition:'color 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--text)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}
                    >
                      {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                </FField>

                {error && (
                  <div style={{ padding:'11px 14px',background:'var(--rose-light)',border:'1.5px solid rgba(225,29,72,0.25)',borderRadius:'var(--r)',fontSize:13,color:'var(--rose)',display:'flex',alignItems:'center',gap:8 }}>
                    ⚠ {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-v" style={{ width:'100%',padding:'13px',fontSize:15,marginTop:4 }}>
                  {loading
                    ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Processing…</>
                    : <>{isLogin?'Sign in':'Create account'} <ArrowRight size={15}/></>
                  }
                </button>
              </div>
            </form>
          </div>

          <p style={{ textAlign:'center',fontSize:13.5,color:'var(--text3)',marginTop:20 }}>
            {isLogin?"Don't have an account? ":"Already registered? "}
            <Link to={isLogin?'/register':'/login'} style={{ color:'var(--v)',fontWeight:700 }}>
              {isLogin?'Sign up free →':'Sign in →'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function FField({ label, children }) {
  return (
    <div>
      <label style={{ display:'block',marginBottom:7,fontSize:12.5,fontWeight:600,color:'var(--text2)' }}>{label}</label>
      {children}
    </div>
  )
}
