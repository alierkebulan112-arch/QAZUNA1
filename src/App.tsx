import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Auth, { loadSession, saveSession, type User } from './Auth'
import ModelViewer from './ModelViewer'
import { T, items, type Lang } from './data'

type IconName = 'cube' | 'photo' | 'play' | 'search' | 'bag' | 'sound' | 'mute' | 'expand' | 'arrow' | 'user' | 'menu' | 'close'

function Icon({ name }: { name: IconName }) {
  const paths = {
    cube: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
    photo: <><rect x="3.5" y="5" width="17" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4" /></>,
    play: <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m10.5 9.5 4 2.5-4 2.5v-5Z" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    sound: <><path d="M5 14H2v-4h3l4-3v10l-4-3Z" /><path d="M13 9a4 4 0 0 1 0 6M16 6a8 8 0 0 1 0 12" /></>,
    mute: <><path d="M5 14H2v-4h3l4-3v10l-4-3Z" /><path d="m14 9 6 6M20 9l-6 6" /></>,
    expand: <><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /><path d="m3 8 5-5m13 5-5-5M3 16l5 5m13-5-5 5" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function useStored<S>(key: string, initial: S) {
  const [value, setValue] = useState<S>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as S) : initial
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
  }, [key, value])
  return [value, setValue] as const
}

const SECTIONS = ['collection', 'story', 'about', 'contact']

// Мягкий фоновый звук (синтез через WebAudio), без внешних файлов.
function useAmbience() {
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const [on, setOn] = useState(false)

  const toggle = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const master = ctx.createGain()
      master.gain.value = 0
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 700
      filter.connect(master).connect(ctx.destination)
      ;[110, 164.81, 220, 277.18].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = i % 2 ? 'triangle' : 'sine'
        osc.frequency.value = freq
        const g = ctx.createGain()
        g.gain.value = 0.22 / (i + 1)
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 0.07 + i * 0.05
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = 0.08
        lfo.connect(lfoGain).connect(g.gain)
        osc.connect(g).connect(filter)
        osc.start()
        lfo.start()
      })
      ctxRef.current = ctx
      gainRef.current = master
    }
    const ctx = ctxRef.current
    const master = gainRef.current!
    setOn((prev) => {
      const next = !prev
      if (next) ctx.resume()
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.linearRampToValueAtTime(next ? 0.5 : 0, ctx.currentTime + 1.2)
      return next
    })
  }, [])

  useEffect(() => () => { ctxRef.current?.close() }, [])
  return [on, toggle] as const
}

type Mode = 'model' | 'photo' | 'video'

