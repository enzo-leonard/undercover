import { useEffect, useState } from 'react'

type HomeProps = {
  onPlay: () => void
  onPairs: () => void
  onHowTo: () => void
}

type BeforeInstallPrompt = Event & {
  prompt: () => Promise<void>
}

export function Home({ onPlay, onPairs, onHowTo }: HomeProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPrompt | null>(null)
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    setStandalone(standaloneMode)

    function onPrompt(event: Event) {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPrompt)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  return (
    <div className="page home">
      <div className="mark" aria-hidden="true">
        <svg viewBox="0 0 120 120" className="mark-svg">
          <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <ellipse cx="60" cy="60" rx="28" ry="14" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="60" cy="60" r="7" fill="currentColor" />
        </svg>
      </div>
      <p className="eyebrow">Jeu d’ambiance · 3 à 20 joueurs</p>
      <h1>Undercover</h1>
      <p className="lede">
        Un mot trop précis, et tout le monde le saura. Trouve tes alliés, démasque
        les infiltrés.
      </p>
      <div className="stack">
        <button type="button" className="btn btn-primary" onClick={onPlay}>
          Nouvelle partie
        </button>
        <button type="button" className="btn btn-ghost" onClick={onPairs}>
          Mes paires de mots
        </button>
        <button type="button" className="btn btn-text" onClick={onHowTo}>
          Comment jouer
        </button>
      </div>
      {!standalone ? (
        <p className="install-hint">
          {installEvent ? (
            <button
              type="button"
              className="btn btn-text"
              onClick={() => {
                void installEvent.prompt()
                setInstallEvent(null)
              }}
            >
              Ajouter à l’écran d’accueil
            </button>
          ) : (
            'Plein écran : Partager → Sur l’écran d’accueil'
          )}
        </p>
      ) : null}
    </div>
  )
}
