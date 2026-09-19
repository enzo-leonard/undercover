import { wordFor } from '../lib/game'
import type { Game, Player } from '../types'

type RevealProps = {
  game: Game
  player: Player
  open: boolean
  remaining: number
  onOpen: () => void
  onNext: () => void
}

export function Reveal({ game, player, open, remaining, onOpen, onNext }: RevealProps) {
  const word = wordFor(player, game)

  if (!open) {
    return (
      <div className="page reveal">
        <p className="eyebrow">Passe le téléphone</p>
        <h1>{player.name}</h1>
        <p className="lede">Personne d’autre ne doit regarder cet écran.</p>
        <button type="button" className="btn btn-primary" onClick={onOpen}>
          C’est moi, {player.name}
        </button>
        {remaining > 0 ? (
          <p className="hint">
            {remaining} joueur{remaining > 1 ? 's' : ''} après toi
          </p>
        ) : (
          <p className="hint">Dernier joueur</p>
        )}
      </div>
    )
  }

  return (
    <div className="page reveal">
      <p className="eyebrow">{player.name}</p>
      <div className={word ? 'word-card' : 'word-card blank'}>
        {word ? (
          <>
            <p className="word-label">Ton mot secret</p>
            <p className="word">{word}</p>
          </>
        ) : (
          <>
            <p className="word-label">Ton mot secret</p>
            <p className="word blank-word">???</p>
            <p className="word-note">Tu n’as pas de mot. Improvise.</p>
          </>
        )}
      </div>
      <p className="hint">Mémorise-le, puis cache l’écran. Ne dis pas si tu as un mot.</p>
      <button type="button" className="btn btn-primary" onClick={onNext}>
        J’ai mémorisé
      </button>
    </div>
  )
}