export default function App() {
  const [lang, setLang] = useStored<Lang>('qazyna_lang', 'kk')
  const [user, setUser] = useState<User | null>(() => loadSession())
  const [route, setRoute] = useState(() => window.location.hash)
  const [active, setActive] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [details, setDetails] = useState(false)
  const [replay, setReplay] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [section, setSection] = useState('collection')
  const [mode, setMode] = useState<Mode>('model')
  const [videoMuted, setVideoMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [toast, setToast] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [sent, setSent] = useState(false)
  const [soundOn, toggleSound] = useAmbience()
  const toastTimer = useRef<number | undefined>(undefined)

  const t = T[lang]
  const item = items[active]
  const isAuth = route.startsWith('#/login') || route.startsWith('#/register')

  const showToast = useCallback((text: string) => {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }, [])

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', onHash)
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setDetails(false); setLangOpen(false); setMenuOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('fullscreenchange', onFs)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => { setRotation(0) }, [active])

  // видео әрдайым дыбыссыз басталады: бұйым немесе режим ауысқанда қайтадан өшіріледі
  useEffect(() => { setVideoMuted(true) }, [active, mode])
  useEffect(() => { if (videoRef.current) videoRef.current.muted = videoMuted }, [videoMuted, active, mode])

  const replayIntro = () => setReplay((n) => n + 1)
  useEffect(() => { document.documentElement.lang = lang }, [lang])

  // переход к секции после возврата со страницы входа / по прямой ссылке
  useEffect(() => {
    if (isAuth) { window.scrollTo(0, 0); return }
    const id = route.replace('#', '')
    if (SECTIONS.includes(id)) window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [route, isAuth])

  // подсветка активного пункта меню
  useEffect(() => {
    if (isAuth) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setSection(e.target.id) }),
      { rootMargin: '-40% 0px -50% 0px' },
    )
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [isAuth])

  const logout = () => { saveSession(null); setUser(null) }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => Object.values(i.name).some((n) => n.toLowerCase().includes(q)) || t.types[i.type].toLowerCase().includes(q))
  }, [query, t])

  const pick = (id: string) => {
    const idx = items.findIndex((i) => i.id === id)
    if (idx >= 0) setActive(idx)
    setSearchOpen(false)
    setQuery('')
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.().catch(() => showToast('Fullscreen недоступен'))
  }

  if (isAuth) {
    return (
      <Auth
        mode={route.startsWith('#/register') ? 'register' : 'login'}
        t={t}
        onDone={(u) => { setUser(u); window.location.hash = '#collection' }}
      />
    )
  }

  const navHrefs = SECTIONS.map((id) => `#${id}`)

  return (
    <main className="app-shell" style={{ '--accent': item.accent } as React.CSSProperties}>
      <div className="yurt-bg" />
      <div className="atmosphere" />

      <header className="topbar">
        <a className="brand" href="#collection" aria-label="Qazyna">
          <span className="brand-mark">Q</span>
          <span>QAZYNA<small>Ұлттық мұра</small></span>
        </a>
        <nav aria-label="Main">
          {t.nav.map((label, i) => (
            <a key={label} className={section === SECTIONS[i] ? 'active' : ''} href={navHrefs[i]}>{label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label={t.search} onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
          <div className="lang-wrap">
            <button className="lang" onClick={() => setLangOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={langOpen}>
              {lang.toUpperCase()} <span>⌄</span>
            </button>
            {langOpen && (
              <ul className="lang-menu" role="listbox">
                {(['kk', 'ru', 'en'] as Lang[]).map((l) => (
                  <li key={l}>
                    <button className={l === lang ? 'on' : ''} onClick={() => { setLang(l); setLangOpen(false) }}>
                      {l === 'kk' ? 'Қазақша' : l === 'ru' ? 'Русский' : 'English'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {user && (
            <button className="lang user-chip" onClick={logout} title={t.logout}>{t.hello}, {user.name.split(' ')[0]} · {t.logout}</button>
          )}
          <button className="icon-button menu-btn" aria-label={t.menu} onClick={() => setMenuOpen((v) => !v)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        </div>
        {menuOpen && (
          <div className="mobile-nav">
            {t.nav.map((label, i) => (<a key={label} href={navHrefs[i]} onClick={() => setMenuOpen(false)}>{label}</a>))}
            {user && <button onClick={() => { logout(); setMenuOpen(false) }}>{t.logout}</button>}
          </div>
        )}
      </header>

      <section className="showroom" id="collection">
        <div className={`model-stage mode-${mode}`}>
          <div className="stage-label"><i /> {t.stage3d}</div>
          <div className="model-wrap">
            <div className="model-glow" />
            <div className={`model-reveal ${mode === 'model' ? 'on' : ''}`}>
              <ModelViewer
                model={item.model}
                accent={item.accent}
                rotation={rotation}
                replay={replay}
                paused={mode !== 'model'}
                loadingText={t.loading3d}
                failText={t.modelFail}
              />
            </div>
            <div className="pedestal"><span /></div>
            {mode === 'photo' && (
              <div className="media-pane photo-pane" key={`photo-${item.id}`}>
                <img src={item.photo} alt={item.name[lang]} draggable={false} />
              </div>
            )}
            {mode === 'video' && (
              <div className="media-pane video-pane" key={`video-${item.id}`} style={{ background: item.videoBg }}>
                <video
                  ref={videoRef}
                  src={item.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
                  tabIndex={-1}
                />
                <button
                  className="video-sound"
                  onClick={() => setVideoMuted((v) => !v)}
                  aria-label={videoMuted ? t.vidUnmute : t.vidMute}
                  title={videoMuted ? t.vidUnmute : t.vidMute}
                >
                  <Icon name={videoMuted ? 'mute' : 'sound'} />
                </button>
              </div>
            )}
          </div>
          <div className="mode-switch" role="tablist" aria-label="View">
            {([['model', 'cube', t.modeModel], ['photo', 'photo', t.modePhoto], ['video', 'play', t.modeVideo]] as const).map(([m, icon, label]) => (
              <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
                <Icon name={icon} /> {label}
              </button>
            ))}
          </div>
          <div className="stage-tools">
            <div className="rotate-hint">
              <button onClick={() => setRotation((v) => v - 30)} aria-label="←">↶</button>
              <span><b>↔</b> {t.hint}</span>
              <button onClick={() => setRotation((v) => v + 30)} aria-label="→">↷</button>
            </div>
            <button className="replay-btn" onClick={replayIntro}>↻ {t.replay}</button>
          </div>
          <nav className="thumb-row" aria-label={t.choose}>
            {items.map((product, index) => (
              <button
                key={product.id}
                className={`thumb-btn ${active === index ? 'selected' : ''}`}
                onClick={() => setActive(index)}
                aria-label={product.name[lang]}
                aria-current={active === index}
                title={product.name[lang]}
              >
                <img src={product.thumb} alt="" draggable={false} />
              </button>
            ))}
          </nav>
        </div>

        <div className="intro">
          <p className="eyebrow"><span /> {t.eyebrow}</p>
          <h1>{t.h1a}<br /><em>{t.h1b}</em></h1>
          <p className="lead">{t.lead}</p>
          <button className="story-button" onClick={() => setDetails(true)}>
            {t.storyBtn} <span><Icon name="arrow" /></span>
          </button>
        </div>
      </section>

      <footer className="bottom-bar">
        <p><span>{String(active + 1).padStart(2, '0')}</span> / {String(items.length).padStart(2, '0')}</p>
        <div className="active-name"><small>{t.selected}</small><strong>{item.name[lang]}</strong></div>
        <div className="utility-actions">
          <button onClick={toggleSound}><Icon name={soundOn ? 'mute' : 'sound'} /> {soundOn ? t.soundOn : t.sound}</button>
          <button onClick={toggleFullscreen}><Icon name="expand" /> {fullscreen ? t.exitFs : t.fullscreen}</button>
        </div>
      </footer>

      <section className="page-section" id="story">
        <p className="eyebrow"><span /> 01</p>
        <h2>{t.storyTitle}</h2>
        <p className="section-sub">{t.storySub}</p>
        <div className="card-grid">
          {t.story.map(([title, text], i) => (
            <article className="info-card" key={title}><b>{String(i + 1).padStart(2, '0')}</b><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="page-section" id="about">
        <p className="eyebrow"><span /> 02</p>
        <h2>{t.mastersTitle}</h2>
        <p className="section-sub">{t.mastersSub}</p>
        <div className="card-grid">
          {t.masters.map(([title, text]) => (
            <article className="info-card master" key={title}><div className="avatar">{title[0]}</div><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="page-section" id="contact">
        <p className="eyebrow"><span /> 03</p>
        <h2>{t.contactTitle}</h2>
        <p className="section-sub">{t.contactSub}</p>
        <form
          className="contact-form"
          onSubmit={(e) => { e.preventDefault(); setSent(true); (e.target as HTMLFormElement).reset() }}
        >
          <label>{t.name}<input required onChange={() => setSent(false)} /></label>
          <label>{t.email}<input type="email" required onChange={() => setSent(false)} /></label>
          <label className="wide">{t.message}<textarea rows={4} required onChange={() => setSent(false)} /></label>
          <button className="primary-btn" type="submit">{t.send}</button>
          {sent && <p className="form-ok" role="status">{t.sent}</p>}
        </form>
      </section>

      <footer className="site-footer">{t.footer}</footer>

      {details && (
        <div className="modal-backdrop" onClick={() => setDetails(false)}>
          <article className="detail-card" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setDetails(false)} aria-label={t.close}>×</button>
            <p className="eyebrow">QAZYNA</p>
            <h2>{t.modalTitle}</h2>
            <p>{t.modalText}</p>
          </article>
        </div>
      )}

      {searchOpen && (
        <div className="modal-backdrop top" onClick={() => setSearchOpen(false)}>
          <div className="search-panel" onClick={(e) => e.stopPropagation()}>
            <input autoFocus placeholder={t.searchPh} value={query} onChange={(e) => setQuery(e.target.value)} />
            <ul>
              {results.map((r) => (
                <li key={r.id}><button onClick={() => pick(r.id)}><b>{r.name[lang]}</b><small>{t.types[r.type]}</small></button></li>
              ))}
              {!results.length && <li className="empty">{t.noResults}</li>}
            </ul>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  )
}
