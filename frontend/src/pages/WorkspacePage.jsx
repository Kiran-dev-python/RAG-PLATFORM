import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Upload, Send, FileText, Trash2, Loader2, ArrowLeft, X,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  MessageSquare, Files, Sparkles, Copy, Check,
  RefreshCw, Bot, User as UserIcon, Zap, Clock,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import api from '../api/client'

export default function WorkspacePage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [workspace, setWorkspace]             = useState(null)
  const [docs, setDocs]                       = useState([])
  const [messages, setMessages]               = useState([])
  const [input, setInput]                     = useState('')
  const [querying, setQuerying]               = useState(false)
  const [uploading, setUploading]             = useState(false)
  const [uploadProgress, setUploadProgress]   = useState([])
  const [dragOver, setDragOver]               = useState(false)
  const [tab, setTab]                         = useState('chat')
  const [delDoc, setDelDoc]                   = useState(null)
  const [copiedId, setCopiedId]               = useState(null)
  const bottomRef = useRef(null)
  const fileRef   = useRef(null)
  const pollRef   = useRef(null)
  const taRef     = useRef(null)

  useEffect(() => {
    loadWorkspace(); loadDocs()
    return () => clearInterval(pollRef.current)
  }, [id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, querying])

  const loadWorkspace = async () => {
    try { const { data } = await api.get('/workspaces/'); const ws = data.find(w=>w.id===id); if(ws) setWorkspace(ws) }
    catch(e){ console.error(e) }
  }

  const loadDocs = async () => {
    try {
      const { data } = await api.get(`/documents/${id}`)
      setDocs(data)
      if (data.some(d=>d.status==='processing')) {
        clearInterval(pollRef.current)
        pollRef.current = setInterval(async () => {
          const { data:f } = await api.get(`/documents/${id}`)
          setDocs(f)
          if (!f.some(d=>d.status==='processing')) clearInterval(pollRef.current)
        }, 2000)
      }
    } catch(e){ console.error(e) }
  }

  const handleUpload = async (files) => {
    if (!files.length) return
    const arr = Array.from(files)
    setUploading(true)
    setUploadProgress(arr.map(f=>({ name:f.name, status:'pending' })))
    for (let i=0; i<arr.length; i++) {
      setUploadProgress(p=>p.map((x,j)=>j===i?{...x,status:'uploading'}:x))
      const form = new FormData(); form.append('file', arr[i])
      try {
        await api.post(`/documents/${id}/upload`, form, { headers:{'Content-Type':'multipart/form-data'} })
        setUploadProgress(p=>p.map((x,j)=>j===i?{...x,status:'done'}:x))
      } catch(e) {
        setUploadProgress(p=>p.map((x,j)=>j===i?{...x,status:'error',err:e.response?.data?.detail}:x))
      }
    }
    setUploading(false); loadDocs()
    setTimeout(()=>setUploadProgress([]), 3500)
  }

  const handleDelete = async (docId) => {
    try { await api.delete(`/documents/${id}/${docId}`); setDocs(d=>d.filter(x=>x.id!==docId)) }
    catch(e){ console.error(e) }
    finally { setDelDoc(null) }
  }

  const handleQuery = async () => {
    if (!input.trim() || querying) return
    const q = input.trim(); setInput('')
    if (taRef.current) taRef.current.style.height='auto'
    setMessages(m=>[...m,{ role:'user', content:q, id:Date.now() }])
    setQuerying(true)
    try {
      const { data } = await api.post(`/chat/${id}`, { query:q })
      setMessages(m=>[...m,{ role:'assistant', content:data.answer, sources:data.sources, duration_ms:data.duration_ms, id:Date.now() }])
    } catch(e) {
      setMessages(m=>[...m,{ role:'error', content:e.response?.data?.detail||'Query failed', id:Date.now() }])
    } finally { setQuerying(false) }
  }

  const copy = (text, id) => {
    navigator.clipboard.writeText(text); setCopiedId(id)
    setTimeout(()=>setCopiedId(null), 2000)
  }

  const readyDocs     = docs.filter(d=>d.status==='ready').length
  const processingCnt = docs.filter(d=>d.status==='processing').length

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>

      {/* ── Top bar ── */}
      <div style={{
        height:58, padding:'0 24px', flexShrink:0,
        background:'var(--bg)',
        borderBottom:'1.5px solid var(--border2)',
        display:'flex', alignItems:'center', gap:12,
      }}>
        {/* Back */}
        <button onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:5, color:'var(--text3)', padding:'6px 10px', borderRadius:8, fontSize:13, fontWeight:500, transition:'all 0.15s' }}
          onMouseEnter={e=>{ e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='var(--bg3)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.background='transparent'; }}
        >
          <ArrowLeft size={14}/> Back
        </button>

        <div style={{ width:1, height:22, background:'var(--border2)' }}/>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {workspace?.name || '…'}
          </div>
        </div>

        {/* Status badges */}
        {processingCnt > 0 && (
          <div className="badge" style={{ background:'var(--amber-light)', border:'1.5px solid rgba(217,119,6,0.25)', color:'var(--amber)' }}>
            <Loader2 size={10} style={{ animation:'spin 1s linear infinite' }}/> {processingCnt} processing
          </div>
        )}
        <div className="badge" style={{ background:'var(--neon-light)', border:'1.5px solid rgba(5,150,105,0.25)', color:'var(--neon)' }}>
          <CheckCircle2 size={10}/> {readyDocs} indexed
        </div>

        {/* Tab switcher */}
        <div style={{ display:'flex', background:'var(--bg3)', borderRadius:10, padding:3, gap:2 }}>
          {[{ k:'chat', icon:<MessageSquare size={13}/>, l:'Chat' }, { k:'docs', icon:<Files size={13}/>, l:'Docs' }].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'6px 14px', borderRadius:8, fontSize:12.5, fontWeight:600,
              background: tab===t.k ? 'var(--bg1)' : 'transparent',
              color: tab===t.k ? 'var(--text)' : 'var(--text3)',
              border: tab===t.k ? '1.5px solid var(--border2)' : '1.5px solid transparent',
              transition:'all 0.15s',
              boxShadow: tab===t.k ? '0 1px 4px rgba(0,0,0,0.07)' : 'none',
            }}>{t.icon} {t.l}</button>
          ))}
        </div>
      </div>

      {/* ── CHAT TAB ── */}
      {tab === 'chat' ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'28px 0', background:'var(--bg)' }}>
            {messages.length === 0
              ? <ChatEmpty readyDocs={readyDocs} onGoToDocs={()=>setTab('docs')}/>
              : (
                <div style={{ maxWidth:780, margin:'0 auto', padding:'0 28px', display:'flex', flexDirection:'column', gap:4 }}>
                  {messages.map((msg,i) => (
                    <Bubble key={msg.id||i} msg={msg} index={i} copiedId={copiedId} onCopy={copy}/>
                  ))}
                  {querying && <ThinkingDots/>}
                  <div ref={bottomRef}/>
                </div>
              )
            }
          </div>

          {/* Input bar */}
          <div style={{ borderTop:'1.5px solid var(--border)', padding:'14px 24px 18px', background:'var(--bg)', flexShrink:0 }}>
            <div style={{ maxWidth:780, margin:'0 auto' }}>
              <div style={{
                display:'flex', gap:10, alignItems:'flex-end',
                background:'var(--bg1)', border:'1.5px solid var(--border2)',
                borderRadius:'var(--r2)', padding:'10px 10px 10px 16px',
                boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                transition:'border-color 0.18s, box-shadow 0.18s',
              }}
                onFocusCapture={e=>{ e.currentTarget.style.borderColor='var(--v)'; e.currentTarget.style.boxShadow='0 0 0 3px var(--v-sub), 0 2px 12px rgba(0,0,0,0.06)'; }}
                onBlurCapture={e=>{ e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.06)'; }}
              >
                <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleQuery(); } }}
                  placeholder={readyDocs > 0
                    ? `Ask anything about your ${readyDocs} document${readyDocs!==1?'s':''}…`
                    : 'Upload documents first, then ask questions…'}
                  rows={1}
                  style={{ flex:1, resize:'none', fontSize:14, lineHeight:1.65, color:'var(--text)', background:'transparent', padding:'3px 0', maxHeight:140, fontFamily:'var(--font)' }}
                  onInput={e=>{ e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,140)+'px'; }}
                />
                <button onClick={handleQuery} disabled={!input.trim()||querying} style={{
                  width:38, height:38, borderRadius:10, flexShrink:0,
                  background: input.trim()&&!querying ? 'var(--v-grad)' : 'var(--bg3)',
                  color: input.trim()&&!querying ? '#fff' : 'var(--text4)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
                  transform: input.trim()&&!querying ? 'scale(1)' : 'scale(0.9)',
                  cursor: input.trim()&&!querying ? 'pointer' : 'not-allowed',
                  boxShadow: input.trim()&&!querying ? '0 4px 14px var(--v-glow)' : 'none',
                  alignSelf:'flex-end', marginBottom:1,
                }}
                  onMouseEnter={e=>{ if(input.trim()&&!querying) e.currentTarget.style.transform='scale(1.08) rotate(-5deg)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}
                >
                  <Send size={14}/>
                </button>
              </div>
              <p style={{ fontSize:11, color:'var(--text4)', textAlign:'center', marginTop:7, fontFamily:'var(--mono)' }}>
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ── DOCS TAB ── */
        <div style={{ flex:1, overflowY:'auto', padding:'24px 32px', background:'var(--bg)' }}>
          <div style={{ maxWidth:780, margin:'0 auto' }}>

            {/* Drop zone */}
            <div
              onDragOver={e=>{ e.preventDefault(); setDragOver(true); }}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{ e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
              onClick={()=>!uploading && fileRef.current?.click()}
              style={{
                border:`2px dashed ${dragOver ? 'var(--v)' : 'var(--border3)'}`,
                borderRadius:'var(--r2)', padding:'40px 24px', textAlign:'center',
                cursor: uploading ? 'default' : 'pointer',
                background: dragOver ? 'var(--v-sub)' : 'var(--bg1)',
                transition:'all 0.2s ease', marginBottom:22,
                boxShadow: dragOver
                  ? '0 0 0 4px var(--v-sub)'
                  : '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >
              <input ref={fileRef} type="file" multiple accept=".pdf,.txt,.md,.docx"
                style={{ display:'none' }} onChange={e=>handleUpload(e.target.files)}/>

              <div style={{
                width:56, height:56, borderRadius:'var(--r2)',
                background: dragOver ? 'var(--v-sub)' : 'var(--bg2)',
                border:`1.5px solid ${dragOver ? 'var(--v)' : 'var(--border2)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto 14px', transition:'all 0.2s',
                color: dragOver ? 'var(--v)' : 'var(--text3)',
              }}>
                {uploading
                  ? <Loader2 size={22} style={{ animation:'spin 1s linear infinite', color:'var(--v)' }}/>
                  : <Upload size={22}/>
                }
              </div>
              {uploading ? (
                <p style={{ fontSize:14, color:'var(--v)', fontWeight:700 }}>Uploading files…</p>
              ) : (
                <>
                  <p style={{ fontSize:14, fontWeight:700, color: dragOver?'var(--v)':'var(--text2)', marginBottom:5, transition:'color 0.2s' }}>
                    {dragOver ? 'Release to upload' : 'Drop files here or click to browse'}
                  </p>
                  <p style={{ fontSize:12.5, color:'var(--text3)' }}>PDF · DOCX · TXT · MD &nbsp;·&nbsp; Max 20 MB</p>
                </>
              )}
            </div>

            {/* Upload progress */}
            {uploadProgress.length > 0 && (
              <div style={{ marginBottom:16, display:'flex', flexDirection:'column', gap:5, animation:'fadeIn 0.2s ease' }}>
                {uploadProgress.map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--bg1)', border:'1.5px solid var(--border2)', borderRadius:'var(--r)', fontSize:12.5, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                    {f.status==='uploading' && <Loader2 size={13} style={{ animation:'spin 1s linear infinite', color:'var(--v)' }}/>}
                    {f.status==='done'      && <CheckCircle2 size={13} style={{ color:'var(--neon)' }}/>}
                    {f.status==='error'     && <AlertCircle size={13} style={{ color:'var(--rose)' }}/>}
                    {f.status==='pending'   && <div style={{ width:13, height:13, borderRadius:'50%', background:'var(--bg4)', flexShrink:0 }}/>}
                    <span style={{ flex:1, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                    <span style={{ fontSize:11, color:f.status==='error'?'var(--rose)':f.status==='done'?'var(--neon)':'var(--text3)', fontFamily:'var(--mono)' }}>
                      {f.status==='error'?(f.err||'Error'):f.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Docs header */}
            {docs.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <h2 style={{ fontSize:13, fontWeight:700, color:'var(--text2)' }}>Documents</h2>
                <div className="badge" style={{ background:'var(--bg3)', border:'1.5px solid var(--border2)', color:'var(--text3)' }}>{docs.length}</div>
                <div style={{ flex:1 }}/>
                <button onClick={loadDocs} style={{ color:'var(--text3)', padding:5, borderRadius:6, transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.color='var(--v)'; e.currentTarget.style.background='var(--v-light)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.background='transparent'; }}
                  title="Refresh"><RefreshCw size={13}/></button>
              </div>
            )}

            {/* Doc list */}
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {docs.map((doc,i) => (
                <DocRow key={doc.id} doc={doc} index={i} onDelete={()=>setDelDoc(doc)}/>
              ))}
              {docs.length===0 && !uploading && (
                <div style={{ textAlign:'center', padding:'36px 0', color:'var(--text3)', fontSize:13.5 }}>
                  No documents yet — upload your first file above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete doc modal ── */}
      {delDoc && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, animation:'fadeIn 0.15s ease', backdropFilter:'blur(6px)' }}
          onClick={()=>setDelDoc(null)}>
          <div style={{ background:'var(--bg1)', border:'1.5px solid var(--border2)', borderRadius:'var(--r3)', padding:28, width:400, animation:'scaleIn 0.2s cubic-bezier(0.34,1.2,0.64,1)', boxShadow:'0 24px 64px rgba(0,0,0,0.15)' }}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontSize:16, fontWeight:800, marginBottom:8, color:'var(--text)' }}>Delete document?</h3>
            <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.65, marginBottom:22 }}>
              <strong style={{ color:'var(--text)' }}>"{delDoc.filename}"</strong> will be removed from the vector store and cannot be recovered.
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setDelDoc(null)} className="btn btn-ghost" style={{ flex:1, padding:10 }}>Cancel</button>
              <button onClick={()=>handleDelete(delDoc.id)} className="btn btn-danger" style={{ flex:1, padding:10 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Chat empty state ── */
function ChatEmpty({ readyDocs, onGoToDocs }) {
  const prompts = ['Summarize the key points', 'What are the main conclusions?', 'Explain the methodology used', 'List the most important findings']
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'40px 24px', animation:'fadeIn 0.4s ease' }}>
      <div style={{ width:68, height:68, borderRadius:20, background:'var(--v-light)', border:'1.5px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22, animation:'float 4s ease-in-out infinite', boxShadow:'0 8px 24px var(--v-glow)' }}>
        <Sparkles size={30} style={{ color:'var(--v)' }}/>
      </div>
      {readyDocs > 0 ? (
        <>
          <h3 style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.03em', marginBottom:8, color:'var(--text)' }}>Ready to answer</h3>
          <p style={{ color:'var(--text3)', fontSize:14, textAlign:'center', maxWidth:340, marginBottom:30 }}>
            {readyDocs} document{readyDocs!==1?'s':''} indexed and ready. Ask anything below.
          </p>
          <div style={{ width:'100%', maxWidth:420 }}>
            <p style={{ fontSize:11, color:'var(--text4)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Try asking:</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {prompts.map((p,i) => (
                <div key={i} style={{ padding:'11px 15px', background:'var(--bg1)', border:'1.5px solid var(--border)', borderRadius:'var(--r)', fontSize:13, color:'var(--text2)', animation:`fadeUp 0.3s ${i*0.07}s both ease`, boxShadow:'0 1px 4px rgba(0,0,0,0.04)', transition:'all 0.15s', cursor:'default' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=`rgba(124,58,237,0.3)`; e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='var(--v-light)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.background='var(--bg1)'; }}
                >{p}</div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <h3 style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.03em', marginBottom:8, color:'var(--text)' }}>No documents yet</h3>
          <p style={{ color:'var(--text3)', fontSize:14, textAlign:'center', maxWidth:300, marginBottom:22 }}>Upload some documents first, then come back to chat.</p>
          <button onClick={onGoToDocs} className="btn btn-v"><Upload size={14}/> Upload Documents</button>
        </>
      )}
    </div>
  )
}

/* ── Typing indicator ── */
function ThinkingDots() {
  return (
    <div style={{ display:'flex', gap:12, marginTop:4, animation:'fadeIn 0.2s ease', paddingLeft:4 }}>
      <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:'var(--v-grad)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px var(--v-glow)' }}>
        <Bot size={15} color="#fff"/>
      </div>
      <div style={{ background:'var(--bg1)', border:'1.5px solid var(--border)', borderRadius:'4px 12px 12px 12px', padding:'13px 16px', display:'flex', alignItems:'center', gap:5, alignSelf:'flex-start', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--v)', display:'inline-block', animation:`pulseDot 1.4s ${i*0.2}s ease-in-out infinite` }}/>
        ))}
      </div>
    </div>
  )
}

/* ── Message bubble ── */
function Bubble({ msg, index, copiedId, onCopy }) {
  const [showSrc, setShowSrc] = useState(false)
  const isUser  = msg.role === 'user'
  const isError = msg.role === 'error'

  return (
    <div style={{ display:'flex', gap:12, flexDirection:isUser?'row-reverse':'row', animation:`fadeUp 0.25s ${Math.min(index*0.02,0.14)}s both ease`, padding:'5px 0', alignItems:'flex-start' }}>
      {/* Avatar */}
      {!isUser ? (
        <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, marginTop:1, background:isError?'var(--rose-light)':'var(--v-grad)', border:isError?'1.5px solid rgba(225,29,72,0.25)':'none', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:isError?'none':'0 4px 12px var(--v-glow)' }}>
          {isError?<AlertCircle size={15} style={{ color:'var(--rose)' }}/>:<Bot size={15} color="#fff"/>}
        </div>
      ) : (
        <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, marginTop:1, background:'var(--bg3)', border:'1.5px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <UserIcon size={14} style={{ color:'var(--text3)' }}/>
        </div>
      )}

      {/* Bubble */}
      <div style={{ maxWidth:'73%', minWidth:0 }}>
        <div style={{ background:isUser?'var(--bg2)':isError?'var(--rose-light)':'var(--bg1)', border:`1.5px solid ${isUser?'var(--border)':isError?'rgba(225,29,72,0.2)':'var(--border)'}`, borderRadius:isUser?'12px 4px 12px 12px':'4px 12px 12px 12px', padding:'12px 15px', fontSize:13.5, color:isError?'var(--rose)':'var(--text)', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          {isUser
            ? <span style={{ lineHeight:1.65 }}>{msg.content}</span>
            : <div className="md"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
          }
        </div>

        {/* Actions */}
        {!isUser && !isError && (
          <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
            <ActionBtn onClick={()=>onCopy(msg.content,msg.id)}>
              {copiedId===msg.id?<Check size={10} style={{ color:'var(--neon)' }}/>:<Copy size={10}/>}
              {copiedId===msg.id?'Copied':'Copy'}
            </ActionBtn>
            {msg.sources?.length > 0 && (
              <ActionBtn onClick={()=>setShowSrc(s=>!s)} active={showSrc}>
                {showSrc?<ChevronUp size={10}/>:<ChevronDown size={10}/>}
                {msg.sources.length} source{msg.sources.length!==1?'s':''}
                {msg.duration_ms && <><span style={{ opacity:0.4, margin:'0 2px' }}>·</span><Clock size={9}/> {msg.duration_ms}ms</>}
              </ActionBtn>
            )}
          </div>
        )}

        {/* Sources */}
        {showSrc && msg.sources?.length > 0 && (
          <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:5, animation:'fadeIn 0.2s ease' }}>
            {msg.sources.map((s,i) => (
              <div key={i} style={{ padding:'10px 13px', background:'var(--bg1)', border:'1.5px solid var(--border)', borderRadius:'var(--r)', fontSize:11.5, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                  <span style={{ color:'var(--v)', fontFamily:'var(--mono)', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                    <FileText size={10}/> {s.filename}
                  </span>
                  <span className="badge" style={{ background:'var(--neon-light)', border:'1.5px solid rgba(5,150,105,0.25)', color:'var(--neon)', fontSize:10 }}>
                    {(s.score*100).toFixed(0)}% match
                  </span>
                </div>
                <p style={{ color:'var(--text3)', lineHeight:1.55 }}>{s.preview}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ onClick, active, children }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:4, fontSize:11,
      color: active ? 'var(--v)' : 'var(--text3)',
      padding:'3px 8px',
      border:`1.5px solid ${active?'rgba(124,58,237,0.25)':'var(--border)'}`,
      background: active ? 'var(--v-light)' : 'var(--bg1)',
      borderRadius:6, transition:'all 0.15s', fontFamily:'var(--mono)',
      boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
    }}
      onMouseEnter={e=>{ if(!active){ e.currentTarget.style.color='var(--text)'; e.currentTarget.style.borderColor='var(--border2)'; } }}
      onMouseLeave={e=>{ if(!active){ e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.borderColor='var(--border)'; } }}
    >
      {children}
    </button>
  )
}

/* ── Doc row ── */
function DocRow({ doc, index, onDelete }) {
  const [hov, setHov] = useState(false)
  const EXT_COLORS = { PDF:{ c:'#e11d48', bg:'#ffe4e6' }, DOCX:{ c:'#7c3aed', bg:'#ede9fe' }, TXT:{ c:'#0ea5e9', bg:'#e0f2fe' }, MD:{ c:'#059669', bg:'#d1fae5' } }
  const ext = doc.filename.split('.').pop()?.toUpperCase() || '?'
  const ec  = EXT_COLORS[ext] || { c:'var(--text3)', bg:'var(--bg3)' }

  const STATUS = {
    ready:      { col:'var(--neon)',  bg:'var(--neon-light)',  border:'rgba(5,150,105,0.25)',  icon:<CheckCircle2 size={12}/>, label:'Indexed' },
    processing: { col:'var(--amber)', bg:'var(--amber-light)', border:'rgba(217,119,6,0.25)',  icon:<Loader2 size={12} style={{ animation:'spin 1s linear infinite' }}/>, label:'Processing' },
    error:      { col:'var(--rose)',  bg:'var(--rose-light)',  border:'rgba(225,29,72,0.25)',  icon:<AlertCircle size={12}/>, label:'Error' },
  }
  const cfg = STATUS[doc.status] || STATUS.error

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:13, padding:'12px 15px', background:'var(--bg1)', border:`1.5px solid ${hov?'var(--border2)':'var(--border)'}`, borderRadius:'var(--r)', transition:'all 0.15s', animation:`slideL 0.3s ${index*0.04}s both ease`, boxShadow:hov?'0 4px 16px rgba(0,0,0,0.07)':'0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Type badge */}
      <div style={{ width:40, height:40, flexShrink:0, borderRadius:9, background:ec.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9.5, fontWeight:800, color:ec.c, fontFamily:'var(--mono)', letterSpacing:'0.04em' }}>
        {ext}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13.5, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>
          {doc.filename}
        </div>
        <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)', display:'flex', gap:8 }}>
          {doc.file_size && <span>{(doc.file_size/1024).toFixed(1)} KB</span>}
          {doc.chunk_count > 0 && <span>· {doc.chunk_count} chunks</span>}
        </div>
      </div>

      {/* Status */}
      <div className="badge" style={{ background:cfg.bg, border:`1.5px solid ${cfg.border}`, color:cfg.col, flexShrink:0 }}>
        {cfg.icon} {cfg.label}
      </div>

      {/* Delete */}
      <button onClick={onDelete} style={{ color:'var(--text4)', padding:6, borderRadius:7, opacity:hov?1:0, transition:'all 0.15s', flexShrink:0 }}
        onMouseEnter={e=>{ e.currentTarget.style.color='var(--rose)'; e.currentTarget.style.background='var(--rose-light)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.color='var(--text4)'; e.currentTarget.style.background='transparent'; }}
      ><Trash2 size={13}/></button>
    </div>
  )
}
