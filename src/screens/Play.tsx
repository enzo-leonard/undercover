import { useState } from 'react'
import { ROLE_LABEL } from '../lib/game'
import type { Game, Player } from '../types'

type TableProps = {
  game: Game
  onVote: () => void
  onQuit: () => void
}

export function Table({ game, onVote, onQuit }: TableProps) {
  const starter = game.players.find((p) => p.id === game.starterId)
  const alive = game.players.filter((p) => p.alive)
  const out = game.players.filter((p) => !p.alive)

  return (
    <div className="page">
      <header className="topbar plain">
        <p className="eyebrow">Tour {game.round}</p>
        <h1>Autour de la table</h1>
      </header>
      <section className="card highlight">
        <p className="hint">Le premier à parler</p>
        <p className="starter">{starter?.name ?? '—'}</p>
        <p className="hint">Un mot chacun, assez vague. Puis on discute et on vote.</p>
      </section>
      <section className="card">
        <h2>Encore en jeu</h2>
        <ul className="player-grid">
          {alive.map((p) => (
            <li key={p.id} className="seat">
              <span className="avatar">{p.name.slice(0, 1).toUpperCase()}</span>
              {p.name}
            </li>
          ))}
        </ul>
      </section>
      {out.length > 0 ? (
        <section className="card muted">
          <h2>Éliminés</h2>
          <ul className="out-list">
            {out.map((p) => (
              <li key={p.id}>
                {p.name} · {ROLE_LABEL[p.role]}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <button type="button" className="btn btn-primary" onClick={onVote}>
        Éliminer quelqu’un
      </button>
      <button type="button" className="btn btn-text" onClick={onQuit}>
        Abandonner la partie
      </button>
    </div>
  )
}

type VoteProps = {
  players: Player[]
  onCancel: () => void
  onConfirm: (playerId: string) => void
}

export function Vote({ players, onCancel, onConfirm }: VoteProps) {
  const [selected, setSelected] = useState<string>('')

  return (
    <div className="page">
      <header className="topbar">
        <button type="button" className="btn btn-back" onClick={onCancel}>
          Retour
        </button>
        <h1>Qui est éliminé ?</h1>
      </header>
      <p className="hint">Après la discussion, touchez le joueur que la table a choisi.</p>
      <ul className="vote-list">
        {players.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={selected === p.id ? 'vote-btn selected' : 'vote-btn'}
              onClick={() => setSelected(p.id)}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!selected}
        onClick={() => selected && onConfirm(selected)}
      >
        Confirmer l’élimination
      </button>
    </div>
  )
}

type EliminationProps = {
  player: Player
  onContinue: () => void
  onWhiteGuess: () => void
}

export function Elimination({ player, onContinue, onWhiteGuess }: EliminationProps) {
  const isWhite = player.role === 'white'
  return (
    <div className="page reveal">
      <p className="eyebrow">Éliminé</p>
      <h1>{player.name}</h1>
      <div className={`role-banner role-${player.role}`}>
        <p>était</p>
        <strong>{ROLE_LABEL[player.role]}</strong>
      </div>
      {isWhite ? (
        <p className="lede">Dernière chance : deviner le mot des civils.</p>
      ) : (
        <p className="lede">Le mot reste secret jusqu’à la fin de la partie.</p>
      )}
      <button
        type="button"
        className="btn btn-primary"
        onClick={isWhite ? onWhiteGuess : onContinue}
      >
        {isWhite ? 'Tenter de deviner' : 'Continuer'}
      </button>
    </div>
  )
}

type WhiteMissProps = {
  onContinue: () => void
}

export function WhiteMiss({ onContinue }: WhiteMissProps) {
  return (
    <div className="page reveal">
      <p className="eyebrow">Mr. White</p>
      <h1>Ce n’est pas le mot</h1>
      <p className="lede">La partie continue. Le mot des civils reste secret.</p>
      <button type="button" className="btn btn-primary" onClick={onContinue}>
        Continuer
      </button>
    </div>
  )
}

type WhiteGuessProps = {
  playerName: string
  onGuess: (value: string) => void
}

export function WhiteGuess({ playerName, onGuess }: WhiteGuessProps) {
  const [guess, setGuess] = useState('')

  return (
    <div className="page">
      <header className="topbar plain">
        <p className="eyebrow">{playerName} · Mr. White</p>
        <h1>Quel est le mot des civils ?</h1>
      </header>
      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault()
          if (guess.trim()) onGuess(guess)
        }}
      >
        <label>
          Proposition
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Un seul mot…"
            autoFocus
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={!guess.trim()}>
          Valider
        </button>
      </form>
    </div>
  )
}
